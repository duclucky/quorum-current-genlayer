import { createContext,useContext,useEffect,useRef,useState,type ReactNode } from 'react';
import { isAddress } from 'viem';
import {ensureNetwork,CHAIN_HEX} from './network';
export interface Provider {
  request(args:{method:string;params?:unknown[]}):Promise<unknown>;
  on?(event:string,fn:(value:unknown)=>void):void;
  removeListener?(event:string,fn:(value:unknown)=>void):void;
  isMetaMask?:boolean;isRabby?:boolean;isCoinbaseWallet?:boolean;isBraveWallet?:boolean;providers?:Provider[];
}
type Wallet={id:string;name:string;provider:Provider};
type WalletState={account:string|null;provider:Provider|null;open:()=>void;disconnect:()=>void};
const WalletContext=createContext<WalletState>({account:null,provider:null,open:()=>{},disconnect:()=>{}});
export const useWallet=()=>useContext(WalletContext);
type WalletWindow=Window&{ethereum?:Provider;okxwallet?:Provider;rabby?:Provider;coinbaseWalletExtension?:Provider;braveEthereum?:Provider};
export function discoverInjected(w:WalletWindow):Wallet[]{
  const list:Wallet[]=[];
  const add=(provider:Provider|undefined,name:string)=>{if(provider&&!list.some(x=>x.provider===provider))list.push({id:'injected:'+name,name,provider});};
  add(w.okxwallet,'OKX Wallet');add(w.rabby,'Rabby');add(w.coinbaseWalletExtension,'Coinbase Wallet');add(w.braveEthereum,'Brave Wallet');
  for(const p of w.ethereum?.providers??(w.ethereum?[w.ethereum]:[]))add(p,p.isRabby?'Rabby':p.isCoinbaseWallet?'Coinbase Wallet':p.isBraveWallet?'Brave Wallet':p.isMetaMask?'MetaMask':'Browser wallet');
  return list;
}
export function WalletProvider({children}:{children:ReactNode}){
  const [wallets,setWallets]=useState<Wallet[]>([]),[account,setAccount]=useState<string|null>(null),[provider,setProvider]=useState<Provider|null>(null),[error,setError]=useState(''),[busy,setBusy]=useState(false);
  const dialog=useRef<HTMLDialogElement>(null),trigger=useRef<HTMLElement|null>(null),restored=useRef(false),mounted=useRef(true);
  useEffect(()=>{mounted.current=true;return()=>{mounted.current=false;};},[]);
  useEffect(()=>{
    setWallets(discoverInjected(window as WalletWindow));
    const announced=(event:Event)=>{const detail=(event as CustomEvent<{info:{uuid:string;name:string};provider:Provider}>).detail;if(!detail?.provider||!detail.info?.uuid)return;setWallets(prev=>{const filtered=prev.filter(w=>w.provider!==detail.provider&&w.id!==detail.info.uuid&&!(w.id.startsWith('injected:')&&w.name===detail.info.name));return [...filtered,{id:detail.info.uuid,name:detail.info.name,provider:detail.provider}];});};
    window.addEventListener('eip6963:announceProvider',announced);window.dispatchEvent(new Event('eip6963:requestProvider'));
    return()=>window.removeEventListener('eip6963:announceProvider',announced);
  },[]);
  function disconnect(){setAccount(null);setProvider(null);setError('');try{sessionStorage.removeItem('qc.selected-wallet');}catch{/* Storage preferences are optional. */}}
  useEffect(()=>{
    if(restored.current)return;
    let choice:{id?:string;name?:string};try{choice=JSON.parse(sessionStorage.getItem('qc.selected-wallet')??'null');}catch{return;}
    if(!choice)return;
    const matches=wallets.filter(w=>w.id===choice.id||w.name===choice.name);if(matches.length!==1)return;
    restored.current=true;const selected=matches[0];
    // The remembered identifier is a UI preference. Only current provider responses establish connection.
    void Promise.all([selected.provider.request({method:'eth_accounts'}),selected.provider.request({method:'eth_chainId'})]).then(([accounts,chain])=>{const current=Array.isArray(accounts)?accounts[0]:null;if(mounted.current&&typeof current==='string'&&isAddress(current)&&String(chain).toLowerCase()===CHAIN_HEX){setProvider(selected.provider);setAccount(current);}}).catch(()=>{});
  },[wallets]);
  useEffect(()=>{if(!provider)return;const changed=(value:unknown)=>{const a=Array.isArray(value)?value[0]:null;if(typeof a==='string'&&isAddress(a))setAccount(a);else disconnect();};const chainChanged=()=>{setAccount(null);setProvider(null);};provider.on?.('accountsChanged',changed);provider.on?.('chainChanged',chainChanged);return()=>{provider.removeListener?.('accountsChanged',changed);provider.removeListener?.('chainChanged',chainChanged);};},[provider]);
  function close(){dialog.current?.close();trigger.current?.focus();}
  async function select(wallet:Wallet){
    setBusy(true);setError('');
    try{
      const accounts=await wallet.provider.request({method:'eth_requestAccounts'});const address=Array.isArray(accounts)?accounts[0]:null;if(typeof address!=='string'||!isAddress(address))throw Error('This wallet did not return a valid account. Choose another wallet.');
      await ensureNetwork(wallet.provider);try{sessionStorage.setItem('qc.selected-wallet',JSON.stringify({id:wallet.id,name:wallet.name}));}catch{/* Storage preferences are optional. */}setProvider(wallet.provider);setAccount(address);close();
    }catch{setError('Connection was not completed. Unlock your wallet and try again.');}finally{setBusy(false);}
  }
  return <WalletContext.Provider value={{account,provider,disconnect,open:()=>{trigger.current=document.activeElement as HTMLElement;setError('');window.dispatchEvent(new Event('eip6963:requestProvider'));dialog.current?.showModal();}}}>
    {children}
    <dialog ref={dialog} className="wallet-dialog" aria-labelledby="wallet-title" onCancel={()=>trigger.current?.focus()}>
      <div className="between"><h2 id="wallet-title">Choose your wallet</h2><button className="quiet" onClick={close} aria-label="Close wallet selection">Close</button></div>
      <p>You choose which browser wallet connects. Your wallet keeps your keys.</p>
      {wallets.length===0?<div className="notice"><strong>No browser wallet detected</strong><p>Open this app in a browser with an EVM wallet extension, then refresh. You can explore the guide without connecting.</p></div>:<div className="wallet-options">{wallets.map(w=><button disabled={busy} key={w.id} onClick={()=>void select(w)}>{w.name}<span aria-hidden="true">↗</span></button>)}</div>}
      {busy&&<p role="status">Approve the connection in the wallet you selected.</p>}{error&&<p role="alert" className="error">{error}</p>}
    </dialog>
  </WalletContext.Provider>;
}
