import {getLearningUser} from '../../../lib/auth-user';
import {cors,preflight} from '../../../lib/api-cors';
export const dynamic='force-dynamic';
export async function GET(request:Request){try{const user=await getLearningUser(request);return cors(Response.json(user?{id:user.userId,name:user.fullName?.split(' ')[0]||'Learner',kind:user.kind}:null,{headers:{'Cache-Control':'no-store'}}),request);}catch{return cors(Response.json({error:'Could not verify your session.'},{status:503,headers:{'Cache-Control':'no-store'}}),request);}}
export const OPTIONS=preflight;
