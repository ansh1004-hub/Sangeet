import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";
import Sidebar from "./components/Sidebar";
import Player from "./components/Player";
import Home from "./pages/Home";
import Search from "./pages/Search";
import Library from "./pages/Library";
import Auth from "./pages/Auth";
import "./App.css";
import TrackDetails from "./pages/TrackDetails";
import Profile from "./pages/Profile";
import AlbumDetails from "./pages/AlbumDetails";

// The "Bouncer" Component: Checks if a user is logged in
function ProtectedRoute({ children }) {
  const { user } = useContext(AuthContext);

  if (!user) {
    // If no user is found, instantly redirect them to the Auth page
    return <Navigate to="/auth" replace />;
  }

  // If they are logged in, let them see the page they requested
  return children;
}

function App() {
  const { user } = useContext(AuthContext);

  return (
    <BrowserRouter>
      <div className="app-layout">
        {/* Only show the sidebar if the user is logged in */}
        {user && <Sidebar />}

        <main className="main-content">
          <Routes>
            {/* Public Route */}
            <Route path="/auth" element={<Auth />} />

            {/* Protected Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />
            <Route
              path="/search"
              element={
                <ProtectedRoute>
                  <Search />
                </ProtectedRoute>
              }
            />
            <Route
              path="/library"
              element={
                <ProtectedRoute>
                  <Library />
                </ProtectedRoute>
              }
            />
            <Route
              path="/track/:artistName/:songTitle"
              element={
                <ProtectedRoute>
                  <TrackDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/album/:collectionId"
              element={
                <ProtectedRoute>
                  <AlbumDetails />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>

        {/* Only show the player if the user is logged in */}
        {user && <Player />}
      </div>
    </BrowserRouter>
  );
}

export default App;
