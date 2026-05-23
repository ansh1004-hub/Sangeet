import { useState, useEffect, useContext } from "react";
import { PlayerContext } from "../context/PlayerContext";
import { AuthContext } from "../context/AuthContext";
import { supabase } from "../supabaseClient";
import { Trash2 } from "lucide-react";

export default function Library() {
  const [savedSongs, setSavedSongs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const { playSong, currentSong } = useContext(PlayerContext);
  const { user } = useContext(AuthContext);

  // Fetch songs as soon as the component loads
  useEffect(() => {
    fetchLibrary();
  }, [user]);

  const fetchLibrary = async () => {
    if (!user) return;

    try {
      // Query Supabase for this specific user's songs, newest first
      const { data, error } = await supabase
        .from("saved_songs")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSavedSongs(data);
    } catch (error) {
      console.error("Error fetching library:", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const removeSong = async (dbId, e) => {
    e.stopPropagation(); // Stop the song from playing when clicking delete

    try {
      const { error } = await supabase
        .from("saved_songs")
        .delete()
        .eq("id", dbId);

      if (error) throw error;

      // Update the UI instantly by filtering out the deleted song
      setSavedSongs(savedSongs.filter((song) => song.id !== dbId));
    } catch (error) {
      console.error("Error deleting song:", error.message);
    }
  };

  return (
    <div className="page-content">
      <h2>Your Library</h2>

      {isLoading ? (
        <p className="loading-text">Loading your saved tracks...</p>
      ) : savedSongs.length === 0 ? (
        <div
          className="empty-state"
          style={{ color: "#a3a3a3", marginTop: "40px" }}
        >
          <p>Your library is looking a little empty.</p>
          <p>Go to the Search tab to find and save some music!</p>
        </div>
      ) : (
        <div className="search-results-list">
          {savedSongs.map((song) => {
            // Check if it's playing using the audio preview URL
            const isCurrentlyPlaying =
              currentSong?.audioPreview === song.audio_preview;

            // Format the database row back into a song object the player understands
            const playableSong = {
              title: song.title,
              artist: song.artist,
              coverArt: song.cover_art,
              audioPreview: song.audio_preview,
            };

            return (
              <div
                key={song.id}
                className={`track-row ${isCurrentlyPlaying ? "active-track" : ""}`}
                onClick={() => playSong(playableSong)}
              >
                <img
                  src={song.cover_art}
                  alt={song.title}
                  className="track-row-image"
                />
                <div className="track-row-info">
                  <span className="track-row-title">{song.title}</span>
                  <span className="track-row-artist">{song.artist}</span>
                </div>

                <button
                  onClick={(e) => removeSong(song.id, e)}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#ef4444",
                    cursor: "pointer",
                    padding: "10px",
                    opacity: 0.7,
                  }}
                  title="Remove from Library"
                >
                  <Trash2 size={20} />
                </button>

                <div
                  className="track-row-action"
                  style={{ width: "80px", textAlign: "right" }}
                >
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
