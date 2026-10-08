# import

Read docs/replace-contractsafe.md first. Inspect the exact export headings and persistent identifiers, use a separate DATA_DIR, run the dry run, then the import. Reconcile count, dates, currencies and source values before activation.

Run: node scripts/contracts.mjs import contractsafe with the required arguments below. Add --json for structured results.

contractsafe --file=export.csv --actor; optional --map=columns.json --dry-run --jurisdiction=NZ|AU|other

Use the CLI output as the source. On ambiguity, present all candidates and resolve the record before retrying. Errors are not permission to substitute another record. Nothing sends, signs, pays or deletes.
