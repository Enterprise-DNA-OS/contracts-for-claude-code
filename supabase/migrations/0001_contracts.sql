create function touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

create table contracts (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique check (btrim(reference) <> ''),
  name text not null check (btrim(name) <> ''),
  counterparty text not null check (btrim(counterparty) <> ''),
  owner text not null default '',
  status text not null default 'draft' check (status in ('draft','active','expired','terminated','archived')),
  currency text not null default 'NZD' check (currency ~ '^[A-Z]{3}$'),
  annual_value numeric(16,2) not null default 0 check (annual_value >= 0),
  effective_on date,
  ends_on date,
  nonrenew_on date,
  auto_renews boolean not null default false,
  renewal_term text not null default '',
  jurisdiction text not null default 'NZ' check (jurisdiction in ('NZ','AU','other')),
  contains_personal boolean not null default false,
  retention_review_on date,
  retention_basis text not null default '',
  legal_hold text not null default '',
  source_id text unique,
  source_row jsonb,
  source_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_on is null or effective_on is null or ends_on >= effective_on),
  check (nonrenew_on is null or ends_on is null or nonrenew_on <= ends_on)
);
create index contracts_deadline_idx on contracts(nonrenew_on) where status in ('draft','active');
create index contracts_ends_idx on contracts(ends_on) where status in ('draft','active');
create index contracts_owner_idx on contracts(lower(owner));
create unique index contracts_reference_ci_idx on contracts(lower(reference));

create table obligations (
  id uuid primary key default gen_random_uuid(),
  contract_id uuid not null references contracts(id),
  reference text not null check(btrim(reference) <> ''),
  title text not null check(btrim(title) <> ''),
  owner text not null check(btrim(owner) <> ''),
  due_on date not null,
  status text not null default 'open' check(status in ('open','done')),
  completed_on date,
  completion_evidence text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(contract_id,reference),
  check ((status='open' and completed_on is null) or (status='done' and completed_on is not null and btrim(completion_evidence)<>''))
);
create index obligations_due_idx on obligations(due_on) where status='open';
create unique index obligations_reference_ci_idx on obligations(contract_id,lower(reference));

create table reminders (
  id uuid primary key default gen_random_uuid(),
  contract_id uuid not null references contracts(id),
  reference text not null check(btrim(reference)<>''),
  title text not null check(btrim(title)<>''),
  owner text not null check(btrim(owner)<>''),
  due_on date not null,
  acknowledged_on date,
  acknowledgement text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(contract_id,reference),
  check(acknowledged_on is null or btrim(acknowledgement)<>'')
);
create index reminders_due_idx on reminders(due_on) where acknowledged_on is null;
create unique index reminders_reference_ci_idx on reminders(contract_id,lower(reference));

create table reviews (
  id uuid primary key default gen_random_uuid(),
  contract_id uuid not null references contracts(id),
  reviewer text not null check(btrim(reviewer)<>''),
  decision text not null check(decision in ('renew','renegotiate','exit','investigate')),
  rationale text not null check(btrim(rationale)<>''),
  evidence text not null check(btrim(evidence)<>''),
  reviewed_on date not null default current_date,
  based_on_end date,
  based_on_nonrenew date,
  based_on_value numeric(16,2) not null,
  based_on_currency text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index reviews_contract_idx on reviews(contract_id,created_at desc);

create table evidence (
  id uuid primary key default gen_random_uuid(),
  contract_id uuid not null references contracts(id),
  title text not null check(btrim(title)<>''),
  location text not null check(btrim(location)<>''),
  kind text not null check(kind in ('signed-contract','amendment','notice','other')),
  actor text not null check(btrim(actor)<>''),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index evidence_contract_idx on evidence(contract_id);

create table activity (
  id uuid primary key default gen_random_uuid(),
  contract_id uuid not null references contracts(id),
  actor text not null check(btrim(actor)<>''),
  action text not null,
  note text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index activity_contract_idx on activity(contract_id,created_at desc);

do $$ declare t text; begin
  foreach t in array array['contracts','obligations','reminders','reviews','evidence','activity'] loop
    execute format('create trigger touch_updated_at before update on %I for each row execute function touch_updated_at()',t);
    execute format('alter table %I enable row level security',t);
    execute format('revoke all on %I from public',t);
  end loop;
end $$;

create view renewal_queue with (security_invoker=true) as
select c.id,c.reference,c.name,c.counterparty,c.owner,c.status,c.currency,c.annual_value,c.ends_on,c.nonrenew_on,
  c.auto_renews, coalesce(c.nonrenew_on,c.ends_on) as action_on,
  coalesce(c.nonrenew_on,c.ends_on)-current_date as days_left,
  r.decision,r.reviewer,r.reviewed_on,
  (select count(*)::int from obligations o where o.contract_id=c.id and o.status='open' and o.due_on<current_date) as overdue_obligations,
  (select count(*)::int from reminders m where m.contract_id=c.id and m.acknowledged_on is null and m.due_on<=current_date) as due_reminders,
  (select max(a.created_at)::date from activity a where a.contract_id=c.id) as last_activity
from contracts c left join lateral (
  select decision,reviewer,reviewed_on from reviews r where r.contract_id=c.id
    and r.based_on_end is not distinct from c.ends_on
    and r.based_on_nonrenew is not distinct from c.nonrenew_on
    and r.based_on_value=c.annual_value and r.based_on_currency=c.currency
  order by r.created_at desc,r.id desc limit 1
) r on true where c.status in ('draft','active');

create view obligation_queue with (security_invoker=true) as
select o.id,c.reference as contract,o.reference,o.title,o.owner,o.due_on,o.due_on-current_date as days_left,
  c.status as contract_status,c.currency,c.annual_value
from obligations o join contracts c on c.id=o.contract_id where o.status='open';

create view reminder_queue with (security_invoker=true) as
select m.id,c.reference as contract,m.reference,m.title,m.owner,m.due_on,m.due_on-current_date as days_left,
  c.status as contract_status,c.currency,c.annual_value
from reminders m join contracts c on c.id=m.contract_id where m.acknowledged_on is null;

create view compliance_findings with (security_invoker=true) as
select c.id,c.reference,'POLICY-OWNER'::text as rule,'Assign a contract owner'::text as finding
from contracts c where c.status in ('draft','active') and btrim(c.owner)=''
union all select c.id,c.reference,'POLICY-RENEWAL','Check the signed agreement for its nonrenewal deadline'
from contracts c where c.status in ('draft','active') and c.auto_renews and c.nonrenew_on is null
union all select c.id,c.reference,'POLICY-EVIDENCE','Link the signed agreement from the controlled archive'
from contracts c where c.status='active' and not exists(select 1 from evidence e where e.contract_id=c.id and e.kind='signed-contract')
union all select c.id,c.reference,case c.jurisdiction when 'NZ' then 'NZ-IPP9' when 'AU' then 'AU-APP11' else 'POLICY-RETENTION' end,
  case when c.retention_review_on is null then 'Set a retention review and lawful purpose' else 'Review retention purpose, required records and any legal hold' end
from contracts c where c.contains_personal and (c.retention_review_on is null or c.retention_review_on<=current_date or btrim(c.retention_basis)='')
union all select c.id,c.reference,'POLICY-IMPORT','Review imported fields and source evidence before activation'
from contracts c where c.status='draft';

revoke all on renewal_queue,obligation_queue,reminder_queue,compliance_findings from public;
