import { useState } from "react";
import { generatePlaylist } from "./aiService";
import "./App.css";

function App() {
  const [mood, setMood] = useState("");
  const [playlist, setPlaylist] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    if (!mood) return;

    setIsLoading(true);
    const songs = await generatePlaylist(mood);
    setPlaylist(songs);
    setIsLoading(false);
  };

  return (
    <div className="container">
      <h1>Sangeet: AI DJ 🎧</h1>
      <p>Tell me what you are doing, and I'll drop the perfect tracks.</p>

      <div className="search-box">
        <input
          type="text"
          placeholder="e.g., late night coding session..."
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
            <span className="song-title">{song.title}</span>
            <span className="song-artist">by {song.artist}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
