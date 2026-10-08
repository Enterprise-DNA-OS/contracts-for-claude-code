#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {createHash,randomUUID} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {getDb,REPO_ROOT} from './lib/db.mjs';
import {parseCsv,pick} from './lib/csv.mjs';
import {table} from './lib/format.mjs';

export const commands = {
  help:'Show commands',
  contracts:'List agreements',
  contract:'Read one agreement and its full history: --contract',
  'renewals-due':'Notice deadlines and end dates: --days=60',
  'obligations-due':'Open deliverables, including terminated agreements: --days=14',
  'reminders-due':'Unacknowledged reminders: --days=14',
  'review-queue':'Unreviewed or stale renewal decisions: --days=60',
  exposure:'Recorded annual value by counterparty and currency',
  'owner-workload':'Open work and overdue counts by owner',
  attention:'Late deadlines, overdue work, missing owners and quiet agreements',
  compliance:'Evidence, ownership and retention review findings',
  activity:'Operator-recorded history: optional --contract',
  'weekly-review':'Renewals, obligations, reminders and compliance in one report',
  'add-contract':'--reference --name --counterparty --owner --actor; optional --currency --annual-value --effective --ends --nonrenew --auto-renews --renewal-term --jurisdiction',
  'update-contract':'--contract --actor with changed fields, including --status',
  'add-obligation':'--contract --reference --title --owner --due --actor',
  'complete-obligation':'--contract --obligation --evidence --actor; optional --date',
  'add-reminder':'--contract --reference --title --owner --due --actor',
  'acknowledge-reminder':'--contract --reminder --note --actor; optional --date',
  review:'--contract --decision=renew|renegotiate|exit|investigate --rationale --evidence --actor',
  evidence:'--contract --title --location --kind=signed-contract|amendment|notice|other --actor',
  retention:'--contract --personal=true|false --review-on --basis --hold --actor',
  log:'--contract --note --actor',
  'draft-renewal':'--contract; writes an internal decision brief to drafts/',
  import:'contractsafe --file=export.csv --actor; optional --map=columns.json --dry-run --jurisdiction=NZ|AU|other',
  export:'Write all records and original imported fields to a JSON backup'
};

const required=(o,k)=>{if(typeof o[k]!=='string'||!o[k].trim())throw Error(`--${k} is required`);return o[k].trim();};
export function date(value,label='date',nullable=true){
  if((value===null||value==='')&&nullable)return null;
  const s=String(value??'');
  if(!/^\d{4}-\d{2}-\d{2}$/.test(s)||!Number.isFinite(Date.parse(`${s}T00:00:00Z`))||new Date(`${s}T00:00:00Z`).toISOString().slice(0,10)!==s)throw Error(`${label} must be a real ISO date (YYYY-MM-DD)`);
  return s;
}
export function decimal(v){const s=String(v);if(!/^\d{1,14}(\.\d{1,2})?$/.test(s))throw Error('annual-value must be nonnegative with at most two decimal places');return s;}
const bool=v=>{if(v===true||v==='true'||v==='Yes'||v==='yes'||v==='1')return true;if(v===false||v==='false'||v==='No'||v==='no'||v==='0'||v==='')return false;throw Error('Boolean must be true/false or yes/no');};
const days=o=>{const n=o.days??'60';if(!/^\d+$/.test(String(n))||Number(n)>3660)throw Error('--days must be between 0 and 3660');return Number(n);};
const today=()=>new Date().toISOString().slice(0,10);
const enumValue=(v,choices,label)=>{if(!choices.includes(v))throw Error(`${label} must be ${choices.join('|')}`);return v;};
function args(argv){const o={},p=[];for(const a of argv){if(!a.startsWith('--')){p.push(a);continue;}const i=a.indexOf('=');const k=a.slice(2,i<0?undefined:i);if(Object.hasOwn(o,k))throw Error(`Repeated --${k}`);o[k]=i<0?true:a.slice(i+1);}return {o,p};}

