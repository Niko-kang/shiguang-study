// Counts foreground visibility, not attention. Cap long gaps after device sleep.
export function createVisibleClock(now:number,visible:boolean){
 let last=now,total=0,active=visible;
 return {sample(now:number,visible=active){total+=active?Math.max(0,Math.min(now-last,20000)):0;last=now;active=visible;return Math.floor(total);}};
}
