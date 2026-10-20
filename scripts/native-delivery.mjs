// Parent finality and cleared credit can precede asynchronous EVM delivery.
export async function waitForNativeDelivery({before,amount,actor,messages,read,pollMs=2500,maxPolls=120}){
 const matching=messages.filter(m=>typeof m?.recipient==='string'&&m.recipient.toLowerCase()===actor.toLowerCase()&&BigInt(m.value??0)===amount);
 if(matching.length!==1)throw Error('Native withdrawal destination/amount is not proven by the finalized message');
 for(let i=0;i<maxPolls;i++){
  const after=await read();
  if(before.contract-after.contract===amount&&after.credit===0n&&after.recipient>before.recipient)return after;
  if(i+1<maxPolls)await new Promise(resolve=>setTimeout(resolve,pollMs));
 }
 throw Error('Native GEN delivery not proven; resume read-only checks, never duplicate withdrawal');
}
