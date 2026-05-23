import { useNavigate } from "react-router-dom";

export default function AlbumCard({ id, image, title, artist }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/album/${id}`)}
      style={{
        background: "rgba(255, 255, 255, 0.05)",
        padding: "16px",
        borderRadius: "8px",
        cursor: "pointer",
        transition: "background 0.3s ease",
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)")
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)")
      }
    >
      <img
        src={image}
        alt={title}
        style={{ width: "100%", borderRadius: "4px", marginBottom: "12px" }}
      />
      <h3 style={{ fontSize: "1rem", color: "white", marginBottom: "4px" }}>
        {title}
      </h3>
      <p style={{ fontSize: "0.85rem", color: "#a3a3a3" }}>{artist}</p>
    </div>
  );
}
