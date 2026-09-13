# Provenance and exact timestamps

## This publication

- Author timestamp: **`2026-09-13T00:37:31+00:00`**
- Committer timestamp: **`2026-09-13T00:37:31+00:00`**
- Parent commit: `01f30e6350defa4035e91d987be03d5d142c4939`
- Full machine-readable record: [provenance.json](provenance.json).

These timestamps are explicitly applied to the commit adding this record, not inferred from file modification times. Resolve that commit's full SHA with:

```sh
git log -1 --format='%H%nAuthor: %aI%nCommitter: %cI' -- docs/provenance.json
```

## Prior publications

[Exact commit history](COMMIT-HISTORY.md) includes commit links, full SHAs, author times and committer times. [JSON export](commit-history.json) names its exact coverage boundary. Git itself stores exact metadata for every subsequent commit; an export cannot contain its own final commit hash without changing that hash.

## Testing versus publication

The compatibility snapshot is **2026-09-13 resume-04**, published separately from the underlying test runs. Its SHA-256 is `42db644b84f8612dc2cf1e5ea16e895a72e93dd9fa871b70ca715b4b554f4bcb`. Publishing a report does not imply the tests ran at the commit time. This snapshot does not carry an exact test-completion timestamp; none is invented here. Live tests, synthetic tests and model-discovery metadata remain distinct in [COMPATIBILITY.md](COMPATIBILITY.md).

## Updating the record

Run `python3 scripts/export-provenance.py` before each publication to refresh the history through the current HEAD. The script reads Git only and never edits author dates or rewrites existing commits. Preserve original evidence timestamps when adding future test reports. Do not substitute file mtimes or publication dates for execution timestamps.
