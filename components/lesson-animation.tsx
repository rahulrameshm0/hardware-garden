'use client';
import {useEffect,useState} from 'react';
import {useNaturalVoice} from '../lib/use-natural-voice';
import {Play,Pause,RotateCcw,SkipForward,Volume2,VolumeX,Keyboard,Monitor,Cpu,Camera,Save,FolderOpen,Music,Settings,Speaker,Laptop,Smartphone,MemoryStick,Network,HardDrive,Power,Gpu,Flame,Fan,Cable,MousePointer,Router,Globe,Zap,Lightbulb,ToggleLeft,ToggleRight,Battery,ArrowRight,Binary,Calculator,Layers,Download,Search,Mailbox,Clock,CheckCircle,ShieldCheck,BookOpen,Hand,Package,Stethoscope,FileCheck,Copy,Wind,Plug,TriangleAlert,type LucideIcon} from 'lucide-react';
import {useReducedMotion} from '../lib/preferences';
import {chapterStories} from '../lib/chapter-stories';
import type {Lesson} from '../lib/course';
const art:Record<string,LucideIcon[]>={
'1-1':[Keyboard,Cpu,Monitor,Lightbulb],'1-2':[Camera,Save,FolderOpen,Monitor],'1-3':[Music,Settings,Cable,Speaker],'1-4':[Monitor,Laptop,Smartphone,Network],
'2-1':[MemoryStick,Network,Cpu,Layers],'2-2':[Download,Search,Calculator,CheckCircle],'2-3':[HardDrive,MemoryStick,Save,Power],'2-4':[Power,Gpu,Flame,Fan],
'3-1':[Search,Cable,FileCheck,Plug],'3-2':[Mailbox,Network,Clock,Layers],'3-3':[MousePointer,Cpu,Gpu,Monitor],'3-4':[Laptop,Router,Globe,Mailbox],
'4-1':[Battery,Zap,Layers,Network],'4-2':[Battery,ToggleRight,Lightbulb,ToggleLeft],'4-3':[Layers,Battery,ArrowRight,Lightbulb],'4-4':[Battery,Cpu,Flame,Fan],
'5-1':[ToggleLeft,ToggleRight,Binary,BookOpen],'5-2':[Binary,Binary,Binary,Calculator],'5-3':[ToggleRight,ToggleRight,ToggleLeft,Cpu],'5-4':[ToggleRight,Network,Calculator,MemoryStick],
'6-1':[Download,Search,Calculator,ArrowRight],'6-2':[Cpu,Search,CheckCircle,MemoryStick],'6-3':[Mailbox,Search,Binary,Battery],'6-4':[Laptop,Clock,Settings,FileCheck],
'7-1':[Cpu,MemoryStick,Package,BookOpen],'7-2':[ShieldCheck,Power,Package,Hand],'7-3':[Cpu,Fan,MemoryStick,HardDrive],'7-4':[FileCheck,Power,Settings,Save],
'8-1':[Wind,Fan,ShieldCheck,Wind],'8-2':[ShieldCheck,Plug,Search,TriangleAlert],'8-3':[Search,Stethoscope,Settings,FileCheck],'8-4':[FolderOpen,Copy,FileCheck,Download]};
export default function LessonAnimation({lesson}:{lesson:Lesson}){
 const story=chapterStories[lesson.id],icons=art[lesson.id];
 const [frame,setFrame]=useState(0),[elapsed,setElapsed]=useState(0),[playing,setPlaying]=useState(false),[speed,setSpeed]=useState(1),[voice,setVoice]=useState(false);
 const reduced=useReducedMotion(),narration=useNaturalVoice();
 const durations=story.captions.map(c=>Math.max(9000,c.split(/\s+/).length/2*1000+1500));
 const total=durations.reduce((a,b)=>a+b,0),position=durations.slice(0,frame).reduce((a,b)=>a+b,0)+elapsed;

 useEffect(()=>{setFrame(0);setElapsed(0);setPlaying(false);},[lesson.id]);
 useEffect(()=>{if(reduced)setPlaying(false);},[reduced]);
 useEffect(()=>{if(!playing||reduced||voice)return;const timer=setInterval(()=>setElapsed(t=>t+100*speed),100);return()=>clearInterval(timer);},[playing,speed,reduced,voice]);
 useEffect(()=>{if(elapsed<durations[frame])return;if(frame===3){setElapsed(durations[3]);setPlaying(false);}else{setFrame(f=>f+1);setElapsed(0);}},[elapsed,frame,durations]);
 useEffect(()=>{if(!voice||!playing){narration.stop();return;}void narration.play(story.captions[frame],speed,()=>setElapsed(durations[frame]));return narration.stop;},[voice,playing,frame,speed,lesson.id,narration.play,narration.stop]);
 useEffect(()=>{if(narration.error)setPlaying(false);},[narration.error]);
 const seek=(n:number)=>{setPlaying(false);setFrame(n);setElapsed(0);};
 const Icon=icons[frame],done=frame===3&&elapsed>=durations[3];
 return <section className="chapter-video" aria-label={`Animated chapter: ${lesson.title}`}>
 <header className="chapter-video-heading"><span><span className="video-eyebrow">WATCH & UNDERSTAND</span><strong>{story.question}</strong></span><span>4 short scenes · about {Math.ceil(total/60000)} min</span></header>
 <div className={`story-stage ${playing&&!reduced?'story-playing':''}`} style={{'--story-speed':`${2/speed}s`} as React.CSSProperties}>
 <div className="story-scene-count">SCENE {frame+1} / 4</div>
 <div className="story-illustration" key={`${lesson.id}-${frame}`}>
 <div className="story-orbit orbit-one"/><div className="story-orbit orbit-two"/>
 <div className="story-main-icon"><Icon size={76} strokeWidth={1.5}/>{lesson.id==='2-2'&&<b>{['2 + 3','ADD','2 + 3','5'][frame]}</b>}{lesson.id==='5-2'&&<b>{['1 0 0','1 0 0','1 0 1','4 + 1 = 5'][frame]}</b>}{lesson.id==='5-1'&&<b>{['0','1','01000001','A'][frame]}</b>}</div>
 <div className="story-travel-dot"/><div className="story-spark spark-one">✦</div><div className="story-spark spark-two">✧</div>
 </div>
 <h3>{story.scenes[frame]}</h3>
 <div className="story-path" aria-label="The story so far">{story.scenes.map((name,i)=>{const Part=icons[i];return <button key={i} onClick={()=>seek(i)} aria-label={`Scene ${i+1}: ${name}`} aria-current={i===frame?'step':undefined} className={i===frame?'current':i<frame?'past':''}><Part size={25}/><span>{name}</span></button>;})}</div>
 </div>
 <div className="story-caption" aria-live={playing?'off':'polite'}><span>{String(frame+1).padStart(2,'0')}</span><p>{story.captions[frame]}</p></div>
 <div className="story-timeline"><label htmlFor={`video-${lesson.id}`}>Chapter timeline</label><input id={`video-${lesson.id}`} type="range" min="0" max="3" step="1" value={frame} onChange={e=>seek(Number(e.target.value))} aria-valuetext={`Scene ${frame+1}: ${story.scenes[frame]}`}/><progress max={total} value={position} aria-label="Playback progress"/></div>
 <div className="story-controls"><button className="small-primary" disabled={reduced} onClick={()=>{if(done){setFrame(0);setElapsed(0);}setPlaying(p=>!p);}}>{playing?<Pause size={18}/>:<Play size={18}/>} {playing?'Pause':done?'Watch again':'Play story'}</button><button onClick={()=>{setFrame(0);setElapsed(0);setPlaying(!reduced);}} aria-label="Replay story"><RotateCcw size={19}/></button><button onClick={()=>seek((frame+1)%4)} aria-label="Next scene"><SkipForward size={19}/></button><button aria-pressed={voice} onClick={()=>{setVoice(v=>!v);}} aria-label={voice?'Turn natural narration off':'Turn natural narration on'}>{voice?<Volume2 size={19}/>:<VolumeX size={19}/>}<span>Natural voice {voice?'on':'off'}</span></button><label>Speed<select aria-label="Story speed" value={speed} onChange={e=>setSpeed(Number(e.target.value))}><option value={.75}>0.75×</option><option value={1}>1×</option><option value={1.25}>1.25×</option></select></label></div>
 {reduced&&<p className="story-notice">Reduced motion is on. Choose a scene or use Next to read at your own pace.</p>}{narration.busy&&<p className="story-notice" role="status">Preparing natural AI narration…</p>}{narration.error&&<p className="story-notice" role="status">{narration.error}</p>}<p className="story-notice">Natural voice is AI-generated and requires sign-in. Original spoken explanations are available in the section videos.</p>
 <aside className="story-takeaway"><Lightbulb size={21}/><span><strong>The big idea</strong>{story.takeaway}</span></aside>
 <details className="story-transcript"><summary>Read the whole story</summary><ol>{story.captions.map((c,i)=><li key={i}><strong>{story.scenes[i]}</strong><p>{c}</p></li>)}</ol></details>
 {lesson.safety&&<p className="story-notice"><strong>Safety first:</strong> {lesson.safety}</p>}
 </section>;
}
