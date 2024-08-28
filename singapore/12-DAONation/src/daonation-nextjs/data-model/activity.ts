export interface Activity {
  date: Date;
  type: ActivityCardType;
  data: any;
}

export type ActivityCardType = 'join' | 'badge' | 'donation' | 'idea' | 'goal' | 'vote';
