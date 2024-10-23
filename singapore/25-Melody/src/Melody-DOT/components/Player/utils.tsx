import { CurrentMusicType } from "./types";

export const secondsToMinutes = (sec: number | undefined) => {
  if (!sec) return "00:00";
  sec = Math.trunc(+sec);
  const minutes = Math.floor(sec / 60);
  const seconds = sec % 60;

  return (
    minutes.toString().padStart(2, "0") +
    ":" +
    seconds.toString().padStart(2, "0")
  );
};

export const defaultMusic: CurrentMusicType = {
  id: 1,
  src: "",
  title: "",
  artist: "",
  isPlaying: false,
};
