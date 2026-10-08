# Move contract records from ContractSafe

Sources checked 8 October 2026: [Contracts List and CSV export](https://www.contractsafe.com/support/how-do-i-customize-my-contracts-list), [standard fields](https://www.contractsafe.com/support/standard-fields-in-contractsafe), and [document download](https://www.contractsafe.com/support/how-do-i-download-selected-contracts-and-data).

## Export and inspect

Use an authorised account. In the Contracts List, select the records, choose the needed columns and export CSV through Actions. Include a stable Contract ID, name, counterparty, owner, currency and the dates you maintain. Labels and custom fields differ between accounts. Do not substitute the visible row number for a persistent identifier. If the account does not expose a stable ID, create and maintain a unique migration reference before importing and map that column to source_id.

The vendor documents Effective Date, Termination Date, Deadline to Nonrenew, Autorenew, Renewal Term and separate value/currency fields. Currency accepts the standard Value (currency) label. A total contract value does not establish annual cost. Annual Value is a deliberately explicit optional field; otherwise recorded annual value starts at zero and the exposure report counts zero or unmapped values. Keep the original total value in source_row and set the annual value only after checking the term.

Download originals and attachments separately. The vendor help describes a 500-file limit for list downloads, an administrator download through Settings, and restoring archived contracts before downloading them. Check that the archive and amendments are complete before closing the account.

## One-command import

Use a new DATA_DIR for live data and run npm run migrate without the demo seed. Then:

```bash
npm run contracts -- import contractsafe --file=/path/contracts.csv --actor="Migration operator" --dry-run
npm run contracts -- import contractsafe --file=/path/contracts.csv --actor="Migration operator"
```

Use ISO dates, YYYY-MM-DD. Resolve ambiguous dates in the export before import. Every row is validated and the whole import rolls back on failure. The dry run rolls back successful records too. Identical repeats add no duplicates. Changed source rows are rejected for reconciliation, preserving later local edits. Import does not refresh a local agreement automatically.

The fixture is synthetic, showing the supported headings. It is not an untouched customer export. A mapping file names your exact headings:

```json
{"source_id":"Persistent ID","name":"Agreement","counterparty":"Supplier","owner":"Manager","currency":"Value (currency)","effective":"Effective Date","ends":"Termination Date","nonrenew":"Deadline to Nonrenew","auto_renews":"Autorenew","renewal_term":"Renewal Term","annual_value":"Reviewed annual cost"}
```

Add --map=/path/columns.json and --jurisdiction=AU for an Australian review policy. The default is NZ; neither setting determines the legal jurisdiction of an agreement. Omit mapping keys whose optional columns are absent. Missing mapped columns fail clearly. Contract Number or Reference maps to the local reference; otherwise it becomes CS- plus the stable source ID. Original fields remain in source_row.

## Reconcile before switching

All imported agreements start as drafts, even if the source says executed or active. Compare counts, names, currencies, dates and original values with the export. Review owners and retention needs. Link signed files through evidence and activate only after verification. Check renewals-due, review-queue and compliance against the originals. Run both processes until the owner accepts the migrated records and operating controls.

The contract-list import does not import reminders, obligations, signatures, file contents, version history, permissions, approval workflows or connected services. Add reminders and obligations through the CLI after mapping their separate exports. Enterprise DNA includes that mapping and reconciliation in a scoped migration. A one-command import is the data step, not a promise that every account can complete its migration in a day.

Export writes all six record sets to JSON, including original imported fields. It does not copy referenced files. Test a reviewed database restore and recovery of the document archive before relying on backups.
