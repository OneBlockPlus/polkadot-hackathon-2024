import {UserInfo} from "@/types/user.d.ts"
type PersonalDetail = {
    code?:number,
    level:number,
    profile:Profile
}
interface Profile extends UserInfo {
    "birthday": number,
    "gender": number,
    "followed": boolean,
    "signature": string,
    "followeds": number,
    "follows": number,
    "eventCount": number,
    "playlistCount": number,
}
