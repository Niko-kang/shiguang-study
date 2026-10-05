export interface Env { DB: D1Database; ALLOWED_ORIGIN: string }
export function json(value:unknown,status=200){return Response.json(value,{status,headers:{'Cache-Control':'no-store','Referrer-Policy':'no-referrer'}})}
export function validOrigin(request:Request,env:Env){const origin=request.headers.get('Origin');return !origin||origin===env.ALLOWED_ORIGIN||origin===new URL(request.url).origin}
