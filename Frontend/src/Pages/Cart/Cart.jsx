import { useState, useEffect } from "react";
import "./Cart.css";

function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchCart() {
      try {
        const response = await fetch("http://localhost:3000/api/cart", {
          credentials: "include",
        });
        if (!response.ok) {
          if (response.status === 401) {
            throw new Error("Please log in to view your cart.");
          }
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
  }, []);

  const handleRemoveFromCart = async (productId) => {
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
            <div className="cart-item" key={product.id}>
              <div className="item-img">IMG</div>
              <span className="item-name">{product.name}</span>
              <span className="item-price">
                {formatPrice(product.price)} x {product.quantity}
              </span>
              <button
                className="remove-from-cart-btn"
                type="button"
                onClick={() => handleRemoveFromCart(product.id)}
              >
                REMOVE FROM CART
              </button>
            </div>
          ))
        )}

        {cartItems.length > 0 && (
          <div className="proceed-to-checkout-wrapper">
            <span>Total: {formatPrice(totalPrice)}</span>
            <button className="proceed-to-checkout-btn" type="button">
              PROCEED TO CHECKOUT
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Cart;
