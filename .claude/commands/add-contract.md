# add-contract

Create a draft agreement from verified inputs. Do not derive dates or annual amounts from incomplete terms. Read it back and show its reference.

Run: node scripts/contracts.mjs add-contract with the required arguments below. Add --json for structured results.

--reference --name --counterparty --owner --actor; optional --currency --annual-value --effective --ends --nonrenew --auto-renews --renewal-term --jurisdiction

Use the CLI output as the source. On ambiguity, present all candidates and resolve the record before retrying. Errors are not permission to substitute another record. Nothing sends, signs, pays or deletes.
