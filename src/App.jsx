import { useState, useEffect } from "react";
import { generatePlaylist } from "./aiService";
import { fetchTrackDetails } from "./musicService";
import "./App.css";

function App() {
  const [mood, setMood] = useState("");
  const [playlist, setPlaylist] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [activeTab, setActiveTab] = useState("studio");
  const [savedMixes, setSavedMixes] = useState([]);

  useEffect(() => {
    const savedData = localStorage.getItem("sangeet_library");
    if (savedData) {
      setSavedMixes(JSON.parse(savedData));
    }
  }, []);

  const handleSearch = async () => {
    if (!mood) return;
    setIsLoading(true);

    const baseSongs = await generatePlaylist(mood);
    const enrichedPlaylist = await Promise.all(
      baseSongs.map(async (song) => {
        const details = await fetchTrackDetails(song.title, song.artist);
        return { ...song, ...details };
      }),
    );

    setPlaylist(enrichedPlaylist);
    setIsLoading(false);
  };

  const saveMix = () => {
    const newMix = {
      id: Date.now(),
      mood: mood,
      songs: playlist,
    };
    const updatedLibrary = [newMix, ...savedMixes];

    setSavedMixes(updatedLibrary);
    localStorage.setItem("sangeet_library", JSON.stringify(updatedLibrary));

    alert("Mix saved to your library!");
  };

  const deleteMix = (id) => {
    const updatedLibrary = savedMixes.filter((mix) => mix.id !== id);
    setSavedMixes(updatedLibrary);
    localStorage.setItem("sangeet_library", JSON.stringify(updatedLibrary));
  };

  return (
    <div className="container">
      <h1>Sangeet: AI DJ 🎧</h1>

      <div className="tabs">
        <button
          className={activeTab === "studio" ? "tab-btn active" : "tab-btn"}
          onClick={() => setActiveTab("studio")}
        >
          Studio
        </button>
        <button
          className={activeTab === "library" ? "tab-btn active" : "tab-btn"}
          onClick={() => setActiveTab("library")}
        >
          My Library ({savedMixes.length})
        </button>
      </div>

      {activeTab === "studio" ? (
        <div className="tab-content">
          <p>Tell me what you are doing, and I'll drop the perfect tracks.</p>

          <div className="search-box">
            <input
              type="text"
              placeholder="e.g., studying for finals..."
              value={mood}
              onChange={(e) => setMood(e.target.value)}
            />
            <button
              onClick={handleSearch}
              disabled={isLoading}
              className="primary-btn"
            >
              {isLoading ? "Mixing..." : "Get Playlist"}
            </button>
          </div>

          {playlist.length > 0 && (
            <button onClick={saveMix} className="save-btn">
              ❤️ Save This Mix
            </button>
          )}

          <div className="playlist">
            {playlist.map((song, index) => (
              <div key={index} className="song-card">
                {song.coverArt ? (
                  <img src={song.coverArt} alt="Cover" className="album-art" />
                ) : (
                  <div className="album-placeholder">🎵</div>
                )}

                <div className="song-info">
                  <span className="song-title">{song.title}</span>
                  <span className="song-artist">by {song.artist}</span>
                  {song.audioPreview && (
                    <audio
                      controls
                      src={song.audioPreview}
                      className="audio-player"
                    ></audio>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="tab-content">
          {savedMixes.length === 0 ? (
            <p className="empty-state">
              Your library is empty. Go to the Studio to mix some tracks!
            </p>
          ) : (
            <div className="saved-mixes-list">
              {savedMixes.map((mix) => (
                <div key={mix.id} className="saved-mix-container">
                  <div className="mix-header">
                    <h2>Mix: "{mix.mood}"</h2>
                    <button
                      onClick={() => deleteMix(mix.id)}
                      className="delete-btn"
                    >
                      Delete
                    </button>
                  </div>

                  <div className="playlist">
                    {mix.songs.map((song, index) => (
                      <div key={index} className="song-card">
                        {song.coverArt ? (
                          <img
                            src={song.coverArt}
                            alt="Cover"
                            className="album-art"
                          />
                        ) : (
                          <div className="album-placeholder">🎵</div>
                        )}
                        <div className="song-info">
                          <span className="song-title">{song.title}</span>
                          <span className="song-artist">by {song.artist}</span>
                          {song.audioPreview && (
                            <audio
                              controls
                              src={song.audioPreview}
                              className="audio-player"
                            ></audio>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
