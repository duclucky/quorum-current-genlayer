import {render,screen,waitFor,fireEvent} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {MemoryRouter} from 'react-router-dom';
import {beforeEach,expect,it,vi} from 'vitest';
import {App} from './App';
import {unconfiguredAdapter} from './adapter';
import {ensureNetwork,CHAIN_HEX,WALLET_RPC} from './network';
import type {ContractAdapter,Decision,TxUpdate} from './types';

const a=(n:number)=>'0x'+String(n).repeat(40);
const base=():Decision=>({id:'one',title:'A council proposal',proposal:'Authorize aggregate monitoring.',digest:'bound',sponsor:a(1),beneficiary:a(2),members:[1,2,3].map((n,i)=>({address:a(n),recorded:true,target:i,scope:'',ballot:'YES'})),status:'READY',recordDeadline:Date.now()/1000-100,expiry:Date.now()/1000+500,escrowGEN:'2',attempts:0,origins:[],yes:0,no:0,abstain:0});
beforeEach(()=>{sessionStorage.clear();window.scrollTo=vi.fn();HTMLDialogElement.prototype.showModal=function(){this.setAttribute('open','');};HTMLDialogElement.prototype.close=function(){this.removeAttribute('open');};(window as unknown as Record<string,unknown>).ethereum={isMetaMask:true,request:vi.fn(async({method}:{method:string})=>method==='eth_requestAccounts'||method==='eth_accounts'?[a(1)]:method==='eth_chainId'?CHAIN_HEX:null)};});
async function connect(){await userEvent.click(screen.getAllByRole('button',{name:'Connect wallet'})[0]);await userEvent.click(screen.getByRole('button',{name:'MetaMask'}));await waitFor(()=>expect(screen.getByRole('button',{name:/0x1111/})).toBeTruthy());}
const updates=async(update:(tx:TxUpdate)=>void)=>{update({stage:'submitted',hash:'0x'+'a'.repeat(64)});update({stage:'accepted'});update({stage:'finalized'});};
function mount(path:string,adapter:ContractAdapter){render(<MemoryRouter initialEntries={[path]}><App adapter={adapter}/></MemoryRouter>);}

