import {getChatGPTUser} from '../../chatgpt-auth';
export const dynamic='force-dynamic';
export async function GET(){const user=await getChatGPTUser();return Response.json(user?{id:user.userId,name:user.fullName?.split(' ')[0]||'Learner'}:null,{headers:{'Cache-Control':'no-store'}});}
