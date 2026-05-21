import "./Navbar.css";
import Logout from "../Logout/Logout.jsx";
import { useContext } from "react";
import { AuthContext } from "../../contexts/AuthContext.jsx";
function Navbar() {
  const { isLoggedIn, setIsLoggedIn, cartCount } = useContext(AuthContext);

  function handleLogin(e) {
    e.preventDefault();
    window.location.href = "/login";
  }

  function handleOpenSearch() {
    window.dispatchEvent(new CustomEvent("vesper-search-open"));
  }

  return (
    <nav>
      <ul className="ul-left">
        <li>
          <a href="/" className="nav-link">
            Home
          </a>
        </li>
        <li>
          <a href="/men" className="nav-link">
            Men
          </a>
        </li>
        <li>
          <a href="/women" className="nav-link">
            Women
          </a>
        </li>
      </ul>
      <h1>
        <a href="/" className="logo">
          Vesper Tela
        </a>
      </h1>
      <ul className="ul-right">
        <li>
          <button
            type="button"
            className="search-btn"
            onClick={handleOpenSearch}
            aria-label="Open search"
          >
            <svg
              className="search-icon"
              viewBox="0 0 24 24"
              aria-hidden="true"
              focusable="false"
            >
              <circle cx="11" cy="11" r="6.5" />
              <line x1="16" y1="16" x2="21" y2="21" />
            </svg>
          </button>
        </li>
        <li>
          <a href="/cart" className="nav-link">
            Cart
            {cartCount > 0 && (
              <span className="cart-count-badge">{cartCount}</span>
            )}
          </a>
        </li>
        <li>
          <a href={isLoggedIn ? "/saved" : "/login"} className="nav-link">
            Saved
          </a>
        </li>
        <li>
          <a href={isLoggedIn ? "/orders" : "/login"} className="nav-link">
            Orders
          </a>
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
