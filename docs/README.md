# QuorumCurrent specification

## Identity

- Idea ID: IDEA-050
- Project name: QuorumCurrent
- Project slug: quorum-current
- Category: Projects
- Status: BUILDING; admission and frontend baseline passed, execution pending
- Repository: local independent child; public repository pending Phase11
- Target network: Studio Dev61997 under workspace D1

## One-sentence product hook

Delegate by topic. Keep every voice accounted for.

QuorumCurrent helps a three-person council make a funded decision using
topic-limited proxies, with independently judged scope and visible vote paths.

## Scope and non-goals

V1 creates protocol decisions, scoped proxies and direct YES/NO fallback ballots.
One actual sponsor deposits2GEN; at least two of three original voices must
resolve YES for the fixed beneficiary to receive the grant. Each origin counts
once; a proxy cycle and all paths entering it abstain. Unclear interpretation
does not settle. Expiry returns the unallocated purse to its actual sponsor.

No external DAO execution, identity attestations, real service-performance
verification, private ballots, arbitrary members, variable thresholds, weighted
membership, or proof of independent ownership of demonstration wallets is claimed.
No frontend fixture is canonical. Local success is not deployed execution proof.

## Provisional capability sketch

Sponsor: fund an immutable proposal, beneficiary, three member addresses and
record/review deadlines; recover an expired unsettled purse. Each named member:
ratify the exact proposal and author its own target, scope and direct ballot once.
Members/sponsor: request scope review after collection closes and before expiry.
Anyone: read decisions, member records, attempts, vote paths and results. Each
credit owner: withdraw only their own GEN. Closure requires zero liability.

Views must provide IDs, proposal/digest, public roles, deadlines, recorded-member
count, canonical status, each signed record, current attempt, normalized scope
labels, resolved paths/roots, YES/NO/abstaining original voices and credit balance.
No success is shown at submission; users see signature request, submitted,
accepted/decided, finalized, failure and retry separately. Canonical views reload
after finality. All write controls remain honestly unavailable before integration.

## Product/frontend blueprint

### Human users and jobs

| User | Job | Decision needed |
| --- | --- | --- |
| Council sponsor | Set up one clear decision and budget | Who participates, what is funded, when it closes |
| Named member | Represent their voice directly or within a topic mandate | Exact proposal, delegate, scope and direct ballot |
| Returning participant | Understand how their voice contributed | Readable path, tally, final consequence and history |
| Sponsor or beneficiary with credit | Recover or receive their own funds | Legal recovery/withdrawal and canonical credit |

### Named page/route map and navigation

Persistent header links: Overview, Decisions, My account, Guide, plus a primary
New decision action. Logo links home. URL routes support direct links/back.
Detail links return to Decisions. Active page is indicated with aria-current.

| Route | Purpose and primary action | Data and states | Mobile |
| --- | --- | --- | --- |
| / | Value-first entry; explain scoped representation; start a decision | Honest network/setup disclosure; three-step explanation; link to guide and existing decisions | Single-column hero, full-width CTA; no decorative metrics |
| /decisions/new | Two-step proposal/council then review/fund | Labeled proposal/title, three addresses, fixed beneficiary, deadlines; review exact2GEN and separate fees; validation, back, signature/submitted/finality/failure | Stacked fields, wrapped addresses and persistent step indicator |
| /decisions | Find and revisit decisions | Canonical list; title/ID search, active/final status filter; loading, error/retry, genuine empty state and create action | Stacked list rows, no wide data table |
| /decisions/:id | Understand proposal, record representation, follow review and result | Canonical detail, human status, member cards, contextual record/review/recover, timeline; own origin path/tally after review; missing/loading/error/retry | Cards stack; paths rendered as readable ordered text |
| /account | Manage connected wallet and own credits | Wallet picker/disconnect; canonical own credit; withdrawal/finality/retry; disconnected/loading/error/zero credit | Wrapped address, large controls |
| /guide | Learn scopes, cycles, deadlines, GEN and honest limits | Functional topic anchors and links to create/list/account; no fabricated onchain data | Readable measure and accessible headings |
| unknown | Recover from invalid link | Clear not-found, return to Decisions | Single column |

