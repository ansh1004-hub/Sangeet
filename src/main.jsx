import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { PlayerProvider } from "./context/PlayerContext.jsx";
import { AuthProvider } from "./context/AuthContext.jsx"; // <--- NEW IMPORT
import "./App.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      {" "}
      {/* <--- WRAP THE APP FIRST */}
      <PlayerProvider>
        <App />
      </PlayerProvider>
    </AuthProvider>
  </React.StrictMode>,
);
