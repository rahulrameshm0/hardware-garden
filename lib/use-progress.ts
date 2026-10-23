'use client';
import {useCallback,useEffect,useRef,useState} from 'react';
import {emptyProgress,mergeProgress,type Progress,type ProgressMap} from './progress';
type User={id:string;name:string};
export function useProgress(){
 const [user,setUser]=useState<User|null>(null),[progress,setProgress]=useState<ProgressMap>({}),[status,setStatus]=useState('Connecting…');
 const current=useRef<User|null>(null),data=useRef<ProgressMap>({}),busy=useRef(false),mounted=useRef(false),revision=useRef(0);
 const persist=useCallback((p:ProgressMap)=>{const changed=JSON.stringify(data.current)!==JSON.stringify(p);data.current=p;if(changed)setProgress(p);if(current.current)try{localStorage.setItem('hg-progress:'+current.current.id,JSON.stringify(p));}catch{setStatus('Device storage full · keep this tab open');}},[]);
 const sync=useCallback(async()=>{
 if(busy.current)return;busy.current=true;
 try{
 if(!navigator.onLine){setStatus('Offline · saved on this device');return;}
 const session=await fetch('/api/session',{cache:'no-store',signal:AbortSignal.timeout(8000)});if(!session.ok)throw Error();const next:User|null=await session.json();
 if(!next){current.current=null;setUser(null);data.current={};setProgress({});localStorage.removeItem('hg-session');setStatus('Sign in to save your progress');return;}
 if(current.current?.id!==next.id){let cached={};try{cached=JSON.parse(localStorage.getItem('hg-progress:'+next.id)||'{}');}catch{}current.current=next;setUser(next);persist(cached);}
 localStorage.setItem('hg-session',JSON.stringify(next));setStatus('Syncing…');
 const remote=await fetch('/api/progress',{cache:'no-store',signal:AbortSignal.timeout(8000),headers:{'X-Learning-Account':next.id}});if(!remote.ok)throw Error();persist(mergeProgress(data.current,await remote.json()));
 const sentRevision=revision.current;
 const saved=await fetch('/api/progress',{method:'POST',signal:AbortSignal.timeout(8000),headers:{'Content-Type':'application/json','X-Learning-Account':next.id},body:JSON.stringify(data.current)});if(!saved.ok)throw Error();persist(mergeProgress(data.current,await saved.json()));
 setStatus(sentRevision===revision.current?'All progress saved':'Saving changes…');
 }catch{if(!current.current)try{const cached=JSON.parse(localStorage.getItem('hg-session')||'null');if(cached){current.current=cached;setUser(cached);persist(JSON.parse(localStorage.getItem('hg-progress:'+cached.id)||'{}'));}}catch{}setStatus(navigator.onLine?'Sync paused · retry when ready':'Offline · saved on this device');}finally{busy.current=false;}
 },[persist]);
 useEffect(()=>{
 mounted.current=true;
 if(!navigator.onLine)try{const cached=JSON.parse(localStorage.getItem('hg-session')||'null');if(cached){current.current=cached;setUser(cached);persist(JSON.parse(localStorage.getItem('hg-progress:'+cached.id)||'{}'));}}catch{}
 void sync();const timer=setInterval(()=>void sync(),15000);const online=()=>void sync();const offline=()=>setStatus('Offline · saved on this device');window.addEventListener('online',online);window.addEventListener('offline',offline);
 return()=>{clearInterval(timer);window.removeEventListener('online',online);window.removeEventListener('offline',offline);mounted.current=false;};
 },[persist,sync]);
 const update=useCallback((id:string,patch:Partial<Progress>)=>{
 if(!current.current){setStatus('Sign in to save your progress');return;}
 const old=data.current[id]??emptyProgress;const next={...old,...patch,completed:old.completed||!!patch.completed,score:Math.max(old.score,patch.score??0)};revision.current++;persist({...data.current,[id]:next});setStatus(navigator.onLine?'Saving changes…':'Offline · saved on this device');
 },[persist]);
 useEffect(()=>{if(!Object.keys(progress).length)return;const t=setTimeout(()=>void sync(),1800);return()=>clearTimeout(t);},[progress,sync]);
 return {user,progress,status,update,sync};
}
