import {getAuth} from '../../../../lib/auth-server';
import {cors,preflight} from '../../../../lib/api-cors';
export const dynamic='force-dynamic';
async function handle(request:Request){try{return cors(await getAuth(request).handler(request),request);}catch{return cors(Response.json({error:'Sign-in is temporarily unavailable. Please try again.'},{status:503,headers:{'Cache-Control':'no-store'}}),request);}}
export const GET=handle;export const POST=handle;export const OPTIONS=preflight;
