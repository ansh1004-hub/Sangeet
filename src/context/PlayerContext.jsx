import { createContext, useState } from "react";

// 1. Create the Context
export const PlayerContext = createContext();

// 2. Create the Provider (The wrapper that holds the data)
export function PlayerProvider({ children }) {
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // A helper function we can call from ANY page to play a song
  const playSong = (song) => {
    setCurrentSong(song);
    setIsPlaying(true);
  };

  return (
    <PlayerContext.Provider
      value={{ currentSong, isPlaying, playSong, setIsPlaying }}
    >
      {children}
    </PlayerContext.Provider>
  );
}
