# Contracts for Claude Code: operating instructions

For the person who owns supplier and customer agreements, renewal decisions and evidence. Configure the business name in brand.json. The supplied Harbour records are fictional.

Read from the CLI before answering. Read a full agreement before writing a change. Use plain language, explicit owners and actual dates. Never invent a signed document, service event, notice period or annual amount. On an ambiguous reference show the candidates and stop the change.

Nothing here sends, signs, pays or deletes. A draft renewal is an internal decision brief. An exit decision is not cancellation. Imported agreements remain drafts until records and evidence are verified. Deadlines come from signed terms, not a generic legal rule. Retention review dates come from the business's documented policy; read docs/compliance.md.

## One route for each job

| Job | Recipe |
|---|---|
| contracts | /contracts |
| contract | /contract |
| renewals due | /renewals-due |
| obligations due | /obligations-due |
| reminders due | /reminders-due |
| review queue | /review-queue |
| exposure | /exposure |
| owner workload | /owner-workload |
| attention | /attention |
| compliance | /compliance |
| activity | /activity |
| weekly review | /weekly-review |
| add contract | /add-contract |
| update contract | /update-contract |
| add obligation | /add-obligation |
| complete obligation | /complete-obligation |
| add reminder | /add-reminder |
| acknowledge reminder | /acknowledge-reminder |
| review | /review |
| evidence | /evidence |
| retention | /retention |
| log | /log |
| draft renewal | /draft-renewal |
| import | /import |
| export | /export |
| customise | /customise |
| new view | /new-view |

Use node scripts/contracts.mjs help for CLI syntax. Append --json for machine output. Each recurring recipe lives only in .claude/commands/. Partial IDs and case-insensitive name matching list candidates and exit 1 when ambiguous.

Migrations and the fictional seed live in supabase/. scripts/contracts.mjs is the one CLI. brand.json controls documents and read-only views. drafts/, docs-out/, views/ and exports/ contain potentially confidential material and are ignored by Git. Never commit real exports or agreements. The fixture in fixtures/ is synthetic.

Local PGlite runs one process at a time. DATABASE_URL selects Postgres with verified TLS. Do not use the owner connection as a public API. Shared installations need authenticated users, restricted privileges and tested recovery. Database administrators can alter history; operator-supplied names are not signatures.

Omni by Enterprise DNA installs, customises and runs your version: https://enterprisedna.co/omni/book/?offer=replace-software&utm_campaign=contractsafe&utm_source=github&utm_medium=instructions
