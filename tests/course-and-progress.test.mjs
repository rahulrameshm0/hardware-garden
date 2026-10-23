import {test} from 'node:test';
import assert from 'node:assert/strict';
import {lessons,modules,glossary,modelNames} from '../lib/course.ts';
import {emptyProgress,mergeProgress} from '../lib/progress.ts';
test('complete curriculum has 8 modules, 32 unique lessons, and valid learning activities',()=>{
 assert.equal(modules.length,8);assert.equal(lessons.length,32);assert.equal(new Set(lessons.map(l=>l.id)).size,32);
 for(let i=0;i<8;i++)assert.equal(lessons.filter(l=>l.module===i).length,4);
 for(const l of lessons){assert.equal(l.steps.length,3);assert.equal(l.quiz.length,3);assert.equal(l.activity.length,3);assert.equal(l.animation.labels.length,3);assert.equal(l.animation.captions.length,3);assert.ok(modelNames[l.model]);assert.ok(l.simple.length>35);for(const term of l.terms)assert.ok(glossary[term],`Missing definition: ${term}`);for(const q of l.quiz){assert.equal(q.options.length,3);assert.ok(q.answer>=0&&q.answer<3);assert.ok(q.explanation.length>10);}}
});
test('completion and highest quiz score survive stale writes',()=>{const a={'1-1':{...emptyProgress,completed:true,score:3,step:4,positionAt:200}};const b={'1-1':{...emptyProgress,score:1,step:1,positionAt:100}};const merged=mergeProgress(a,b);assert.equal(merged['1-1'].completed,true);assert.equal(merged['1-1'].score,3);assert.equal(merged['1-1'].step,4);assert.deepEqual(mergeProgress(b,a),merged);});
test('bookmark removal uses its own timestamp, independent of reading position',()=>{const a={'1-1':{...emptyProgress,bookmarked:true,bookmarkAt:100,step:3,positionAt:300}};const b={'1-1':{...emptyProgress,bookmarked:false,bookmarkAt:200,step:1,positionAt:150}};const r=mergeProgress(a,b)['1-1'];assert.equal(r.bookmarked,false);assert.equal(r.step,3);assert.equal(r.bookmarkAt,200);});
test('repeated sync is idempotent and new lessons remain isolated',()=>{const a={'1-1':{...emptyProgress,score:2,completed:true},'2-1':{...emptyProgress,bookmarked:true,bookmarkAt:10}};assert.deepEqual(mergeProgress(a,a),a);assert.deepEqual(mergeProgress(a,{}),a);assert.deepEqual(mergeProgress({},a),a);});
