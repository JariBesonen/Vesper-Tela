import "./Navbar.css";
import Logout from "../Logout/Logout.jsx";
import { useState, useEffect } from "react";
function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check session on mount
  useEffect(() => {
    fetch("http://localhost:3000/api/auth/session", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => setIsLoggedIn(data.loggedIn))
      .catch(() => setIsLoggedIn(false));
  }, []);

  // Handler for login (redirect to login page)
  function handleLogin(e) {
    e.preventDefault();
    window.location.href = "/login";
  }

  return (
    <nav>
      <ul className="ul-left">
        <li>
          <a href="/men">Men</a>
        </li>
        <li>
          <a href="/women">Woman</a>
        </li>
      </ul>
      <h1>
        <a href="/">Vesper Tela</a>
      </h1>
      <ul className="ul-right">
        <li>
          <a href="/cart">Cart</a>
        </li>
        <li>
          <a href="/saved">Saved</a>
        </li>
        {isLoggedIn ? (
          <li>
            <Logout onLogout={() => setIsLoggedIn(false)} />
          </li>
        ) : (
          <li>
            <button onClick={handleLogin} className="login-btn">
              LOGIN
            </button>
          </li>
        )}
      </ul>
    </nav>
  );
}

export default Navbar;
