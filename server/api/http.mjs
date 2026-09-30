export const jsonResponse=(status,body,extra={})=>({
 status,
 headers:{"content-type":"application/json; charset=utf-8","cache-control":"no-store","x-content-type-options":"nosniff",...(extra.headers||{})},
 body:JSON.stringify(body),
 cookies:extra.cookies||[]
});

const header=(headers,name)=>headers?.[name]??headers?.[name.toLowerCase()]??headers?.[name.toUpperCase()];

export function clientIp(request){
 const forwarded=header(request.headers,"x-forwarded-for");
 return (forwarded&&String(forwarded).split(",")[0].trim())||request.remoteAddress||header(request.headers,"x-nf-client-connection-ip")||"local";
}

export function cookieValues(request){
 const raw=header(request.headers,"cookie")||"";
 return Object.fromEntries(String(raw).split(/; */).filter(Boolean).map(value=>{
  const at=value.indexOf("=");
  if(at<0)return [value,""];
  try{return [value.slice(0,at),decodeURIComponent(value.slice(at+1))]}catch{return [value.slice(0,at),""]}
 }));
}
