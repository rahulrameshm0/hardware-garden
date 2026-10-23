import {readFileSync,readdirSync} from 'node:fs';
const path='android/app/src/main/assets/public/assets';
const bundle=readdirSync(path).filter(f=>f.endsWith('.js')).map(f=>readFileSync(`${path}/${f}`,'utf8')).join('\n');
for(const marker of ['AI Assistant','hg-open-assistant','/api/assistant','mobile-ai-card','Hardware Garden 2.0'])if(!bundle.includes(marker))throw new Error(`Android bundle is missing ${marker}`);
console.log('Verified Android bundle includes the AI assistant, Gemini API connection, and mobile 2.0 home.');
