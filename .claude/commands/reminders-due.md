# reminders-due

Show unacknowledged reminders by due date. Acknowledgement is an internal note, never proof that someone sent a notice.

Run: node scripts/contracts.mjs reminders-due with the required arguments below. Add --json for structured results.

Unacknowledged reminders: --days=14

Use the CLI output as the source. On ambiguity, present all candidates and resolve the record before retrying. Errors are not permission to substitute another record. Nothing sends, signs, pays or deletes.
