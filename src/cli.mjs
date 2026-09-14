import { createInterface } from 'node:readline/promises';
import seed from './seed.json' with { type: 'json' };
import meta from './catalog-meta.json' with { type: 'json' };
import { projectRows } from './catalog.mjs';
import { CATALOG_URL, fetchPublicJson, validateCatalog, snapshotAge } from './catalog-maintenance.mjs';
import { fetchPricing } from './pricing.mjs';
import { runSetup, SetupError, parseRate } from './setup.mjs';
const safe = value => String(value).replace(/[\u0000-\u001f\u007f-\u009f\u202a-\u202e\u2066-\u2069]/g, '');
const say = text => process.stderr.write(text + '\n');

async function acquireRows(refresh, signal) {
  if (refresh) {
    try {
      const body = await fetchPublicJson(CATALOG_URL, { signal }); validateCatalog(body);
      return { rows: body.data, source: 'live', fetchedAt: new Date().toISOString(), stale: false };
    } catch (e) {
      if (signal?.aborted || e.name === 'AbortError') throw e;
      return { rows: seed, source: 'bundled', fetchedAt: meta.fetchedAt, ...snapshotAge(meta), warning: 'Live metadata unavailable; using the dated bundled fallback.' };
    }
  }
  return { rows: seed, source: 'bundled', fetchedAt: meta.fetchedAt, ...snapshotAge(meta) };
}

function printReview(preview) {
  say(preview.qualification);
  for (const x of preview.selections) say(`${x.id}: ${Object.entries(x.rates).map(([k, v]) => `${k}=${v ?? 'UNKNOWN'}`).join(', ')} USD/1M`);
  if (preview.missingRates.length) say(`Explicit estimates needed: ${preview.missingRates.join(', ')}`);
  if (preview.plan) {
    say(`Model allowlist additions: ${preview.plan.allowlistAdditions.join(', ') || 'none'}`);
    say(`Existing manual model costs updated: ${preview.plan.manualCostChanges.join(', ') || 'none'}`);
    say(`Review token: ${preview.plan.reviewToken}`);
    say('Primary model, credentials and unselected models are preserved. No automatic gateway restart.');
  }
}

async function action(options, operation) {
  const controller = new AbortController();
  const interrupt = () => controller.abort();
  process.once('SIGINT', interrupt);
  try {
    const result = await operation(controller.signal, interrupt);
    if (options.json) process.stdout.write(JSON.stringify(result, null, 2) + '\n');
    else if (result.applied) say(`Saved and verified: ${result.modelIds.join(', ')}. ${result.next}`);
    else if (result.cancelled) say('Cancelled. Configuration unchanged.');
    return result;
  } catch (error) {
    const cancelled = controller.signal.aborted || error.name === 'AbortError';
    const message = cancelled ? 'Cancelled.' : error instanceof SetupError ? error.message : 'Command failed; inspect native configuration status before retrying.';
    if (options.json) process.stdout.write(JSON.stringify({ ok: false, code: cancelled ? 'CANCELLED' : 'SETUP_FAILED', error: message }) + '\n');
    else say(message);
    process.exitCode = cancelled ? 130 : 1;
  } finally { process.removeListener('SIGINT', interrupt); }
}

