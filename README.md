# Contracts for Claude Code

Renewal decisions, notice deadlines, obligations and evidence in a database you own. MIT-licensed contract administration for Claude Code, Codex, OpenCode or Cursor.

| Do it yourself | We customise it | We run it for you |
|---|---|---|
| Free. Install, try the demo and import your contract register. | Your terms, fields, document connections and ContractSafe migration. | Installed and operated through Omni by Enterprise DNA. One setup fee, then a retainer. |
| [Quick start](#quick-start) | [Get your version built](https://enterprisedna.co/omni/book/?offer=replace-software&utm_campaign=contractsafe&utm_source=github&utm_medium=customise) | [Book a call](https://enterprisedna.co/omni/book/?offer=replace-software&utm_campaign=contractsafe&utm_source=github&utm_medium=managed) |

ContractSafe's current Maximize band for 1,001-2,500 contracts lists US$1,325 per month prepaid annually, or US$15,900 for twelve months. That is a public list-price scenario, not a customer's invoice. [Vendor pricing](https://www.contractsafe.com/pricing), checked 8 October 2026. See [research and six scores](docs/research.md).

## The five weekly jobs

Review renewals before the notice date, chase outstanding obligations, check reminders, collect signed evidence and review record retention. The fictional Harbour demo includes a missed nonrenewal date, stale activity, unassigned ownership, an overdue obligation after termination, and a record under legal hold. Dates are relative to the first seed. Reseeding preserves later changes.

## Quick start

Node 20 or later, Windows or Linux:

```bash
git clone https://github.com/Enterprise-DNA-OS/contracts-for-claude-code.git
cd contracts-for-claude-code
npm install
npm run demo
npm test
npm run view
npm run docs
```

Start with /renewals-due. PGlite runs locally in .data/db with no server install. DATABASE_URL selects shared Postgres. Use a separate DATA_DIR, run migrate without seed and read [the replacement guide](docs/replace-contractsafe.md) before real imports. Local operation permits one process at a time. Shared operation needs authenticated access, restricted database privileges and tested backups.

## 26 CLI commands and 27 slash recipes

/contracts, /contract, /renewals-due, /obligations-due, /reminders-due, /review-queue, /exposure, /owner-workload, /attention, /compliance, /activity, /weekly-review, /add-contract, /update-contract, /add-obligation, /complete-obligation, /add-reminder, /acknowledge-reminder, /review, /evidence, /retention, /log, /draft-renewal, /import, /export, /customise, /new-view. The CLI also includes help. [Arguments and calculations](docs/cli.md). Every command supports --json. Partial IDs and case-insensitive names work; ambiguous matches list candidates and exit 1.

## Ten questions for your renewal meeting

ContractSafe already offers custom reports and plain-language search. Its [Smart Search help](https://www.contractsafe.com/support/ai-powered-natural-launguage-search), checked 8 October 2026, says reminder-date filtering is not available in natural-language search. These ten analyses work here today; they are not blanket claims that the vendor cannot produce similar reports.

- Which notice deadlines have already passed? `renewals-due`
- Which reminders are due in the next fourteen days? `reminders-due`
- Which renewal decisions are missing or stale? `review-queue`
- Which near-term agreements also have overdue obligations? `renewals-due`
- Which active agreements have no signed evidence reference? `compliance`
- Which closed agreements still have outstanding duties? `obligations-due`
- Which owners have the most overdue work items? `owner-workload`
- What annual value is recorded for each counterparty and currency? `exposure`
- Which agreements have been quiet for more than fourteen days? `attention`
- Which personal-information records need a retention review? `compliance`

## Your first hour: ten things to ask for

1. Put our name, logo and colours on the review paperwork.
2. Show the notice deadlines before contract end dates.
3. List reminders nobody has acknowledged.
4. Show obligations still open after an agreement ended.
5. Separate NZD and AUD exposure.
6. Draft an internal renewal brief from the records.
7. Test our ContractSafe export without saving changes.
8. Add our document archive references and check owners.
9. Add a business-unit field with a new migration.
10. Build a read-only view for our Monday review.

## Paperwork and checks

Change brand.json once. npm run docs renders internal renewal briefs, obligation registers and personal-information retention reviews. npm run view renders the weekly register and evidence exceptions. These are local HTML snapshots. They never send, sign or cancel an agreement. Contract clauses, notice methods and authentic documents still require a responsible reviewer.

[Compliance checks](docs/compliance.md) cite NZ privacy Principle 9 and Australian APP 11 guidance, distinguish internal policies, preserve legal holds and flag records for review. They do not certify compliance or invent a fixed retention period. Evidence locations are references, not verified files. [Why no front end](docs/why-no-front-end.md) explains the base and the scoped additions Enterprise DNA can build.

## Switch from ContractSafe

```bash
npm run contracts -- import contractsafe --file=/path/contracts.csv --actor="Migration operator" --dry-run
npm run contracts -- import contractsafe --file=/path/contracts.csv --actor="Migration operator"
```

The one-command import covers contract-list CSV records, with explicit mappings for your headings. It preserves original fields, starts records as drafts and rejects changed repeats for reconciliation. Signed files, reminders, obligations, permissions and signing history need separate mapping. [Full steps and exclusions](docs/replace-contractsafe.md). Export writes all six record sets to JSON; referenced files require their own backup.

## Verification

npm test uses a temporary database and exercises all 26 commands, repeat seeds and migrations, renewal decision invalidation, reference ambiguity, evidence requirements, holds, import dry runs, repeat detection and full rollback. It also checks drafts, exports and escaped HTML. The same suite supports a fresh disposable Postgres database through TEST_DATABASE_URL. GitHub checks cover Linux, Windows and Postgres.

MIT licence. Not affiliated with ContractSafe or Anthropic. Hosting and agent use have separate costs. [Book 30 minutes with Sam](https://enterprisedna.co/omni/book/?offer=replace-software&utm_campaign=contractsafe&utm_source=github&utm_medium=readme).
