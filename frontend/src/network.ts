import {studioDevnet} from 'genlayer-js/chains';
import type {Provider} from './wallet';
export const IC_RPC='/genlayer-rpc';
export const EXPLORER='https://explorer-studio-dev.genlayer.com';
export const WALLET_RPC=studioDevnet.rpcUrls.default.http[0];
export const chain={...studioDevnet,rpcUrls:{default:{http:[IC_RPC]}}};
export const CHAIN_HEX=`0x${studioDevnet.id.toString(16)}`;
export async function ensureNetwork(provider:Provider){
 const expected={chainId:CHAIN_HEX};
 if(String(await provider.request({method:'eth_chainId'})).toLowerCase()===CHAIN_HEX)return;
 try{await provider.request({method:'wallet_switchEthereumChain',params:[expected]});}
 catch(error){
  const code=(error as {code?:number})?.code;
  if(code!==4902&&code!==-32603)throw Error('Switch to Studio Dev in your selected wallet before signing.');
  await provider.request({method:'wallet_addEthereumChain',params:[{...expected,chainName:studioDevnet.name,nativeCurrency:studioDevnet.nativeCurrency,rpcUrls:[WALLET_RPC],blockExplorerUrls:[EXPLORER]}]});
  await provider.request({method:'wallet_switchEthereumChain',params:[expected]});
 }
 if(String(await provider.request({method:'eth_chainId'})).toLowerCase()!==CHAIN_HEX)throw Error('Your wallet has not switched to Studio Dev.');
}
