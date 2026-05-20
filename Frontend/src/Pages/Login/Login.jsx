import { useState } from "react";
import { Link } from "react-router-dom";
import { BsEye, BsEyeSlash } from "react-icons/bs";
import { mergeGuestCartIntoServerCart } from "../../utils/guestCart.js";
import "./Login.css";

function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "info") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 1000);
  };

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
          showToast(data.error || "Login failed", "error");
          return;
        }

        const { mergedCount, failedCount } =
          await mergeGuestCartIntoServerCart();

        if (mergedCount > 0 && failedCount === 0) {
          showToast(
            `Login successful. ${mergedCount} guest item(s) were moved to your cart.`,
            "success",
          );
        } else if (mergedCount > 0 && failedCount > 0) {
          showToast(
            `Login successful. ${mergedCount} guest item(s) were moved to your cart. ${failedCount} item(s) could not be moved and remain local.`,
            "success",
          );
        } else {
          showToast("Login successful", "success");
        }

        setTimeout(() => {
          window.location.href = "/";
        }, 1000);
      } catch (err) {
        console.error("Login error:", err);
        showToast("Login failed", "error");
      }
    })();
  };

  return (
    <div className="login-page">
      {toast && (
        <div
          className={`auth-toast ${toast.type}`}
          role="status"
          aria-live="polite"
        >
          {toast.message}
        </div>
      )}
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Login</h2>

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <div className="password-field">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
          >
            {showPassword ? (
              <BsEyeSlash aria-hidden="true" />
            ) : (
              <BsEye aria-hidden="true" />
            )}
          </button>
        </div>

        <button type="submit" className="auth-submit">
          Login
        </button>

        <p className="login-register-link">
          Don&apos;t have an account? <Link to="/register">Create one</Link>
        </p>
      </form>
    </div>
  );
}

export default Login;
