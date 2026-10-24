import {env} from 'cloudflare:workers';
export function publicOrigin(request:Request){const c=env as typeof env&{WEB_PUBLIC_ORIGIN?:string;WEB_PROXY_SECRET?:string};
 if(c.WEB_PUBLIC_ORIGIN&&c.WEB_PROXY_SECRET&&request.headers.get('x-hg-public-origin')===c.WEB_PUBLIC_ORIGIN&&request.headers.get('x-hg-proxy-secret')===c.WEB_PROXY_SECRET)return c.WEB_PUBLIC_ORIGIN;
 return new URL(request.url).origin;
}
