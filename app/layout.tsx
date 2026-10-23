import type {Metadata,Viewport} from 'next';
import './globals.css';
import {AppTheme} from '../components/theme-toggle';
export const metadata:Metadata={title:'Hardware Garden · Learn how computers work',description:'Small steps into computer hardware and electronics. Explore 32 simple lessons, animated explanations, and interactive 3D models.',manifest:'/manifest.webmanifest',icons:{icon:'/favicon.svg',apple:'/icon-192.png'},appleWebApp:{capable:true,title:'Hardware Garden',statusBarStyle:'default'}};
export const viewport:Viewport={width:'device-width',initialScale:1,themeColor:'#3158c9'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en" suppressHydrationWarning><body><AppTheme>{children}</AppTheme></body></html>;}
