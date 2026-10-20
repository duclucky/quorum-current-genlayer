# Browser payment verification - recovery payment branch passed

Network: Studio Dev 61997. Browser: Chrome. Selected wallet: OKX Wallet.
Connected sponsor: `0xC495ef51618D03267A1f227aFe5b27B38c748272`.
Contract: `0x10eb2739Cd3336a69DBfE9cAeA2F9704D50708ce`.
Decision: `qc-eea191cf-c38f-4dce-825d-44433249d139`.

This record is distinct from earlier operator-script demonstrations. After the
owner clarified that payment must be tested through the website, no further
script-signed payment/review/withdrawal has been initiated. Read-only RPC commands
only corroborate the browser-originated transaction and canonical balances.

| Browser action | Verified outcome | Proof |
| --- | --- | --- |
| Choose wallet / restore connection | OKX selected, current authorized account on Studio Dev | Chrome DOM and current provider responses; no stored account is authoritative |
| Prepare / review 2 GEN funding | Actual proposal, three distinct members, fixed beneficiary and explicit deadlines reviewed | Browser form and submitted screenshot |
| Fund decision | FINALIZED / SUCCESS; website navigated to canonical decision; escrow 2 GEN | Hash `0xadbcd588078bb022c78bc8b9c2a64c527d44582d5775271e5f2c1b4d3bf303a6`; `evidence/studio-dev/browser-funding.json`; local/frontend browser-funded-canonical JSON/PNG |
| Record representation | NOT COMPLETE; first fee read failed, later signature request did not produce a confirmed record before deadline | Browser error and deadline-closed DOM; canonical recorded count remained zero |
| Deadline guard | Recording UI disappeared at 16:34 local time; recovery remained unavailable until 16:36 | browser-deadline-closed.json |
| Own credit before recovery | 0 GEN; withdrawal disabled | browser-credit-before-recovery.json |
| Recover expired budget | FINALIZED / SUCCESS; decision RECOVERED, escrow 0 GEN; own credit 2 GEN | Hash `0xad8d2cd17870af56cb4ce2a48cfb10777e8c8105c917c59896071f8fcfefe392`; `evidence/studio-dev/browser-recovery.json`; browser-recovered-canonical.png and browser-credit-after-recovery.png |
| Withdraw own 2 GEN | FINALIZED / SUCCESS; native contract balance 6 -> 4 GEN; own credit 2 -> 0 GEN; recipient wallet increased | Hash `0x60f0ca761efd695d41e2d9991aaef8c32fe16561f1d689181d7e2fb71a3924b2`; `evidence/studio-dev/browser-withdrawal.json`; browser-withdrawal-finalized.png |
| Close | FINALIZED / SUCCESS; canonical CLOSED, escrow 0 GEN | Hash `0xa665e5119096a2ea322dbbd67a6d23b682c7e5f572f15c6fa77f7ee09daa7afc`; `evidence/studio-dev/browser-close.json`; browser-closed-canonical.png |

The tested payment branch is funding -> expiry recovery -> own withdrawal -> close.
The user's wallet signed all three successful browser transactions. The final
withdrawal message names the connected recipient and exactly 2 GEN. Its wallet
balance increased from 30.276695400582780555 to 32.276569095082779732 GEN:
1.999873694499999177 GEN net, with a 0.000126305500000823 GEN difference from
the gross 2 GEN transfer. The account screen reloaded canonical zero credit and
disabled further withdrawals. Two earlier withdrawal requests returned 4001
without a transaction hash; the user then clicked and approved the successful
withdrawal directly in Chrome/OKX. No failed request is reported as a transfer.

The first case did not complete a three-member semantic approval branch. The
later grant below has browser-signed record, review and withdrawal evidence;
earlier script-signed APPROVED/3 YES is not substituted for that browser proof.
The later owner-supplied Record hash
`0xf2b512c2ef659d94d707e56608b44bc79df433e0ef389ee7ac934b84849c906c`
is FINALIZED/SUCCESS but targets a different contract,
`0xFd64D6cD0816970CE6151aa5232cf8f4Bdf41D32`, at 02:34 UTC. It is excluded
from QuorumCurrent action proof. See browser-member0-supplied-hash.json.
Initial rejected funding requests created no canonical decision; the successful
funding transaction above is the only funding transaction for that first decision.

