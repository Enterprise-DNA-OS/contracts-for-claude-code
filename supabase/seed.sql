insert into contracts(id,reference,name,counterparty,owner,status,currency,annual_value,effective_on,ends_on,nonrenew_on,auto_renews,renewal_term,jurisdiction,contains_personal,retention_review_on,retention_basis,legal_hold) values
('10000000-0000-0000-0000-000000000001','C-1001','Harbour software licence','Harbour Systems','Aroha','active','NZD',24000,current_date-340,current_date+25,current_date-5,true,'annual','NZ',true,current_date-10,'Review customer contact data at agreement end',''),
('10000000-0000-0000-0000-000000000002','C-1002','Harbour distribution agreement','Harbour Logistics','Ben','active','AUD',18000,current_date-200,current_date+70,current_date+10,true,'annual','AU',true,current_date+90,'Supplier contact records needed for current performance',''),
('10000000-0000-0000-0000-000000000003','C-1003','South Island support','Southern Support','','draft','NZD',9600,current_date-90,current_date+40,null,true,'annual','NZ',false,null,'',''),
('10000000-0000-0000-0000-000000000004','C-1004','Archive storage agreement','Archive Services','Aroha','terminated','NZD',1200,current_date-700,current_date-30,null,false,'','NZ',true,current_date-1,'Dispute evidence pending counsel review','Case LEGAL-27: retain until counsel releases hold')
on conflict do nothing;
insert into obligations(id,contract_id,reference,title,owner,due_on) values
('20000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','O-1','Obtain service availability report','Aroha',current_date-7),
('20000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000002','O-1','Check carrier insurance evidence','Ben',current_date+4),
('20000000-0000-0000-0000-000000000003','10000000-0000-0000-0000-000000000004','O-1','Obtain archive return receipt','Aroha',current_date-2)
on conflict do nothing;
insert into reminders(id,contract_id,reference,title,owner,due_on) values
('30000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','R-1','Review exit decision with owner','Aroha',current_date-3),
('30000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000002','R-1','Check next-term quote','Ben',current_date+2)
on conflict do nothing;
insert into evidence(id,contract_id,title,location,kind,actor) values
('40000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000002','Signed distribution agreement','demo://archive/C-1002.pdf','signed-contract','Demo operator')
on conflict do nothing;
insert into activity(id,contract_id,actor,action,note,created_at) values
('50000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','Demo operator','seed','Fictional demo. No real agreement or counterparty.',now()-interval '35 days'),
('50000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000002','Demo operator','seed','Fictional demo. Review next-term quote.',now()-interval '3 days'),
('50000000-0000-0000-0000-000000000003','10000000-0000-0000-0000-000000000003','Demo operator','seed','Fictional draft with missing owner and deadline.',now()-interval '20 days')
on conflict do nothing;
