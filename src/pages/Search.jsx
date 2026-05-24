import { useState, useEffect, useContext } from "react";
import { PlayerContext } from "../context/PlayerContext";
import { Search as SearchIcon, X } from "lucide-react"; // Imported X for clearing history
import { useNavigate } from "react-router-dom";
import AlbumCard from "../components/AlbumCard";

export default function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [discovery, setDiscovery] = useState({ albums: [] });

  // 1. Initialize Search History from Local Storage
  const [searchHistory, setSearchHistory] = useState(() => {
    const saved = localStorage.getItem("sangeet_search_history");
    return saved ? JSON.parse(saved) : [];
  });

  const { playSong } = useContext(PlayerContext);
  const navigate = useNavigate();

  // Load initial discovery data
  useEffect(() => {
    const fetchDiscovery = async () => {
      try {
        const res = await fetch(
          `https://itunes.apple.com/search?term=bollywood+hits&entity=album&limit=6`,
        );
        const data = await res.json();
        setDiscovery({ albums: data.results });
      } catch (err) {
        console.error("Discovery failed", err);
      }
    };
    fetchDiscovery();
  }, []);

  // Live Debounced Search
  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      const res = await fetch(
        `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=8`,
      );
      const data = await res.json();
      setResults(
        data.results.map((t) => ({
          id: t.trackId,
          title: t.trackName,
          artist: t.artistName,
          coverArt: t.artworkUrl100.replace("100x100bb", "300x300bb"),
          audioPreview: t.previewUrl,
        })),
      );
    }, 500);
    return () => clearTimeout(timer);
  }, [query]);

  // 2. Function to Save Search Term
  const saveSearchToHistory = (term) => {
    if (!term.trim()) return;

    setSearchHistory((prev) => {
      // Remove duplicate if it exists, then add to front
      const filtered = prev.filter(
        (item) => item.toLowerCase() !== term.toLowerCase(),
      );
      const updated = [term, ...filtered].slice(0, 5); // Keep max 5 recent searches
      localStorage.setItem("sangeet_search_history", JSON.stringify(updated));
      return updated;
    });
  };

  // 3. Save on Enter Key
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      saveSearchToHistory(query);
    }
  };

  // 4. Clear History Function
  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem("sangeet_search_history");
  };

  return (
    <div
      className="page-content"
      style={{ padding: "40px", color: "white", maxWidth: "1000px" }}
    >
      {/* Search Input */}
      <div style={{ marginBottom: "30px" }}>
        <input
          type="text"
          placeholder="Search for Indian hits, albums, or artists..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown} // Trigger save on Enter
          style={{
            width: "100%",
            padding: "15px 25px",
            borderRadius: "30px",
            background: "#18181b",
            border: "1px solid #3f3f46",
            color: "white",
            outline: "none",
            fontSize: "1rem",
          }}
        />
      </div>

      {/* Discovery & History View (Only when search is empty) */}
      {!query && (
        <>
          {/* Recent Searches Section */}
          {searchHistory.length > 0 && (
            <div style={{ marginBottom: "40px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "15px",
                }}
              >
                <h3 style={{ margin: 0, color: "#e4e4e7" }}>Recent Searches</h3>
                <button
                  onClick={clearHistory}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#a3a3a3",
                    cursor: "pointer",
                    fontSize: "0.9rem",
                  }}
                >
                  Clear All
                </button>
              </div>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                {searchHistory.map((term, index) => (
                  <button
                    key={index}
                    onClick={() => setQuery(term)} // Clicking a pill runs the search again
                    style={{
                      padding: "8px 16px",
                      borderRadius: "20px",
                      background: "#27272a",
                      color: "white",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "0.9rem",
                      transition: "background 0.2s",
                    }}
                    onMouseEnter={(e) =>
                      (e.target.style.background = "#3f3f46")
                    }
                    onMouseLeave={(e) =>
                      (e.target.style.background = "#27272a")
                    }
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Top Albums */}
          <h2 style={{ marginBottom: "20px" }}>Top Indian Albums</h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
              gap: "20px",
            }}
          >
            {discovery.albums.map((album) => (
              <AlbumCard
                key={album.collectionId}
                id={album.collectionId}
                image={album.artworkUrl100.replace("100x100bb", "300x300bb")}
                title={album.collectionName}
                artist={album.artistName}
              />
            ))}
          </div>
        </>
      )}

      {/* Live Search Results */}
      {query && (
        <div className="search-results-list">
          {results.map((song) => (
            <div
              key={song.id}
              className="track-row"
              onClick={() => {
                saveSearchToHistory(query); // Save to history when they actually select a song
                playSong(song);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "15px",
                padding: "10px",
                borderRadius: "8px",
                cursor: "pointer",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#27272a")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              <img
                src={song.coverArt}
                style={{ width: "50px", height: "50px", borderRadius: "4px" }}
                alt={song.title}
              />
              <div>
                <p style={{ margin: 0, fontWeight: "500" }}>{song.title}</p>
                <p style={{ margin: 0, fontSize: "0.85rem", color: "#a3a3a3" }}>
                  {song.artist}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
