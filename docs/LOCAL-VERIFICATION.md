# Local verification

These checks do not establish a deployed lifecycle, browser wallet signature,
value delivery, adoption, CI or Portal acceptance.

## Contract and tooling

Command: `npm run check` (Python 3.12 project `.venv`, Node 24).
Current complete output: [serverless types check](evidence/local/check-serverless-types.txt).

- GenVM linter: `Lint passed (3 checks)`, `Validation passed`,
  `Contract: QuorumCurrent`, `Methods: 14 (8 view, 6 write)`.
- Python: `61 passed`; real SDK storage/direct execution, 1,728 graph/ballot
  reference cases within the graph test, authority, temporal, retry, accounting,
  EVM message and AST/payability checks. No skips or xfails.
- Node tooling: `tests 12`, `pass 12`, `fail 0`; raw/normalized/contradictory
  receipt handling, RPC secret projection, concurrent journal preservation and
  asynchronous recipient-delivery verification and native Node ESM serverless startup.
- Frontend: `Test Files 4 passed`, `Tests 33 passed`; UI lifecycle controls,
  selected wallet, restored current authorization, EVM chain handling, actual
  SDK project adapter calldata, exact 2 GEN, finality/retry, canonical reload and
  one-view-per-decision summaries rather than full-detail list fan-out.
- TypeScript and Vite production build passed. The SDK makes the initial bundle
  approximately 905 kB (222 kB gzip); Vite reports its standard size warning.

## Test-first corrections

The graph suite initially failed before `resolve` existed, then passed against
the independently derived exhaustive reference. The settlement-purse regression
initially failed because an invalid purse could update an attempt before raising
in the direct harness. The guard now runs before all review mutation; the same
regression passes. Production GenVM rollback is not relied upon to conceal the
ordering defect. This record does not claim every existing line was written TDD.

Direct test adapters only repair Windows fd handling, v0.3 LLM wire transport and
fresh contract-module registration. They do not replace contract state or the
semantic validator. External-message tests inspect the actual SDK WASI emission;
they do not certify native delivery on a live network.

## Browser-local RPC

Command/action: open the ignored local RPC harness in the in-app browser, run the
installed SDK `createClient({chain})`, request `eth_chainId` through
`/genlayer-rpc`, then read its visible result.

Real output: `chainId: 0xf22d`, `passed: true`, `failedToFetch: false` at
2026-10-20T08:44:42.988Z. [JSON](evidence/local/frontend/browser-rpc-phase7.json)
and [screenshot](evidence/local/frontend/browser-rpc-phase7.png).
The temporary harness is ignored and excluded from the production build.

The official [networks documentation](https://docs.genlayer.com/developers/networks)
and installed `genlayer-js@2.0.0-rc.1` identify the wallet RPC as
`https://studio-dev.genlayer.com/api`, chain 61997. A fresh unsigned identity read
returned `0xf22d` from both that host and the configured IC alias
`https://studio-next.genlayer.com/api`. Wallet writes use the explicitly selected
EVM provider; IC reads use the same-origin fixed-upstream proxy. These separate
paths target the same verified network. The Chrome/OKX funding, expiry recovery
and own withdrawal branch has now passed with canonical reads and native balance
proof: [browser payment verification](BROWSER-PAYMENT-VERIFICATION.md). This is
distinct from local tests and from script-signed semantic-review evidence.

Production startup regression: the compiled serverless entry first reproduced
ERR_MODULE_NOT_FOUND for its extensionless RPC import. The explicit .js import
passes the same native Node ESM startup/method-guard test. A full check then passed.
