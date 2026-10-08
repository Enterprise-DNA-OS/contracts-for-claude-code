# retention

Read docs/compliance.md and the existing purpose and hold. Set the next review with its lawful basis. Preserve any hold unless its explicit release is authorised. Nothing is destroyed.

Run: node scripts/contracts.mjs retention with the required arguments below. Add --json for structured results.

--contract --personal=true|false --review-on --basis --hold --actor

Use the CLI output as the source. On ambiguity, present all candidates and resolve the record before retrying. Errors are not permission to substitute another record. Nothing sends, signs, pays or deletes.