Main journey: overview -> new proposal/council -> review/fund -> decision detail
-> each member records -> request review -> read paths/result -> account withdrawal
-> return to decision history. Before Phase7, configured adapter absence is shown
as unavailable; the frontend never fabricates a completed decision to demonstrate
the flow. Form review and navigation work without a wallet or deployed contract.

### Visibility matrix

| Function/data | Visibility | Eligibility | Reason |
| --- | --- | --- | --- |
| Proposal, council, scope, direct ballot, deadlines | USER_PRIMARY | Reader/member | Understand and author exact decision |
| Status, tally, origin representation path, outcome | USER_PRIMARY | Reader | Understand voice and consequence |
| New/record/review/recover/withdraw controls | USER_CONTEXTUAL | Matching role and legal canonical state/time | Complete or recover own task |
| Credit and2GEN budget | USER_PRIMARY | Credit owner / decision reader | Know exact value destination |
| Wallet address and network | USER_CONTEXTUAL | Connected user | Click for account menu and logout |
| Contract address, raw attempt IDs, hashes, Explorer | USER_CONTEXTUAL | Optional verification disclosure | Verify independently without dominating product |
| Raw validator output, storage, grading/submission internals | SYSTEM_ONLY | No product control | Never part of primary workflow |

### Provisional UI action matrix

| Control | Capability | Role/state | Input/value | Finality and recovery |
| --- | --- | --- | --- | --- |
| Review decision / Fund2GEN | create_decision | Sponsor, valid future windows | proposal, council, beneficiary, deadlines;2GEN | Wait finalized SUCCESS, reload list/detail; preserve failed form |
| Record my representation | record_member | Unrecorded named member, before record deadline | exact proposal digest, target, scope, YES/NO;0GEN application value | Finalized canonical record; reject wrong entity/late/duplicate |
| Resolve representation / Try review again | review | Sponsor/member, all recorded, record deadline<=now<expiry | decision ID;0GEN application value | Reload attempt/result; uncertainty is retryable, never success |
| Recover expired budget | recover | Actual sponsor, unsettled, now>=expiry | decision ID;0GEN application value | Reload decision and own credit; no duplicate credit |
| Withdraw my GEN | withdraw | Connected credit owner, positive credit | own credit only;0GEN application value | Finalized parent plus transfer/canonical balance evidence |
| Close completed decision | close | Sponsor, zero escrow/liability | decision ID;0GEN application value | Reload zero closure; cannot discard another person's credit |
| Refresh / search / filter | views/local presentation | Any reader | ID/title/filter | Fresh canonical reads; errors remain errors |
| Connect / select / disconnect | provider session | User selection | discovered EVM wallet | No automatic first provider; disconnect clears clients/actions |

### User-facing state language

| Canonical | Label | Next step |
| --- | --- | --- |
| COLLECTING | Waiting for council | Named members record before deadline |
| READY | Ready for review | Wait for collection close, then request review |
| RETRYABLE | More clarity needed | Retry before expiry or sponsor recovers after expiry |
| APPROVED | Council approved | Fixed beneficiary has grant credit |
| REJECTED | Council did not approve | Sponsor has refund credit |
| RECOVERED | Budget recovered | Sponsor can withdraw |
| CLOSED | Completed | Read history; no new writes |

### Wallet and network behavior

EIP-6963 discovery plus injected fallbacks (ethereum/providers, OKX, Rabby,
MetaMask, Coinbase and Brave when present). A centered native dialog lists actual
providers. Request accounts only after explicit selection. Clickable account
button opens account menu with disconnect. Clear selected provider/account/client
on disconnect and wallet account loss; bind anew on account change. Do not persist
financial state. Switch/add verified Studio Dev EVM-compatible wallet chain before
writes. IC reads use a same-origin RPC proxy as required; wallet writes use the
chosen provider. Phase7 verifies the real SDK account adapter and browser CORS.

### Visual preservation constraints

