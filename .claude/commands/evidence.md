# evidence

Record a controlled archive location and its evidence kind. The CLI does not download or authenticate the file.

Run: node scripts/contracts.mjs evidence with the required arguments below. Add --json for structured results.

--contract --title --location --kind=signed-contract|amendment|notice|other --actor

Use the CLI output as the source. On ambiguity, present all candidates and resolve the record before retrying. Errors are not permission to substitute another record. Nothing sends, signs, pays or deletes.
