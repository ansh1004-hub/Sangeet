import { useState, useEffect, useContext } from "react";
import { PlayerContext } from "../context/PlayerContext";
import { useParams } from "react-router-dom";

export default function TrackDetails() {
  const { artistName, songTitle } = useParams();
  const [lyrics, setLyrics] = useState("Loading lyrics...");
  const { currentSong } = useContext(PlayerContext);

  useEffect(() => {
    const fetchLyrics = async () => {
      // Decode the URL parameters
      const artist = decodeURIComponent(artistName);
      const title = decodeURIComponent(songTitle);

      console.log(`Fetching: https://api.lyrics.ovh/v1/${artist}/${title}`);

      try {
        const res = await fetch(`https://api.lyrics.ovh/v1/${artist}/${title}`);
        const data = await res.json();

        if (data.lyrics) {
          setLyrics(data.lyrics);
        } else {
          setLyrics("Lyrics not found for this song.");
        }
      } catch (err) {
        console.error("Lyrics fetch error:", err);
        setLyrics("Could not connect to lyrics server.");
      }
    };

    if (artistName && songTitle) fetchLyrics();
  }, [artistName, songTitle]);

  return (
    <div className="page-content" style={{ padding: "40px", color: "white" }}>
      <div style={{ display: "flex", gap: "30px", alignItems: "flex-end" }}>
        <img
          src={currentSong?.coverArt}
          style={{ width: "250px", borderRadius: "8px" }}
        />
        <div>
          <h1 style={{ fontSize: "3rem" }}>{decodeURIComponent(songTitle)}</h1>
          <p style={{ fontSize: "1.2rem", color: "#a3a3a3" }}>
            {decodeURIComponent(artistName)}
          </p>
        </div>
      </div>

      <div
        style={{
          marginTop: "50px",
          whiteSpace: "pre-line",
          fontSize: "1.1rem",
          lineHeight: "1.6",
          color: "#e5e5e5",
        }}
      >
        <h3 style={{ borderBottom: "1px solid #333", paddingBottom: "10px" }}>
          Lyrics
        </h3>
        <p>{lyrics}</p>
      </div>
    </div>
  );
}
