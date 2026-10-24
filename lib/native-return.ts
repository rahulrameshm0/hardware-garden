const project='941002a8-412b-41a9-8c1f-038bfb9e9f43';
export function nativeReturn(value:string|null){
 if(!value)return 'hardwaregarden://auth';
 try{const u=new URL(value);if(['hardwaregarden:','hardwaregardenexpo:'].includes(u.protocol)&&u.host==='auth'&&u.pathname==='')return `${u.protocol}//auth`;
 if(!['exp:','exps:'].includes(u.protocol)||u.hostname!=='u.expo.dev'||u.port||u.username||u.password||!new RegExp(`^/${project}(?:/--/auth)?/?$`).test(u.pathname))return null;
 for(const key of [...u.searchParams.keys()])if(!['channel-name','runtime-version','platform','disableOnboarding'].includes(key))u.searchParams.delete(key);u.hash='';return u.href;
 }catch{return null;}
}
