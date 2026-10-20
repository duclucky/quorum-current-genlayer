# Step-by-step user guide

This guide matches the twelve separate How-to entries prepared in the Projects submission. The live contract is on Studio Dev. All demo purses are 2 GEN; wallet network fees are additional.

## 1. Connect the wallet you will use as sponsor

Open https://quorum-current-genlayer.vercel.app. Click Connect wallet, choose OKX or another detected EVM wallet, and approve the connection. Allow the app to switch/add Studio Dev (chain 61997). Use an existing funded wallet with 2 GEN plus network fees. For a read-only review without funding a new round, go to step 12.

## 2. Prepare the exact proposal and three members

Click Start a decision. Enter a title and this proposal: Authorize publication of anonymous aggregate uptime monitoring statistics, excluding personal data and promotional marketing. Enter three distinct wallet addresses as Members 1, 2 and 3, and the fixed beneficiary. Use only addresses whose owners can sign. The connected funding wallet becomes the sponsor.

## 3. Review deadlines and fund the fixed budget

Set Collection closes at least 20 minutes in the future and Recovery opens later, for example 40 minutes in the future. Click Review decision. Check the proposal, all addresses, beneficiary, local deadlines and 2 GEN budget. Click Fund decision · 2 GEN, sign in the selected wallet and wait for finality. The app should open the new canonical decision with a 2 GEN escrow.

## 4. Member 1 records a scoped delegation

Before collection closes, connect the wallet registered as Member 1. Under Choose your representation, select Member 2. For On which topics?, enter: May represent me only on publication of anonymous aggregate uptime monitoring statistics; exclude personal-data disclosure and promotional marketing. Choose Do not approve as the fallback ballot. Click Record my representation, sign, and wait until Member 1 is marked Recorded.

## 5. Member 2 delegates to Member 3

Switch the extension to the wallet registered as Member 2; verify the address shown in the app. If needed, use the address menu to disconnect and reconnect. Select Member 3, enter the same monitoring-only scope, and choose Do not approve as the fallback. Click Record my representation, sign and wait for its canonical Recorded status. Each member may record only once, before the collection deadline.

## 6. Member 3 records a direct YES ballot

Connect the wallet registered as Member 3. Choose Represent myself and Approve the proposal. Do not enter a proxy scope for direct representation. Click Record my representation and sign. Wait until the decision shows 3 of 3 recorded. Members 1 and 2 now delegate to Member 3, while Member 3 represents itself.

## 7. Ask validators to resolve the scopes

After Collection closes, but before Recovery opens, connect the sponsor or a registered member. Click Resolve representation and sign. Wait through submitted, accepted and finalized states; use the existing transaction hash when finality is pending. If the result is unclear, the app shows a retryable state and Try review again, up to three attempts before expiry. Do not interpret accepted alone as successful settlement.

## 8. Read the finalized paths and consequence

Inspect How the decision was reached after the app reloads canonical state. For the monitoring-only scopes above, the verified demo resolved Member 1 -> 2 -> 3, Member 2 -> 3 and Member 3 to 3 YES and APPROVED. Approval credits the locked beneficiary exactly 2 GEN. Otherwise a finalized rejection credits the actual sponsor. UNCLEAR does not settle or create a payout.

## 9. Withdraw only the current wallet’s 2 GEN credit

Connect the wallet entitled to the grant or refund and open My account. Check that Your available credit reads 2 GEN. Click Withdraw my GEN and sign; network fees are separate. Wait for finality and canonical credit to return to 0 GEN. The completed demo additionally proves an exact 2 GEN contract-balance decrease and a matching recipient balance increase. Withdraw each demo purse before creating another payout to the same wallet.

## 10. Recover an incomplete or unclear round after expiry

Use this branch only if the decision has not already settled. At or after Recovery opens, connect the original sponsor and open the decision. Click Recover expired budget and sign. After finalized RECOVERED state, open My account and withdraw the resulting 2 GEN credit as in step 9. Missing member records and exhausted unclear attempts cannot orphan the original budget.

## 11. Close the completed decision

After its escrow is zero and all outstanding contract credits have been withdrawn, reconnect the sponsor and refresh the decision. Click Close completed decision and sign. Wait for the Completed state. If the control is unavailable, check the state and remaining credits; V1 closure requires zero contract-wide credit liability. Never use another member’s wallet to close a sponsor-owned decision.

## 12. Verify the existing real demo without sending GEN

Open https://quorum-current-genlayer.vercel.app/decisions/qc-4ee9f395-fd03-4621-b27d-3c61f6a4e8b0 to inspect the actual approved proposal, member records and origin paths. In the repository, open docs/BROWSER-PAYMENT-VERIFICATION.md for Chrome/OKX hashes, docs/NETWORK-VERIFICATION.md for cycle and UNCLEAR cases, and docs/evidence/studio-dev/zero-liability.json for received 14 GEN, withdrawn 14 GEN, locked/credits/native balance 0 GEN.
