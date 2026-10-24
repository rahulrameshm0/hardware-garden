export function parseOAuthCode(value:string){
 const direct=/^([a-f0-9]{32}):(.{1,100})$/.exec(value.trim());if(direct)return {state:direct[1],token:direct[2]};
 try{const u=new URL(value);if(!(u.protocol==='hardwaregarden:'&&u.host==='auth')&&!(['exp:','exps:'].includes(u.protocol)&&u.hostname==='u.expo.dev'&&u.pathname.startsWith('/941002a8-412b-41a9-8c1f-038bfb9e9f43')))return null;const state=u.searchParams.get('state')||'',token=u.searchParams.get('token')||'';return /^[a-f0-9]{32}$/.test(state)&&token.length>0&&token.length<=100?{state,token}:null;}catch{return null;}
}
