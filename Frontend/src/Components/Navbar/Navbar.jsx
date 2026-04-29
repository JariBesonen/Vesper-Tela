import "./Navbar.css";
import Logout from "../Logout/Logout.jsx";
import { useContext } from "react";
import { AuthContext } from "../../contexts/AuthContext.jsx";
function Navbar() {
  const { isLoggedIn, setIsLoggedIn } = useContext(AuthContext);

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
          <a href="/">Home</a>
        </li>
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
          <button
            type="button"
            className="search-btn"
            onClick={handleOpenSearch}
          >
            SEARCH
          </button>
        </li>
        {isLoggedIn && (
          <>
            <li>
              <a href="/cart">Cart</a>
            </li>
            <li>
              <a href="/saved">Saved</a>
            </li>
          </>
        )}
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
