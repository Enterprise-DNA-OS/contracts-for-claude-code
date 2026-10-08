# complete-obligation

Read the open obligation. Require a completion evidence location and the responsible operator. Do not mark promised work complete.

Run: node scripts/contracts.mjs complete-obligation with the required arguments below. Add --json for structured results.

--contract --obligation --evidence --actor; optional --date

Use the CLI output as the source. On ambiguity, present all candidates and resolve the record before retrying. Errors are not permission to substitute another record. Nothing sends, signs, pays or deletes.