Design source: project-local ui-ux-pro-max, invoked after this blueprint and before
frontend source. Its verified design result will be recorded below. Preserve
palette, typography, layout, page arrangement and navigation after Phase3B.
Later phases may only wire adapters or make necessary minimal functional fixes.
Each screen has empty/loading/error/success and applicable transaction states;
no screenshot-only page or fixture disguised as a live read.

## Fingerprint and trust boundary

Trust problem: neutral activation of topic-scoped transitive proxies without a
chair duplicating, dropping or reassigning original voice weight. Actors/adversary:
three distinct registered members, opposed delegates/dissenters, actual sponsor
and fixed beneficiary. Evidence class + authenticity: constitutive authenticated
proposal and member mandate/ballot records bound to domain/version/digest/time.
Consensus question: applicability of each non-self delegation to this proposal.
State machine: funded collection, frozen records, review/retry, per-origin
resolution, grant/refund credit, withdrawal and zero closure. Direct consequence:
two YES of the fixed three original voices grants2GEN to the fixed beneficiary;
otherwise sponsor refund, with cycles abstaining. Reuse surface: typed decision,
member,attempt,resolution,tally,credit/accounting views and bounded lifecycle writes.

A signed database or chair-run LLM can record or count an already chosen graph;
it leaves scope interpretation under one party's control. GenLayer validators
must independently classify those scope edges before deterministic voting and
funded settlement. No LLM chooses target,ballot,threshold,recipient,amount or root.

## Mandatory admission gates

| Gate | Result | Evidence/reason |
| --- | --- | --- |
| Replacement | PASS_ADMISSION | Neutral scope interpretation is lost with a single chair/backend |
| Judgment | PASS_ADMISSION | Natural-language topic inclusion/exclusions require semantic judgment |
| Evidence availability | PASS_ADMISSION | Bounded public canonical inputs; two frozen Studio Dev unsigned viability runs SUCCESS,12/12 labels each |
| Evidence authenticity | PASS_ADMISSION | Complete matrix below; sender/domain/version/entity/digest/time/uniqueness precede consequence |
| Equivalence | PASS_ADMISSION | Exact complete semantic labels by immutable member ID, independently replayed |
| Consequence | PASS_ADMISSION | Active edges change actual represented voting weight and fixed2GEN grant/refund |
| Adversarial | PASS_ADMISSION | Delegates seek broad scope,dissenters narrow scope; sponsor/beneficiary oppose payout |
| State model | PASS_ADMISSION | Keyed records,append-only attempts,one origin unit,explicit time guards and recovery |
| Reuse | PASS_ADMISSION | Proposed DAOhaus committee,Snapshot bridge,LangGraph council interfaces; no adopters claimed |
| Contract count | PASS_ADMISSION | One independent state/accounting owner; no mirror consumer |
| Differentiation | PASS_ADMISSION | Topic activation plus transitive origin conservation differs from breach punishment,motion equivalence,policy conjunction and pledge closure |
| Claim-to-code | PASS_ADMISSION | Complete planned method/view/test/evidence matrix below |
| Full lifecycle | PASS_ADMISSION / PENDING_EXECUTION | Complete positive/retry/cycle/partial/expiry/value/browser acceptance design; real execution still required |
| Scope honesty | PASS_ADMISSION | Protocol choices only; no identity,external execution,performance,independent demo operators or adoption claim |

## State model

One project-specific QuorumCurrent contract. Structured storage: Decision records
keyed by stable caller-chosen IDs matching[A-Za-z0-9_-],1-64 characters; immutable
sponsor,beneficiary,title1-80 ASCII,proposal1-2400 ASCII,three distinct member
addresses,record_deadline,expiry,digest,domain,version; mutable status,recorded
count,attempt counter,escrow,YES/NO/ABSTAIN counts. Member records keyed by
decision ID plus exact slot0/1/2 store address,target,scope1-1200 ASCII for proxy
or empty for self,direct YES/NO ballot,proposal digest,record timestamp and
accepted scope label. Attempt records keyed by decision ID/index store three
structured labels,source snapshot digest,outcome and timestamp. A DynArray of
decision IDs supports bounded paginated listing; no global last-result storage.
Global bigint received/locked/credit_total/withdrawn and str-keyed own credits.

