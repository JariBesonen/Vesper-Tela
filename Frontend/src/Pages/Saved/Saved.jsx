import "./Saved.css";

function Saved() {
  return (
    <div className="saved-page">
      <div className="saved-wrapper">
        <div className="saved-item">
          <div className="item-img">IMG</div>
          <span className="item-name">NAME</span>
          <span className="item-price">PRICE</span>
          <button className="unsave-btn">UNSAVE</button>
        </div>
        <div className="saved-item">
          <div className="item-img">IMG</div>
          <span className="item-name">NAME</span>
          <span className="item-price">PRICE</span>
          <button className="unsave-btn">UNSAVE</button>
        </div>
        <div className="saved-item">
          <div className="item-img">IMG</div>
          <span className="item-name">NAME</span>
          <span className="item-price">PRICE</span>
          <button className="unsave-btn">UNSAVE</button>
        </div>
      </div>
    </div>
  );
}

export default Saved;
