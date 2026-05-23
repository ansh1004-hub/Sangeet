import { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import { PlayerContext } from "../context/PlayerContext";
import { Heart } from "lucide-react";

export default function AlbumDetails() {
  const { collectionId } = useParams();
  const [album, setAlbum] = useState(null);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { playSong } = useContext(PlayerContext);

  const addToLibrary = (song) => {
    alert(`${song.trackName} added to your library!`);
  };

  useEffect(() => {
    const fetchAlbum = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://itunes.apple.com/lookup?id=${collectionId}&entity=song`,
        );
        const data = await res.json();

        if (data.results && data.results.length > 0) {
          const albumData =
            data.results.find((item) => item.wrapperType === "collection") ||
            data.results[0];
          const trackList = data.results.filter(
            (item) => item.wrapperType === "track",
          );

          setAlbum(albumData);
          setSongs(trackList);
        }
      } catch (err) {
        console.error("Failed to fetch album:", err);
      } finally {
        setLoading(false);
      }
    };
    if (collectionId) fetchAlbum();
  }, [collectionId]);

  if (loading)
    return <div style={{ padding: "40px", color: "white" }}>Loading...</div>;

  return (
    <div
      className="page-content"
      style={{ padding: "40px", color: "white", maxWidth: "1000px" }}
    >
      {album && (
        <div
          style={{
            display: "flex",
            gap: "30px",
            marginBottom: "40px",
            alignItems: "flex-end",
          }}
        >
          <img
            src={album.artworkUrl100?.replace("100x100bb", "300x300bb")}
            alt={album.collectionName}
            style={{ width: "230px", borderRadius: "8px" }}
          />
          <div>
            <h1>{album.collectionName}</h1>
            <p style={{ color: "#a3a3a3" }}>{album.artistName}</p>
          </div>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
        {songs.map((song, index) => (
          <div
            key={song.trackId}
            className="track-row"
            onClick={() =>
              playSong({
                id: song.trackId,
                title: song.trackName,
                artist: song.artistName,
                coverArt: song.artworkUrl100?.replace("100x100bb", "300x300bb"),
                audioPreview: song.previewUrl,
              })
            }
            style={{
              display: "grid",
              gridTemplateColumns: "50px 1fr 100px 50px",
              padding: "12px 20px",
              alignItems: "center",
              cursor: "pointer",
            }}
          >
            <span>{index + 1}</span>
            <div>
              <span style={{ fontWeight: "500" }}>{song.trackName}</span>
              <p style={{ margin: 0, fontSize: "0.85rem", color: "#a3a3a3" }}>
                {song.artistName}
              </p>
            </div>
            <span style={{ textAlign: "right" }}>
              {Math.floor(song.trackTimeMillis / 60000)}:
              {Math.floor((song.trackTimeMillis % 60000) / 1000)
                .toString()
                .padStart(2, "0")}
            </span>
            <Heart
              size={20}
              onClick={(e) => {
                e.stopPropagation();
                addToLibrary(song);
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
