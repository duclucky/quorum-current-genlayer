import {useEffect,useState} from 'react';
import type {TxUpdate} from './types';
export function useResource<T>(load:()=>Promise<T>,deps:unknown[]){
  const [value,setValue]=useState<T|null>(null),[error,setError]=useState(''),[loading,setLoading]=useState(true),[version,setVersion]=useState(0);
  useEffect(()=>{let live=true;setLoading(true);setError('');setValue(null);load().then(v=>{if(live)setValue(v);}).catch(e=>{if(live)setError(e instanceof Error?e.message:'Unable to read the decision. Please retry.');}).finally(()=>{if(live)setLoading(false);});return()=>{live=false;};},[...deps,version]);
  return {value,error,loading,reload:()=>setVersion(v=>v+1)};
}
export function useWrite(){
  const [tx,setTx]=useState<TxUpdate|null>(null),[busy,setBusy]=useState(false);
  async function run(action:(update:(tx:TxUpdate)=>void)=>Promise<unknown>,complete:()=>void){setBusy(true);setTx(null);try{await action(setTx);complete();}catch(e){setTx({stage:'failed',message:e instanceof Error?e.message:'The action did not complete. Read the latest decision before retrying.'});}finally{setBusy(false);}}
  return {tx,busy,run};
}
