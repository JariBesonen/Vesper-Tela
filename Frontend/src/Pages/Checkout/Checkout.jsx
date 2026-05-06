import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import "./Checkout.css";
import { AuthContext } from "../../contexts/AuthContext.jsx";
import { clearGuestCart, getGuestCartItems } from "../../utils/guestCart.js";

function Checkout() {
  const navigate = useNavigate();
  const { isLoggedIn, loading: authLoading } = useContext(AuthContext);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (authLoading) return;

    if (isLoggedIn) {
      async function fetchCart() {
        try {
          const response = await fetch("http://localhost:3000/api/cart", {
            credentials: "include",
          });
          if (!response.ok) {
            throw new Error("Failed to load cart");
          }
          const data = await response.json();
          setCartItems(data || []);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      }

      fetchCart();
      return;
    }

    setCartItems(getGuestCartItems());
    setLoading(false);
  }, [authLoading, isLoggedIn]);

  const handlePayment = async () => {
    setProcessing(true);
    setError(null);

    try {
      if (isLoggedIn) {
        const response = await fetch(
          "http://localhost:3000/api/orders/checkout",
          {
            method: "POST",
            credentials: "include",
          },
        );
        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.error || "Checkout failed");
        }
      } else {
        clearGuestCart();
      }

      alert("Thank you for your purchase!");
      navigate("/");
    } catch (err) {
      setError(err.message || "Payment failed. Please try again.");
      setProcessing(false);
    }
  };

  const formatPrice = (price) => {
    if (price === undefined || price === null || price === "") return "";
    const numberPrice = Number(price);
    if (Number.isNaN(numberPrice)) return price;
    return `$${numberPrice.toFixed(2)}`;
  };

  const totalPrice = cartItems.reduce(
    (sum, item) => sum + Number(item.price || 0) * (item.quantity || 1),
    0,
  );

  if (loading) {
    return <div className="checkout-page">Loading checkout...</div>;
  }

  if (error) {
    return <div className="checkout-page">Error: {error}</div>;
  }

  if (cartItems.length === 0) {
    return (
      <div className="checkout-page">
        <div className="checkout-container">
          <h2>Your cart is empty</h2>
          <button
            className="back-to-cart-btn"
            onClick={() => navigate("/cart")}
          >
            Back to Cart
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <h2>Order Summary</h2>
        {!isLoggedIn && (
          <p className="guest-checkout-note">
            You are checking out as guest. This order will not appear in order
            history.
          </p>
        )}

        <div className="checkout-items">
          {cartItems.map((item) => (
            <div
              className="checkout-item"
              key={`${item.id}-${item.size || "Unspecified"}`}
            >
              <div className="item-details">
                <span className="item-name">{item.name}</span>
                <span className="item-size">
                  Size: {item.size || "Unspecified"}
                </span>
                <span className="item-qty">Qty: {item.quantity}</span>
              </div>
              <span className="item-total">
                {formatPrice(Number(item.price || 0) * (item.quantity || 1))}
              </span>
            </div>
          ))}
        </div>

        <div className="checkout-summary">
          <div className="summary-row">
            <span>Subtotal:</span>
            <span>{formatPrice(totalPrice)}</span>
          </div>
          <div className="summary-row">
            <span>Shipping:</span>
            <span>FREE</span>
          </div>
          <div className="summary-row total">
            <span>Total:</span>
            <span>{formatPrice(totalPrice)}</span>
          </div>
        </div>

        <div className="checkout-actions">
          <button
            className="pay-now-btn"
            onClick={handlePayment}
            disabled={processing}
          >
            {processing ? "Processing..." : "Pay Now"}
          </button>
          <button
            className="back-to-cart-btn"
            onClick={() => navigate("/cart")}
            disabled={processing}
          >
            Back to Cart
          </button>
        </div>
      </div>
    </div>
  );
}

export default Checkout;
