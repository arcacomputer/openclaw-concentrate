# Provenance and exact timestamps

## This publication

- Author timestamp: **`2026-09-13T00:44:35+00:00`**
- Committer timestamp: **`2026-09-13T00:44:35+00:00`**
- Parent commit: `f984c1e9f10a7a111e136f446261de36fa98ea60`
- Full machine-readable record: [provenance.json](provenance.json).

These timestamps are explicitly applied to the commit adding this record, not inferred from file modification times. Resolve that commit's full SHA with:

```sh
git log -1 --format='%H%nAuthor: %aI%nCommitter: %cI' -- docs/provenance.json
```

## Prior publications

[Exact commit history](COMMIT-HISTORY.md) includes commit links, full SHAs, author times and committer times. [JSON export](commit-history.json) names its exact coverage boundary. Git itself stores exact metadata for every subsequent commit; an export cannot contain its own final commit hash without changing that hash.

## Testing versus publication

The compatibility snapshot is **2026-09-13 resume-06**, published separately from the underlying test runs. Its SHA-256 is `a329693e77bfd8dbabde56a3a4b23131a8d81de60714e7e4ebfa87d34e775052`. Publishing a report does not imply the tests ran at the commit time. This snapshot does not carry an exact test-completion timestamp; none is invented here. Live tests, synthetic tests and model-discovery metadata remain distinct in [COMPATIBILITY.md](COMPATIBILITY.md).

## Updating the record

Run `python3 scripts/export-provenance.py` before each publication to refresh the history through the current HEAD. The script reads Git only and never edits author dates or rewrites existing commits. Preserve original evidence timestamps when adding future test reports. Do not substitute file mtimes or publication dates for execution timestamps.
