# add-obligation

Read the signed clause and ask for its owner and actual due date. Add one deliverable with a stable reference.

Run: node scripts/contracts.mjs add-obligation with the required arguments below. Add --json for structured results.

--contract --reference --title --owner --due --actor

Use the CLI output as the source. On ambiguity, present all candidates and resolve the record before retrying. Errors are not permission to substitute another record. Nothing sends, signs, pays or deletes.
