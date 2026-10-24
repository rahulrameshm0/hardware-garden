import {test} from 'node:test';
import assert from 'node:assert/strict';
import {lessons} from '../lib/course.ts';
import {lessonVideoKeys,sectionVideo,youtubeUrl} from '../lib/lesson-videos.ts';
test('all 96 explanation sections have valid videos, with three different videos per lesson',()=>{
 assert.deepEqual(Object.keys(lessonVideoKeys).sort(),lessons.map(l=>l.id).sort());
 let sections=0;
 for(const lesson of lessons){const ids=[];for(let i=0;i<lesson.steps.length;i++){const v=sectionVideo(lesson.id,i);assert.match(v.id,/^[a-zA-Z0-9_-]{11}$/);assert.ok(v.author&&v.title);assert.equal(new URL(youtubeUrl(v)).hostname,'www.youtube.com');ids.push(v.id);sections++;}assert.equal(new Set(ids).size,3,lesson.id);}
 assert.equal(sections,96);
});
