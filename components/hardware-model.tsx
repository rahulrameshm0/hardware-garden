'use client';
import {useEffect,useRef,useState} from 'react';
import {RotateCcw,ZoomIn,ZoomOut,Layers,Move,ChevronLeft,ChevronRight} from 'lucide-react';
import {modelNames,type ModelId} from '../lib/course';
type Part={name:string;x:number;y:number;w:number;h:number;d:number;z:number;color:string;kind?:string;description:string};
const part=(name:string,x:number,y:number,w:number,h:number,d:number,z:number,color:string,description:string,kind?:string):Part=>({name,x,y,w,h,d,z,color,description,kind});
const board=part('Main circuit board',0,0,280,240,5,0,'#397867','Connects components through conducting paths called traces.','board');
const cpu=part('Processor',86,63,65,65,10,7,'#b5c0cb','The CPU follows program instructions. The metal lid helps spread heat.','cpu');
const ram=[0,1].map(i=>part(`Memory module ${i+1}`,180+i*26,30,13,156,22,8,'#304b59','RAM holds working information for running programs. It loses its contents without power.','ram'));
const drive=part('SSD',35,169,109,25,6,7,'#263a50','Flash memory keeps files without continuous power. This model uses an M.2-style format.','ssd');
const cap=[0,1,2,3].map(i=>part(`Power regulation ${i+1}`,39+i*28,30,14,14,12,7,'#899eac','These simplified components represent parts that help regulate and smooth electrical power.'));
const gpu=part('Graphics card',30,133,220,70,24,14,'#51616d','A GPU performs many suitable calculations in parallel and helps draw images.','gpu');
const fan=part('Cooling fan',82,65,80,80,24,38,'#718eaa','Moves air through the heat sink to carry heat away.','fan');
const sink=part('Heat sink',72,55,100,100,25,12,'#b2beca','Metal fins transfer heat into moving air.','sink');
const defs:Record<ModelId,Part[]>={
 computer:[part('Case floor',-15,-15,310,270,6,-8,'#d6dfe7','A chassis supports and protects the components.'),part('Case back panel',-15,-15,310,7,68,0,'#b4c5d5','Openings let external ports and ventilation meet the outside.'),board,cpu,...ram,drive,...cap,part('Power supply',5,198,130,60,42,6,'#435266','Converts wall electricity into suitable power. Never open it.','psu'),fan],
 motherboard:[board,cpu,...ram,drive,...cap,part('Expansion slot',25,137,135,10,8,6,'#e1d7bf','Accepts a compatible expansion card.'),part('External ports',4,40,22,78,24,5,'#aab9c5','Connect external devices, network cables, and supported displays.')],
 cpu:[part('Chip substrate',65,40,155,155,5,0,'#347d68','The package connects the silicon to the motherboard.','board'),part('Heat spreader',76,51,133,133,10,5,'#bdc8d1','A metal lid spreads heat from the silicon below.','cpu'),part('Silicon die (illustration)',109,84,66,66,4,26,'#6c8bb6','The tiny circuits doing the work are fabricated on silicon. Shown exposed for learning.','chip')],
 ram:[part('Memory board',15,80,250,68,4,0,'#397867','This board connects the memory chips to the memory controller.','board'),...[0,1,2,3].map(i=>part(`DRAM chip ${i+1}`,31+i*56,94,39,35,7,5,'#283b4b','Working data is stored in DRAM chips that need power and refresh.','chip')),part('Edge contacts',24,146,230,9,2,0,'#caa866','These contacts connect the module to its compatible memory slot.','contacts')],
 ssd:[part('Drive board',18,74,248,87,4,0,'#294a65','A solid-state drive uses electronic storage with no spinning platters.','board'),part('Flash memory',45,88,66,52,7,4,'#293743','Nonvolatile flash stores files even with power removed.','chip'),part('Flash memory 2',127,88,66,52,7,4,'#293743','Additional flash chips add storage capacity.','chip'),part('Controller',209,95,34,36,6,4,'#7897ad','Coordinates reads, writes, and management of flash storage.','chip'),part('Drive contacts',18,157,70,10,2,0,'#cfac69','The supported connector links this drive to the computer.','contacts')],
 gpu:[part('Graphics board',15,65,250,117,4,0,'#357363','The board connects the GPU, memory, power, and display outputs.','board'),part('GPU silicon package',106,93,65,58,8,5,'#a8b8ca','A processor designed for many parallel calculations.','cpu'),part('Cooler assembly',23,68,232,104,18,20,'#586d83','A heat sink and fans remove heat from the graphics processor.','gpu'),part('Display ports',1,90,18,72,15,3,'#a7b8c5','Supported displays attach here.')],
 psu:[part('Sealed enclosure',53,48,175,150,65,0,'#465c72','The power supply converts and regulates electricity. Do not open the enclosure.','psu'),part('Cable connectors',231,70,12,102,29,7,'#263c52','Only use cables explicitly compatible with the exact PSU.')],
 cooling:[part('Processor below cooler',95,75,90,90,8,0,'#b3c1ce','The processor produces heat during operation.','cpu'),part('Heat sink fins',67,47,145,145,53,10,'#aebdc9','The fins create more surface area for heat transfer.','sink'),part('Cooling fan',59,39,161,161,20,66,'#617f9c','The fan moves air through the heat sink.','fan')]
};
export default function HardwareModel({model='computer',hero=false}:{model?:ModelId;hero?:boolean}){
 const [rx,setRx]=useState(55),[rz,setRz]=useState(-28),[zoom,setZoom]=useState(1),[exploded,setExploded]=useState(false),[flat,setFlat]=useState(false),[selected,setSelected]=useState<number|null>(null);
 const drag=useRef<{x:number;y:number;rx:number;rz:number}|null>(null);const moved=useRef(false);const parts=defs[model];const selectedPart=selected!==null?parts[selected]:null;
 useEffect(()=>{if(!CSS.supports('transform-style','preserve-3d'))setFlat(true);},[]);
 const reset=()=>{setRx(55);setRz(-28);setZoom(1);setExploded(false);setSelected(null);};
 return <div className={`hardware-view ${hero?'hero-model':''}`}>
 <div className={`model-stage ${flat?'flat-view':''}`} tabIndex={hero?-1:0} role="group" aria-hidden={hero||undefined} aria-label={`Interactive 3D ${modelNames[model]}. Arrow keys rotate; plus and minus zoom.`}
 onKeyDown={e=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','-'].includes(e.key))e.preventDefault();if(e.key==='ArrowLeft')setRz(rz-10);if(e.key==='ArrowRight')setRz(rz+10);if(e.key==='ArrowUp')setRx(Math.min(85,rx+10));if(e.key==='ArrowDown')setRx(Math.max(10,rx-10));if(e.key==='+')setZoom(Math.min(1.5,zoom+.1));if(e.key==='-')setZoom(Math.max(.6,zoom-.1));}}
 onPointerDown={e=>{moved.current=false;drag.current={x:e.clientX,y:e.clientY,rx,rz};}}
 onPointerMove={e=>{if(!drag.current||flat)return;if(Math.abs(e.clientX-drag.current.x)+Math.abs(e.clientY-drag.current.y)>4){moved.current=true;e.currentTarget.setPointerCapture(e.pointerId);}setRz(drag.current.rz+(e.clientX-drag.current.x)*.5);setRx(Math.max(10,Math.min(85,drag.current.rx-(e.clientY-drag.current.y)*.35)));}}
 onPointerUp={()=>{drag.current=null;}} onPointerCancel={()=>{drag.current=null;}}>
 <div className="model-grid"/>
 <div className="model-object" style={{transform:`translate(-50%,-50%) scale(${zoom*(hero?1.05:1)}) rotateX(${flat?0:rx}deg) rotateZ(${flat?0:rz}deg)`}}>
 {parts.map((p,i)=><div key={p.name} className={`model-part ${selected===i?'selected-part':''}`} style={{left:p.x,top:p.y,width:p.w,height:p.h,transform:`translateZ(${flat?i*.1:p.z+(exploded?i*9:0)}px)`,'--part-color':p.color,'--depth':`${p.d}px`} as React.CSSProperties}>
 <button tabIndex={hero?-1:0} className={`part-top ${p.kind||''}`} style={{transform:`translateZ(${flat?0:p.d}px)`}} onClick={()=>{if(!moved.current)setSelected(i);}} aria-label={p.name} title={p.name}>{p.kind==='cpu'?<span>CPU</span>:p.kind==='fan'||p.kind==='gpu'||p.kind==='psu'?<span className={`fan-drawing ${p.kind==='gpu'?'double-fan':''}`}/>:p.kind==='chip'?<span className="chip-mark"/>:null}</button>
 {!flat&&<><div className="part-front" style={{top:p.h,height:p.d}}/><div className="part-right" style={{left:p.w,width:p.d}}/></>}
 </div>)}
 </div>
 {hero&&<><span className="model-callout callout-cpu">Processor <span>The instruction follower</span></span><span className="model-callout callout-ram">Memory <span>Your working space</span></span></>}
 </div>
 {!hero&&<><div className="model-toolbar"><span><Move size={14}/> Drag to explore</span><div><button aria-label="Zoom out" onClick={()=>setZoom(Math.max(.6,zoom-.15))}><ZoomOut size={18}/></button><button aria-label="Zoom in" onClick={()=>setZoom(Math.min(1.5,zoom+.15))}><ZoomIn size={18}/></button><button aria-label="Reset model" onClick={reset}><RotateCcw size={17}/></button><button className={exploded?'active-tool':''} aria-pressed={exploded} onClick={()=>setExploded(!exploded)}><Layers size={16}/> Explode</button><button aria-pressed={flat} onClick={()=>setFlat(!flat)}>{flat?'3D view':'2D view'}</button></div></div><div className="part-description" aria-live="polite"><strong>{selectedPart?.name||'Pick a part. Discover its job.'}</strong><p>{selectedPart?.description||'Tap any component above, or choose one below. These are simplified educational models, not assembly drawings.'}</p><div className="part-list">{parts.map((p,i)=><button key={p.name} onClick={()=>setSelected(i)} aria-pressed={selected===i}>{p.name}</button>)}</div></div></>}
 </div>;
}
