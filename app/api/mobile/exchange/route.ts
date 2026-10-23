import {env} from 'cloudflare:workers';
import {getAuth} from '../../../../lib/auth-server';
import {cors,preflight} from '../../../../lib/api-cors';
export const dynamic='force-dynamic';
async function hash(value:string){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value))),b=>b.toString(16).padStart(2,'0')).join('');}
export async function POST(request:Request){try{const raw=await request.text();if(raw.length>1000)throw Error();const {token,verifier}=JSON.parse(raw);if(typeof token!=='string'||token.length>100||typeof verifier!=='string'||!/^[a-f0-9]{64}$/.test(verifier))throw Error();const identifier='native:'+await hash(token);const proof=await env.DB!.prepare('SELECT value,expires_at FROM auth_verification WHERE identifier=?').bind(identifier).first<{value:string;expires_at:number}>();if(!proof||proof.expires_at<Date.now()||proof.value!==await hash(verifier))throw Error();const auth=getAuth(request);const response=await auth.api.verifyOneTimeToken({body:{token},headers:request.headers,asResponse:true});await env.DB!.prepare('DELETE FROM auth_verification WHERE identifier=?').bind(identifier).run();return cors(response,request);}catch{return cors(Response.json({error:'Sign-in expired or invalid. Start again from the app.'},{status:400,headers:{'Cache-Control':'no-store'}}),request);}}
export const OPTIONS=preflight;
