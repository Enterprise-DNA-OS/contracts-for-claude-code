# export

Export all six record sets. Preserve referenced documents separately. Record the output path and remind the operator that recovery needs a tested restore.

Run: node scripts/contracts.mjs export with the required arguments below. Add --json for structured results.

Write all records and original imported fields to a JSON backup

Use the CLI output as the source. On ambiguity, present all candidates and resolve the record before retrying. Errors are not permission to substitute another record. Nothing sends, signs, pays or deletes.