Clock: datetime parsed from gl.message.raw["datetime"] using an aware UTC datetime
and integer ordinal/hour/minute/second arithmetic. Never host time or caller time.
Create requires now<record_deadline<expiry,expiry-now<=7days. Record requires
now<record_deadline. Review requires record_deadline<=now<expiry; maximum3
successful recorded attempts. Expiry equality already closes review and allows
recovery. Every public entrypoint calls its own clock guard even with stale phase.
Creation/record immutable digest binds QC_V1,chain,contract,ID,sponsor,beneficiary,
member set,title,proposal and both deadlines. No edits after creation/recording.

COLLECTING -> READY when third member records; READY/RETRYABLE -> APPROVED or
REJECTED on valid complete judgment and tally; UNCLEAR/technical source failure
-> RETRYABLE without moving escrow; COLLECTING/READY/RETRYABLE -> RECOVERED
by actual sponsor at expiry; APPROVED/REJECTED/RECOVERED -> CLOSED only after
zero escrow and global credit liability. Closed IDs remain readable and unusable.
Any missing/duplicate/extra/invalid normalized semantic ID or self classification
is rejected before mutation; technical model/parser failures cannot become NO.

## Write-method safety matrix

| Method | Caller | Allowed states | Forbidden states | Temporal/expiry gate | Idempotency | Value/accounting effect | Views affected | Negative tests |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| create_decision(id,title,proposal,m0,m1,m2,beneficiary,record_deadline,expiry) | Actual authenticated sponsor | Unused ID;valid three-member configuration | Existing/closed ID,invalid inputs,zero/duplicate member/beneficiary | now<record_deadline<expiry<=now+7days; equality late | Duplicate ID rejects,never overwrites | Payable exactly2GEN;received+2,locked+2,decision escrow2 | list_decisions,get_decision,get_accounting | wrong value,duplicate ID,invalid member/recipient/title/proposal/deadlines; unchanged state/accounting |
| record_member(id,digest,target,scope,ballot) | Exact registered unrecorded origin | COLLECTING,own slot empty | Wrong sender,recorded slot,READY/settled/closed,wrong digest,target or enum | now<record_deadline; equality late independent of phase | Duplicate rejects before change | Nonpayable;no credit/GEN effect;third record sets READY | get_decision,get_member | wrong actor/entity/version/digest,target,empty/oversized proxy scope,late/stale phase,duplicate; state/accounting unchanged |
| review(id) | Sponsor or named member | READY/RETRYABLE,three records,attempts<3 | Partial/settled/closed,outsider,attempt cap | record_deadline<=now<expiry; exact start allowed,expiry forbidden | One append-only attempt per successful review;settlement only once | Valid complete labels derive graph and move exactly2GEN from escrow to one fixed credit;UNCLEAR only appends retry,no money | get_decision,get_attempt,get_resolution,get_credit,get_accounting | wrong caller/state/time,invalid leader/coverage/class/root/path,repeat settlement,malicious injection; invalid output leaves accounting unchanged |
| recover(id) | Actual sponsor only | COLLECTING/READY/RETRYABLE,remaining escrow2GEN | Settled/recovered/closed,wrong caller | now>=expiry; equality allowed,partial/missing mandates included | Duplicate rejects,no double credit | escrow2->0;locked-2;actual sponsor credit+2 | get_decision,get_credit,get_accounting | wrong caller,state,expiry-1/equality/+1 with stale phase,partial/attempt-cap/unclear,duplicate,unchanged rejected ledger |
| withdraw() | Authenticated owner of positive own credit | Own credit>0,valid EVM/EOA sender boundary | Zero credit,attempt to choose another recipient,duplicate zero withdrawal | N/A:existing credit never expires | Zeroes own credit before message;second call rejects | credit_total decreases;withdrawn increases;EVM recipient interface emits exact own amount | get_credit,get_accounting | no credit,other actor cannot draw victim credit,double call,ledger invariant,payability metadata; exact EVM destination/value |
| close(id) | Actual sponsor | APPROVED/REJECTED/RECOVERED,escrow0,global credit_total0 | Pending/retryable,remaining own/other credit,CLOSED,wrong caller | N/A:completed zero-liability housekeeping only | CLOSED duplicate rejects;history retained | No money;cannot discard another person's credit | get_decision,get_accounting | wrong caller/state,positive liability,duplicate,unchanged ledger |

