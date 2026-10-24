import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import {existsSync,mkdirSync,copyFileSync,readdirSync} from 'node:fs';
export default defineConfig({root:path.resolve('mobile'),publicDir:path.resolve('public'),plugins:[react(),{name:'android-download',closeBundle(){const dir=path.resolve('release');if(existsSync(dir)){mkdirSync('vercel-dist/downloads',{recursive:true});for(const name of readdirSync(dir).filter(n=>/^Hardware-Garden-[0-9.]+\.apk$/.test(n)))copyFileSync(path.join(dir,name),path.join('vercel-dist/downloads',name));}}}],define:{__HG_API_BASE__:JSON.stringify('')},build:{outDir:path.resolve('vercel-dist'),emptyOutDir:true},resolve:{alias:{'@':path.resolve('.')}}});