it.each(['review','recover','close'] as const)('wires contextual %s and reloads canonical decision after finality',async method=>{
 const d=base();if(method==='recover'){d.status='COLLECTING';d.expiry=Date.now()/1000-1;}
 if(method==='close'){d.status='APPROVED';d.escrowGEN='0';d.zeroLiability=true;}
 const decision=vi.fn(async()=>d),write=vi.fn(async(_id:string,u:(t:TxUpdate)=>void)=>updates(u));
 mount('/decisions/one',{...unconfiguredAdapter,configured:true,decision,[method]:write});await screen.findByRole('heading',{name:d.title});await connect();
 const text={review:'Resolve representation',recover:'Recover expired budget',close:'Close completed decision'}[method];
 await userEvent.click(screen.getByRole('button',{name:text}));await waitFor(()=>expect(write).toHaveBeenCalled());await waitFor(()=>expect(decision.mock.calls.length).toBeGreaterThan(1));
 expect(screen.getByRole('status').textContent).toContain('Finalized');
});
it('records the connected origin and reloads its canonical record',async()=>{
 const d=base();d.status='COLLECTING';d.recordDeadline=Date.now()/1000+100;d.members[0].recorded=false;
 const decision=vi.fn(async()=>d),record=vi.fn(async(_id,_digest,_target,_scope,_ballot,u)=>updates(u));
 mount('/decisions/one',{...unconfiguredAdapter,configured:true,decision,record});await screen.findByRole('heading',{name:d.title});await connect();
 await userEvent.click(screen.getByRole('button',{name:'Record my representation'}));
 await waitFor(()=>expect(record).toHaveBeenCalledWith('one','bound',0,'','YES',expect.any(Function)));
 await waitFor(()=>expect(decision.mock.calls.length).toBeGreaterThan(1));
});
it('withdraws only displayed own canonical credit and reloads after delivery',async()=>{
 let available='2';const credit=vi.fn(async()=>available),withdraw=vi.fn(async u=>{await updates(u);available='0';});
 mount('/account',{...unconfiguredAdapter,configured:true,credit,withdraw});await connect();await screen.findByRole('button',{name:'Withdraw my GEN'});
 await userEvent.click(screen.getByRole('button',{name:'Withdraw my GEN'}));await waitFor(()=>expect(withdraw).toHaveBeenCalledOnce());await waitFor(()=>expect(credit.mock.calls.length).toBeGreaterThan(1));
 await waitFor(()=>expect((screen.getByRole('button',{name:'Withdraw my GEN'}) as HTMLButtonElement).disabled).toBe(true));
});
it('funds the reviewed user input then navigates to canonical detail',async()=>{
 const create=vi.fn(async(_input,u)=>{await updates(u);return 'one';});mount('/decisions/new',{...unconfiguredAdapter,configured:true,create,decision:async()=>base()});await connect();
 fireEvent.change(screen.getByLabelText('Decision title'),{target:{value:'Monitoring'}});
 fireEvent.change(screen.getByLabelText(/What should this decision authorize/),{target:{value:'Authorize monitoring aggregates.'}});
 for(let n=1;n<=3;n++)fireEvent.change(screen.getByLabelText('Member '+n),{target:{value:a(n)}});
 fireEvent.change(screen.getByLabelText(/Grant beneficiary/),{target:{value:a(2)}});
 await userEvent.click(screen.getByRole('button',{name:/Review decision/}));await userEvent.click(screen.getByRole('button',{name:'Fund decision · 2 GEN'}));
 await waitFor(()=>expect(create).toHaveBeenCalledOnce());expect(await screen.findByRole('heading',{name:'A council proposal'})).toBeTruthy();
});
it('keeps a failed action retryable without claiming finality',async()=>{
 const review=vi.fn(async()=>{throw Error('Semantic review unavailable.');});mount('/decisions/one',{...unconfiguredAdapter,configured:true,decision:async()=>base(),review});await screen.findByRole('heading',{name:'A council proposal'});await connect();
 await userEvent.click(screen.getByRole('button',{name:'Resolve representation'}));expect((await screen.findByRole('alert')).textContent).toContain('Semantic review unavailable');
 expect((screen.getByRole('button',{name:'Resolve representation'}) as HTMLButtonElement).disabled).toBe(false);
});
it('adds the official EVM wallet chain only on supported missing-chain errors',async()=>{
 let current='0x1',first=true;const request=vi.fn(async({method,params})=>{
  if(method==='eth_chainId')return current;
  if(method==='wallet_switchEthereumChain'){if(first){first=false;throw {code:4902};}current=params[0].chainId;}
 });await ensureNetwork({request});
 expect(request).toHaveBeenCalledWith({method:'wallet_addEthereumChain',params:[expect.objectContaining({chainId:CHAIN_HEX,rpcUrls:[WALLET_RPC]})]});
 expect(current).toBe(CHAIN_HEX);
});
it('restores only the chosen authorized provider using current accounts without permission prompts',async()=>{
 sessionStorage.setItem('qc.selected-wallet',JSON.stringify({id:'injected:MetaMask',name:'MetaMask'}));
 const request=(window as unknown as {ethereum:{request:ReturnType<typeof vi.fn>}}).ethereum.request;
 mount('/account',{...unconfiguredAdapter,configured:true,credit:async()=> '0'});
 expect(await screen.findByRole('heading',{name:a(1)})).toBeTruthy();
 expect(request).toHaveBeenCalledWith({method:'eth_accounts'});expect(request).not.toHaveBeenCalledWith({method:'eth_requestAccounts'});
 await userEvent.click(screen.getByRole('button',{name:'Disconnect wallet'}));expect(sessionStorage.getItem('qc.selected-wallet')).toBeNull();
});
