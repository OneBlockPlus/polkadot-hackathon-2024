export interface Goal {
  goalId: String;
  daoId?: String;
  Title: string;
  Description: string;
  budget : string;
  End_Date: Date;
  UserId?: Number;
  logo?: string;
  ideasCount?:Number;
  votesCount?:Number;
  reached?: Number
}
