export type DecisionStatus = 'COLLECTING' | 'READY' | 'RETRYABLE' | 'APPROVED' | 'REJECTED' | 'RECOVERED' | 'CLOSED';
export type Vote = 'YES' | 'NO';
export type TxStage = 'preparing' | 'signature' | 'submitted' | 'accepted' | 'finalized' | 'failed';
export type TxUpdate = { stage: TxStage; hash?: string; message?: string };
export type Member = { address: string; recorded: boolean; target: number; scope: string; ballot: Vote };
export type Origin = { member: number; path: number[]; root: number; vote: Vote | 'ABSTAIN'; label: string };
export type Decision = { id: string; title: string; proposal: string; digest: string; sponsor: string; beneficiary: string; members: Member[]; status: DecisionStatus; recordDeadline: number; expiry: number; escrowGEN: string; attempts: number; origins: Origin[]; yes: number; no: number; abstain: number; zeroLiability?:boolean };
export type DecisionSummary = Pick<Decision,'id'|'title'|'status'|'recordDeadline'> & {recorded:number};
export type NewDecision = { title: string; proposal: string; members: [string,string,string]; beneficiary: string; recordDeadline: number; expiry: number };
export interface ContractAdapter {
  configured: boolean;
  list(): Promise<DecisionSummary[]>;
  decision(id: string): Promise<Decision>;
  credit(address: string): Promise<string>;
  create(input: NewDecision, update: (tx: TxUpdate)=>void): Promise<string>;
  record(id: string, digest: string, target: number, scope: string, ballot: Vote, update: (tx: TxUpdate)=>void): Promise<void>;
  review(id: string, update: (tx: TxUpdate)=>void): Promise<void>;
  recover(id: string, update: (tx: TxUpdate)=>void): Promise<void>;
  close(id: string, update: (tx: TxUpdate)=>void): Promise<void>;
  withdraw(update: (tx: TxUpdate)=>void): Promise<void>;
}
