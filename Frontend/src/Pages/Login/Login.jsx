import { useState } from "react";
import { Link } from "react-router-dom";
import { mergeGuestCartIntoServerCart } from "../../utils/guestCart.js";
import "./Login.css";

function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    (async () => {
      try {
        const res = await fetch("http://localhost:3000/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (!res.ok) {
          alert(data.error || "Login failed");
          return;
        }

        const { mergedCount, failedCount } =
          await mergeGuestCartIntoServerCart();

        if (mergedCount > 0 && failedCount === 0) {
          alert(
            `Login successful. ${mergedCount} guest item(s) were moved to your cart.`,
          );
        } else if (mergedCount > 0 && failedCount > 0) {
          alert(
            `Login successful. ${mergedCount} guest item(s) were moved to your cart. ${failedCount} item(s) could not be moved and remain local.`,
          );
        } else {
          alert("Login successful");
        }

        window.location.href = "/";
      } catch (err) {
        console.error("Login error:", err);
        alert("Login failed");
      }
    })();
  };

  return (
    <div className="register-page">
      <form className="register-form" onSubmit={handleSubmit}>
        <h2>Login</h2>

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <button type="submit">Login</button>

        <p className="login-register-link">
          Don&apos;t have an account? <Link to="/register">Create one</Link>
        </p>
      </form>
    </div>
  );
}

export default Login;
