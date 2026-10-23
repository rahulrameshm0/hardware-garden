import {getChatGPTUser} from '../app/chatgpt-auth';
import {getAuth,authConfig} from './auth-server';
export async function getLearningUser(request:Request){
 if(authConfig().AUTH_SECRET){const account=await getAuth(request).api.getSession({headers:request.headers});if(account)return {userId:'account:'+account.user.id,fullName:account.user.name,kind:'account' as const};}
 const legacy=await getChatGPTUser();return legacy?{...legacy,kind:'chatgpt' as const}:null;
}