export function registerConcentrateCli(program, configIO) {
  const root = program.command('concentrate').description('Browse Concentrate models and review setup estimates');
  root.command('models').description('List the complete eligible catalog; visibility is not account entitlement')
    .option('--json', 'Emit JSON only on stdout').option('--refresh', 'Try current public metadata; label any fallback')
    .option('--filter <text>', 'Filter by exact ID, name or vendor').action(options => action(options, async signal => {
      const catalog = await acquireRows(options.refresh === true, signal);
      const eligible = projectRows(catalog.rows);
      const query = (options.filter ?? '').toLowerCase();
      const rows = eligible.filter(x => `${x.id} ${x.name} ${catalog.rows.find(r => r.id === x.id)?.owned_by ?? ''}`.toLowerCase().includes(query));
      const result = { source: catalog.source, fetchedAt: catalog.fetchedAt, stale: catalog.stale, warning: catalog.warning ?? null, count: rows.length, totalEligible: eligible.length, models: rows, qualification: 'Metadata only, not measured feature support or entitlement. Configure reviewed cost estimates before inference.' };
      if (!options.json) {
        say(`${rows.length}/${eligible.length} eligible models | ${catalog.source} | ${catalog.fetchedAt}${catalog.stale ? ' | STALE' : ''}`);
        if (catalog.warning) say(catalog.warning);
        for (const row of rows) process.stdout.write(`${row.id}  ${safe(row.name)}  input:${row.contextWindow} output:${row.maxTokens} image:${row.input.includes('image')} reasoning:${row.reasoning}\n`);
      }
      return result;
    }));
  root.command('setup').description('Choose models, review estimates and save only after explicit consent')
    .option('--model <id>', 'Exact eligible model ID; repeat for up to 16 models', (value, previous) => [...previous, value], [])
    .option('--dry-run', 'Read-only preview; public metadata only, no inference or config writes')
    .option('--json', 'Headless JSON output, with diagnostics on stderr')
    .option('--apply', 'Apply the exact headless preview with its review token and acknowledgement')
    .option('--review <token>', 'Exact review token from the current preview')
    .option('--acknowledge-estimates', 'Acknowledge estimates are not prices or a spending cap')
    .option('--input <usd>', 'Explicit input estimate in USD/1M tokens')
    .option('--output <usd>', 'Explicit output estimate in USD/1M tokens')
    .option('--cache-read <usd>', 'Explicit cache-read estimate in USD/1M tokens')
    .option('--cache-write <usd>', 'Explicit cache-write estimate in USD/1M tokens')
    .action(options => action(options, async (signal, interrupt) => {
      let readline;
      const ask = async prompt => {
        if (!readline) {
          readline = createInterface({ input: process.stdin, output: process.stderr });
          readline.on('SIGINT', interrupt);
        }
        return readline.question(prompt, { signal });
      };
      const catalog = await acquireRows(true, signal);
      const interactive = Boolean(process.stdin.isTTY && process.stderr.isTTY && !options.json && !options.apply && !options.dryRun);
      if (!options.json) say(`Catalog: ${catalog.source}, ${catalog.fetchedAt}${catalog.warning ? '. ' + catalog.warning : ''}`);
      try {
        return await runSetup(options, {
          ...configIO, rows: catalog.rows, signal, interactive,
          pricing: id => fetchPricing(id, { signal }),
          emit: options.json ? undefined : printReview,
          chooseModels: async rows => {
            const filter = (await ask('Filter models by name/vendor (Enter for all): ')).toLowerCase();
            const choices = projectRows(rows).filter(x => `${x.id} ${x.name} ${rows.find(r => r.id === x.id)?.owned_by ?? ''}`.toLowerCase().includes(filter));
            if (!choices.length) throw new SetupError('No matching models. Nothing changed.');
            choices.forEach((row, i) => say(`${i + 1}. ${row.id} (${safe(row.name)})`));
            const raw = await ask('Select model numbers, comma-separated: ');
            const indices = raw.split(',').map(x => x.trim());
            if (indices.some(x => !/^\d+$/.test(x) || Number(x) < 1 || Number(x) > choices.length)) throw new SetupError('Invalid model selection. Nothing changed.');
            return indices.map(x => choices[Number(x) - 1].id);
          },
          askRate: async ({ model, key, suggested, evidence }) => {
            if (key === 'input') {
              say(`${model}: published route prices (tiers/TTLs may vary; these are estimate baselines, not ceilings):`);
              say(JSON.stringify(Object.fromEntries(Object.entries(evidence.routes ?? {}).map(([name, row]) => [name, row.pricing])), null, 2));
            }
            for (let attempt = 0; attempt < 3; attempt++) {
              const input = await ask(`${key} USD/1M${suggested === null ? ' (unknown, enter your estimate)' : ` [${suggested}]`}: `);
              try { return parseRate(input === '' && suggested !== null ? suggested : input); }
              catch (e) { if (!(e instanceof SetupError)) throw e; say(e.message); }
            }
            throw new SetupError('No valid rate supplied. Nothing changed.');
          },
          confirm: async () => (await ask('Save these estimates? Type yes to confirm: ')).toLowerCase() === 'yes',
        });
      } finally { readline?.close(); }
    }));
}
