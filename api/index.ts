// Same-origin gateway: account data and AI credentials stay in the existing backend.
const backend='https://hardware-garden-rahul.rahulrameshm98.chatgpt.site';
export default {
 async fetch(request:Request){
  const url=new URL(request.url),publicOrigin=process.env.HG_PUBLIC_ORIGIN,secret=process.env.HG_PROXY_SECRET;
  if(!publicOrigin||!secret)return Response.json({error:'Website connection is not configured.'},{status:503});
  const origin=request.headers.get('origin');
  if(origin&&origin!==publicOrigin)return Response.json({error:'Invalid origin.'},{status:403});
  const route=url.searchParams.get('route')||url.pathname.replace(/^\/api\/?/,'');
  if(!/^[a-zA-Z0-9/_-]+$/.test(route)||route.includes('..'))return Response.json({error:'Unknown API route.'},{status:404});
  const target=new URL('/api/'+route,backend);url.searchParams.delete('route');target.search=url.searchParams.toString();
  const headers=new Headers();for(const key of ['content-type','cookie','authorization','x-learning-account','origin','sec-fetch-site']){const value=request.headers.get(key);if(value)headers.set(key,value);}
  headers.set('x-hg-public-origin',publicOrigin);headers.set('x-hg-proxy-secret',secret);
  try{let body:ArrayBuffer|undefined;if(!['GET','HEAD'].includes(request.method)){body=await request.arrayBuffer();if(body.byteLength>64000)return Response.json({error:'Request too large.'},{status:413});}
   const upstream=await fetch(target,{method:request.method,headers,body,redirect:'manual',signal:AbortSignal.timeout(50000)});
   const responseHeaders=new Headers(upstream.headers);responseHeaders.delete('content-encoding');responseHeaders.delete('content-length');responseHeaders.set('cache-control','no-store');
   return new Response(upstream.body,{status:upstream.status,headers:responseHeaders});
  }catch{return Response.json({error:'The learning service is temporarily unavailable. Your saved progress is safe.'},{status:503,headers:{'Cache-Control':'no-store'}});}
 }
};
