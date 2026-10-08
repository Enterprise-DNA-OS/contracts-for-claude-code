# review-queue

List agreements with missing or stale decisions. Read signed evidence before recommending renew, renegotiate or exit.

Run: node scripts/contracts.mjs review-queue with the required arguments below. Add --json for structured results.

Unreviewed or stale renewal decisions: --days=60

Use the CLI output as the source. On ambiguity, present all candidates and resolve the record before retrying. Errors are not permission to substitute another record. Nothing sends, signs, pays or deletes.
