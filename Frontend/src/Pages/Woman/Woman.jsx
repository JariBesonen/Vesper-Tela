import { useState, useEffect } from "react";
import "./Woman.css";

function Woman() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch(
          "http://localhost:3000/api/products?category=women",
        );
        if (!response.ok) {
          throw new Error(`Failed to load products: ${response.status}`);
        }
        const data = await response.json();
        setProducts(data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  const formatPrice = (price) => {
    if (price === undefined || price === null || price === "") return "";
    const numberPrice = Number(price);
    if (Number.isNaN(numberPrice)) return price;
    return `$${numberPrice.toFixed(2)}`;
  };

  if (loading) {
    return <div className="womens-page">Loading products...</div>;
  }

  if (error) {
    return <div className="womens-page">Error loading products: {error}</div>;
  }

  return (
    <div className="womens-page">
      {products.length === 0 ? (
        <div>No products found for women.</div>
      ) : (
        products.map((product) => (
          <div
            className="womens-product-wrapper"
            key={product.id ?? product.name}
          >
            <span className="product-wrapper-save-icon">save</span>
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
  );
}

export default Woman;
