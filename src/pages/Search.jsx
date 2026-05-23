import { useState, useContext } from "react";
import { PlayerContext } from "../context/PlayerContext";
import { AuthContext } from "../context/AuthContext";
import { supabase } from "../supabaseClient";
import { Search as SearchIcon, Plus } from "lucide-react";

export default function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [notification, setNotification] = useState(""); // To show success messages

  const { playSong, currentSong } = useContext(PlayerContext);
  const { user } = useContext(AuthContext); // Get the logged-in user's ID

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query) return;

    setIsSearching(true);
    try {
      const res = await fetch(
        `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=12`,
      );
      const data = await res.json();

      const formattedResults = data.results.map((track) => ({
        id: track.trackId,
        title: track.trackName,
        artist: track.artistName,
        coverArt: track.artworkUrl100.replace("100x100bb", "300x300bb"),
        audioPreview: track.previewUrl,
      }));

      setResults(formattedResults);
    } catch (error) {
      console.error("Search failed", error);
    } finally {
      setIsSearching(false);
    }
  };

  // NEW: The database save function
  const saveToLibrary = async (song, e) => {
    e.stopPropagation(); // Prevents the song from playing when you click the save button

    try {
      const { error } = await supabase.from("saved_songs").insert([
        {
          user_id: user.id, // Tie the song to THIS specific user
          track_id: song.id.toString(),
          title: song.title,
          artist: song.artist,
          cover_art: song.coverArt,
          audio_preview: song.audioPreview,
        },
      ]);

      if (error) throw error;

      // Show a quick success message
      setNotification(`Added "${song.title}" to Library!`);
      setTimeout(() => setNotification(""), 3000);
    } catch (error) {
      console.error("Error saving song:", error.message);
      setNotification("Error saving song!");
      setTimeout(() => setNotification(""), 3000);
    }
  };

  return (
    <div className="page-content">
      <div className="search-header">
        <form onSubmit={handleSearch} className="manual-search-box">
          <SearchIcon size={20} className="search-icon" />
          <input
            type="text"
            placeholder="What do you want to listen to?"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
        </form>
      </div>

      {/* Pop-up Notification */}
      {notification && (
        <div
          style={{
            background: "#10b981",
            color: "white",
            padding: "10px 20px",
            borderRadius: "8px",
            marginBottom: "20px",
            display: "inline-block",
          }}
        >
          {notification}
        </div>
      )}

      {isSearching ? (
        <p className="loading-text">Searching the database...</p>
      ) : (
        <div className="search-results-list">
          {results.map((song) => {
            const isCurrentlyPlaying =
              currentSong?.audioPreview === song.audioPreview;

            return (
              <div
                key={song.id}
                className={`track-row ${isCurrentlyPlaying ? "active-track" : ""}`}
                onClick={() => playSong(song)}
              >
                <img
                  src={song.coverArt}
                  alt={song.title}
                  className="track-row-image"
                />
                <div className="track-row-info">
                  <span className="track-row-title">{song.title}</span>
                  <span className="track-row-artist">{song.artist}</span>
                </div>

                {/* NEW: Save Button */}
                <button
                  className="save-btn"
                  onClick={(e) => saveToLibrary(song, e)}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#a3a3a3",
                    cursor: "pointer",
                    padding: "10px",
                  }}
                  title="Save to Library"
                >
                  <Plus size={24} />
                </button>

                <div className="track-row-action">
                  {isCurrentlyPlaying ? "🎧 Playing" : "▶ Play"}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
