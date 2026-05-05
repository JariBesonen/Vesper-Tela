import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import "./Saved.css";
import LoginPromptModal from "../../Components/LoginPromptModal/LoginPromptModal.jsx";
import { AuthContext } from "../../contexts/AuthContext.jsx";

function Saved() {
  const navigate = useNavigate();
  const { isLoggedIn, loading: authLoading } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      setShowLoginModal(true);
      setLoading(false);
      return;
    }

    if (authLoading) {
      return;
    }

    async function fetchSavedProducts() {
      try {
        const response = await fetch("http://localhost:3000/api/saved", {
          credentials: "include",
        });
        if (!response.ok) {
          if (response.status === 401) {
            setShowLoginModal(true);
            return;
          }
          throw new Error(`Failed to load saved products: ${response.status}`);
        }
        const data = await response.json();
        setProducts(data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchSavedProducts();
  }, [authLoading, isLoggedIn]);

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

  const handleUnsave = async (productId) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/saved/${productId}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );
      if (!response.ok) {
        throw new Error("Failed to unsave product");
      }
      // Remove from local state
      setProducts(products.filter((p) => p.id !== productId));
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return <div className="saved-page">Loading saved products...</div>;
  }

  if (showLoginModal) {
    return (
      <div className="saved-page">
        <LoginPromptModal
          open={true}
          message="You must log in to view saved products."
          onCancel={() => (window.location.href = "/")}
          onLogin={() => {
            window.location.href = "/login";
          }}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="saved-page">Error loading saved products: {error}</div>
    );
  }

  return (
    <div className="saved-page">
      <LoginPromptModal
        open={showLoginModal}
        message="You must log in to view saved products."
        onCancel={() => setShowLoginModal(false)}
        onLogin={() => {
          window.location.href = "/login";
        }}
      />
      <div className="saved-wrapper">
        {products.length === 0 ? (
          <div>No saved products.</div>
        ) : (
          products.map((product) => (
            <div
              className="saved-item"
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
                className="item-img"
                src={getProductImageSrc(product)}
                alt={product.name}
                loading="lazy"
              />
              <div className="saved-item-content">
                <div className="saved-item-header-row">
                  <h3 className="item-name">{product.name}</h3>
                  <span className="item-price">
                    {formatPrice(product.price)}
                  </span>
                </div>
                <p className="saved-item-hint">
                  Click card to view product details
                </p>
                <div className="saved-item-buttons">
                  <button
                    className="unsave-btn"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleUnsave(product.id);
                    }}
                  >
                    UNSAVE
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Saved;
