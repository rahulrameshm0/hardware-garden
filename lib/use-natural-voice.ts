'use client';
import {useCallback,useEffect,useRef,useState} from 'react';
import {apiFetch} from './api-client';
const clips=new Map<string,Blob>();
export function useNaturalVoice(){
 const [busy,setBusy]=useState(false),[speaking,setSpeaking]=useState(false),[error,setError]=useState(''),[ready,setReady]=useState(false);
 const player=useRef<HTMLAudioElement|null>(null),url=useRef(''),controller=useRef<AbortController|null>(null),generation=useRef(0),identity=useRef({});
 const stop=useCallback(()=>{generation.current++;controller.current?.abort();player.current?.pause();if(url.current){URL.revokeObjectURL(url.current);url.current='';}setBusy(false);setSpeaking(false);setReady(false);},[]);
 const play=useCallback(async(text:string,speed=1,onEnd?:()=>void)=>{
  stop();window.dispatchEvent(new CustomEvent('hg-video-start'));window.dispatchEvent(new CustomEvent('hg-narration-start',{detail:identity.current}));const run=generation.current;setBusy(true);setError('');
  try{let blob=clips.get(text);if(!blob){controller.current=new AbortController();const r=await apiFetch('/api/assistant/voice',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text:text.slice(0,2200)}),signal:controller.current.signal});if(!r.ok)throw Error(r.status===401?'Sign in to use natural AI narration. The YouTube videos have their own spoken explanations.':r.status===429?'The hourly voice limit is reached. Please use the YouTube video or captions for now.':'Natural voice is unavailable right now. Please try again or watch the YouTube video.');blob=await r.blob();if(!blob.type.startsWith('audio/'))throw Error('Natural voice could not load. Please try again.');if(clips.size>=6)clips.delete(clips.keys().next().value!);clips.set(text,blob);}if(run!==generation.current)return;
   url.current=URL.createObjectURL(blob);const a=player.current;if(!a)throw Error('Audio player is not ready. Please try again.');a.src=url.current;a.playbackRate=speed;setReady(true);a.onplay=()=>{setError('');setSpeaking(true);};a.onpause=()=>setSpeaking(false);a.onended=()=>{if(run===generation.current){setSpeaking(false);onEnd?.();}};a.onerror=()=>{if(run===generation.current){setSpeaking(false);setError('Your device could not play this audio. Try the YouTube video instead.');}};await a.play();if(run===generation.current){setBusy(false);setSpeaking(true);}
  }catch(e){if(run!==generation.current)return;setError(e instanceof DOMException&&e.name==='NotAllowedError'?'Your browser needs another tap. Press Play in the audio player below to hear the narration.':e instanceof Error?e.message:'Natural voice could not load.');setBusy(false);setSpeaking(false);}
 },[stop]);
 useEffect(()=>{const other=(e:Event)=>{if((e as CustomEvent).detail!==identity.current)stop();};window.addEventListener('hg-narration-start',other);return()=>{window.removeEventListener('hg-narration-start',other);stop();};},[stop]);
 return {play,stop,busy,speaking,error,ready,element:player};
}
