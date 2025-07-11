import { Link, Route, BrowserRouter as Router, Routes } from "react-router-dom";
import AdminPanel from "./AdminPanel/AdminPanel";
import "./App.css";
import Scoreboard from "./Scoreboard/Scoreboard";

interface Forecast {
  date: string;
  temperatureC: number;
  temperatureF: number;
  summary: string;
}

function App() {
  return (
    <Router>
      {typeof window !== "undefined" && window.innerWidth >= 768 && (
        <div
          style={{
            position: "fixed",
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999,
            display: "flex",
            justifyContent: "center",
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              background: "linear-gradient(90deg, #23272f 0%, #343a40 100%)",
              borderRadius: 16,
              boxShadow: "0 4px 24px rgba(0,0,0,0.25)",
              padding: "8px 32px",
              marginBottom: 20,
              opacity: 0.1,
              transition: "opacity 0.5s",
              pointerEvents: "auto",
              display: "flex",
              alignItems: "center",
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = "1")}
            onMouseLeave={e => (e.currentTarget.style.opacity = "0")}
          >
            <nav style={{ display: "flex", gap: 16 }}>
              <Link to="/scoreboard" style={{ marginRight: 10, color: '#0dcaf0', fontWeight: 600, textDecoration: 'none' }}>
                Scoreboard
              </Link>
              <Link to="/admin" style={{ color: '#6610f2', fontWeight: 600, textDecoration: 'none' }}>
                AdminPanel
              </Link>
            </nav>
          </div>
        </div>
      )}
      <Routes>
        <Route path="/scoreboard" element={<Scoreboard />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="*" element={<Scoreboard />} />
      </Routes>
    </Router>
  );
}

export default App;
