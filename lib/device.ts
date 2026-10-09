export function deviceLabel(){
 const ua=navigator.userAgent;
 const os=/iPhone/.test(ua)?'iPhone · iOS':/iPad/.test(ua)||(/Macintosh/.test(ua)&&navigator.maxTouchPoints>1)?'iPad · iPadOS':/Android/.test(ua)?'Android 手机/平板':/Windows/.test(ua)?'电脑 · Windows':/Macintosh/.test(ua)?'电脑 · macOS':/Linux/.test(ua)?'电脑 · Linux':'未知设备';
 const browser=/MicroMessenger/.test(ua)?'微信':/Edg/.test(ua)?'Edge':/CriOS|Chrome/.test(ua)?'Chrome':/FxiOS|Firefox/.test(ua)?'Firefox':/Safari/.test(ua)?'Safari':'浏览器';
 return os+' · '+browser;
}
