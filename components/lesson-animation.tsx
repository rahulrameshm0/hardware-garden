'use client';
import {useEffect,useState,lazy,Suspense} from 'react';
import {Play,Pause,RotateCcw,SkipForward} from 'lucide-react';
import {useReducedMotion} from '../lib/preferences';
import type {Lesson} from '../lib/course';
const HardwareModel=lazy(()=>import('./hardware-model'));
export default function LessonAnimation({lesson}:{lesson:Lesson}){
 const [frame,setFrame]=useState(0),[playing,setPlaying]=useState(false),[speed,setSpeed]=useState(1);
 const reduced=useReducedMotion();
 useEffect(()=>{if(reduced)setPlaying(false);},[reduced]);
 useEffect(()=>{if(!playing)return;const t=setInterval(()=>setFrame(f=>(f+1)%3),6000/speed);return()=>clearInterval(t);},[playing,speed]);
 return <section className="animation-card" aria-label="Animated explanation"><div className="animation-heading"><span>See the real hardware in action</span><span>Step {frame+1} of 3</span></div><div className="real-animation-scene"><Suspense fallback={<div className="model-loading">Preparing the hardware animation…</div>}><HardwareModel model={lesson.model} animation={{playing,speed,stage:frame}}/></Suspense></div><div className="animation-stepper" aria-label="Animation stages">{lesson.animation.labels.map((label,i)=><button key={label} aria-pressed={frame===i} onClick={()=>{setPlaying(false);setFrame(i);}}><span>{i+1}</span>{label}</button>)}</div><p className="animation-caption" aria-live={playing?'off':'polite'}>{lesson.animation.captions[frame]}</p><div className="animation-controls"><button className="small-primary" disabled={reduced} onClick={()=>setPlaying(!playing)}>{playing?<Pause size={16}/>:<Play size={16}/>} {playing?'Pause':'Play'}</button><button onClick={()=>{setFrame(0);setPlaying(false);}} aria-label="Replay from start"><RotateCcw size={17}/></button><button onClick={()=>{setPlaying(false);setFrame((frame+1)%3);}} aria-label="Next animation stage"><SkipForward size={18}/></button><label>Speed <select aria-label="Animation speed" value={speed} onChange={e=>setSpeed(Number(e.target.value))}><option value={.5}>0.5×</option><option value={1}>1×</option><option value={1.5}>1.5×</option></select></label>{reduced&&<span>Reduced motion · use next to step through</span>}</div></section>;
}