All nonpayable methods reject incoming value through actual metadata,not by
reading gl.message.value in nonpayable bodies. Withdrawal with another existing
own credit is legitimate; "wrong caller" means it cannot select/draw victim
credit. No callback boundary exists. Recovery/close are first-class safety writes.

## Evidence policy and Authority Matrix

All consequential sources are canonical contract state. No claimant URL,uploaded
JSON,screenshot,commit hash or signature-looking text is accepted as an external
fact. Digest uses the exact canonical field serialization; the review recomputes
the decision digest and member bindings before semantic work. No fetched-content
digest exists in V1: no external factual fetch controls payout. Scope/body text
cannot define IDs,authority,canonical objective,threshold or value destination.
The model receives only exact proposal and delegated scope IDs/texts;ballots,
targets and amount are kept outside its authority. No arbitrary crawling or URLs.

| Consequential claim/fact | Evidence/artifact | Data controller | Authoritative source/issuer | Deterministic verification | Canonical objective/entity/actor binding | Freshness/anti-replay | Semantic role after verification | Non-penalizing failure state | Consequence blocked | Required negative test |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Exact funded proposal and fixed recipients | Create fields and member ratification | Sponsor authors;each member independently accepts | Runtime authenticated sender and canonical state | exactly2GEN,three distinct valid members,nonzero recipient,bounded ASCII,exact domain/digest | QC_V1,chain/contract,decision ID,sponsor/beneficiary,members,proposal,deadlines | unique permanent ID,immutable creation,ratification before deadline | Proposal meaning only,never external truth | Reject before mutation | Activation,settlement,credit,payout | Valid bytes/digest for another ID/contract/actor/version cannot authorize;injection cannot change objective or recipient |
| Origin authorizes exact proxy scope,target and direct ballot | One member record bound to proposal digest | Only registered origin sender | Runtime signature/sender plus locked membership | caller own slot,target in0..2,YES/NO enum,digest equality,scope bounds,one write | network/contract/decision/version/proposal hash/origin,target | one record,canonical record timestamp,now<deadline,no supplied timestamp trusted | APPLIES/NOT_APPLICABLE/UNCLEAR only for this scope | Reject without mutation | Graph,tally,all money and rights changes | Valid-digest actor-controlled artifact,wrong sender/entity/version,duplicate or forged future/late record;all ledger/hard state unchanged |
| Scope vector justifies this graph/tally | Normalized leader result independently replayed | Leader untrusted;validators independently evaluate | Consensus with deterministic settlement invariants | expected IDs exactly once,valid enum,self labels DIRECT derived,matching snapshot | exact frozen proposal/records/current attempt digest | append-only attempt index,max3,review interval | Only edge applicability;no model roots,ballots,payees or amounts | Invalid result reverts;uncertainty RETRYABLE | Settlement,credit,access,routing and payout | Malicious valid-shape contradictory label,missing/extra/duplicate ID,unsupported root/cycle/path,changed authority/payout;accounting unchanged |

Unavailable parser/model/evidence -> RETRYABLE attempt holding the purse until
retry or expiry recovery;malformed accepted leader output -> revert before
mutation. Contradictory/ambiguous semantic meaning -> UNCLEAR,never a penalty.
Timestamps/version signatures for external facts are N/A because no external
facts enter the protocol;no caller-supplied timestamp or issuer can replace runtime
authentication. Test wrong record timestamp/bindings in the runtime harness.

## Consensus and settlement invariants

Leader captures immutable proposal and records before entering nondeterminism.
For each non-self target,LLM returns member ID and one exact applicability enum.
Self representation yields DIRECT in deterministic code and is omitted from the
model task. Normalize bounded JSON/fences/transport without repairing an unknown
core ID/enum. Ignore optional rationale wording and unknown noncritical keys.
Custom validator uses sandboxed run_nondet_default,returns False unless leader
is gl.vm.Return,validates candidate meaning,independently reruns the same task
and compares the exact full applicability vector. No shape-only agreement.

