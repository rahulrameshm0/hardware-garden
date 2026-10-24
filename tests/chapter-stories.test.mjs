import {test} from 'node:test';
import assert from 'node:assert/strict';
import {lessons} from '../lib/course.ts';
import {chapterStories} from '../lib/chapter-stories.ts';
test('every lesson has a distinct, short four-scene teaching story',()=>{
 assert.deepEqual(Object.keys(chapterStories).sort(),lessons.map(l=>l.id).sort());
 const scripts=new Set();
 for(const lesson of lessons){const story=chapterStories[lesson.id];assert.equal(story.scenes.length,4);assert.equal(story.captions.length,4);assert.ok(story.question.endsWith('?'));assert.ok(story.takeaway.length>15);for(const caption of story.captions){const words=caption.split(/\s+/);assert.ok(words.length>=5&&words.length<=50,`${lesson.id}: caption length`);}scripts.add(story.captions.join(' '));}
 assert.equal(scripts.size,32);
 for(const id of ['7-2','7-3','8-1','8-2'])assert.match(chapterStories[id].captions.join(' '),/adult/);
});
