import test from 'node:test';
import assert from 'node:assert/strict';
import gateway from '../api/index.ts';

test('Vercel gateway checks origin, fixes the upstream destination, and preserves session cookies',async()=>{
 const previous={origin:process.env.HG_PUBLIC_ORIGIN,secret:process.env.HG_PROXY_SECRET,fetch:globalThis.fetch};
 process.env.HG_PUBLIC_ORIGIN='https://hardware.test';process.env.HG_PROXY_SECRET='test-only-gateway-secret';let observed;
 globalThis.fetch=async(url,init)=>{observed={url:new URL(url),init};return new Response('{"ok":true}',{headers:{'Set-Cookie':'session=test; HttpOnly; Secure; SameSite=Lax','Content-Type':'application/json'}});};
 try{
  const bad=await gateway.fetch(new Request('https://hardware.test/api/auth?route=auth/sign-in/username',{method:'POST',headers:{Origin:'https://untrusted.test'},body:'{}'}));assert.equal(bad.status,403);assert.equal(observed,undefined);
  const good=await gateway.fetch(new Request('https://hardware.test/api/index?route=auth/callback/google&state=sample',{headers:{Cookie:'session=test',Origin:'https://hardware.test'}}));
  assert.equal(good.status,200);assert.equal(observed.url.origin,'https://hardware-garden-rahul.rahulrameshm98.chatgpt.site');assert.equal(observed.url.pathname,'/api/auth/callback/google');assert.equal(observed.url.search,'?state=sample');assert.equal(observed.init.headers.get('cookie'),'session=test');assert.equal(observed.init.headers.get('x-hg-public-origin'),'https://hardware.test');assert.equal(observed.init.headers.get('x-hg-proxy-secret'),'test-only-gateway-secret');assert.match(good.headers.get('set-cookie'),/HttpOnly/);assert.equal(good.headers.get('cache-control'),'no-store');
  const tooBig=await gateway.fetch(new Request('https://hardware.test/api/index?route=progress',{method:'POST',body:'x'.repeat(64001)}));assert.equal(tooBig.status,413);
  const invalid=await gateway.fetch(new Request('https://hardware.test/api/index?route=https://untrusted.test'));assert.equal(invalid.status,404);
 }finally{globalThis.fetch=previous.fetch;if(previous.origin===undefined)delete process.env.HG_PUBLIC_ORIGIN;else process.env.HG_PUBLIC_ORIGIN=previous.origin;if(previous.secret===undefined)delete process.env.HG_PROXY_SECRET;else process.env.HG_PROXY_SECRET=previous.secret;}
});
