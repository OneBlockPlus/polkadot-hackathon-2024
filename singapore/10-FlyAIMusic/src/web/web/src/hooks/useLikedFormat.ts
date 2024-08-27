//用来确定该歌曲是否已喜欢 返回布尔值
// 参数1：该歌曲id,参数2：用户所有喜欢的歌曲id列表
export function useLikedFormat(id:number,ids:number[]) {
  return   ids?.some(v=> id==v)
}
