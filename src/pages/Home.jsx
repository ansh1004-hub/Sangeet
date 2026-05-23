import { useState, useEffect, useContext } from "react";
import { PlayerContext } from "../context/PlayerContext";
import { AuthContext } from "../context/AuthContext";
import { supabase } from "../supabaseClient";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Sparkles, Plus, Play } from "lucide-react";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [aiPlaylist, setAiPlaylist] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [notification, setNotification] = useState("");

  // NEW: State for our dashboard rows
  const [trending, setTrending] = useState([]);
  const [suggestions, setSuggestions] = useState([]);

  const { playSong, currentSong } = useContext(PlayerContext);
  const { user } = useContext(AuthContext);

  // NEW: Fetch default dashboard music as soon as the page loads
  useEffect(() => {
    const fetchDashboardMusic = async () => {
      try {
        // Fetch Trending (Global Pop Hits)
        const trendRes = await fetch(
          `https://itunes.apple.com/search?term=pop+hits+2024&entity=song&limit=6`,
        );
        const trendData = await trendRes.json();

        // Fetch Suggestions (Curated Bollywood/Desi vibes based on your UI screenshot)
        const suggRes = await fetch(
          `https://itunes.apple.com/search?term=arijit+singh+pritam&entity=song&limit=6`,
        );
        const suggData = await suggRes.json();

        // Helper to format iTunes data for our app
        const formatData = (results) =>
          results.map((track) => ({
            id: track.trackId.toString(),
            title: track.trackName,
            artist: track.artistName,
            coverArt: track.artworkUrl100.replace("100x100bb", "300x300bb"),
            audioPreview: track.previewUrl,
          }));

        setTrending(formatData(trendData.results));
        setSuggestions(formatData(suggData.results));
      } catch (error) {
        console.error("Error fetching dashboard music:", error);
      }
    };

    fetchDashboardMusic();
  }, []);

  const generateMix = async (e) => {
    e.preventDefault();
    if (!prompt) return;

    setIsGenerating(true);
    setAiPlaylist([]);

    try {
      const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        generationConfig: { responseMimeType: "application/json" },
      });

      const aiPrompt = `You are a professional DJ. Create a playlist of exactly 6 real, well-known songs that perfectly match this vibe/scenario: "${prompt}". 
      Return ONLY a raw, valid JSON array of objects. Do not use markdown blocks. Each object must have a "title" key and an "artist" key.`;

      const result = await model.generateContent(aiPrompt);
      let responseText = result.response.text();

      responseText = responseText
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();
      const firstBracket = responseText.indexOf("[");
      const lastBracket = responseText.lastIndexOf("]");
      if (firstBracket !== -1 && lastBracket !== -1) {
        responseText = responseText.substring(firstBracket, lastBracket + 1);
      }

      const songList = JSON.parse(responseText);

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

  // NEW: A reusable component to render the modern Spotify-style cards
  const SongCardGrid = ({ title, songs }) => (
    <div style={{ marginTop: "40px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          marginBottom: "20px",
        }}
      >
        <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", margin: 0 }}>
          {title}
        </h2>
        <span
          style={{
            fontSize: "0.85rem",
            color: "#a3a3a3",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Show all
        </span>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
          gap: "24px",
        }}
      >
        {songs.map((song) => {
          const isPlaying = currentSong?.audioPreview === song.audioPreview;

          return (
            <div
              key={song.id}
              onClick={() => playSong(song)}
              style={{
                background: "#18181b", // Dark card background
                padding: "16px",
                borderRadius: "8px",
                cursor: "pointer",
                transition: "background 0.3s ease",
                position: "relative",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#27272a")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "#18181b")
              }
            >
              <div style={{ position: "relative", marginBottom: "16px" }}>
                <img
                  src={song.coverArt}
                  alt={song.title}
                  style={{
                    width: "100%",
                    aspectRatio: "1/1",
                    objectFit: "cover",
                    borderRadius: "4px",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
                  }}
                />
              </div>

              <h3
                style={{
                  margin: "0 0 4px 0",
                  fontSize: "1rem",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {song.title}
              </h3>
              <p
                style={{
                  margin: 0,
                  fontSize: "0.85rem",
                  color: "#a3a3a3",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {song.artist}
              </p>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: "12px",
                }}
              >
                <button
                  onClick={(e) => saveToLibrary(song, e)}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#a3a3a3",
                    cursor: "pointer",
                    padding: 0,
                  }}
                  title="Save to Library"
                >
                  <Plus size={20} />
                </button>
                {isPlaying && (
                  <span
                    style={{
                      color: "#10b981",
                      fontSize: "0.8rem",
                      fontWeight: "bold",
                    }}
                  >
                    Playing
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="page-content" style={{ paddingBottom: "100px" }}>
      {/* AI DJ Hero Section */}
      <div
        style={{
          background:
            "linear-gradient(180deg, rgba(139,92,246,0.15) 0%, rgba(0,0,0,0) 100%)",
          margin: "-24px -24px 20px -24px",
          padding: "60px 24px 40px",
          textAlign: "center",
        }}
      >
        <h1 style={{ fontSize: "3rem", marginBottom: "10px", fontWeight: 800 }}>
          Sangeet AI DJ
        </h1>
        <p
          style={{ color: "#a3a3a3", fontSize: "1.1rem", marginBottom: "30px" }}
        >
          Describe your vibe. Let AI curate the perfect mix.
        </p>

        <form
          onSubmit={generateMix}
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "10px",
            maxWidth: "600px",
            margin: "0 auto",
          }}
        >
          <input
            type="text"
            placeholder="e.g. Late night coding in a cyberpunk city..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            style={{
              padding: "14px 24px",
              borderRadius: "30px",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              background: "rgba(0, 0, 0, 0.5)",
              color: "white",
              fontSize: "16px",
              flex: 1,
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
              background: isGenerating ? "#6b7280" : "white",
              color: "black",
              fontSize: "15px",
              fontWeight: "bold",
              cursor: isGenerating ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <Sparkles size={18} />
            {isGenerating ? "Curating..." : "Generate"}
          </button>
        </form>
      </div>

      {notification && (
        <div
          style={{
            background: "#10b981",
            color: "white",
            padding: "10px 20px",
            borderRadius: "8px",
            marginBottom: "20px",
            textAlign: "center",
          }}
        >
          {notification}
        </div>
      )}

      {/* Dynamic Sections */}
      {isGenerating ? (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
          <p className="loading-text">Gemini is analyzing your vibe...</p>
        </div>
      ) : aiPlaylist.length > 0 ? (
        <SongCardGrid title={`Mix: "${prompt}"`} songs={aiPlaylist} />
      ) : null}

      {/* Spotify-Style Default Dashboard */}
      {trending.length > 0 && (
        <SongCardGrid title="Trending songs" songs={trending} />
      )}
      {suggestions.length > 0 && (
        <SongCardGrid title="Made for you" songs={suggestions} />
      )}
    </div>
  );
}