User signatures remain in the selected wallet. No private key, fake provider,
backend signer or script transaction is used to impersonate a browser signature.

## Scoped delegation grant - browser principal with two API members

The owner explicitly directed the two other member wallets to use the API.
Decision `qc-4ee9f395-fd03-4621-b27d-3c61f6a4e8b0` uses the connected Chrome
wallet as both sponsor and fixed beneficiary. The role separation remains three
distinct members, all controlled by the demo operator; this does not claim
independent real-world council participation.

| Action | Actual proof |
| --- | --- |
| Fund 2 GEN through Chrome/OKX | `0xe3ae51b6d8ce88c06ecdb92c8fec263fb06af840ca7d4878977250c6e33f2d88`; browser navigated to the canonical new decision |
| Browser member record | `0xe5f3a72c665c59c27e2ab1b13c2a7fafb452fd2a0092014fbdc2995b4f575826`, FINALIZED/SUCCESS; exact proposal digest, target member1, bounded monitoring scope, fallback NO; browser-grant-recorded.json |
| Other members via API | `0x808039c78b2cb3752c60d138db14f0bd920fa249fd0f41aa65870ec84a132cb1` and `0x22c4f31b89006679876bff6545124ad8c8062856201a18189c06239d6fb9c2d2`, FINALIZED/SUCCESS; member1 -> member2, member2 DIRECT/YES |
| Browser review | `0x7688e4666db0e314c286986013f909d9bdb3b1296873e8027de90ace6a7d2e8d`, FINALIZED/SUCCESS; APPROVED, 3 YES, 0 NO, 0 ABSTAIN; browser-grant-review.json |
| Canonical consequence | Labels APPLIES/APPLIES/DIRECT; paths 0->1->2, 1->2 and 2; own credit exactly 2 GEN; browser-grant-approved.png and browser-grant-credit.png |
| Own grant withdrawal | `0x836c80398f4952e655649e57e4bce730c3aef3aca99fa6aa1e64eaa757a3b4cb`, FINALIZED/SUCCESS; exact native debit 2 GEN, own credit zero, matching recipient message and net wallet increase 1.999873694499999177 GEN; browser-grant-withdrawal.json |
| Close | Grant withdrawal passed; optional final history closure remains available when global credits are zero. Browser close control already passed on the original recovered case. |

The grant withdrawal reduced native contract balance 4 -> 2 GEN and increased
the connected wallet from 28.276175807832775617 to 30.276049502332774794 GEN.
The other 2 GEN still belongs to the
earlier incomplete browser round and must be recovered separately. No grant
closure is claimed complete before its own proof.

## Incomplete two-member round recovery

The earlier browser cycle round retained two member records and no settlement.
At expiry the actual browser sponsor recovered it with
`0xfc00ccc1d124888f6f4d8b0cd54d446b974d14f1ef6d6996ead2a1394f865680`,
FINALIZED/SUCCESS, canonical RECOVERED and own credit 2 GEN. Before its final
withdrawal, contract balance was 2 GEN and wallet balance
30.275970872332773971 GEN (`browser-partial-recovery.json`). The user initiated
withdrawal from the actual Account UI; hash
`0x877364adf35eb4eb4fb742fabca56c59a5a636ed40bf01c6c9f5015f4aba8adc`
is FINALIZED/SUCCESS. Contract native balance fell 2 -> 0 GEN, own credit became
0 GEN, and the finalized message names the connected recipient with 2 GEN. Its
wallet increased to 32.275844566832773148 GEN (1.999873694499999177 GEN net).
`browser-partial-withdrawal.json` and `zero-liability.json` prove total received
14 GEN, total withdrawn 14 GEN, locked 0 GEN, credits 0 GEN, native balance 0 GEN.
This action is kept
separate from the grant withdrawal; each withdrawal is exactly 2 GEN.
