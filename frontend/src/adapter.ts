import type { ContractAdapter } from './types';
const unavailable=async():Promise<never>=>{throw new Error('The decision contract is not configured yet. You can prepare a proposal; funding and live decisions will be available after deployment.');};
export const unconfiguredAdapter: ContractAdapter = {
  configured:false,list:unavailable,decision:unavailable,credit:unavailable,
  create:unavailable,record:unavailable,review:unavailable,recover:unavailable,
  close:unavailable,withdraw:unavailable,
};
