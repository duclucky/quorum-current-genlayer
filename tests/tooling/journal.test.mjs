import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,readFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {updateOperation} from '../../scripts/journal.mjs';
test('finalizing an older operation preserves a newer independently submitted operation',t=>{
 const folder=mkdtempSync(join(tmpdir(),'qc-journal-'));t.after(()=>rmSync(folder,{recursive:true}));const file=join(folder,'operations.json');
 updateOperation(file,'first',{hash:'one',stage:'SUBMITTED'});
 const first=JSON.parse(readFileSync(file)).first;
 updateOperation(file,'second',{hash:'two',stage:'SUBMITTED'});
 updateOperation(file,'first',{...first,stage:'FINALIZED_SUCCESS'});
 const result=JSON.parse(readFileSync(file));assert.equal(result.second.hash,'two');assert.equal(result.first.stage,'FINALIZED_SUCCESS');
 assert.throws(()=>updateOperation(file,'first',{hash:'different'}),/Cannot replace/);
});
