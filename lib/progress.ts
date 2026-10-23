export type Progress = {completed:boolean;score:number;step:number;positionAt:number;bookmarked:boolean;bookmarkAt:number};
export type ProgressMap = Record<string,Progress>;
export const emptyProgress:Progress={completed:false,score:0,step:0,positionAt:0,bookmarked:false,bookmarkAt:0};
export function mergeProgress(a:ProgressMap,b:ProgressMap):ProgressMap {
 const result:ProgressMap={...a};
 for(const [id,right] of Object.entries(b)) {
  const left=result[id]??emptyProgress;
  result[id]={completed:left.completed||right.completed,score:Math.max(left.score,right.score),step:right.positionAt>left.positionAt?right.step:left.step,positionAt:Math.max(left.positionAt,right.positionAt),bookmarked:right.bookmarkAt>left.bookmarkAt?right.bookmarked:left.bookmarked,bookmarkAt:Math.max(left.bookmarkAt,right.bookmarkAt)};
 }
 return result;
}
