import "./Cart.css";

function Cart() {
  return (
    <div className="cart-page">
      <div className="cart-wrapper">
        <div className="cart-item">
          <div className="item-img">IMG</div>
          <span className="item-name">NAME</span>
          <span className="item-price">PRICE</span>
          <button className="remove-from-cart-btn">REMOVE FROM CART</button>
        </div>
        <div className="cart-item">
          <div className="item-img">IMG</div>
          <span className="item-name">NAME</span>
          <span className="item-price">PRICE</span>
          <button className="remove-from-cart-btn">REMOVE FROM CART</button>
        </div>
        <div className="cart-item">
          <div className="item-img">IMG</div>
          <span className="item-name">NAME</span>
          <span className="item-price">PRICE</span>
          <button className="remove-from-cart-btn">REMOVE FROM CART</button>
        </div>
        <div className="proceed-to-checkout-wrapper">
            <span>PRICE</span>
          <button className="proceed-to-checkout-btn">
            PROCEED TO CHECKOUT
          </button>
        </div>
      </div>
    </div>
  );
}

export default Cart;
