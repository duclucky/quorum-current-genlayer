# Studio Dev verification

This is a development-network demonstration with operator-controlled test actors,
not evidence of independent adoption. Network 61997; active contract
`0x10eb2739Cd3336a69DBfE9cAeA2F9704D50708ce`. Public receipts are saved through an
explicit field allowlist; validator configuration and raw traces are excluded.

## Approved transitive delegation and grant

`qc-cascade-1792486986`: all three authenticated members recorded their own
representation. The first two scopes were judged APPLIES, and the last member
voted directly. Canonical paths 0 -> 1 -> 2, 1 -> 2 and 2 each resolve to YES.
The fixed original threshold approves 3 YES, 0 NO, 0 ABSTAIN. Code credits the
locked beneficiary exactly 2 GEN; model output supplies no payout destination
or amount. The review transaction is
`0xc3258efb6cfa8e3273f5d0c4ae4e6afdfc03f0aef663385a13d1b14ec61a8a5b`.

The beneficiary withdrew with API signing from its ignored local configuration:
`0x194f701b4ef1b01501595361b271726f1bc37d3112064e94abac8c93adde783a`,
FINALIZED / SUCCESS. Native contract balance fell 4 -> 2 GEN, own credit became
zero, and the finalized message names the beneficiary with 2 GEN. Recipient
delivery lagged parent finality; the read-only follow-up proves its balance rose
from 2.998772848249987655 to 4.998646542749986832 GEN. No second withdrawal was
sent. Proof: `withdraw-1-2.json` plus
`withdraw-1-2-recipient-confirmation.json` in `evidence/studio-dev/`.

After all outstanding credits were withdrawn, sponsor closure finalized:
`0x91b75b9f84ba44e24569b1dffb3e9c9ada6940a7e3184798f9e3f66ac291ca4b`.
Canonical status is CLOSED. Source/state/attempt/path proof is in the matching
created, recorded, reviewed and closed evidence files.

## Expired round recovery

The earlier script cycle round reached READY but expired before review while
browser payment verification took priority. It is not claimed as cycle judgment
evidence. Sponsor recovery
`0x7ef9555fb050976f0b904ea009c0eac06a3d06960fc7ee0cce2d0d2ceea21411`
and own withdrawal
`0xd83d6d2e13ece6a90b5b33d50300accda316935f17ff2d674211bace947a911c`
both finalized successfully. Exact native debit was 2 GEN, recipient net gain
1.999873694499999177 GEN, own credit zero. Closure
`0x459e6d4e293f38c1b906b0ca44c741f451b5141bd64090996ff00a268df719ff`
also finalized successfully. The ledger then showed received 6 GEN, withdrawn
6 GEN, locked 0 GEN, credits 0 GEN. Later test rounds are recorded separately.

## Browser proof

Chrome/OKX funding, expiry recovery and own withdrawal passed with a separate
wallet: [browser verification](BROWSER-PAYMENT-VERIFICATION.md). Script signatures
above do not replace a browser signature. The second browser-funded round
`qc-bbc3149b-5ad5-4fce-b69c-f4f278aad711` has two API member records; its Chrome
member did not record before the 17:11 local deadline. It remains locked until
recovery opens at 17:30 on 2026-10-20. Funding
`0x3bbf06d01f9ee59e3b6daaf6c20b4bf8ff6a23405e21bbcf8c25bd8bd1f1614a`
is FINALIZED / SUCCESS. It is not yet browser-complete.

## UNCLEAR remains non-consequential

`qc-unclear-1792490999`: review
`0x67b8049c156afb5e693c3633d0e2d1a0a2b0046a09fce057f94691078f381053`
finalized successfully with labels UNCLEAR, UNCLEAR, DIRECT. Canonical status
RETRYABLE; no tally settlement or credit; the 2 GEN purse remained locked.
After expiry, sponsor recovery
`0x231a63d8408976ac3730d8360cc00f1f140791d7eaee966c07e220314fc9f607`
finalized. Withdrawal
`0xd726b7d9d729bfb755a1f043649e90525e5d5b6000ecae1c710b0a78853f00d9`
finalized with exact 2 GEN native contract decrease, own credit zero and recipient
net increase 1.999873694499999177 GEN. Matching reviewed, recovered and
withdrawal evidence is in `evidence/studio-dev/`.

## Cycles preserve the original denominator

`qc-cycle-proof-1792491133`: review
`0xa3191edf050d272105105f5ca2c6037ff13a309532212190aff53ff005e05656`
finalized successfully. The subsequent bounded canonical reads prove REJECTED,
0 YES, 0 NO, 3 ABSTAIN; paths are 0 -> 1 -> 0, 1 -> 0 -> 1 and
2 -> 0 -> 1 -> 0. All scope labels are APPLIES, but the contract detects repeated
vertices and abstains. A majority of a reduced denominator is never substituted.
The fixed sponsor receives 2 GEN credit. Proof: the matching `-verdict.json`.
Sponsor withdrawal
`0x63ad053ac2c452078d10d4e2e98155b3f7c1b09452f43cca4d179bbbff40d23e`
finalized with exact 2 GEN native debit, zero own credit, and recipient net
increase 1.999873694499999177 GEN (`withdraw-0-8.json`). The UNCLEAR case's closure
`0x77676783f5df86ec1e2524580e293e93a6bc35895641c6896e4ba2778c723e71`
also finalized successfully after its recovery and withdrawal.
Cycle proof closure
`0x8f8f28284dc6af72ddef7fbe0a2b3741670e7d34a4b67dd3073902f8f58ac913`
finalized with canonical CLOSED and escrow 0 GEN.

One record envelope hit an RPC rate limit after signing; its saved hash
`0x9163bd3a128aa00a76be644682a4c46a24ccca0d7270a83d12c193ec5a3b94b2`
was not found in repeated queries and canonical member state remained unrecorded.
A separate bounded record attempt then finalized, with the contract's one-record
guard preventing duplicate mutation. The earlier hash is retained as unobserved;
it is not reported as a successful transaction. This was a zero-value member
record, not a repeated purse deposit or withdrawal. The hosted service returned
30 requests/minute; receipt polling was slowed and the frontend list now reads
one summary per decision rather than full member/resolution/accounting trees.

## Final accounting and browser execution

API cycle and UNCLEAR branches completed withdrawal and closure. Chrome/OKX
funding, member recording, review, recovery, withdrawal and close have actual
wallet and canonical-state proof. The two other grant members were signed through
the authorized API route, as directed by the owner. The complete positive grant
and incomplete-round recovery evidence is linked from browser verification.
Final accounting (`zero-liability.json`): received 14 GEN, withdrawn 14 GEN,
locked 0 GEN, credits 0 GEN and native balance 0 GEN. No test purse remains locked
or credited. Two browser decisions retain APPROVED/RECOVERED history and permit
zero-value final closure; all value has already been delivered.
Public GitHub, CI, production hosting, original Projects checker and submission
are later phase gates and are not claimed here.
