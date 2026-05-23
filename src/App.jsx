import { useState } from "react";
import { generatePlaylist } from "./aiService";
import { fetchTrackDetails } from "./musicService";
import "./App.css";

function App() {
  const [mood, setMood] = useState("");
  const [playlist, setPlaylist] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    if (!mood) return;

    setIsLoading(true);

    // 1. Get the text playlist from Gemini
    const baseSongs = await generatePlaylist(mood);

    // 2. Fetch the audio and images for all 5 songs at the same time
    const enrichedPlaylist = await Promise.all(
      baseSongs.map(async (song) => {
        const details = await fetchTrackDetails(song.title, song.artist);
        return { ...song, ...details }; // Merges the AI text with the iTunes audio/image
      }),
    );

    setPlaylist(enrichedPlaylist);
    setIsLoading(false);
  };

  return (
    <div className="container">
      <h1>Sangeet: AI DJ 🎧</h1>
      <p>Tell me what you are doing, and I'll drop the perfect tracks.</p>

      <div className="search-box">
        <input
          type="text"
          placeholder="e.g., epic movie soundtrack..."
          value={mood}
          onChange={(e) => setMood(e.target.value)}
        />
        <button onClick={handleSearch} disabled={isLoading}>
          {isLoading ? "Mixing tracks..." : "Get Playlist"}
        </button>
      </div>

      <div className="playlist">
        {playlist.map((song, index) => (
          <div key={index} className="song-card">
            {/* Render the Album Art if iTunes found it */}
            {song.coverArt ? (
              <img
                src={song.coverArt}
                alt="Album Cover"
                className="album-art"
              />
            ) : (
              <div className="album-placeholder">🎵</div>
            )}

            <div className="song-info">
              <span className="song-title">{song.title}</span>
              <span className="song-artist">by {song.artist}</span>

              {/* Render the native HTML5 Audio Player if iTunes found the preview */}
              {song.audioPreview && (
                <audio
                  controls
                  src={song.audioPreview}
                  className="audio-player"
                >
                  Your browser does not support the audio element.
                </audio>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
