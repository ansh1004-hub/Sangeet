import { useState, useEffect, useContext } from "react";
import { PlayerContext } from "../context/PlayerContext";
import { Search as SearchIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AlbumCard from "../components/AlbumCard"; // 1. Added import

export default function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [discovery, setDiscovery] = useState({ albums: [] });
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

  return (
    <div
      className="page-content"
      style={{ padding: "40px", color: "white", maxWidth: "1000px" }}
    >
      {/* Search Input */}
      <div style={{ marginBottom: "40px" }}>
        <input
          type="text"
          placeholder="Search for Indian hits, albums, or artists..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{
            width: "100%",
            padding: "15px 25px",
            borderRadius: "30px",
            background: "#18181b",
            border: "1px solid #3f3f46",
            color: "white",
            outline: "none",
          }}
        />
      </div>

      {/* Discovery View (Only when search is empty) */}
      {!query && (
        <>
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
              onClick={() => playSong(song)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "15px",
                padding: "10px",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              <img
                src={song.coverArt}
                style={{ width: "50px", height: "50px", borderRadius: "4px" }}
                alt={song.title}
              />
              <div>
                <p style={{ margin: 0 }}>{song.title}</p>
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
