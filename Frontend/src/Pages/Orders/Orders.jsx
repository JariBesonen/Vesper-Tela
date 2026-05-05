import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext.jsx";
import "./Orders.css";

function Orders() {
  const navigate = useNavigate();
  const { isLoggedIn, loading: authLoading } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) return;

    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    const fetchOrders = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await fetch("http://localhost:3000/api/orders", {
          credentials: "include",
        });
        if (!response.ok) {
          throw new Error(`Failed to load orders: ${response.status}`);
        }
        const data = await response.json();
        setOrders(data || []);
      } catch (err) {
        setError(err.message || "Unable to load order history.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [authLoading, isLoggedIn, navigate]);

  const formatPrice = (price) => {
    const numberPrice = Number(price || 0);
    return `$${numberPrice.toFixed(2)}`;
  };

  const formatDate = (value) => {
    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? "Unknown date"
      : date.toLocaleString();
  };

  if (loading) {
    return <div className="orders-page">Loading order history...</div>;
  }

  if (error) {
    return <div className="orders-page">Error: {error}</div>;
  }

  return (
    <div className="orders-page">
      <div className="orders-wrapper">
        <h2>Order History</h2>

        {orders.length === 0 ? (
          <div className="orders-empty">No orders yet.</div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <article className="order-card" key={order.id}>
                <header className="order-card-header">
                  <span>Order #{order.id}</span>
                  <span>{formatDate(order.createdAt)}</span>
                </header>

                <div className="order-items">
                  {(order.items || []).map((item) => (
                    <div className="order-item" key={item.id}>
                      <span>{item.productName}</span>
                      <span>
                        {item.quantity} x {formatPrice(item.unitPrice)}
                      </span>
                      <span>{formatPrice(item.lineTotal)}</span>
                    </div>
                  ))}
                </div>

                <div className="order-card-footer">
                  <span>Status: {String(order.status || "completed")}</span>
                  <strong>Total: {formatPrice(order.total)}</strong>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Orders;
