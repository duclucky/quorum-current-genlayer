import {existsSync,readFileSync,mkdirSync,writeFileSync,renameSync,rmdirSync} from 'node:fs';
export function updateOperation(path,name,entry){
 const lock=path+'.lock';
 // A competing writer must retry explicitly; never erase or steal its lock.
 mkdirSync(lock);
 try{
  const current=existsSync(path)?JSON.parse(readFileSync(path,'utf8')):{};
  if(current[name]?.hash&&entry.hash!==current[name].hash)throw Error('Cannot replace a journaled signed hash');
  current[name]={...current[name],...entry};
  const temporary=path+'.tmp-'+process.pid;
  writeFileSync(temporary,JSON.stringify(current,null,2)+'\n');renameSync(temporary,path);
 }finally{rmdirSync(lock);}
}
