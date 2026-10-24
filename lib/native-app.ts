import {Capacitor} from '@capacitor/core';
import {apiBase,apiFetch} from './api-client';
const bytes=(length:number)=>Array.from(crypto.getRandomValues(new Uint8Array(length)),b=>b.toString(16).padStart(2,'0')).join('');
async function digest(value:string){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value))),b=>b.toString(16).padStart(2,'0')).join('');}
export async function nativeSocialSignIn(provider:'google'|'apple'){
 const {SecureStorage}=await import('@aparajita/capacitor-secure-storage');const {Browser}=await import('@capacitor/browser');const verifier=bytes(32),state=bytes(16),challenge=await digest(verifier);await SecureStorage.set('hg-oauth',{verifier,state});await Browser.open({url:`${apiBase()}/mobile-auth?provider=${provider}&state=${state}&challenge=${challenge}`,presentationStyle:'popover'});
}
export async function initializeNative(){
 if(!Capacitor.isNativePlatform())return;
 document.documentElement.classList.add('native-app');const {Preferences}=await import('@capacitor/preferences');
 const cached=await Preferences.get({key:'hg-device-cache'});if(cached.value)try{const entries=JSON.parse(cached.value);for(const [key,value] of Object.entries(entries))if(key.startsWith('hg-')&&typeof value==='string')localStorage.setItem(key,value);}catch{}
 const save=async()=>{const entries:Record<string,string>={};for(let i=0;i<localStorage.length;i++){const key=localStorage.key(i)!;if(key.startsWith('hg-'))entries[key]=localStorage.getItem(key)!;}await Preferences.set({key:'hg-device-cache',value:JSON.stringify(entries)});};window.addEventListener('pagehide',()=>void save());setInterval(()=>void save(),3000);
 const {App}=await import('@capacitor/app');const {Browser}=await import('@capacitor/browser');const {SecureStorage}=await import('@aparajita/capacitor-secure-storage');
 async function callback(raw:string){const url=new URL(raw);if(url.protocol!=='hardwaregarden:'||url.host!=='auth')return;try{const saved=await SecureStorage.get('hg-oauth') as {state:string;verifier:string}|null;if(!saved||url.searchParams.get('state')!==saved.state)throw Error('Sign-in state did not match. Try again.');const token=url.searchParams.get('token');if(!token)throw Error('Sign-in did not return a token.');const response=await apiFetch('/api/mobile/exchange',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({token,verifier:saved.verifier})});if(!response.ok)throw Error('Sign-in expired. Please try again.');await SecureStorage.remove('hg-oauth');await Browser.close().catch(()=>{});location.hash='home';location.reload();}catch{location.hash='account';}}
 await App.addListener('appUrlOpen',event=>{void callback(event.url);});const launch=await App.getLaunchUrl();if(launch?.url)await callback(launch.url);
 await App.addListener('backButton',({canGoBack})=>{if(!window.dispatchEvent(new Event('hg-native-back',{cancelable:true})))return;if(canGoBack)history.back();else if(location.hash&&location.hash!=='#home')location.hash='home';else void App.exitApp();});
}
