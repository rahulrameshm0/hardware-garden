import {copyFileSync} from 'node:fs';
for(const name of ['course.ts','progress.ts','chapter-stories.ts','lesson-videos.ts','assistant.ts'])copyFileSync(new URL('../lib/'+name,import.meta.url),new URL('../expo-app/src/'+name,import.meta.url));
console.log('Expo course content synchronized.');