Before any mutation: exactly IDs0,1,2 once,valid classes,immutable target/ballot,
correct proposal/member digest,complete source coverage. Any UNCLEAR produces
only retry. For complete labels,origin0/1/2 each follows APPLIES edges. Self or
NOT_APPLICABLE terminates at that member's direct ballot. Repeated vertex means
ABSTAIN for the originating voice. Traverse at most three distinct members.
Derive roots and paths in code;the model cannot supply them. Assert each root
is reachable,each cycle abstention has a repeated vertex,and YES+NO+ABSTAIN==3.
Every origin contributes exactly one unit;threshold stays2 even with abstentions.
Root/fault/downstream LLM classes do not exist;coverage/reachability/cycle
analogues are tested explicitly. No extra/missing/duplicate IDs or invalid enum.

YES>=2 -> APPROVED,beneficiary credit exactly2GEN. Otherwise REJECTED,sponsor
credit exactly2GEN. No split or rounding residual. Before settlement,purse==2GEN
and unsettled status;after settlement,purse0 and exactly one credit. Invalid
normalization has no credit,settlement,rights or other hard-state consequence.

## Consequence,value destinations and accounting

| Value/source | Locked state | Release/refund | Terminal/recovery branches | Duplicate/late/retry | Canonical proof |
| --- | --- | --- | --- | --- | --- |
| Actual sponsor2GEN purse | COLLECTING/READY/RETRYABLE | Valid approved tally:fixed beneficiary2GEN;valid nonapproval or expiry:actual sponsor2GEN | APPROVED/REJECTED/RECOVERED then CLOSED after withdrawal;partial/missing mandates and attempts exhausted recover at expiry | Incoming value only once;late record/review reject;retry retains2GEN;settle/recover once | get_decision escrow/status,get_credit,get_accounting,exact native balance/child proof |
| Credit owned by sender | Structured credit map until withdrawal | Exact owner to same owner EVM address | Never expires;closure blocked while credit liability exists | Debit before external message;no duplicate withdrawal,arbitrary recipient or actor override | get_credit,get_accounting,receipt and exact contract balance decrease |

Invariant:received==locked+credit_total+withdrawn;all quantities nonnegative;
each decision escrow either2GEN unsettled or0 terminal. Fee0,slashing0;protocol
transaction fees are separate. Withdrawal uses only @gl.evm.contract_interface
for an EVM recipient,never gl.chain.Account. Parent finalization and zero internal
credit are insufficient transfer proof;verify child receipt and exact native
contract debit plus recipient evidence. A failed child is not automatically
refunded;do not claim completed withdrawal absent delivery evidence. Deployment
recovery must preserve such failures or explicitly abandon a broken revision.
Consequences commit through GenLayer consensus;frontend and evidence wait for
finalized successful execution and canonical finalized reads.

## Reusable interface and views

Writes: six exact methods in safety matrix. No generic raw artifact/verdict write.
Views: get_decision(id),get_member(id,index),get_attempt(id,index),
get_resolution(id),get_credit(address),get_accounting(),list_decisions(offset,limit).
Views return JSON transport strings over typed structured storage;the client
parses/validates these into typed objects. JSON is not a raw write-only registry.
Listing caps limit at50 and rejects invalid pagination. Credit display is formatted
GEN;raw storage/accounting is disclosed only for technical verification.
No consumer/callback in V1;sender authentication,idempotency and failure handling
for external execution belong to a future independently evidenced integration.

## Frontend lifecycle coverage matrix

