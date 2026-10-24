import {publicOrigin} from '../../../lib/public-origin';
import {env} from 'cloudflare:workers';
import {getLearningUser} from '../../../lib/auth-user';
import {cors,preflight,nativeOrigin} from '../../../lib/api-cors';
import {lessons} from '../../../lib/course';
import type {Progress,ProgressMap} from '../../../lib/progress';
export const dynamic='force-dynamic';
const headers={'Cache-Control':'no-store'};
async function read(userId:string){
 const {results}=await env.DB!.prepare('SELECT * FROM learning_progress WHERE user_id = ?').bind(userId).all<{lesson_id:string;completed:number;score:number;step:number;position_at:number;bookmarked:number;bookmark_at:number}>();
 return Object.fromEntries(results.map(r=>[r.lesson_id,{completed:!!r.completed,score:r.score,step:r.step,positionAt:r.position_at,bookmarked:!!r.bookmarked,bookmarkAt:r.bookmark_at}]));
}
async function readProgress(request:Request){
 const user=await getLearningUser(request);if(!user)return Response.json({error:'Sign in to load progress.'},{status:401,headers});
 if(request.headers.get('x-learning-account')!==user.userId)return Response.json({error:'Account changed. Reconnect to sync.'},{status:409,headers});
 try{return Response.json(await read(user.userId),{headers});}catch{return Response.json({error:'Progress is temporarily unavailable. Your device copy is safe.'},{status:503,headers});}
}
async function saveProgress(request:Request){
 const user=await getLearningUser(request);if(!user)return Response.json({error:'Sign in to save progress.'},{status:401,headers});
 if(request.headers.get('x-learning-account')!==user.userId)return Response.json({error:'Account changed. Reconnect to sync.'},{status:409,headers});
 const origin=request.headers.get('origin');if((origin&&origin!==publicOrigin(request)&&!nativeOrigin(origin))||(request.headers.get('sec-fetch-site')==='cross-site'&&!nativeOrigin(origin)))return Response.json({error:'Invalid origin.'},{status:403,headers});
 let body:unknown;try{const raw=await request.text();if(raw.length>24000)throw Error();body=JSON.parse(raw);}catch{return Response.json({error:'Invalid progress data.'},{status:400,headers});}
 if(!body||typeof body!=='object'||Array.isArray(body)||Object.keys(body).length>32)return Response.json({error:'Invalid progress data.'},{status:400,headers});
 const ids=new Set(lessons.map(l=>l.id));const maxTime=Date.now()+300000;
 for(const [id,v] of Object.entries(body)){
 const p=v as Progress;
 if(!ids.has(id)||!p||typeof p!=='object'||typeof p.completed!=='boolean'||typeof p.bookmarked!=='boolean'||!Number.isInteger(p.score)||p.score<0||p.score>3||!Number.isInteger(p.step)||p.step<0||p.step>4||![p.positionAt,p.bookmarkAt].every(t=>Number.isSafeInteger(t)&&t>=0&&t<=maxTime))return Response.json({error:'Invalid progress record.'},{status:400,headers});
 }
 try{
 const statements=Object.entries(body as ProgressMap).map(([id,p])=>env.DB!.prepare(`INSERT INTO learning_progress (user_id,lesson_id,completed,score,step,position_at,bookmarked,bookmark_at) VALUES (?,?,?,?,?,?,?,?) ON CONFLICT(user_id,lesson_id) DO UPDATE SET completed=MAX(learning_progress.completed,excluded.completed),score=MAX(learning_progress.score,excluded.score),step=CASE WHEN excluded.position_at>learning_progress.position_at THEN excluded.step ELSE learning_progress.step END,position_at=MAX(learning_progress.position_at,excluded.position_at),bookmarked=CASE WHEN excluded.bookmark_at>learning_progress.bookmark_at THEN excluded.bookmarked ELSE learning_progress.bookmarked END,bookmark_at=MAX(learning_progress.bookmark_at,excluded.bookmark_at)`).bind(user.userId,id,+p.completed,p.score,p.step,p.positionAt,+p.bookmarked,p.bookmarkAt));
 if(statements.length)await env.DB!.batch(statements);
 return Response.json(await read(user.userId),{headers});
 }catch{return Response.json({error:'Could not sync. Your progress remains on this device.'},{status:503,headers});}
}

export async function GET(request:Request){return cors(await readProgress(request),request);}
export async function POST(request:Request){return cors(await saveProgress(request),request);}
export const OPTIONS=preflight;
