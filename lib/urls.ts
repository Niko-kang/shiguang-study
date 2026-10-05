export function pageUrl(path: string) { return import.meta.env.BASE_URL.replace(/\/$/, '') + path; }
export function apiUrl(path: string) { return (import.meta.env.VITE_API_ORIGIN || 'https://mpa-study-2027.nikolakang.chatgpt.site').replace(/\/$/, '') + path; }
