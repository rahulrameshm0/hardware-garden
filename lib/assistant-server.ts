import {env} from 'cloudflare:workers';
import {getLearningUser} from './auth-user';
import {nativeOrigin} from './api-cors';
export const aiEnv=()=>env as typeof env&{GEMINI_API_KEY?:string;GEMINI_MODEL?:string;GEMINI_VOICE_MODEL?:string};
export async function assistantAccess(request:Request){
 const origin=request.headers.get('origin');if((origin&&origin!==new URL(request.url).origin&&!nativeOrigin(origin))||(request.headers.get('sec-fetch-site')==='cross-site'&&!nativeOrigin(origin)))return Response.json({error:'Invalid origin.'},{status:403});
 const user=await getLearningUser(request);if(!user)return Response.json({error:'Sign in for Gemini answers. Here is a built-in explanation instead.'},{status:401});
 if(!aiEnv().GEMINI_API_KEY)return Response.json({error:'Gemini is not connected yet. Here is the built-in lesson guide.'},{status:503});
 // Atomic fixed-hour quota shared by text and speech; a stable row avoids unbounded records.
 const key=`assistant:${user.userId}`,hour=Math.floor(Date.now()/3600000);
 const row=await env.DB!.prepare('INSERT INTO auth_rate_limit (id,key,count,last_request) VALUES (?,?,1,?) ON CONFLICT(key) DO UPDATE SET count=CASE WHEN last_request=excluded.last_request THEN count+1 ELSE 1 END,last_request=excluded.last_request RETURNING count').bind(key,key,hour).first<{count:number}>();
 if(!row||row.count>30)return Response.json({error:'Your AI limit is reached for this hour. The built-in guide is still available.'},{status:429});
 return null;
}
export async function gemini(body:unknown){const r=await fetch('https://generativelanguage.googleapis.com/v1beta/interactions',{method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':aiEnv().GEMINI_API_KEY!},body:JSON.stringify({...body as object,store:false}),signal:AbortSignal.timeout(40000)});if(!r.ok)throw Error('Gemini is temporarily unavailable.');return r.json() as Promise<{steps?:{type:string;content?:{type:string;text?:string;data?:string;mime_type?:string}[]}[]}>;}
