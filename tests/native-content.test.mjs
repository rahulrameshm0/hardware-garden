import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
test('Expo native app bundles the same lessons, video links, quizzes, glossary and merge rules',()=>{for(const name of ['course.ts','progress.ts','chapter-stories.ts','lesson-videos.ts','assistant.ts'])assert.equal(readFileSync(new URL('../expo-app/src/'+name,import.meta.url),'utf8'),readFileSync(new URL('../lib/'+name,import.meta.url),'utf8'),`${name} must stay synchronized`);});
