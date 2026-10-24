'use client';
import {useEffect,useRef,useState} from 'react';
import {Play,ExternalLink,Volume2,Square,LoaderCircle} from 'lucide-react';
import {sectionVideo,youtubeUrl} from '../lib/lesson-videos';
import {useNaturalVoice} from '../lib/use-natural-voice';
import {usePreferences} from '../lib/preferences';
export function NaturalNarration({text}:{text:string}){
 const voice=useNaturalVoice(),preferences=usePreferences();
 return <div className="section-narration"><button className="secondary-button" onClick={()=>voice.busy||voice.speaking?voice.stop():void voice.play(text,Number(preferences.voiceSpeed))}>{voice.busy?<LoaderCircle size={17}/>:voice.speaking?<Square size={17}/>:<Volume2 size={17}/>} {voice.busy?'Cancel loading':voice.speaking?'Stop narration':'Listen · natural voice'}</button><audio ref={voice.element} controls hidden={!voice.ready} aria-label="Natural narration audio player"/><small>Natural AI-generated speech · sign-in required</small>{voice.error&&<p role="status">{voice.error}</p>}</div>;
}
export default function SectionVideo({lessonId,index,text}:{lessonId:string;index:number;text:string}){
 const video=sectionVideo(lessonId,index),[loaded,setLoaded]=useState(false),identity=useRef({});
 useEffect(()=>{const close=(e:Event)=>{if((e as CustomEvent).detail!==identity.current)setLoaded(false);};window.addEventListener('hg-video-start',close);return()=>window.removeEventListener('hg-video-start',close);},[]);
 return <div className="section-video"><div className="section-video-label"><span>SECTION {index+1} VIDEO</span><span>Related topic · original narration</span></div><div className="section-video-screen">{loaded?<iframe src={`https://www.youtube-nocookie.com/embed/${video.id}?rel=0&cc_load_policy=1&playsinline=1`} title={`${video.title} — section ${index+1}`} allow="encrypted-media; picture-in-picture; fullscreen" allowFullScreen referrerPolicy="strict-origin-when-cross-origin"/>:<button className="section-video-cover" onClick={()=>{window.dispatchEvent(new CustomEvent('hg-video-start',{detail:identity.current}));window.dispatchEvent(new CustomEvent('hg-narration-start'));setLoaded(true);}} aria-label={`Load video: ${video.title}`}><span className="section-video-play"><Play size={28} fill="currentColor"/></span><strong>{video.title}</strong><span>{video.author} · Tap to load video</span></button>}</div><div className="section-video-meta"><span>{video.author}</span><a href={youtubeUrl(video)} target="_blank" rel="noopener noreferrer">Watch on YouTube <ExternalLink size={15}/></a></div><NaturalNarration text={text}/><p className="section-video-note">YouTube needs an internet connection. If the player cannot load, use the YouTube link. Turn on CC for available captions.</p></div>;
}