| Canonical state | User action | Contract write | UI component | Frontend test | Evidence status |
| --- | --- | --- | --- | --- | --- |
| unused ID | Prepare/review/fund2GEN | create_decision | CreateDecision review form | valid/invalid review,exact2GEN SDK adapter,finality/reload | Local form proof;real write PENDING |
| COLLECTING,eligible member | Record own representation | record_member | RecordMember | role/time/digest/target,selected wallet,canonical reload | UI built;real write PENDING |
| READY/RETRYABLE,review window | Resolve/retry scopes | review | DecisionDetail next step | exact boundary,role,accepted/finalized/error/retry,reload | UI built;real write PENDING |
| unsettled,expiry | Recover own budget | recover | DecisionDetail contextual action | sponsor/time/stale-phase gating,credit reload | UI built;real write PENDING |
| own positive credit | Withdraw | withdraw | Account | no fake balance,own credit,real SDK value/destination,delivery feedback | UI built;real write PENDING |
| zero-liability terminal | Close completed decision | close | DecisionDetail contextual action | sponsor/zero-liability only,closed reload | Minimal control pending Phase7;not yet browser-complete |
| all phases | Read/filter/history/paths | views only | Decisions/detail/account | canonical empty/error/search/path/route tests |13 local tests and18 viewport checks baseline;deployed read PENDING |

## Threat model and test plan

| Threat | Attack | Mitigation | Required test |
| --- | --- | --- | --- |
| Impersonated origin | Another sender submits valid hash/text | Locked member address and digest before mutation | Unauthorized actor,valid-digest forgery,wrong decision/version |
| Authority injection | Scope/proposal redefines target,IDs,payout or vote | Structured locked fields,isolated model task,code consequence | Injection fixture and immutable recipients/ledger |
| Biased leader | Valid-shaped but different scope labels | Independent semantic replay | replay mismatch rejects;non-Return false |
| Weight inflation | Duplicate IDs,unreachable root or cycle broken by choice | Exact coverage and deterministic bounded path | all graphs/ballots reference cross-check,invalid root/path assertions |
| Denominator manipulation | Cycles shrink denominator and one YES wins | Fixed threshold2 of3 | one YES plus two abstentions rejected |
| Temporal griefing | Stale phase admits late record/review or early refund | Each entrypoint's exact clock/caller/state checks | -1/equality/+1 for every bound,unchanged rejected state |
| Double payout | Repeat review/recover/withdraw/close | Terminal state,zero escrow,own ledger debit | duplicates/closed/wrong actor/accounting across each value write |
| Orphaned partial round | Member never records or semantic attempts fail | Sponsor unilateral expiry recovery | partial0/1/2 records,UNCLEAR/attempt cap,exact expiry |
| False finality | Signature/hash/accepted error shown as success | SDK execution status plus finalized read and transfer proof | raw/normalized parser cases;frontend finality and error tests |

Direct tests must exercise real GenVM SDK storage via genlayer-test direct mode,
plus semantic validator function replay separately because direct leader success
does not prove validator agreement. Metadata/AST asserts payable creation,
nonpayable remaining writes,ASCII/header,one recognized contract and clock guards.
Raw Studio and normalized SDK parser fixtures include successful finality,error,
missing/contradictory result;no critical skips/xfails. Full check includes semantic
genvm-lint check,all direct/tooling/frontend tests,TypeScript and production build.

## Claim-to-code matrix

| Claim | Contract method/state | View/read | Test | Network evidence |
| --- | --- | --- | --- | --- |
| Topic-scoped proxies are independently judged | record_member,review/labels | get_member,get_attempt | valid scopes,injection,malicious leader replay | PENDING Phase8 finalized review and bound source |
| Every original voice counted once through a valid path | review/resolution/tally | get_resolution,get_decision | exhaustive graph+ballot reference,cascade/cycle/fixed threshold | PENDING Phase8 canonical origin paths/tally |
| Only fixed beneficiary/sponsor receives2GEN | create_decision,review,recover | get_credit,get_accounting | amount/recipient/duplicate/isolated decisions | PENDING Phase8 receipts/state/native proof |
| Partial/unclear rounds recover without keeper | recover/RECOVERED | get_decision,get_credit | stale-phase expiry -1/0/+1,missing records,retrycap | PENDING Phase8 recovery receipt/read |
| Own-credit withdrawal closes liabilities | withdraw,close | get_credit,get_accounting | EVM boundary/double draw/zero closure | PENDING exact native debit,child/recipient evidence |
| Browser completes every claimed action | typed adapter plus route controls | finalized decision/credit reload | real SDK adapter and full UI rows above | PENDING Phase7/8 browser signed lifecycle |

## Analogue,differentiation and adoption path

