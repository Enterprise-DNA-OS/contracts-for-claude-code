# Contract CLI

Run npm run contracts -- followed by a command. --json works for every command. Options use --name=value; quote values with spaces. Dates use YYYY-MM-DD. Booleans accept true/false and yes/no. Currency is an uppercase three-letter code; money is entered without currency symbols or thousands separators.

## help

Show commands

## contracts

List agreements

## contract

Read one agreement and its full history: --contract

## renewals-due

Notice deadlines and end dates: --days=60

## obligations-due

Open deliverables, including terminated agreements: --days=14

## reminders-due

Unacknowledged reminders: --days=14

## review-queue

Unreviewed or stale renewal decisions: --days=60

## exposure

Recorded annual value by counterparty and currency

## owner-workload

Open work and overdue counts by owner

## attention

Late deadlines, overdue work, missing owners and quiet agreements

## compliance

Evidence, ownership and retention review findings

## activity

Operator-recorded history: optional --contract

## weekly-review

Renewals, obligations, reminders and compliance in one report

## add-contract

--reference --name --counterparty --owner --actor; optional --currency --annual-value --effective --ends --nonrenew --auto-renews --renewal-term --jurisdiction

## update-contract

--contract --actor with changed fields, including --status

## add-obligation

--contract --reference --title --owner --due --actor

## complete-obligation

--contract --obligation --evidence --actor; optional --date

## add-reminder

--contract --reference --title --owner --due --actor

## acknowledge-reminder

--contract --reminder --note --actor; optional --date

## review

--contract --decision=renew|renegotiate|exit|investigate --rationale --evidence --actor

## evidence

--contract --title --location --kind=signed-contract|amendment|notice|other --actor

## retention

--contract --personal=true|false --review-on --basis --hold --actor

## log

--contract --note --actor

## draft-renewal

--contract; writes an internal decision brief to drafts/

## import

contractsafe --file=export.csv --actor; optional --map=columns.json --dry-run --jurisdiction=NZ|AU|other

## export

Write all records and original imported fields to a JSON backup

## Working example

```bash
npm run contracts -- contract --contract=C-1001
npm run contracts -- review --contract=C-1001 --decision=investigate --rationale="Read the signed notice clause" --evidence="archive://reviews/C-1001" --actor="Casey"
npm run contracts -- draft-renewal --contract=C-1001
```

References match exactly first, then UUID prefixes and case-insensitive name fragments. Ambiguity exits 1 and lists candidates. Obligation and reminder resolution stays inside the selected agreement. All CLI writes use a transaction and activity record. Reads are not proof the underlying source document is correct.

Renewals-due uses the nonrenewal deadline when present, otherwise the recorded end date. It includes missed dates and both draft and active agreements. Obligations-due and reminders-due include outstanding work on ended agreements. Owner-workload counts work items, not unique agreements. Exposure includes active contracts only, grouped by counterparty and currency, and flags zero or unmapped annual values. Attention considers a record quiet after fourteen days without activity.
