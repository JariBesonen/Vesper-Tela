import { useState, useEffect } from "react";
import "./Men.css";

function Men() {
  const [products, setProducts] = useState([]);
  const [savedIds, setSavedIds] = useState(new Set());
  const [cartIds, setCartIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch products
        const productResponse = await fetch(
          "http://localhost:3000/api/products?category=men",
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
        }

        // Fetch cart products
        const cartResponse = await fetch("http://localhost:3000/api/cart", {
          credentials: "include",
        });
        if (cartResponse.ok) {
          const cartData = await cartResponse.json();
          const ids = new Set(cartData.map((p) => p.id));
          setCartIds(ids);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const formatPrice = (price) => {
    if (price === undefined || price === null || price === "") return "";
    const numberPrice = Number(price);
    if (Number.isNaN(numberPrice)) return price;
    return `$${numberPrice.toFixed(2)}`;
  };

  const handleSaveToggle = async (productId) => {
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
        }
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAddToCart = async (productId) => {
    try {
      const response = await fetch("http://localhost:3000/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ productId }),
      });
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Please log in to add items to cart.");
        }
        throw new Error("Failed to add product to cart.");
      }
      setCartIds((prev) => new Set(prev).add(productId));
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return <div className="mens-page">Loading products...</div>;
  }

  if (error) {
    return <div className="mens-page">Error loading products: {error}</div>;
  }

  return (
    <div className="mens-page">
      {products.length === 0 ? (
        <div>No products found for men.</div>
      ) : (
        products.map((product) => (
          <div
            className="mens-product-wrapper"
            key={product.id ?? product.name}
          >
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
  );
}

export default Men;
