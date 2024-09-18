export interface Comment {
  id: number,
  ideasId: number,
  goalId: number,
  daoId: number,
  address: string,
  date: string,
  message: string,
  user_info: object,
  userid: number,
  replies: []
}
