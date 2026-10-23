import {Capacitor} from '@capacitor/core';
declare const __HG_API_BASE__:string;
export const isNative=()=>Capacitor.isNativePlatform();
export const apiBase=()=>typeof __HG_API_BASE__==='string'?__HG_API_BASE__:'';
export async function apiFetch(path:string,init:RequestInit={}){
 const headers=new Headers(init.headers);if(isNative()){const {SecureStorage}=await import('@aparajita/capacitor-secure-storage');const token=await SecureStorage.get('hg-session-token');if(typeof token==='string')headers.set('Authorization',`Bearer ${token}`);}
 const response=await fetch(apiBase()+path,{...init,headers,credentials:isNative()?'omit':'same-origin'});
 if(isNative()){const token=response.headers.get('set-auth-token');if(token){const {SecureStorage}=await import('@aparajita/capacitor-secure-storage');await SecureStorage.set('hg-session-token',token);}}
 return response;
}
export async function signOut(){await apiFetch('/api/auth/sign-out',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});if(isNative()){const {SecureStorage}=await import('@aparajita/capacitor-secure-storage');await SecureStorage.remove('hg-session-token');}localStorage.removeItem('hg-session');location.hash='home';location.reload();}
