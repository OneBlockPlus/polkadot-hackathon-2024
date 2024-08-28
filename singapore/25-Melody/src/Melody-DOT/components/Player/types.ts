/*
 * @Descripttion: 
 * @version: 1.0
 * @Author: Hesin
 * @Date: 2024-08-27 15:33:06
 * @LastEditors: Hesin
 * @LastEditTime: 2024-08-27 17:21:45
 */
export type PlayerProps = {
  // id: number;
  name: string;
  mediaUri: string;
  image: string
  // artist?: string;
};

export interface CurrentMusicType extends PlayerProps {
  duration?: number;
  curTime?: number;
  isPlaying?: boolean;
}
export type PlayerContextType = {
  currentMusic: CurrentMusicType;
  setCurrentMusic: (cm: Partial<CurrentMusicType>, replace?: boolean) => void;
  playList: PlayerProps[];
};
