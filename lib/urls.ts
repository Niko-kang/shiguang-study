export function pageUrl(path: string) { return import.meta.env.BASE_URL.replace(/\/$/, '') + path; }
export function apiUrl(path: string) { return (import.meta.env.VITE_API_ORIGIN || 'https://mpa-study-2027.nikolakang.chatgpt.site').replace(/\/$/, '') + path; }
export async function apiFetch(path: string, init?: RequestInit) {
  try {
    const response = await fetch(apiUrl(path), {...init, signal: AbortSignal.timeout(12000)});
    if (!(response.headers.get('content-type') || '').includes('application/json')) throw new Error('invalid response');
    return response;
  } catch {
    throw new Error('暂时无法连接学习记录，请重试，或打开原站继续记录。');
  }
}
