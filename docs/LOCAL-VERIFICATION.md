# Local verification

These checks do not establish a deployed lifecycle, browser wallet signature,
value delivery, adoption, CI or Portal acceptance.

## Contract and tooling

Command: `npm run check` (Python 3.12 project `.venv`, Node 24).
Current complete output: [phase 7 check](evidence/local/check-phase7.txt).

- GenVM linter: `Lint passed (3 checks)`, `Validation passed`,
  `Contract: QuorumCurrent`, `Methods: 14 (8 view, 6 write)`.
- Python: `61 passed`; real SDK storage/direct execution, 1,728 graph/ballot
  reference cases within the graph test, authority, temporal, retry, accounting,
  EVM message and AST/payability checks. No skips or xfails.
- Node tooling: `tests 5`, `pass 5`, `fail 0`; raw/normalized/contradictory
  receipt handling and RPC secret projection.
- Frontend: `Test Files 4 passed`, `Tests 32 passed`; UI lifecycle controls,
  selected wallet, restored current authorization, EVM chain handling, actual
  SDK project adapter calldata, exact 2 GEN, finality/retry and canonical reload.
- TypeScript and Vite production build passed. The SDK makes the initial bundle
  approximately 904 kB (221 kB gzip); Vite reports its standard size warning.

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
paths target the same verified network. Browser wallet writes remain pending
until the deployed lifecycle is exercised.
