import { useEffect, useState } from "react";
import { Link, Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { AdminPanel } from "../components/AdminPanel";
import styles from "./App.module.scss";
import "../global.scss";
import Scoreboard from "../components/Scoreboard/Scoreboard";
import { SignalRContext } from "../providers/SignalRProvider";


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
        <div className={styles.navigationContainer}>
          <div className={styles.navigationBar}>
            <nav className={styles.navigation}>
              <Link to="/scoreboard" className={styles.navLink}>
                Scoreboard
              </Link>
              <Link to="/adminpanel" className={`${styles.navLink} ${styles.admin}`}>
                AdminPanel
              </Link>
            </nav>
          </div>
        </div>
      )}
      <div className={styles.themeContainer}>
        <div className={styles.themeButtonContainer}>
          <button onClick={toggleTheme} className={styles.themeButton}>
            {theme === "dark" ? "🌙 Тёмная" : "☀️ Светлая"}
          </button>
        </div>
      </div>
      <SignalRContext.Provider
        value={{
          connection: null,
          automaticReconnect: true,
          withCredentials: false,
          url: "http://localhost:5035/scoreboardHub"
        }}
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
