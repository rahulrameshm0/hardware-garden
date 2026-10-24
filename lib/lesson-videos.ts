export type TopicVideo={id:string;title:string;author:string;level?:string};
export const topicVideos:Record<string,TopicVideo> = {
 "computer": {
  "id": "mCq8-xTH7jA",
  "title": "How Computers Work: What Makes a Computer, a Computer?",
  "author": "CodeAI"
 },
 "io": {
  "id": "DKGZlaPlVLY",
  "title": "How Computers Work: CPU, Memory, Input & Output",
  "author": "CodeAI"
 },
 "software": {
  "id": "xnyFYiK2rSY",
  "title": "How Computers Work: Hardware and Software",
  "author": "CodeAI"
 },
 "binary": {
  "id": "USCBCmwMCDA",
  "title": "How Computers Work: Binary & Data",
  "author": "CodeAI"
 },
 "logic": {
  "id": "ZoqMiFKspAA",
  "title": "How Computers Work: Circuits & Logic",
  "author": "CodeAI"
 },
 "parts": {
  "id": "HB4I2CgkcCo",
  "title": "Basic Computer Parts Explained for Beginners",
  "author": "LearnFree"
 },
 "cpu": {
  "id": "FZGugFqdr60",
  "title": "The Central Processing Unit (CPU): Crash Course Computer Science #7",
  "author": "CrashCourse"
 },
 "ram": {
  "id": "fpnE6UAfbtU",
  "title": "Registers and RAM: Crash Course Computer Science #6",
  "author": "CrashCourse"
 },
 "storage": {
  "id": "TQCr9RV7twk",
  "title": "Memory & Storage: Crash Course Computer Science #19",
  "author": "CrashCourse"
 },
 "numbers": {
  "id": "1GSjbWt0c9M",
  "title": "Representing Numbers and Letters with Binary: Crash Course Computer Science #4",
  "author": "CrashCourse"
 },
 "gates": {
  "id": "gI-qXk7XojA",
  "title": "Boolean Logic & Logic Gates: Crash Course Computer Science #3",
  "author": "CrashCourse"
 },
 "alu": {
  "id": "1I5ZMmrOfnA",
  "title": "How Computers Calculate - the ALU: Crash Course Computer Science #5",
  "author": "CrashCourse"
 },
 "os": {
  "id": "26QPDBe-NB8",
  "title": "Operating Systems: Crash Course Computer Science #18",
  "author": "CrashCourse"
 },
 "files": {
  "id": "KN8YgJnShPM",
  "title": "Files & File Systems: Crash Course Computer Science #20",
  "author": "CrashCourse"
 },
 "wires": {
  "id": "ZhEf7e4kopM",
  "title": "The Internet: Wires, Cables & Wifi",
  "author": "CodeAI"
 },
 "internet": {
  "id": "Dxcc6ycZ73M",
  "title": "What is the Internet?",
  "author": "CodeAI"
 },
 "clean": {
  "id": "gdheyyNnJyk",
  "title": "Computer Basics: Cleaning your Computer",
  "author": "LearnFree"
 },
 "build": {
  "id": "cMSj8DgnmaQ",
  "title": "How to Build a PC - Step by Step Beginners Guide",
  "author": "Christopher Flannigan"
 },
 "voltage": {
  "id": "w82aSjLuD_8",
  "title": "Voltage Explained - What is Voltage? Basic electricity  potential difference",
  "author": "The Engineering Mindset"
 },
 "capacitor": {
  "id": "X4EUwTwZ110",
  "title": "Capacitors Explained - The basics how capacitors work working principle",
  "author": "The Engineering Mindset"
 },
 "diode": {
  "id": "Fwj_d3uO5g8",
  "title": "Diodes Explained - The basics how diodes work working principle pn junction",
  "author": "The Engineering Mindset"
 },
 "cache": {
  "id": "yi0FhRqDJfo",
  "title": "CPU Cache Explained - What is Cache Memory?",
  "author": "PowerCert Animated Videos"
 },
 "workspace": {
  "id": "7NLQ3uC8_sw",
  "title": "Computer Basics: Creating a Safe Workspace",
  "author": "LearnFree"
 },
 "build2": {
  "id": "PXaLc9AYIcg",
  "title": "How To Build A PC - Step by Step (Full Build Guide)",
  "author": "TechSource"
 }
};
// Three different related videos for the three explanation sections of every lesson.
export const lessonVideoKeys:Record<string,[string,string,string]>={
'1-1':['computer','software','io'],'1-2':['io','storage','files'],'1-3':['software','os','computer'],'1-4':['computer','parts','io'],
'2-1':['parts','ram','cpu'],'2-2':['cpu','alu','io'],'2-3':['ram','storage','files'],'2-4':['parts','build','clean'],
'3-1':['parts','wires','build'],'3-2':['io','wires','cache'],'3-3':['io','software','cpu'],'3-4':['internet','wires','computer'],
'4-1':['voltage','logic','capacitor'],'4-2':['voltage','logic','diode'],'4-3':['voltage','capacitor','diode'],'4-4':['voltage','parts','clean'],
'5-1':['binary','numbers','io'],'5-2':['binary','numbers','alu'],'5-3':['logic','gates','alu'],'5-4':['gates','alu','ram'],
'6-1':['cpu','alu','ram'],'6-2':['cache','ram','storage'],'6-3':['ram','cache','storage'],'6-4':['cpu','cache','storage'],
'7-1':['parts','build','build2'],'7-2':['workspace','clean','build'],'7-3':['build','build2','parts'],'7-4':['build2','os','files'],
'8-1':['clean','parts','workspace'],'8-2':['parts','build','workspace'],'8-3':['os','ram','clean'],'8-4':['files','storage','software']
};
export function sectionVideo(id:string,index:number){return topicVideos[lessonVideoKeys[id][index]];}
export const youtubeUrl=(video:TopicVideo)=>`https://www.youtube.com/watch?v=${video.id}`;
