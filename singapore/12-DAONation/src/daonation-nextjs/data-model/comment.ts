export interface Comment {
  address: string;
  message: string;
  date: Date;
  id: number;
  replies: Comment[];
}
