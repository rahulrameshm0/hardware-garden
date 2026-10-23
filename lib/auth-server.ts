import {env} from 'cloudflare:workers';
import {betterAuth} from 'better-auth';
import {drizzleAdapter} from '@better-auth/drizzle-adapter';
import {username,bearer,oneTimeToken} from 'better-auth/plugins';
import {getDb} from '../db';
import * as schema from '../db/auth-schema';
export type AuthEnv={AUTH_SECRET?:string;AUTH_BASE_URL?:string;GOOGLE_CLIENT_ID?:string;GOOGLE_CLIENT_SECRET?:string;APPLE_CLIENT_ID?:string;APPLE_CLIENT_SECRET?:string;APPLE_APP_BUNDLE_IDENTIFIER?:string};
export function authConfig(){return env as typeof env&AuthEnv;}
export function getAuth(request:Request){
 const c=authConfig();if(!c.AUTH_SECRET||c.AUTH_SECRET.length<32)throw new Error('Authentication is not configured.');
 const url=new URL(request.url);const local=['localhost','127.0.0.1'].includes(url.hostname);const baseURL=local?url.origin:c.AUTH_BASE_URL;
 if(!baseURL)throw new Error('Authentication origin is not configured.');
 return betterAuth({appName:'Hardware Garden',baseURL,secret:c.AUTH_SECRET,database:drizzleAdapter(getDb(),{provider:'sqlite',schema}),emailAndPassword:{enabled:true,minPasswordLength:12,maxPasswordLength:128},socialProviders:{...(c.GOOGLE_CLIENT_ID&&c.GOOGLE_CLIENT_SECRET?{google:{clientId:c.GOOGLE_CLIENT_ID,clientSecret:c.GOOGLE_CLIENT_SECRET}}:{}),...(c.APPLE_CLIENT_ID&&c.APPLE_CLIENT_SECRET?{apple:{clientId:c.APPLE_CLIENT_ID,clientSecret:c.APPLE_CLIENT_SECRET,appBundleIdentifier:c.APPLE_APP_BUNDLE_IDENTIFIER}}:{})},plugins:[username({minUsernameLength:3,maxUsernameLength:30}),bearer({requireSignature:true}),oneTimeToken({expiresIn:1,storeToken:'hashed',disableClientRequest:true})],trustedOrigins:[baseURL,'https://appleid.apple.com','capacitor://localhost','http://localhost'],session:{expiresIn:60*60*24*14,updateAge:60*60*24},rateLimit:{enabled:true,storage:'database',window:60,max:60,customRules:{'/sign-in/*':{window:60,max:8},'/sign-up/*':{window:60,max:5}}},account:{accountLinking:{enabled:false}}});
}
