'use client';
import {useEffect,useState} from 'react';
export type Preferences={largeText:boolean;reduceMotion:boolean;simpleExplanations:boolean;modelView:'3d'|'2d';voice:'natural'|'device';voiceSpeed:'0.8'|'1'|'1.2';aiAnswers:boolean};
export const defaultPreferences:Preferences={largeText:false,reduceMotion:false,simpleExplanations:false,modelView:'3d',voice:'natural',voiceSpeed:'1',aiAnswers:true};
export function readPreferences():Preferences{
 if(typeof window==='undefined')return defaultPreferences;
 try{const raw=JSON.parse(localStorage.getItem('hg-preferences')||'{}');return {largeText:raw.largeText===true,reduceMotion:raw.reduceMotion===true,simpleExplanations:raw.simpleExplanations===true,modelView:raw.modelView==='2d'?'2d':'3d',voice:raw.voice==='device'?'device':'natural',voiceSpeed:['0.8','1.2'].includes(raw.voiceSpeed)?raw.voiceSpeed:'1',aiAnswers:raw.aiAnswers!==false};}catch{return defaultPreferences;}
}
export function savePreferences(patch:Partial<Preferences>){try{localStorage.setItem('hg-preferences',JSON.stringify({...readPreferences(),...patch}));window.dispatchEvent(new Event('hg-preferences-changed'));return true;}catch{return false;}}
export function usePreferences(){const [value,setValue]=useState(defaultPreferences);useEffect(()=>{const read=()=>setValue(readPreferences());read();window.addEventListener('hg-preferences-changed',read);window.addEventListener('storage',read);return()=>{window.removeEventListener('hg-preferences-changed',read);window.removeEventListener('storage',read);};},[]);return value;}
export function useReducedMotion(){const p=usePreferences();const [system,setSystem]=useState(false);useEffect(()=>{const m=matchMedia('(prefers-reduced-motion: reduce)');const read=()=>setSystem(m.matches);read();m.addEventListener('change',read);return()=>m.removeEventListener('change',read);},[]);return p.reduceMotion||system;}