MandateLock judges misconduct after a delegated vote and suspends/slashes a
bilateral bonded mandate;this resolves topic-conditioned transitive representation
before counting,with no misconduct claim or guard. SlateFold pools explicit
ballots over equivalent competing motions;this has one proposal and no equivalent
motion classes or nominee selection. SemanticPolicyQuorum requires every policy
satisfied for one executor;here out-of-scope means direct fallback and dissent
need not block an absolute majority. PledgeKnot computes greatest support-closed
funding among actual payers;this routes conserved nonpaying member voices through
paths/cycles while one actual sponsor owns the purse. Historical generic debate
resolver lets the model choose a winner;here model authority stops at scope labels.
These nearest comparisons share at most three material fingerprint dimensions;
domain/name changes alone are not differentiation. Liquid democracy and cycles
are established research,not novel inventions;the contribution is the bounded
semantic authority compiler with enforced per-origin conservation and GEN result.

Proposed consumers only: DAOhaus committee module,Snapshot execution bridge,
LangGraph council. Public adapter/views permit integration without forking core
logic. After an accepted V1,the next substantial milestone is persistent
multi-proposal delegation charters with snapshot-bound revocation and a separately
authenticated real Safe/DAO execution consumer. No such consumer/adoption is
claimed now;new safety/time/anti-replay tests and network evidence are required.

## Deployment and evidence plan

Studio Dev61997 primary,studio-next IC RPC under D1;no evidence relabeled.
Independent bounded probe proved5jyc...v0.3 header works. Current upstream9b8...
runner failed schema and sim execution both with/without pragma on this target;
do not adopt it mechanically. Use the proven coherent5jyc...family subject to
semantic lint/direct checks and authorized exact-source smoke before value.
Select RC SDK coherently and pin exact manifests/lockfiles. Use project Python3.12
.venv and PYTHONUTF8=1. No new EOA needed: three existing authorized role accounts
can demonstrate all member roles,with shared demo operator disclosed.

Inspect before write;bind source commit/hash,runner/API,network,addresses and
entity IDs to active deployment.json. Resume only matching identity;archive
superseded revisions and inspect ambiguous writes before any retry. Test actual
contract schema and bounded source smoke first. Run approved cascade2GEN,cycle
nonapproval2GEN,UNCLEAR/partial expiry recovery2GEN,own withdrawals and closure,
all with receipts and finalized views. Demonstrate browser create/record/review/
recover/withdraw/close from UI,not script-only substitutes. Deposit values2GEN;
actor funding if needed only1GEN/2GEN per authorized transaction. Never faucet.
Evidence uses an explicit safe allowlist,not raw Studio payloads/config/stdout.
Keep source commit,evidence commit and final public CI distinct. Store under
docs/evidence/studio-dev;local tests/UI stay under docs/evidence/local.

## Definition of Done,honest limits and kill criteria

Required: one lint-recognized ASCII contract;no unpinned runner;all direct,
metadata,parser,semantic replay,graph/accounting/temporal/frontend/real-SDK tests
green;full npm check;real finalized judgment->tally->GEN grant/refund with exact
native transfer/recovery proof;all browser actions/control/tests/finality/reload;
public hygiene and meaningful history;CI on final public commit;verified Vercel
app/Explorer URLs;English UI/docs;unchanged original Projects checker NO BLOCKER;
copy-ready<=1000-character Portal description and precise limitations;postmortem,
registry and final master checklist reconciliation. Every pending evidence cell
must be populated by real proof or remain a completion blocker.

Current limits: execution/deployment/browser writes/public repo/hosting/CI and
Portal submission are PENDING. Three-member public named ballots only. No
identity/sybil proof,private data,external action execution or independent demo
operators. Protocol decisions are not legal rulings. No performance/adoption
claim is inferred from authenticated constitutive text or unsigned simulation.

Stop/redesign if scope interpretation becomes backend-owned,validators compare
only shape,untrusted text gains authority,graph can inflate weight,any GEN branch
has no destination,temporal entrypoint depends on offchain phase advance,the
product repeats a prior core architecture,or source/tests/network/UI claims drift.
