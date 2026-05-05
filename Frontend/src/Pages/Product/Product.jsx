import { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import LoginPromptModal from "../../Components/LoginPromptModal/LoginPromptModal.jsx";
import { AuthContext } from "../../contexts/AuthContext.jsx";
import "./Product.css";

const SIZE_OPTIONS = {
  shirts: ["XS", "S", "M", "L", "XL"],
  pants: ["28", "30", "32", "34", "36"],
  shoes: ["7", "8", "9", "10", "11", "12"],
};

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
  const { isLoggedIn } = useContext(AuthContext);
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(`http://localhost:3000/api/products/${id}`);
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
  const sizeOptions = useMemo(() => SIZE_OPTIONS[category] || SIZE_OPTIONS.shirts, [category]);

  useEffect(() => {
    if (sizeOptions.length > 0) {
      setSelectedSize(sizeOptions[0]);
    }
  }, [sizeOptions]);

  const formatPrice = (price) => {
    if (price === undefined || price === null || price === "") return "";
    const numberPrice = Number(price);
    if (Number.isNaN(numberPrice)) return String(price);
    return `$${numberPrice.toFixed(2)}`;
  };

  const handleQuantityChange = (nextValue) => {
    const parsed = Number(nextValue);
    if (!Number.isInteger(parsed)) return;
    setQuantity(Math.max(1, Math.min(parsed, 99)));
  };

  const handleAddToCart = async () => {
    if (!product?.id) return;

    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }

    setSuccessMessage("");
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

      setSuccessMessage(`Added ${quantity} item${quantity > 1 ? "s" : ""} to cart.`);
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
      <LoginPromptModal
        open={showLoginModal}
        message="Please login to add items to cart."
        onCancel={() => setShowLoginModal(false)}
        onLogin={() => {
          window.location.href = "/login";
        }}
      />

      <div className="product-detail-card">
        <button
          className="product-back-btn"
          type="button"
          onClick={() => navigate(-1)}
        >
          Back
        </button>

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
          <p className="product-detail-description">{getShortDescription(product)}</p>

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
                max="99"
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

          <button className="product-add-btn" type="button" onClick={handleAddToCart}>
            Add to cart
          </button>

          {successMessage && <p className="product-success-msg">{successMessage}</p>}
          {error && <p className="product-error-msg">{error}</p>}
        </div>
      </div>
    </div>
  );
}

export default Product;
