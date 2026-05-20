import { useNavigate } from "react-router-dom";
import "./CartPreview.css";

const formatPrice = (price) => {
  const value = Number(price || 0);
  if (Number.isNaN(value)) return "$0.00";
  return `$${value.toFixed(2)}`;
};

function CartPreview({
  isOpen,
  items,
  subtotal,
  onClose,
  onRemoveItem,
  onIncrementItem,
  onDecrementItem,
}) {
  const navigate = useNavigate();

  if (!isOpen || !Array.isArray(items) || items.length === 0) {
    return null;
  }

  return (
    <>
      <div className="cart-preview-overlay" onClick={onClose} aria-hidden="true" />
      <aside className="cart-preview-drawer" role="dialog" aria-modal="true" aria-label="Cart preview">
        <button
          type="button"
          className="cart-preview-close"
          onClick={onClose}
          aria-label="Close cart preview"
        >
          x
        </button>

        <p className="cart-preview-heading">Added to cart</p>

        <div className="cart-preview-items">
          {items.map((cartItem) => (
            <div
              key={`${cartItem.id}-${cartItem.size || "Unspecified"}`}
              className="cart-preview-item"
            >
              <img
                src={cartItem.image}
                alt={cartItem.name}
                className="cart-preview-image"
              />
              <div className="cart-preview-item-meta">
                <p className="cart-preview-name">{cartItem.name}</p>
                <p className="cart-preview-price">{formatPrice(cartItem.price)}</p>
                <div className="cart-preview-qty-row">
                  <button
                    type="button"
                    className="cart-preview-qty-btn"
                    onClick={() => onDecrementItem?.(cartItem)}
                    disabled={Number(cartItem.quantity || 0) <= 1}
                    aria-label={`Decrease quantity for ${cartItem.name}`}
                  >
                    -
                  </button>
                  <p className="cart-preview-qty">Qty: {cartItem.quantity}</p>
                  <button
                    type="button"
                    className="cart-preview-qty-btn"
                    onClick={() => onIncrementItem?.(cartItem)}
                    disabled={Number(cartItem.quantity || 0) >= 3}
                    aria-label={`Increase quantity for ${cartItem.name}`}
                  >
                    +
                  </button>
                </div>
                <button
                  type="button"
                  className="cart-preview-remove-btn"
                  onClick={() => onRemoveItem?.(cartItem)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="cart-preview-subtotal-row">
          <span>Cart subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>

        <div className="cart-preview-actions">
          <button
            type="button"
            className="cart-preview-btn primary"
            onClick={() => navigate("/checkout")}
          >
            Checkout
          </button>
          <button
            type="button"
            className="cart-preview-btn secondary"
            onClick={() => navigate("/cart")}
          >
            View Cart
          </button>
          <button
            type="button"
            className="cart-preview-btn ghost"
            onClick={onClose}
          >
            Continue Shopping
          </button>
        </div>
      </aside>
    </>
  );
}

export default CartPreview;