export async function resolve(db,kind,search,parent=null){
  if(!['contracts','obligations','reminders'].includes(kind))throw Error('Unknown record type');
  if(typeof search!=='string'||!search.trim())throw Error('Record reference is required');
  const label=kind==='contracts'?'name':'title';
  const values=[search.trim()]; const scope=parent?' and contract_id=$2':'';if(parent)values.push(parent);
  const exact=await db.query(`select * from ${kind} where (id::text=$1 or lower(reference)=lower($1))${scope}`,values);
  if(exact.length===1)return exact[0];
  const rows=await db.query(`select * from ${kind} where (starts_with(lower(id::text),lower($1)) or strpos(lower(${label}),lower($1))>0)${scope} order by reference`,values);
  if(rows.length===1)return rows[0];
  throw Error(rows.length?`Ambiguous ${kind}:\n${rows.map(r=>`${r.id}  ${r.reference}  ${r[label]}`).join('\n')}`:`No matching ${kind}: ${search}`);
}
async function audit(db,c,actor,action,note){await db.query('insert into activity(contract_id,actor,action,note) values($1,$2,$3,$4)',[c.id,actor,action,note]);}
async function transaction(db,fn,dry=false){await db.exec('begin');try{const result=await fn();await db.exec(dry?'rollback':'commit');return result;}catch(e){await db.exec('rollback');throw e;}}
const contractFields={name:'name',counterparty:'counterparty',owner:'owner',status:'status',currency:'currency','annual-value':'annual_value',effective:'effective_on',ends:'ends_on',nonrenew:'nonrenew_on','auto-renews':'auto_renews','renewal-term':'renewal_term',jurisdiction:'jurisdiction'};
function fields(o){const data={};for(const [k,col] of Object.entries(contractFields)){if(!Object.hasOwn(o,k))continue;let v=o[k];if(typeof v!=='string'&&k!=='auto-renews')throw Error(`--${k} needs a value`);if(['effective','ends','nonrenew'].includes(k))v=date(v,k);if(k==='annual-value')v=decimal(v);if(k==='auto-renews')v=bool(v);if(k==='currency'&&!/^[A-Z]{3}$/.test(v))throw Error('currency needs an uppercase three-letter code');if(k==='status')v=enumValue(v,['draft','active','expired','terminated','archived'],'status');if(k==='jurisdiction')v=enumValue(v,['NZ','AU','other'],'jurisdiction');data[col]=v;}return data;}
async function insert(db,kind,data){const keys=Object.keys(data);return (await db.query(`insert into ${kind}(${keys.join(',')}) values(${keys.map((_,i)=>`$${i+1}`).join(',')}) returning *`,Object.values(data)))[0];}

