import { useState, useEffect } from "react";
import "./Saved.css";

function Saved() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchSavedProducts() {
      try {
        const response = await fetch("http://localhost:3000/api/saved", {
          credentials: "include",
        });
        if (!response.ok) {
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
  }, []);

  const formatPrice = (price) => {
    if (price === undefined || price === null || price === "") return "";
    const numberPrice = Number(price);
    if (Number.isNaN(numberPrice)) return price;
    return `$${numberPrice.toFixed(2)}`;
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

  if (error) {
    return (
      <div className="saved-page">Error loading saved products: {error}</div>
    );
  }

  return (
    <div className="saved-page">
      <div className="saved-wrapper">
        {products.length === 0 ? (
          <div>No saved products.</div>
        ) : (
          products.map((product) => (
            <div className="saved-item" key={product.id}>
              <div className="item-img">IMG</div>
              <span className="item-name">{product.name}</span>
              <span className="item-price">{formatPrice(product.price)}</span>
              <button
                className="unsave-btn"
                onClick={() => handleUnsave(product.id)}
              >
                UNSAVE
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Saved;
