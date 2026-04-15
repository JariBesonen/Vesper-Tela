import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import "./Checkout.css";
import { AuthContext } from "../../contexts/AuthContext.jsx";

function Checkout() {
  const navigate = useNavigate();
  const { isLoggedIn } = useContext(AuthContext);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

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
  }, [isLoggedIn, navigate]);

  const handlePayment = async () => {
    setProcessing(true);
    try {
      // Clear the cart after successful "payment"
      await Promise.all(
        cartItems.map((item) =>
          fetch(`http://localhost:3000/api/cart/${item.id}`, {
            method: "DELETE",
            credentials: "include",
          }),
        ),
      );

      // Show thank you alert
      alert("Thank you for your purchase!");

      // Redirect to home
      navigate("/");
    } catch (err) {
      setError("Payment failed. Please try again.");
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

        <div className="checkout-items">
          {cartItems.map((item) => (
            <div className="checkout-item" key={item.id}>
              <div className="item-details">
                <span className="item-name">{item.name}</span>
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
