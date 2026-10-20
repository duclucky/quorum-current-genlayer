# QuorumCurrent

Delegate by topic. Keep every original voice accounted for.

QuorumCurrent is a three-member council product on GenLayer. Members sign an
exact proposal and either vote directly or delegate within a written topic scope.
Validators independently interpret scope applicability. Contract code follows
each origin's delegation path, makes cycles abstain, and requires two YES voices
out of the original three before crediting a fixed 2 GEN grant. Otherwise the
actual sponsor receives the refund. Unclear reviews retain the recoverable purse.

The category is **Projects**: the React product, selected EVM wallet integration,
canonical contract views and contract-owned funded result form one contribution.
There is exactly one Intelligent Contract: `QuorumCurrent`.

## Run and verify

Requirements: Node 24, Python 3.12 and Git. Windows is the verified local platform.

```powershell
python -m venv .venv
./.venv/Scripts/python.exe -m pip install -r requirements.lock
npm ci
npm run check
npm run dev
```

`npm run check` runs pinned GenVM lint, 61 Python tests, 5 Node tooling tests,
32 frontend tests including the real SDK adapter, TypeScript and a production
build. The graph reference test covers 1,728 graph/ballot cases. No critical
tests are skipped. [Local proof and limits](docs/LOCAL-VERIFICATION.md).

The frontend provides Overview, New decision, Decisions, decision detail,
My account and Guide. Without a configured deployed address, it permits proposal
preparation and explains why canonical reads and funding are unavailable.
It never presents local fixtures as live chain state.

## Network operation

The target is Studio Dev, chain 61997. Wallet traffic uses the user's selected
EVM provider and official wallet RPC; finalized IC reads use a same-origin proxy.
Keys belong only in an ignored `.env`, with project configuration taking precedence
over an authorized parent `.env`. No private key enters the browser bundle.

```powershell
node scripts/deploy.mjs inspect
node scripts/deploy.mjs smoke
node scripts/deploy.mjs deploy
node scripts/lifecycle.mjs inspect
```

Deployment is not yet claimed. A successful exact-source unsigned constructor
and schema smoke is recorded separately from any signed deployment or value flow.
Scripts journal signed transaction hashes before broadcast and resume existing
operations. Deployment identity binds the source commit/hash, runner, SDK,
network and contract address. Never manually replay an ambiguous value transfer.
All decision purses are 2 GEN; network fees are additional and estimated from
the current network policy before signing.

## Reuse and trust limits

The six writes create, ratify, review, recover, withdraw and close protocol
decisions; eight views expose canonical proposal, member, attempt, path, credit,
accounting, version and listing state. No backend chooses the verdict or payout.
The [specification](docs/README.md) defines the authority matrix, state machine,
method safety cards and all value destinations.

Proposal and scope text are constitutive protocol inputs authenticated by runtime
sender and immutable decision/domain/version bindings. They do not prove an
external service ran or a real DAO executed anything. The model can classify
scope applicability only; it cannot set ballots, targets, payees, amounts or roots.
Public named ballots, three members, a fixed threshold and a fixed purse bound V1.
Demo wallets can share one operator. No independent ownership, identity, adoption,
external execution or Portal acceptance is claimed. Closing currently requires
zero contract-wide credit liability. Native withdrawal delivery needs exact
contract-balance debit and recipient evidence beyond parent finality.

Proposed integrations include a DAOhaus committee module, Snapshot execution
bridge or LangGraph council. These are integration candidates, not adopters.
After an accepted V1, a substantial next milestone would add persistent
multi-proposal delegation charters with snapshot-bound revocation and a separately
authenticated Safe/DAO execution adapter. Those features are not implemented now.
