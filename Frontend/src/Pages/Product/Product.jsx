import { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext.jsx";
import { addGuestCartItem, getGuestCartItems } from "../../utils/guestCart.js";
import "./Product.css";

const SIZE_OPTIONS = {
  shirts: ["XS", "S", "M", "L", "XL"],
  pants: ["28", "30", "32", "34", "36"],
  shoes: ["7", "8", "9", "10", "11", "12"],
};
const MAX_CART_ITEM_QUANTITY = 3;

const normalizeCategory = (value) => {
  const category = String(value || "").toLowerCase();
  if (["shirts", "pants", "shoes"].includes(category)) return category;
  return "shirts";
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

  const gender = String(product?.gender || "").toLowerCase();
  const normalizedGender =
    gender === "women" || gender === "female" ? "women" : "men";
  const category = normalizeCategory(product?.category);

  return `/images/products/${normalizedGender}-${category}.svg`;
};

const getShortDescription = (product) => {
  const name = String(product?.name || "This piece");
  const category = normalizeCategory(product?.category);

  if (category === "shoes") {
    return `${name} blends stable support, premium materials, and all-day comfort for both street and occasion wear.`;
  }

  if (category === "pants") {
    return `${name} is cut for a clean silhouette with flexible movement and easy styling from day to night.`;
  }

  return `${name} delivers a polished look with breathable comfort and an elevated fit you can wear all season.`;
};

function Product() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn, loading: authLoading } = useContext(AuthContext);
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(
          `http://localhost:3000/api/products/${id}`,
        );
        if (!response.ok) {
          throw new Error(
            response.status === 404
              ? "Product not found."
              : `Failed to load product: ${response.status}`,
          );
        }

        const data = await response.json();
        setProduct(data);
      } catch (err) {
        setError(err.message || "Unable to load product.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const category = normalizeCategory(product?.category);
  const sizeOptions = useMemo(
    () => SIZE_OPTIONS[category] || SIZE_OPTIONS.shirts,
    [category],
  );

  useEffect(() => {
    if (sizeOptions.length > 0) {
      setSelectedSize(sizeOptions[0]);
    }
  }, [sizeOptions]);

  useEffect(() => {
    let cancelled = false;

    const syncAddedState = async () => {
      if (!product?.id || authLoading) return;

      if (!isLoggedIn) {
        const guestItems = getGuestCartItems();
        const inGuestCart = guestItems.some(
          (item) => Number(item.id) === Number(product.id),
        );
        if (!cancelled) setAddedToCart(inGuestCart);
        return;
      }

      try {
        const response = await fetch("http://localhost:3000/api/cart", {
          credentials: "include",
        });

        if (!response.ok) {
          if (!cancelled) setAddedToCart(false);
          return;
        }

        const data = await response.json();
        const inUserCart =
          Array.isArray(data) &&
          data.some((item) => Number(item.id) === Number(product.id));

        if (!cancelled) setAddedToCart(inUserCart);
      } catch {
        if (!cancelled) setAddedToCart(false);
      }
    };

    syncAddedState();

    return () => {
      cancelled = true;
    };
  }, [authLoading, isLoggedIn, product?.id]);

  const formatPrice = (price) => {
    if (price === undefined || price === null || price === "") return "";
    const numberPrice = Number(price);
    if (Number.isNaN(numberPrice)) return String(price);
    return `$${numberPrice.toFixed(2)}`;
  };

  const handleQuantityChange = (nextValue) => {
    const parsed = Number(nextValue);
    if (!Number.isInteger(parsed)) return;
    setQuantity(Math.max(1, Math.min(parsed, MAX_CART_ITEM_QUANTITY)));
  };

  const handleAddToCart = async () => {
    if (!product?.id) return;
    if (authLoading) return;

    setError("");
    setSuccessMessage("");

    if (!isLoggedIn) {
      addGuestCartItem(product, quantity, selectedSize);
      setSuccessMessage(
        `Added ${quantity} item${quantity > 1 ? "s" : ""} in size ${selectedSize} to cart as guest.`,
      );
      setAddedToCart(true);
      setTimeout(() => {
        setSuccessMessage("");
      }, 2000);
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          productId: product.id,
          quantity,
          size: selectedSize,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add product to cart.");
      }

      setSuccessMessage(
        `Added ${quantity} item${quantity > 1 ? "s" : ""} in size ${selectedSize} to cart.`,
      );
      setAddedToCart(true);
      setTimeout(() => {
        setSuccessMessage("");
      }, 2000);
    } catch (err) {
      setError(err.message || "Unable to add product to cart.");
    }
  };

  if (loading) {
    return <div className="product-page">Loading product...</div>;
  }

  if (error && !product) {
    return <div className="product-page">{error}</div>;
  }

  if (!product) {
    return <div className="product-page">Product not found.</div>;
  }

  return (
    <div className="product-page">
      <button
        className="product-back-btn"
        type="button"
        onClick={() => navigate(-1)}
      >
        Back
      </button>
      <div className="product-detail-card">
        <div className="product-visual-column">
          <img
            className="product-detail-image"
            src={getProductImageSrc(product)}
            alt={product.name}
          />
        </div>

        <div className="product-content-column">
          <h1>{product.name}</h1>
          <p className="product-detail-price">{formatPrice(product.price)}</p>
          <p className="product-detail-description">
            {getShortDescription(product)}
          </p>

          <div className="product-control-group">
            <label htmlFor="size-select">Size</label>
            <select
              id="size-select"
              value={selectedSize}
              onChange={(event) => setSelectedSize(event.target.value)}
            >
              {sizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>

          <div className="product-control-group">
            <label htmlFor="quantity-input">Quantity</label>
            <div className="quantity-row">
              <button
                type="button"
                onClick={() => handleQuantityChange(quantity - 1)}
              >
                -
              </button>
              <input
                id="quantity-input"
                type="number"
                min="1"
                max={MAX_CART_ITEM_QUANTITY}
                value={quantity}
                onChange={(event) => handleQuantityChange(event.target.value)}
              />
              <button
                type="button"
                onClick={() => handleQuantityChange(quantity + 1)}
              >
                +
              </button>
            </div>
          </div>

          <button
            className={`product-add-btn${addedToCart ? " added" : ""}`}
            type="button"
            onClick={handleAddToCart}
          >
            {addedToCart ? "Added to Cart ✓" : "Add to Cart"}
          </button>

          {successMessage && (
            <p className="product-success-msg">{successMessage}</p>
          )}
          {error && <p className="product-error-msg">{error}</p>}
        </div>
      </div>
    </div>
  );
}

export default Product;
