# Contract evidence and retention checks

Sources checked 8 October 2026. This is an administrative record checker. It does not interpret an agreement, calculate service of notice, certify compliance or provide legal advice. A responsible reviewer decides the rules for each business and jurisdiction.

## NZ-IPP9: personal information retention

The [NZ Privacy Commissioner, Principle 9](https://www.privacy.org.nz/privacy-principles/9/) requires personal information to be kept only while needed for a lawful purpose. There is no universal contract retention period in that principle. The checker flags personal-information records with no retention purpose, no review date or a review date that has arrived. The date is a business review date, not a statutory destruction deadline. Other record duties and legal holds still matter.

## AU-APP11: review retention and security

The [OAIC APP 11 guidance](https://www.oaic.gov.au/privacy/australian-privacy-principles/australian-privacy-principles-guidelines/chapter-11-app-11-security-of-personal-information) describes security duties and, where applicable, destruction or de-identification when information is no longer needed, with exceptions including legal retention requirements. Confirm whether the business is an APP entity and what exceptions apply. The AU check uses the same missing or due review fields as a prompt for that assessment. It does not inspect security controls or decide applicability.

## Internal policies

POLICY-OWNER flags draft or active agreements with no named owner. POLICY-RENEWAL flags autorenewing agreements with no recorded nonrenewal deadline. POLICY-EVIDENCE flags active agreements without a signed-contract evidence reference. POLICY-IMPORT flags drafts for review. These are local policies, not laws or vendor limitations.

An evidence reference is a location supplied by the operator. The software does not open the file, verify a signature, establish authenticity or prove delivery. Add actual documents to a protected archive. Imported execution statuses never activate agreements. Activation requires an owner, effective date, signed evidence reference and, for autorenewals, a recorded notice deadline.

Record the date from the signed clause, including its real notice rules. No default notice period is invented. A missed date is flagged, not treated as proof the agreement has renewed. A review decision of exit does not terminate a contract or send notice. A changed end date, nonrenewal date, currency or annual value makes the previous decision stale.

A legal hold is stored as text and blocks archiving until explicitly cleared with an activity record. Retention findings continue while a hold exists so the owner can review it. No command destroys records or documents. Shared use requires authenticated identities, restricted database privileges and tested backups. Actor names in activity are supplied by the operator, not verified identities; the history is not tamper-proof against database administrators.
