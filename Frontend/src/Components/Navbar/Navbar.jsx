import "./Navbar.css";
import Logout from "../Logout/Logout.jsx";
import { useState } from "react";
function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  function handleTemporaryFunctionality(e) {
    e.preventDefault();
    setIsLoggedIn(true);
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
            <Logout />
          </li>
        ) : (
          <li>
            <button
              onClick={handleTemporaryFunctionality}
              className="login-btn"
            >
              LOGIN
            </button>
          </li>
        )}
      </ul>
    </nav>
  );
}

export default Navbar;
