# review

Read the agreement, current dates, open work and evidence. Record the reviewed decision, rationale and evidence. It does not execute the decision. Date or annual-value changes make it stale.

Run: node scripts/contracts.mjs review with the required arguments below. Add --json for structured results.

--contract --decision=renew|renegotiate|exit|investigate --rationale --evidence --actor

Use the CLI output as the source. On ambiguity, present all candidates and resolve the record before retrying. Errors are not permission to substitute another record. Nothing sends, signs, pays or deletes.
