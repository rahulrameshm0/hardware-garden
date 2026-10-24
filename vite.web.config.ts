import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import {existsSync,mkdirSync,copyFileSync} from 'node:fs';
export default defineConfig({root:path.resolve('mobile'),publicDir:path.resolve('public'),plugins:[react(),{name:'android-download',closeBundle(){const apk=path.resolve('release/Hardware-Garden-2.1.apk');if(existsSync(apk)){mkdirSync('vercel-dist/downloads',{recursive:true});copyFileSync(apk,'vercel-dist/downloads/Hardware-Garden-2.1.apk');}}}],define:{__HG_API_BASE__:JSON.stringify('')},build:{outDir:path.resolve('vercel-dist'),emptyOutDir:true},resolve:{alias:{'@':path.resolve('.')}}});
