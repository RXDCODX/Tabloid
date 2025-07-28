import { useEffect, useState } from "react";
import { Link, Route, BrowserRouter as Router, Routes } from "react-router-dom";
import AdminPanel from "./AdminPanel/AdminPanel";
import "./App.css";
import "./global.scss";
import Scoreboard from "./Scoreboard/Scoreboard";
import { SignalRContext } from "./SignalRProvider";

interface Forecast {
  date: string;
  temperatureC: number;
  temperatureF: number;
  summary: string;
}

function App() {
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "light",
  );

  useEffect(() => {
    document.body.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

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
              opacity: 0,
              transition: "opacity 0.5s",
              pointerEvents: "auto",
              display: "flex",
              alignItems: "center",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "0")}
          >
            <nav style={{ display: "flex", gap: 16 }}>
              <Link
                to="/scoreboard"
                style={{
                  marginRight: 10,
                  color: "#0dcaf0",
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                Scoreboard
              </Link>
              <Link
                to="/adminpanel"
                style={{
                  color: "#6610f2",
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                AdminPanel
              </Link>
            </nav>
          </div>
        </div>
      )}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          zIndex: 2000,
          width: 80,
          height: 50,
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "flex-end",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            width: 80,
            height: 50,
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "flex-end",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.querySelector("button")!.style.opacity = "1";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.querySelector("button")!.style.opacity = "0";
          }}
        >
          <button
            onClick={toggleTheme}
            style={{
              border: "none",
              background: "var(--table-header-bg)",
              color: "var(--main-text)",
              borderRadius: 6,
              padding: "6px 14px",
              fontWeight: 600,
              boxShadow: "0 1px 4px #0002",
              cursor: "pointer",
              opacity: 0,
              transition: "opacity 0.2s",
              pointerEvents: "auto",
              margin: 8,
            }}
          >
            {theme === "dark" ? "🌙 Тёмная" : "☀️ Светлая"}
          </button>
        </div>
      </div>
      <SignalRContext.Provider
        automaticReconnect
        withCredentials={false}
        url="http://localhost:5035/scoreboardHub"
      >
        <Routes>
          <Route path="/scoreboard" element={<Scoreboard />} />
          <Route path="/adminpanel" element={<AdminPanel />} />
          <Route path="*" element={<Scoreboard />} />
        </Routes>
      </SignalRContext.Provider>
    </Router>
  );
}

export default App;
