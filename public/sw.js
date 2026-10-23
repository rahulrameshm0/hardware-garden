const CACHE='hardware-garden-v1';
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(['/','/favicon.svg','/icon-192.png','/icon-512.png','/manifest.webmanifest'])));self.skipWaiting();});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',event=>{
 const request=event.request,url=new URL(request.url);
 if(request.method!=='GET'||url.origin!==self.location.origin||url.pathname.startsWith('/api/')||url.pathname.startsWith('/signin')||url.pathname.startsWith('/signout')||url.pathname==='/callback')return;
 if(request.mode==='navigate'){
 event.respondWith(fetch(request).then(response=>{if(response.ok&&!response.redirected&&response.headers.get('content-type')?.includes('text/html')){const copy=response.clone();event.waitUntil(caches.open(CACHE).then(c=>c.put('/',copy)));}return response;}).catch(()=>caches.match('/').then(cached=>cached||new Response('Connect once to prepare your learning space.',{status:503,headers:{'Content-Type':'text/plain'}}))));return;
 }
 if(['script','style','font','image'].includes(request.destination)||url.pathname==='/manifest.webmanifest'){
 event.respondWith(caches.match(request).then(cached=>cached||fetch(request).then(response=>{if(response.ok){const copy=response.clone();event.waitUntil(caches.open(CACHE).then(c=>c.put(request,copy)));}return response;})));
 }
});
