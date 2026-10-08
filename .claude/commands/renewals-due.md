# renewals-due

Sort by the actual notice deadline before the end date. Negative days mean the recorded date has passed. Do not infer that a contract renewed or notice was served.

Run: node scripts/contracts.mjs renewals-due with the required arguments below. Add --json for structured results.

Notice deadlines and end dates: --days=60

Use the CLI output as the source. On ambiguity, present all candidates and resolve the record before retrying. Errors are not permission to substitute another record. Nothing sends, signs, pays or deletes.
