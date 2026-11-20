// Sustained USEFUL traffic: GET / then GET /api/health every 1.5 s, keeps conns busy.
const H="attendance.knust.edu.gh", N=parseInt(process.env.N||"250"), DUR=parseInt(process.env.DUR||"90");
let sent=0, codes={};
const loop=async()=>{while(Date.now()-T0<DUR*1000){for(const p of ["/","/api/health"]){try{const r=await fetch(`https://${H}${p}`,{signal:AbortSignal.timeout(9000)});codes[r.status]=(codes[r.status]||0)+1;sent++;}catch{codes.ERR=(codes.ERR||0)+1}}}}
const T0=Date.now();
for(let i=0;i<N;i++)loop();
const iv=setInterval(async()=>{const t=Date.now();let h;try{const r=await fetch(`https://${H}/api/health`,{signal:AbortSignal.timeout(7000)});h=r.status+"/"+(Date.now()-t)+"ms"}catch{h="D/"+(Date.now()-t)};console.log(JSON.stringify({t:((Date.now()-T0)/1000)|0,sent,codes,health:h}));},10000);
setTimeout(()=>{clearInterval(iv);console.log("done",sent,JSON.stringify(codes));process.exit(0)},DUR*1000+2000);
