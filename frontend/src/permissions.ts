import type { Decision } from './types';
export function actions(decision: Decision, account: string | null, now: number) {
  const who=account?.toLowerCase();
  const memberIndex=decision.members.findIndex(m=>m.address.toLowerCase()===who);
  const sponsor=!!who&&decision.sponsor.toLowerCase()===who;
  const unsettled=['COLLECTING','READY','RETRYABLE'].includes(decision.status);
  return {
    memberIndex,
    record: memberIndex>=0&&decision.status==='COLLECTING'&&!decision.members[memberIndex].recorded&&now<decision.recordDeadline,
    review: (sponsor||memberIndex>=0)&&['READY','RETRYABLE'].includes(decision.status)&&decision.attempts<3&&decision.members.every(m=>m.recorded)&&now>=decision.recordDeadline&&now<decision.expiry,
    recover: sponsor&&unsettled&&now>=decision.expiry,
    close:sponsor&&['APPROVED','REJECTED','RECOVERED'].includes(decision.status)&&decision.escrowGEN==='0'&&decision.zeroLiability===true,
  };
}
