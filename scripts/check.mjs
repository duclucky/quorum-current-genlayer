import {spawnSync} from 'node:child_process';
import {existsSync} from 'node:fs';
const python=process.platform==='win32'?'.venv/Scripts/python.exe':'.venv/bin/python';
if(!existsSync(python))throw Error('Create the project Python 3.12 .venv and install requirements.lock first.');
const tasks=[
 [python,['scripts/lint_contracts.py','check','contracts/quorum_current.py']],
 [python,['-m','pytest','-q']],
 [process.execPath,['--test','tests/tooling/receipt.test.mjs','tests/tooling/proxy.test.mjs']],
 ...['scripts/network.mjs','scripts/deploy.mjs','scripts/lifecycle.mjs'].map(file=>[process.execPath,['--check',file]]),
 [process.execPath,['node_modules/vitest/vitest.mjs','run','--root','frontend']],
 [process.execPath,['node_modules/typescript/bin/tsc','--noEmit','-p','frontend/tsconfig.json']],
 [process.execPath,['node_modules/vite/bin/vite.js','build','frontend']],
];
for(const [command,args] of tasks){
 const result=spawnSync(command,args,{stdio:'inherit',env:{...process.env,PYTHONUTF8:'1'}});
 if(result.status!==0)process.exit(result.status??1);
}
console.log('CHECK PASS: contract lint, direct/tooling/frontend tests, TypeScript and production build.');
