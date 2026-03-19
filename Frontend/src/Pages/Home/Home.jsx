import "./Home.css";

function Home() {
  return (
    <main>
      <section className="hero-section">
        <div className="hero-section-cta-wrapper">
          <span>Code_Black Collection</span>
          <button>SHOP NOW</button>
        </div>
      </section>

      <section className="woman-section">
        <div id="woman-promo-one" className="woman-product-promo">
          <span>bags for women</span>
        </div>
        <div id="woman-promo-two" className="woman-product-promo">
          <span>shirts</span>
        </div>
        <div id="woman-promo-three" className="woman-product-promo">
          <span>pants</span>
        </div>
        <div id="woman-promo-four" className="woman-product-promo">
          <span>shoes for women</span>
        </div>
      </section>
      <section className="men-section">
        <div className="men-cta-wrapper">
          <span>Shop Men</span>
          <button>SHOP NOW</button>
        </div>
      </section>
      <section className="new-arrival-section">
        <div id="new-arrival-promo-one" className="new-arrival-product-promo">
          <span>shoes</span>
        </div>
        <div id="new-arrival-promo-two" className="new-arrival-product-promo">
          <span>shirts</span>
        </div>
        <div id="new-arrival-promo-three" className="new-arrival-product-promo">
          <span>pants</span>
        </div>
        <div id="new-arrival-promo-four" className="new-arrival-product-promo">
          <span>something else</span>
        </div>
      </section>
    </main>
  );
}

export default Home;