export const importFields={
 source_id:['Contract ID','ID'],reference:['Contract Number','Reference'],name:['Contract Name','Name'],counterparty:['Counterparty'],owner:['Owner'],
 currency:['Currency','Contract Currency','Value (currency)'],effective:['Effective Date','Start Date'],ends:['Termination Date','End Date'],nonrenew:['Deadline to Nonrenew'],
 auto_renews:['Autorenew','Auto Renew'],renewal_term:['Renewal Term'],annual_value:['Annual Value']
};
async function importContracts(db,o){
 const actor=required(o,'actor'),file=required(o,'file');
 const rows=parseCsv(fs.readFileSync(file,'utf8'));if(!rows.length)throw Error('CSV has no records');
 let map={};if(o.map){map=JSON.parse(fs.readFileSync(required(o,'map'),'utf8'));if(!map||typeof map!=='object'||Array.isArray(map))throw Error('Column map must be an object');for(const [k,v]of Object.entries(map))if(!(k in importFields)||typeof v!=='string'||!v.trim())throw Error(`Unknown or invalid map field: ${k}`);}
 for(const column of Object.values(map))if(!Object.keys(rows[0]).some(k=>k.toLowerCase()===column.toLowerCase()))throw Error(`Mapped column missing: ${column}`);
 const seen=new Set(); const input=rows.map((row,i)=>{
  const read=k=>map[k]?pick(row,map[k]):pick(row,...importFields[k]);
  const source_id=String(read('source_id')).trim();const name=read('name').trim(),counterparty=read('counterparty').trim();
  if(!source_id||!name||!counterparty)throw Error(`Row ${i+2}: Contract ID, Contract Name and Counterparty are required; map your headings explicitly`);
  if(seen.has(source_id))throw Error(`Row ${i+2}: duplicate Contract ID ${source_id}`);seen.add(source_id);
  const reference=read('reference').trim()||`CS-${source_id}`;
  // A total Contract Value is not an annual value. Annual Value is opt-in only.
  const currency=read('currency').trim().toUpperCase();if(!/^[A-Z]{3}$/.test(currency))throw Error(`Row ${i+2}: Currency is required`);
  const data={reference,name,counterparty,owner:read('owner').trim(),status:'draft',currency,annual_value:decimal(read('annual_value')||'0'),effective_on:date(read('effective'),'Effective Date'),ends_on:date(read('ends'),'Termination Date'),nonrenew_on:date(read('nonrenew'),'Deadline to Nonrenew'),auto_renews:bool(read('auto_renews')),renewal_term:read('renewal_term'),jurisdiction:enumValue(o.jurisdiction||'NZ',['NZ','AU','other'],'jurisdiction'),source_id,source_row:row,source_hash:createHash('sha256').update(JSON.stringify(Object.fromEntries(Object.entries(row).sort(([a],[b])=>a.localeCompare(b))))).digest('hex')};
  // Include the interpretation as well as the raw row: a changed map or jurisdiction
  // must not be silently treated as an unchanged import.
  data.source_hash=createHash('sha256').update(JSON.stringify({...data,source_row:Object.fromEntries(Object.entries(row).sort(([a],[b])=>a.localeCompare(b))),source_hash:undefined})).digest('hex');
  return data;
 });
 return transaction(db,async()=>{let added=0,unchanged=0;for(const data of input){
   const old=(await db.query('select * from contracts where source_id=$1',[data.source_id]))[0];
   if(old){if(old.source_hash!==data.source_hash)throw Error(`Source record ${data.source_id} changed. Reconcile it before changing reviewed records.`);unchanged++;continue;}
   const c=await insert(db,'contracts',data);await audit(db,c,actor,'import','ContractSafe CSV imported as draft; source fields retained for review');added++;
 }return {added,unchanged,dry_run:Boolean(o['dry-run']),missing_annual_value:input.filter(r=>!pick(r.source_row,...(map.annual_value?[map.annual_value]:importFields.annual_value))).length};},Boolean(o['dry-run']));
}

