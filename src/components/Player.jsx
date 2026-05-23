import { useContext, useRef, useEffect } from "react";
import { PlayerContext } from "../context/PlayerContext";

export default function Player() {
  // Connect to the global state
  const { currentSong, isPlaying } = useContext(PlayerContext);
  const audioRef = useRef(null);

  // Auto-play when a new song is sent to the context
  useEffect(() => {
    if (isPlaying && audioRef.current) {
      audioRef.current.play();
    }
  }, [currentSong, isPlaying]);

  // If no song is selected yet, show an empty state
  if (!currentSong) {
    return (
      <div className="player-bar empty">
        <p>Select a track to start listening...</p>
      </div>
    );
  }

  // If a song IS selected, show the UI
  return (
    <div className="player-bar active">
      <div className="now-playing">
        {currentSong.coverArt && (
          <img
            src={currentSong.coverArt}
            alt="cover"
            className="player-cover"
          />
        )}
        <div className="player-info">
          <span className="player-title">{currentSong.title}</span>
          <span className="player-artist">{currentSong.artist}</span>
        </div>
      </div>

      <div className="player-controls">
        <audio
          ref={audioRef}
          controls
          src={currentSong.audioPreview}
          className="global-audio"
        ></audio>
      </div>

      <div className="player-spacer"></div>
    </div>
  );
}
