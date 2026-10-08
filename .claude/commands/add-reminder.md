# add-reminder

Record the internal reminder date, owner and purpose. There is no background mail sender; run the reminders review regularly.

Run: node scripts/contracts.mjs add-reminder with the required arguments below. Add --json for structured results.

--contract --reference --title --owner --due --actor

Use the CLI output as the source. On ambiguity, present all candidates and resolve the record before retrying. Errors are not permission to substitute another record. Nothing sends, signs, pays or deletes.