export async function run(db,argv){
 const {o,p}=args(argv);const command=p[0]||'help';if(!(command in commands))throw Error(`Unknown command ${command}. Use help.`);
 if(command==='help')return Object.entries(commands).map(([command,usage])=>({command,usage}));
 const allowed={contracts:[],contract:['contract'],'renewals-due':['days'],'obligations-due':['days'],'reminders-due':['days'],'review-queue':['days'],exposure:[], 'owner-workload':[],attention:[],compliance:[],activity:['contract'],'weekly-review':['days'],'add-contract':['reference','actor',...Object.keys(contractFields)],'update-contract':['contract','actor',...Object.keys(contractFields)],'add-obligation':['contract','reference','title','owner','due','actor'],'complete-obligation':['contract','obligation','evidence','actor','date'],'add-reminder':['contract','reference','title','owner','due','actor'],'acknowledge-reminder':['contract','reminder','note','actor','date'],review:['contract','decision','rationale','evidence','actor'],evidence:['contract','title','location','kind','actor'],retention:['contract','personal','review-on','basis','hold','actor'],log:['contract','note','actor'],'draft-renewal':['contract'],import:['file','actor','map','dry-run','jurisdiction'],export:[]};
 for(const k of Object.keys(o))if(k!=='json'&&!allowed[command].includes(k))throw Error(`Unknown option --${k} for ${command}`);
 for(const k of ['json','dry-run'])if(Object.hasOwn(o,k)&&o[k]!==true)throw Error(`--${k} is a bare flag`);
 if(p.length>(command==='import'?2:1))throw Error('Unexpected positional argument');
 if(command==='contracts')return db.query('select id,reference,name,counterparty,owner,status,currency,annual_value,ends_on,nonrenew_on from contracts order by reference');
 if(command==='renewals-due')return db.query('select reference,name,owner,currency,annual_value,action_on,days_left,decision,overdue_obligations,due_reminders from renewal_queue where action_on<=current_date+$1::int order by action_on,reference',[days(o)]);
 if(command==='review-queue')return db.query("select reference,name,status,owner,action_on,decision,overdue_obligations,due_reminders from renewal_queue where (action_on<=current_date+$1::int or action_on is null) and (decision is null or decision='investigate' or status='draft') order by action_on nulls first,reference",[days(o)]);
 if(command==='obligations-due'||command==='reminders-due'){const v=command==='obligations-due'?'obligation_queue':'reminder_queue';return db.query(`select contract,reference,title,owner,due_on,days_left,contract_status from ${v} where due_on<=current_date+$1::int order by due_on,contract`,[days({...o,days:o.days??'14'})]);}
 if(command==='exposure')return db.query("select counterparty,currency,count(*)::int as active_contracts,sum(annual_value) as recorded_annual_value,count(*) filter(where annual_value=0)::int as zero_or_unmapped_values from contracts where status='active' group by counterparty,currency order by currency,counterparty");
 if(command==='owner-workload')return db.query("select owner,count(*)::int as open_items,count(*) filter(where due_on<current_date)::int as overdue from (select owner,due_on from obligation_queue union all select owner,due_on from reminder_queue) x group by owner order by overdue desc,owner");
 if(command==='attention')return db.query("select reference,name,owner,action_on,days_left,overdue_obligations,due_reminders,coalesce(current_date-last_activity,9999) as quiet_days from renewal_queue where days_left<0 or overdue_obligations>0 or due_reminders>0 or btrim(owner)='' or last_activity is null or last_activity<current_date-14 order by action_on nulls first,reference");
 if(command==='compliance')return db.query('select reference,rule,finding from compliance_findings order by reference,rule');
 if(command==='activity'){const c=o.contract?await resolve(db,'contracts',o.contract):null;return db.query(`select c.reference,a.actor,a.action,a.note,a.created_at from activity a join contracts c on c.id=a.contract_id ${c?'where c.id=$1':''} order by a.created_at,a.id`,c?[c.id]:[]);}
 if(command==='contract'){const c=await resolve(db,'contracts',required(o,'contract'));const result={contract:c};for(const t of ['obligations','reminders','reviews','evidence','activity'])result[t]=await db.query(`select * from ${t} where contract_id=$1 order by created_at,id`,[c.id]);return result;}
 if(command==='weekly-review'){const result={};for(const c of ['renewals-due','obligations-due','reminders-due','compliance'])result[c]=await run(db,[c,...(c==='compliance'?[]:[`--days=${days({...o,days:o.days??'7'})}`])]);return result;}
 if(command==='import'){if(p[1]!=='contractsafe')throw Error('Supported import: contractsafe');return importContracts(db,o);}
 if(command==='export'){const backup={format:'contracts-for-claude-code/v1',exported_at:new Date().toISOString(),records:{}};for(const t of ['contracts','obligations','reminders','reviews','evidence','activity'])backup.records[t]=await db.query(`select * from ${t} order by id`);const dir=path.resolve(process.env.OUTPUT_DIR||REPO_ROOT,'exports');fs.mkdirSync(dir,{recursive:true});const file=path.join(dir,`contracts-${randomUUID()}.json`);fs.writeFileSync(file,JSON.stringify(backup,null,2)+'\n',{flag:'wx'});return {file,contracts:backup.records.contracts.length};}
 if(command==='draft-renewal'){
  const history=await run(db,['contract',`--contract=${required(o,'contract')}`]);const c=history.contract;
  const text=`# Internal renewal review: ${c.reference}\n\nDRAFT. Internal decision brief only. Not a contractual notice.\n\n${c.name}\nCounterparty: ${c.counterparty}\nOwner: ${c.owner||'Unassigned'}\nEnd date: ${c.ends_on||'Not recorded'}\nNonrenewal deadline: ${c.nonrenew_on||'Not recorded'}\nRecorded annual value: ${c.currency} ${c.annual_value}\n\n## Open obligations\n\n${human(history.obligations.filter(r=>r.status==='open').map(r=>({title:r.title,due_on:r.due_on,owner:r.owner})))}\n\n## Reminders to review\n\n${human(history.reminders.filter(r=>!r.acknowledged_on).map(r=>({title:r.title,due_on:r.due_on,owner:r.owner})))}\n\n## Evidence references\n\n${human(history.evidence.map(r=>({title:r.title,kind:r.kind,location:r.location})))}\n\nRead the signed agreement, service history and latest quote. Confirm the notice clause, delivery method and recipient with the responsible reviewer before any external notice. Nothing has been sent, renewed or terminated.\n`;
  const dir=path.resolve(process.env.OUTPUT_DIR||REPO_ROOT,'drafts');fs.mkdirSync(dir,{recursive:true});const file=path.join(dir,`renewal-${c.id}-${randomUUID()}.md`);fs.writeFileSync(file,text,{flag:'wx'});return {file,reference:c.reference};
 }
 const actor=required(o,'actor');
 return transaction(db,async()=>{
  if(command==='add-contract'){
   const data={reference:required(o,'reference'),...fields(o)};required(o,'name');required(o,'counterparty');required(o,'owner');
   if(data.status&&data.status!=='draft')throw Error('New contracts start as draft; attach signed evidence before activation');
   const c=await insert(db,'contracts',data);await audit(db,c,actor,command,'Draft agreement created');return c;
  }
  const match=await resolve(db,'contracts',required(o,'contract'));
  const c=(await db.query('select * from contracts where id=$1 for update',[match.id]))[0];
  if(command==='update-contract'){
   const data=fields(o);if(!Object.keys(data).length)throw Error('No changed fields supplied');
   const next={...c,...data};
   if(next.status==='active'){
    if(!next.owner.trim()||!next.effective_on||(next.auto_renews&&!next.nonrenew_on))throw Error('Active agreements need an owner, effective date and any autorenewal notice deadline');
    const e=await db.query("select id from evidence where contract_id=$1 and kind='signed-contract'",[c.id]);if(!e.length)throw Error('Attach signed-contract evidence before activation');
   }
   if(next.status==='archived'){
    const open=await db.query("select id from obligations where contract_id=$1 and status='open' union all select id from reminders where contract_id=$1 and acknowledged_on is null",[c.id]);if(open.length)throw Error('Resolve outstanding obligations and reminders before archiving');
    if(c.legal_hold.trim())throw Error('Review and explicitly clear the legal hold before archiving');
   }
   const keys=Object.keys(data);const updated=(await db.query(`update contracts set ${keys.map((k,i)=>`${k}=$${i+1}`).join(',')} where id=$${keys.length+1} returning *`,[...Object.values(data),c.id]))[0];
   await audit(db,c,actor,command,JSON.stringify({before:Object.fromEntries(keys.map(k=>[k,c[k]])),after:data}));return updated;
  }
  if(command==='add-obligation'||command==='add-reminder'){
   if(c.status==='archived')throw Error('Reopen the archived agreement before adding work');
   const type=command==='add-obligation'?'obligations':'reminders';const record=await insert(db,type,{contract_id:c.id,reference:required(o,'reference'),title:required(o,'title'),owner:required(o,'owner'),due_on:date(required(o,'due'),'due',false)});await audit(db,c,actor,command,`${record.reference}: ${record.title}`);return record;
  }
  if(command==='complete-obligation'){
   const r=await resolve(db,'obligations',required(o,'obligation'),c.id);if(r.status!=='open')throw Error('Obligation already complete');
   const completed=date(o.date??today(),'date',false);if(completed>today())throw Error('Completion cannot be future-dated');
   const result=(await db.query("update obligations set status='done',completed_on=$1,completion_evidence=$2 where id=$3 returning *",[completed,required(o,'evidence'),r.id]))[0];await audit(db,c,actor,command,`${r.reference}: ${o.evidence}`);return result;
  }
  if(command==='acknowledge-reminder'){
   const r=await resolve(db,'reminders',required(o,'reminder'),c.id);if(r.acknowledged_on)throw Error('Reminder already acknowledged');
   const completed=date(o.date??today(),'date',false);if(completed>today())throw Error('Acknowledgement cannot be future-dated');
   const result=(await db.query('update reminders set acknowledged_on=$1,acknowledgement=$2 where id=$3 returning *',[completed,required(o,'note'),r.id]))[0];await audit(db,c,actor,command,`${r.reference}: ${o.note}`);return result;
  }
  if(command==='review'){
   if(!['draft','active'].includes(c.status))throw Error('Renewal review requires a draft or active agreement');
   const r=await insert(db,'reviews',{contract_id:c.id,reviewer:actor,decision:enumValue(required(o,'decision'),['renew','renegotiate','exit','investigate'],'decision'),rationale:required(o,'rationale'),evidence:required(o,'evidence'),based_on_end:c.ends_on,based_on_nonrenew:c.nonrenew_on,based_on_value:c.annual_value,based_on_currency:c.currency});await audit(db,c,actor,command,`${r.decision}: ${r.rationale}`);return r;
  }
  if(command==='evidence'){
   const r=await insert(db,'evidence',{contract_id:c.id,title:required(o,'title'),location:required(o,'location'),kind:enumValue(required(o,'kind'),['signed-contract','amendment','notice','other'],'kind'),actor});await audit(db,c,actor,command,`${r.kind}: ${r.location}`);return r;
  }
  if(command==='retention'){
   if(!Object.hasOwn(o,'personal'))throw Error('--personal is required');const personal=bool(o.personal);const review=date(required(o,'review-on'),'review-on',false);const basis=required(o,'basis');
   if(Object.hasOwn(o,'hold')&&typeof o.hold!=='string')throw Error('--hold needs text, or an explicit empty value to clear');
   const hold=Object.hasOwn(o,'hold')?String(o.hold):c.legal_hold;
   const result=(await db.query('update contracts set contains_personal=$1,retention_review_on=$2,retention_basis=$3,legal_hold=$4 where id=$5 returning *',[personal,review,basis,hold,c.id]))[0];await audit(db,c,actor,command,JSON.stringify({before:{personal:c.contains_personal,review:c.retention_review_on,basis:c.retention_basis,hold:c.legal_hold},after:{personal,review,basis,hold}}));return result;
  }
  if(command==='log'){await audit(db,c,actor,'note',required(o,'note'));return {reference:c.reference,recorded:true};}
  throw Error(`Unimplemented command ${command}`);
 });
}

export function human(result){
 if(Array.isArray(result)){if(!result.length)return '(none)';const cols=Object.keys(result[0]).filter(k=>!['id','contract_id','source_row','source_hash','created_at','updated_at'].includes(k));return table(result,cols.map(key=>({key,label:key,width:48,format:v=>v&&typeof v==='object'?JSON.stringify(v):String(v??'')})));}
 if(result&&typeof result==='object'){return Object.entries(result).map(([k,v])=>v&&typeof v==='object'?`${k}\n${human(Array.isArray(v)?v:[v])}`:`${k}: ${v??''}`).join('\n\n');}
 return String(result);
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){let db;try{db=await getDb();const result=await run(db,process.argv.slice(2));console.log(process.argv.includes('--json')?JSON.stringify(result,null,2):human(result));}catch(e){console.error(e.message);process.exitCode=1;}finally{if(db)await db.close();}}
