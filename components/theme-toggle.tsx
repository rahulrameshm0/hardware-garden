'use client';
import {useEffect,useState} from 'react';
import {Moon,Sun} from 'lucide-react';
import {ThemeProvider,useTheme} from 'next-themes';
export function AppTheme({children}:{children:React.ReactNode}){return <ThemeProvider attribute="data-theme" defaultTheme="dark" enableSystem disableTransitionOnChange>{children}</ThemeProvider>;}
export default function ThemeToggle(){const {resolvedTheme,setTheme}=useTheme();const [ready,setReady]=useState(false);useEffect(()=>setReady(true),[]);const dark=!ready||resolvedTheme==='dark';return <button className="theme-toggle icon-button" aria-label={dark?'Switch to light mode':'Switch to dark mode'} title={dark?'Switch to light mode':'Switch to dark mode'} onClick={()=>setTheme(dark?'light':'dark')}>{dark?<Sun size={18}/>:<Moon size={18}/>}<span>{dark?'Light':'Dark'}</span></button>;}
