# Frontend baseline and design preservation

Phase3A/3B local baseline,2026-10-20. Category Projects. No deployed contract or
browser-wallet transaction proof is claimed by this document.

The full route map and role-specific jobs are in the specification. Design was
generated before frontend source using the project-local ui-ux-pro-max skill.
The first governance query resolved to a realtime operations pattern and was
discarded as off-topic. The single narrower retry, `collaboration productivity
accessible spacious --design-system -p QuorumCurrent`, resolved to Productivity
Tool / Flat Design / Product Demo + Features. Verified palette: primary#0D9488,
secondary#14B8A6, CTA#EA580C, background#F0FDFA, text#134E4A, card#FFFFFF,
muted#E8F1F4, muted text#475569, border#99F6E4, danger#DC2626.
Plus Jakarta Sans is used throughout, with native sans fallback. Flat surfaces,
clear borders, no gradients/shadows,8px component spacing and150-200ms hover.
On-accent black follows the generated accessible token, rather than its generic
white-button example. No video, invented live metrics or unverifiable social
proof is needed; a labeled static delegation illustration explains the product.

Focused skill queries: `routing forms state --stack react` returned controlled
forms as the top result; `keyboard focus modal --domain ux` returned Focus
States, then focus-not-obscured guidance. Applied visible focus, native dialog
focus containment, dismiss/return focus, labeled fields and linked error summary,
reduced motion and responsive navigation.

Commands and real output:

`npm run test:frontend` initially collected3 tests and failed all3 because the
contextual permission boundary returned false. After implementation all3 pass.
An earlier jsdom module-resolution failure collected no tests and is not RED.
jsdom26.1.0 is pinned to support the actual Node24.11.1 runtime.

`npm run check`:2 test files passed,13 tests passed,0 skipped; TypeScript exited0;
Vite8.3.4 transformed446 modules and built successfully. Current command output
is stored with the local evidence. This phase's check does not yet include
contract lint/direct tests; Phase6 must extend it before contract completion.

Real local browser: six routes at375x812,812x375 and1440x900; all18 combinations
reported no horizontal overflow and four persistent navigation links. The form
accepted test input, showed the exact unsigned review and disabled funding
without configured contract/account. The wallet picker detected EVM extensions;
no account was requested until a provider was selected in the unit test. The
browser QA did not sign or send a blockchain transaction. Screenshots and
route measurements live under evidence/local/frontend/.

FE-PRESERVE starts at this baseline: preserve this palette, font, flat components,
header/navigation, six-route map and arrangement. Later changes may only wire
the typed adapter and make necessary control/field/state/accessibility fixes.
FE-HONEST,FE-SURFACE,FE-WALLET-EVM,FE-WALLET-ACCOUNT and FE-PRODUCT remain binding.

Pending: actual SDK adapter, network switch and RPC proxy, deployed reads,
every browser write/finality/reload, real credit/transfer receipts and final
accessibility checks on the deployed product. Those are not substituted by
this provisional adapter baseline.
