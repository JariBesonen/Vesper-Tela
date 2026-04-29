import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Search.css";

const MAX_RESULTS = 5;

const toTokenSet = (value) => {
  const normalized = String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!normalized) return new Set();
  return new Set(normalized.split(" "));
};

const getProductTags = (product) => {
  const gender = String(product?.gender || "").toLowerCase();
  const normalizedGender =
    gender === "female" || gender === "women" ? "women" : "men";
  const category = String(product?.category || "shirts").toLowerCase();
  const categories = ["shirts", "pants", "shoes"];
  const safeCategory = categories.includes(category) ? category : "shirts";
  const nameTokens = Array.from(toTokenSet(product?.name));

  return [normalizedGender, safeCategory, ...nameTokens]
    .filter(Boolean)
    .map((tag) => `#${tag}`);
};

const getProductScore = (product, query) => {
  const queryText = String(query || "")
    .trim()
    .toLowerCase();
  if (!queryText) return 0;

  const queryTokens = Array.from(toTokenSet(queryText));
  if (!queryTokens.length) return 0;

  const name = String(product?.name || "").toLowerCase();
  const tagTokens = getProductTags(product).map((tag) => tag.slice(1));

  let score = 0;

  if (name === queryText) score += 100;
  if (name.includes(queryText)) score += 60;

  queryTokens.forEach((token) => {
    if (name.includes(token)) score += 20;
    if (tagTokens.some((tag) => tag.includes(token))) score += 12;
  });

  return score;
};

const getProductRoute = (product) => {
  const gender = String(product?.gender || "").toLowerCase();
  const category = String(product?.category || "shirts").toLowerCase();
  const safeCategory = ["shirts", "pants", "shoes"].includes(category)
    ? category
    : "shirts";
  const baseRoute =
    gender === "women" || gender === "female" ? "/women" : "/men";

  return `${baseRoute}?category=${safeCategory}`;
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
  const category = String(product?.category || "shirts").toLowerCase();
  const safeCategory = ["shirts", "pants", "shoes"].includes(category)
    ? category
    : "shirts";

  return `/images/products/${normalizedGender}-${safeCategory}.svg`;
};

function Search() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const handleOpen = () => setOpen(true);
    window.addEventListener("vesper-search-open", handleOpen);
    return () => window.removeEventListener("vesper-search-open", handleOpen);
  }, []);

  useEffect(() => {
    if (!open || products.length > 0 || loading) return;

    const fetchProducts = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await fetch("http://localhost:3000/api/products");
        if (!response.ok) {
          throw new Error(`Failed to load products: ${response.status}`);
        }
        const data = await response.json();
        setProducts(data || []);
      } catch (err) {
        setError(err.message || "Unable to load products.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [open, products.length, loading]);

  const similarProducts = useMemo(() => {
    if (!query.trim()) return [];

    return [...products]
      .map((product) => ({
        product,
        score: getProductScore(product, query),
      }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, MAX_RESULTS)
      .map(({ product }) => product);
  }, [products, query]);

  const handleSearch = () => {
    if (!query.trim()) return;
    const bestMatch = similarProducts[0];
    if (!bestMatch) return;
    navigate(getProductRoute(bestMatch));
    setOpen(false);
  };

  const handleInputKeyDown = (event) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    handleSearch();
  };

  const closeModal = () => {
    setOpen(false);
    setQuery("");
  };

  if (!open) return null;

  return (
    <div className="search-modal-overlay" onClick={closeModal}>
      <div
        className="search-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="search-modal-header">
          <h2>Search Products</h2>
          <button
            type="button"
            className="search-close-btn"
            onClick={closeModal}
          >
            Close
          </button>
        </div>
        <div className="search-input-row">
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder="Try: black pants, coffee heels, maroon shirt"
          />
          <button type="button" onClick={handleSearch} disabled={!query.trim()}>
            Search
          </button>
        </div>

        {loading && <p>Loading product index...</p>}
        {error && <p className="search-error">{error}</p>}

        {!loading && !error && query.trim() && similarProducts.length === 0 && (
          <p>No similar products found.</p>
        )}

        {similarProducts.length > 0 && (
          <div className="similar-products-list">
            {similarProducts.map((product) => (
              <button
                type="button"
                key={product.id ?? `${product.name}-${product.category}`}
                className="similar-product-item"
                onClick={() => {
                  navigate(getProductRoute(product));
                  setOpen(false);
                }}
              >
                <img
                  className="similar-product-image"
                  src={getProductImageSrc(product)}
                  alt={product.name}
                />
                <span className="similar-product-content">
                  <span className="similar-product-name">{product.name}</span>
                  <span className="similar-product-meta">
                    {String(product.gender || "men")} ·{" "}
                    {String(product.category || "shirts")}
                  </span>
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Search;
