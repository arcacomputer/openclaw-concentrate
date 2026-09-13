// Values come only from Concentrate's public aggregate catalog; no price estimates.
export function projectRows(rows) {
  if (!Array.isArray(rows)) return [];
  const seen = new Set();
  return rows.filter(row => {
    if (!row || row.object !== 'model' || row.type !== 'model' ||
        typeof row.id !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(row.id) ||
        row.id === 'redact-v1' || row.disabled === true || row.deprecated === true ||
        row.archived === true || row.active === false ||
        ['disabled', 'archived', 'deprecated', 'retired'].includes(row.status) ||
        !Number.isSafeInteger(row.max_input_tokens) || row.max_input_tokens <= 0 ||
        !Number.isSafeInteger(row.max_tokens) || row.max_tokens <= 0 || seen.has(row.id)) return false;
    seen.add(row.id);
    return true;
  }).map(row => ({
    id: row.id,
    name: typeof row.display_name === 'string' && row.display_name.trim() ? row.display_name : row.id,
    reasoning: row.capabilities?.thinking?.supported === true || row.capabilities?.effort?.supported === true,
    input: row.capabilities?.image_input?.supported === true ? ['text', 'image'] : ['text'],
    contextWindow: row.max_input_tokens,
    maxTokens: row.max_tokens,
  }));
}
