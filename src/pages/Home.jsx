import { useState, useContext } from "react";
import { PlayerContext } from "../context/PlayerContext";
import { AuthContext } from "../context/AuthContext";
import { supabase } from "../supabaseClient";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Sparkles, Plus } from "lucide-react";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [aiPlaylist, setAiPlaylist] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [notification, setNotification] = useState("");

  const { playSong, currentSong } = useContext(PlayerContext);
  const { user } = useContext(AuthContext);

  const generateMix = async (e) => {
    e.preventDefault();
    if (!prompt) return;

    setIsGenerating(true);
    setAiPlaylist([]);

    try {
      // 1. Call Gemini AI using the stable flash model
      const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        generationConfig: { responseMimeType: "application/json" },
      });

      const aiPrompt = `You are a professional DJ. Create a playlist of exactly 6 real, well-known songs that perfectly match this vibe/scenario: "${prompt}". 
      Return ONLY a raw, valid JSON array of objects. Do not use markdown blocks. Each object must have a "title" key and an "artist" key.`;

      const result = await model.generateContent(aiPrompt);
      let responseText = result.response.text();

      // BULLETPROOF PARSING: Strip out any accidental markdown or text Gemini adds
      responseText = responseText
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      // Find the exact start and end of the JSON array
      const firstBracket = responseText.indexOf("[");
      const lastBracket = responseText.lastIndexOf("]");

      if (firstBracket !== -1 && lastBracket !== -1) {
        responseText = responseText.substring(firstBracket, lastBracket + 1);
      }

      const songList = JSON.parse(responseText);

      // 2. Fetch the actual playable audio for each song from iTunes
      const playableTracks = [];
      for (const song of songList) {
        const searchQuery = `${song.title} ${song.artist}`;
        const res = await fetch(
          `https://itunes.apple.com/search?term=${encodeURIComponent(searchQuery)}&entity=song&limit=1`,
        );
        const data = await res.json();

        if (data.results.length > 0) {
          const track = data.results[0];
          playableTracks.push({
            id: track.trackId.toString(),
            title: track.trackName,
            artist: track.artistName,
            coverArt: track.artworkUrl100.replace("100x100bb", "300x300bb"),
            audioPreview: track.previewUrl,
          });
        }
      }

      setAiPlaylist(playableTracks);
    } catch (error) {
      console.error("AI DJ Error:", error);
      setNotification("Hmm, the AI got confused. Try a different prompt!");
      setTimeout(() => setNotification(""), 3000);
    } finally {
      setIsGenerating(false);
    }
  };

  const saveToLibrary = async (song, e) => {
    e.stopPropagation();
    if (!user) return;

    try {
      const { error } = await supabase.from("saved_songs").insert([
        {
          user_id: user.id,
          track_id: song.id,
          title: song.title,
          artist: song.artist,
          cover_art: song.coverArt,
          audio_preview: song.audioPreview,
        },
      ]);

      if (error) throw error;
      setNotification(`Added "${song.title}" to Library!`);
      setTimeout(() => setNotification(""), 3000);
    } catch (error) {
      console.error("Save Error:", error.message);
    }
  };

  return (
    <div className="page-content">
      {/* Hero Section */}
      <div style={{ textAlign: "center", margin: "40px 0 60px" }}>
        <h1
          style={{
            fontSize: "3.5rem",
            marginBottom: "15px",
            background: "linear-gradient(to right, #fff, #a78bfa)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontWeight: 800,
          }}
        >
          Sangeet AI DJ
        </h1>
        <p
          style={{ color: "#a3a3a3", fontSize: "1.2rem", marginBottom: "30px" }}
        >
          Describe your vibe. Let AI curate the perfect mix.
        </p>

        <form
          onSubmit={generateMix}
          style={{ display: "flex", justifyContent: "center", gap: "10px" }}
        >
          <input
            type="text"
            placeholder="e.g. Late night coding in a cyberpunk city..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            style={{
              padding: "16px 24px",
              borderRadius: "30px",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              background: "rgba(255, 255, 255, 0.1)",
              color: "white",
              fontSize: "16px",
              width: "100%",
              maxWidth: "500px",
              outline: "none",
            }}
          />
          <button
            type="submit"
            disabled={isGenerating}
            style={{
              padding: "0 24px",
              borderRadius: "30px",
              border: "none",
              background: isGenerating ? "#6b7280" : "#8b5cf6",
              color: "white",
              fontSize: "16px",
              fontWeight: "bold",
              cursor: isGenerating ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              transition: "background 0.3s",
            }}
          >
            <Sparkles size={20} />
            {isGenerating ? "Curating..." : "Generate Mix"}
          </button>
        </form>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div
          style={{
            background: "#10b981",
            color: "white",
            padding: "10px 20px",
            borderRadius: "8px",
            marginBottom: "20px",
            display: "inline-block",
            textAlign: "center",
            width: "100%",
          }}
        >
          {notification}
        </div>
      )}

      {/* Results Section */}
      {isGenerating ? (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
          <div
            className="loading-spinner"
            style={{
              width: "40px",
              height: "40px",
              border: "4px solid rgba(167, 139, 250, 0.3)",
              borderTop: "4px solid #a78bfa",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 20px",
            }}
          />
          <p className="loading-text">
            Gemini is analyzing your vibe and searching the database...
          </p>
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
      ) : (
        <div className="search-results-list">
          {aiPlaylist.map((song) => {
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

                <button
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
