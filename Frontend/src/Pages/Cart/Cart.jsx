import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import "./Cart.css";
import { AuthContext } from "../../contexts/AuthContext.jsx";
import {
  getGuestCartItems,
  removeGuestCartItem,
} from "../../utils/guestCart.js";

function Cart() {
  const navigate = useNavigate();
  const { isLoggedIn, loading: authLoading } = useContext(AuthContext);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!isLoggedIn) {
      setCartItems(getGuestCartItems());
      setLoading(false);
      return;
    }

    async function fetchCart() {
      try {
        const response = await fetch("http://localhost:3000/api/cart", {
          credentials: "include",
        });
        if (!response.ok) {
          throw new Error(`Failed to load cart: ${response.status}`);
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
  }, [authLoading, isLoggedIn]);

  const handleRemoveFromCart = async (productId) => {
    if (!isLoggedIn) {
      setCartItems(removeGuestCartItem(productId));
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:3000/api/cart/${productId}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );
      if (!response.ok) {
        throw new Error("Failed to remove item from cart.");
      }
      setCartItems((prev) => prev.filter((item) => item.id !== productId));
    } catch (err) {
      setError(err.message);
    }
  };

  const formatPrice = (price) => {
    if (price === undefined || price === null || price === "") return "";
    const numberPrice = Number(price);
    if (Number.isNaN(numberPrice)) return price;
    return `$${numberPrice.toFixed(2)}`;
  };

  const getProductImageSrc = (product) => {
    const rawImage = String(product?.image || "").trim();
    if (rawImage) {
      if (
        /^(https?:)?\/\//i.test(rawImage) ||
        rawImage.startsWith("/") ||
        rawImage.startsWith("data:") ||
        rawImage.startsWith("blob:")
      ) {
        return rawImage;
      }
      return `/${rawImage.replace(/^\/+/, "")}`;
    }

    const normalizedGender = String(product?.gender || "").toLowerCase();
    const genderPrefix =
      normalizedGender === "women" || normalizedGender === "female"
        ? "women"
        : "men";
    const normalizedCategory = String(product?.category || "").toLowerCase();
    const category = ["shirts", "pants", "shoes"].includes(normalizedCategory)
      ? normalizedCategory
      : "shirts";

    return `/images/products/${genderPrefix}-${category}.svg`;
  };

  const totalPrice = cartItems.reduce(
    (sum, item) => sum + Number(item.price || 0) * (item.quantity || 1),
    0,
  );

  if (loading) {
    return <div className="cart-page">Loading cart...</div>;
  }

  if (error) {
    return <div className="cart-page">Error loading cart: {error}</div>;
  }

  return (
    <div className="cart-page">
      <div className="cart-wrapper">
        {cartItems.length === 0 ? (
          <div className="empty-cart">Your cart is empty.</div>
        ) : (
          cartItems.map((product) => (
            <div
              className="cart-item"
              key={product.id}
              role="button"
              tabIndex={0}
              onClick={() => navigate(`/product/${product.id}`)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  navigate(`/product/${product.id}`);
                }
              }}
            >
              <img
                className="cart-item-img"
                src={getProductImageSrc(product)}
                alt={product.name}
                loading="lazy"
              />
              <div className="cart-item-content">
                <div className="cart-item-header-row">
                  <h3 className="cart-item-name">{product.name}</h3>
                  <span className="cart-item-line-total">
                    {formatPrice(
                      Number(product.price || 0) *
                        Number(product.quantity || 1),
                    )}
                  </span>
                </div>
                <div className="cart-item-meta-row">
                  <span className="cart-item-unit-price">
                    {formatPrice(product.price)} each
                  </span>
                  <span className="cart-item-qty">Qty: {product.quantity}</span>
                </div>
                <p className="cart-item-hint">
                  Click card to view product details
                </p>
                <div className="cart-item-buttons">
                  <button
                    className="remove-from-cart-btn"
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleRemoveFromCart(product.id);
                    }}
                  >
                    REMOVE
                  </button>
                </div>
              </div>
            </div>
          ))
        )}

        {cartItems.length > 0 && (
          <div className="proceed-to-checkout-wrapper">
            <span className="cart-total-label">Total</span>
            <span className="cart-total-value">{formatPrice(totalPrice)}</span>
            <button
              className="proceed-to-checkout-btn"
              type="button"
              onClick={() => navigate("/checkout")}
            >
              PROCEED TO CHECKOUT
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Cart;
