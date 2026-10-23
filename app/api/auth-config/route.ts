import {authConfig} from '../../../lib/auth-server';
import {cors,preflight} from '../../../lib/api-cors';
export const dynamic='force-dynamic';
export async function GET(request:Request){const c=authConfig();return cors(Response.json({password:!!c.AUTH_SECRET,google:!!(c.GOOGLE_CLIENT_ID&&c.GOOGLE_CLIENT_SECRET),apple:!!(c.APPLE_CLIENT_ID&&c.APPLE_CLIENT_SECRET)},{headers:{'Cache-Control':'no-store'}}),request);}
export const OPTIONS=preflight;
