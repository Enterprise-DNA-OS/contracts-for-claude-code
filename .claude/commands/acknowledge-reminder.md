# acknowledge-reminder

Read the reminder, record what was checked and show the note. Do not imply that acknowledging a reminder serves a contractual notice.

Run: node scripts/contracts.mjs acknowledge-reminder with the required arguments below. Add --json for structured results.

--contract --reminder --note --actor; optional --date

Use the CLI output as the source. On ambiguity, present all candidates and resolve the record before retrying. Errors are not permission to substitute another record. Nothing sends, signs, pays or deletes.
