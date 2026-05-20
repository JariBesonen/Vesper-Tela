import { useState, useEffect, useContext } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./Woman.css";
import CategoryNav from "../../Components/CategoryNav/CategoryNav.jsx";
import LoginPromptModal from "../../Components/LoginPromptModal/LoginPromptModal.jsx";
import { AuthContext } from "../../contexts/AuthContext.jsx";

function Woman() {
  const validCategories = ["shirts", "pants", "shoes"];
  const { isLoggedIn } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryFromUrl = (
    searchParams.get("category") || "shirts"
  ).toLowerCase();
  const initialCategory = validCategories.includes(categoryFromUrl)
    ? categoryFromUrl
    : "shirts";
  const [products, setProducts] = useState([]);
  const [savedIds, setSavedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginModalMessage, setLoginModalMessage] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);

  useEffect(() => {
    if (initialCategory !== selectedCategory) {
      setSelectedCategory(initialCategory);
    }
  }, [initialCategory, selectedCategory]);

  const handleCategoryChange = (nextCategory) => {
    setSelectedCategory(nextCategory);
    setSearchParams({ category: nextCategory });
  };

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // Fetch products
        const productResponse = await fetch(
          `http://localhost:3000/api/products?gender=women&category=${selectedCategory}`,
        );
        if (!productResponse.ok) {
          throw new Error(`Failed to load products: ${productResponse.status}`);
        }
        const productData = await productResponse.json();
        setProducts(productData || []);

        // Fetch saved products
        const savedResponse = await fetch("http://localhost:3000/api/saved", {
          credentials: "include",
        });
        if (savedResponse.ok) {
          const savedData = await savedResponse.json();
          const ids = new Set(savedData.map((p) => p.id));
          setSavedIds(ids);
        } else if (savedResponse.status !== 401) {
          throw new Error(
            `Failed to load saved products: ${savedResponse.status}`,
          );
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [selectedCategory]);

  const formatPrice = (price) => {
    if (price === undefined || price === null || price === "") return "";
    const numberPrice = Number(price);
    if (Number.isNaN(numberPrice)) return price;
    return `$${numberPrice.toFixed(2)}`;
  };

  const handleSaveToggle = async (productId) => {
    if (!isLoggedIn) {
      setLoginModalMessage("Please login to save products.");
      setShowLoginModal(true);
      return;
    }

    const isSaved = savedIds.has(productId);
    try {
      if (isSaved) {
        // Unsave
        const response = await fetch(
          `http://localhost:3000/api/saved/${productId}`,
          {
            method: "DELETE",
            credentials: "include",
          },
        );
        if (response.ok) {
          setSavedIds((prev) => {
            const newSet = new Set(prev);
            newSet.delete(productId);
            return newSet;
          });
        }
      } else {
        // Save
        const response = await fetch("http://localhost:3000/api/saved", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ productId }),
        });
        if (response.ok) {
          setSavedIds((prev) => new Set([...prev, productId]));
        } else if (response.status === 401) {
          setLoginModalMessage("Please login to save products.");
          setShowLoginModal(true);
        }
      }
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return <div className="womens-page">Loading products...</div>;
  }

  if (error) {
    return <div className="womens-page">Error loading products: {error}</div>;
  }

  return (
    <>
      <CategoryNav
        page="women"
        selectedCategory={selectedCategory}
        onCategoryChange={handleCategoryChange}
      />
      <div className="womens-page">
        <LoginPromptModal
          open={showLoginModal}
          message={loginModalMessage}
          onCancel={() => setShowLoginModal(false)}
          onLogin={() => {
            window.location.href = "/login";
          }}
        />
        {products.length === 0 ? (
          <div>No products found for women.</div>
        ) : (
          products.map((product) => (
            <div
              className="womens-product-wrapper"
              key={product.id ?? product.name}
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
                className="product-image"
                src={
                  product.image ||
                  `/images/products/women-${product.category || "shirts"}.svg`
                }
                alt={product.name}
                loading="lazy"
              />
              <span
                className={`product-wrapper-save-icon ${savedIds.has(product.id) ? "saved" : ""}`}
                onClick={(event) => {
                  event.stopPropagation();
                  handleSaveToggle(product.id);
                }}
              >
                {savedIds.has(product.id) ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="var(--color-primary)"
                    width="18"
                    height="18"
                  >
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--color-primary)"
                    strokeWidth="1.6"
                    width="18"
                    height="18"
                  >
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                )}
              </span>
              <div className="product-info-wrapper">
                <span className="product-name">{product.name}</span>
                <span className="product-price">
                  {formatPrice(product.price)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}

export default Woman;
