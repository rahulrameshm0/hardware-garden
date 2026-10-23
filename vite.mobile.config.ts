import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
export default defineConfig({root:path.resolve('mobile'),publicDir:path.resolve('public'),plugins:[react()],define:{__HG_API_BASE__:JSON.stringify(process.env.HG_API_BASE_URL||'https://hardware-garden-rahul.rahulrameshm98.chatgpt.site')},build:{outDir:path.resolve('mobile-dist'),emptyOutDir:true},resolve:{alias:{'@':path.resolve('.')}}});
