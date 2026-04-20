import { useState, useEffect, useContext } from "react";
import { useSearchParams } from "react-router-dom";
import "./Woman.css";
import CategoryNav from "../../Components/CategoryNav/CategoryNav.jsx";
import LoginPromptModal from "../../Components/LoginPromptModal/LoginPromptModal.jsx";
import { AuthContext } from "../../contexts/AuthContext.jsx";

function Woman() {
  const validCategories = ["shirts", "pants", "shoes"];
  const { isLoggedIn } = useContext(AuthContext);
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryFromUrl = (
    searchParams.get("category") || "shirts"
  ).toLowerCase();
  const initialCategory = validCategories.includes(categoryFromUrl)
    ? categoryFromUrl
    : "shirts";
  const [products, setProducts] = useState([]);
  const [savedIds, setSavedIds] = useState(new Set());
  const [cartIds, setCartIds] = useState(new Set());
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

        // Fetch cart products
        const cartResponse = await fetch("http://localhost:3000/api/cart", {
          credentials: "include",
        });
        if (cartResponse.ok) {
          const cartData = await cartResponse.json();
          const ids = new Set(cartData.map((p) => p.id));
          setCartIds(ids);
        } else if (cartResponse.status !== 401) {
          throw new Error(
            `Failed to load cart products: ${cartResponse.status}`,
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

  const handleAddToCart = async (productId) => {
    if (!isLoggedIn) {
      setLoginModalMessage("Please login to add items to cart.");
      setShowLoginModal(true);
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ productId }),
      });
      if (!response.ok) {
        if (response.status === 401) {
          setLoginModalMessage("Please login to add items to cart.");
          setShowLoginModal(true);
          return;
        }
        throw new Error("Failed to add product to cart.");
      }
      setCartIds((prev) => new Set(prev).add(productId));
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
                onClick={() => handleSaveToggle(product.id)}
              >
                {savedIds.has(product.id) ? "❤️" : "♡"}
              </span>
              <div className="product-info-wrapper">
                <span className="product-name">{product.name}</span>
                <span className="product-price">
                  {formatPrice(product.price)}
                </span>
                <button
                  className="add-to-cart-btn"
                  type="button"
                  onClick={() => handleAddToCart(product.id)}
                  disabled={cartIds.has(product.id)}
                >
                  {cartIds.has(product.id) ? "In cart" : "Add to cart"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}

export default Woman;
