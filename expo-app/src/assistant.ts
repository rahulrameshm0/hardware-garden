import {glossary,lessons,type Lesson} from './course';
export type Explanation={title:string;answer:string;analogy:string;steps:{label:string;detail:string}[];check:string;lessonId:string;source:'gemini'|'course'};
export function courseExplanation(question:string,current:Lesson):Explanation{
 const words=question.toLowerCase().match(/[a-z]{3,}/g)||[];
 const ranked=lessons.map(l=>({l,score:words.reduce((n,w)=>n+(l.title.toLowerCase().includes(w)?4:0)+(l.terms.some(t=>t.includes(w))?3:0),0)})).sort((a,b)=>b.score-a.score);
 const l=ranked[0]?.score>3?ranked[0].l:current;
 const term=l.terms.find(t=>question.toLowerCase().includes(t));
 return {title:l.title,answer:term&&glossary[term]?`${term}: ${glossary[term]} ${l.simple}`:l.simple,analogy:l.steps[2].text,steps:l.animation.labels.map((label,i)=>({label,detail:l.animation.captions[i]})),check:l.activity[0],lessonId:l.id,source:'course'};
}
