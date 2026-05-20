import { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext.jsx";
import {
  addGuestCartItem,
  getGuestCartItems,
  removeGuestCartItem,
  updateGuestCartItemQuantity,
} from "../../utils/guestCart.js";
import CartPreview from "../../Components/CartPreview/CartPreview.jsx";
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

const mapCartItemsForPreview = (items) =>
  (Array.isArray(items) ? items : []).map((item) => ({
    id: item.id,
    size: item.size || "Unspecified",
    name: item.name,
    image: getProductImageSrc(item),
    price: Number(item.price || 0),
    quantity: Number(item.quantity || 0),
  }));

const getSubtotal = (items) =>
  (Array.isArray(items) ? items : []).reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0),
    0,
  );

function Product() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn, loading: authLoading, refreshCartCount } =
    useContext(AuthContext);
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addedToCart, setAddedToCart] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState([]);
  const [cartSubtotal, setCartSubtotal] = useState(0);

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

    if (!isLoggedIn) {
      const updatedItems = addGuestCartItem(product, quantity, selectedSize);
      setPreviewItem(mapCartItemsForPreview(updatedItems));
      setCartSubtotal(getSubtotal(updatedItems));
      setIsPreviewOpen(true);
      setAddedToCart(true);
      refreshCartCount();
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

      const addResult = await response.json().catch(() => ({}));
      const cartResponse = await fetch("http://localhost:3000/api/cart", {
        credentials: "include",
      });
      const latestCart = cartResponse.ok ? await cartResponse.json() : [];

      setPreviewItem(
        Array.isArray(latestCart)
          ? mapCartItemsForPreview(latestCart)
          : [
              {
                id: product.id,
                size: addResult.size || selectedSize || "Unspecified",
                name: product.name,
                image: getProductImageSrc(product),
                price: Number(product.price || 0),
                quantity: Number(addResult.quantity || quantity),
              },
            ],
      );
      setCartSubtotal(
        Array.isArray(latestCart)
          ? getSubtotal(latestCart)
          : Number(product.price || 0) * Number(quantity || 1),
      );
      setIsPreviewOpen(true);
      setAddedToCart(true);
      refreshCartCount();
    } catch (err) {
      setError(err.message || "Unable to add product to cart.");
    }
  };

  const handlePreviewRemoveItem = async (item) => {
    if (!item?.id) return;

    if (!isLoggedIn) {
      const updatedItems = removeGuestCartItem(item.id, item.size);
      const mappedItems = mapCartItemsForPreview(updatedItems);
      setPreviewItem(mappedItems);
      setCartSubtotal(getSubtotal(updatedItems));
      setAddedToCart(mappedItems.some((cartItem) => Number(cartItem.id) === Number(product?.id)));
      if (mappedItems.length === 0) {
        setIsPreviewOpen(false);
      }
      refreshCartCount();
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:3000/api/cart/${item.id}?size=${encodeURIComponent(item.size || "Unspecified")}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );

      if (!response.ok) {
        throw new Error("Unable to remove item from cart.");
      }

      const cartResponse = await fetch("http://localhost:3000/api/cart", {
        credentials: "include",
      });
      const latestCart = cartResponse.ok ? await cartResponse.json() : [];
      const mappedItems = mapCartItemsForPreview(latestCart);
      setPreviewItem(mappedItems);
      setCartSubtotal(getSubtotal(latestCart));
      setAddedToCart(mappedItems.some((cartItem) => Number(cartItem.id) === Number(product?.id)));
      if (mappedItems.length === 0) {
        setIsPreviewOpen(false);
      }
      refreshCartCount();
    } catch (err) {
      setError(err.message || "Unable to remove item from cart.");
    }
  };

  const handlePreviewQuantityChange = async (item, delta) => {
    if (!item?.id || !delta) return;
    const nextQuantity = Number(item.quantity || 0) + Number(delta);

    if (nextQuantity < 1 || nextQuantity > MAX_CART_ITEM_QUANTITY) {
      return;
    }

    if (!isLoggedIn) {
      const updatedItems = updateGuestCartItemQuantity(
        item.id,
        item.size,
        nextQuantity,
      );
      const mappedItems = mapCartItemsForPreview(updatedItems);
      setPreviewItem(mappedItems);
      setCartSubtotal(getSubtotal(updatedItems));
      setAddedToCart(mappedItems.some((cartItem) => Number(cartItem.id) === Number(product?.id)));
      refreshCartCount();
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/api/cart/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          quantity: nextQuantity,
          size: item.size || "Unspecified",
        }),
      });

      if (!response.ok) {
        throw new Error("Unable to update cart quantity.");
      }

      const cartResponse = await fetch("http://localhost:3000/api/cart", {
        credentials: "include",
      });
      const latestCart = cartResponse.ok ? await cartResponse.json() : [];
      const mappedItems = mapCartItemsForPreview(latestCart);
      setPreviewItem(mappedItems);
      setCartSubtotal(getSubtotal(latestCart));
      setAddedToCart(mappedItems.some((cartItem) => Number(cartItem.id) === Number(product?.id)));
      refreshCartCount();
    } catch (err) {
      setError(err.message || "Unable to update cart quantity.");
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
      <CartPreview
        isOpen={isPreviewOpen}
        items={previewItem}
        subtotal={cartSubtotal}
        onClose={() => setIsPreviewOpen(false)}
        onRemoveItem={handlePreviewRemoveItem}
        onIncrementItem={(item) => handlePreviewQuantityChange(item, 1)}
        onDecrementItem={(item) => handlePreviewQuantityChange(item, -1)}
      />
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

          {error && <p className="product-error-msg">{error}</p>}
        </div>
      </div>
    </div>
  );
}

export default Product;
