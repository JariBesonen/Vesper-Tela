import "./Logout.css";

function Logout({ onLogout }) {
  const handleLogout = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        if (onLogout) onLogout();
        window.location.href = "/login";
      } else {
        alert("Logout failed");
      }
    } catch (err) {
      alert("Logout failed");
      console.error("Logout error:", err);
    }
  };

  return (
    <button className="logout-btn" onClick={handleLogout}>
      LOGOUT
    </button>
  );
}

export default Logout;
