import "./Home.css";
import { Link, useNavigate } from "react-router-dom";
import heroVideo from "../../assets/productImgs/heroVideo.mp4";
import menSectionBackground from "../../assets/productImgs/heropageMenCTA.png";
import womenShoesCtaImage from "../../assets/productImgs/womansCoffeeHeels.png";
import womenShirtsCtaImage from "../../assets/productImgs/womansBeigeLongSleeveShirt.png";
import womenPantsCtaImage from "../../assets/productImgs/womansBlackLoungePants2.png";
import menShoesCtaImage from "../../assets/productImgs/mensCasualCoffeeToneShoes.png";
import menShirtsCtaImage from "../../assets/productImgs/mensBeigeShirt.png";
import menPantsCtaImage from "../../assets/productImgs/mensBlackLoungePants2.png";

function Home() {
  const navigate = useNavigate();

  return (
    <main>
      <section className="hero-section">
        <video
          className="hero-video"
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          onClick={() => navigate("/women")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              navigate("/women");
            }
          }}
        >
          <source src={heroVideo} type="video/mp4" />
        </video>
        <div className="hero-video-overlay" aria-hidden="true" />
        <div className="hero-section-cta-wrapper">
          <span>Shop Women</span>
          <button type="button" onClick={() => navigate("/women")}>
            SHOP NOW
          </button>
        </div>
      </section>

      <section className="woman-section">
        <Link
          to="/women?category=shoes"
          className="woman-product-promo"
          style={{ backgroundImage: `url(${womenShoesCtaImage})` }}
        >
          <span className="woman-promo-label">Women Shoes</span>
          <span className="woman-promo-btn">SHOP SHOES</span>
        </Link>
        <Link
          to="/women?category=shirts"
          className="woman-product-promo"
          style={{ backgroundImage: `url(${womenShirtsCtaImage})` }}
        >
          <span className="woman-promo-label">Women Shirts</span>
          <span className="woman-promo-btn">SHOP SHIRTS</span>
        </Link>
        <Link
          to="/women?category=pants"
          className="woman-product-promo"
          style={{ backgroundImage: `url(${womenPantsCtaImage})` }}
        >
          <span className="woman-promo-label">Women Pants</span>
          <span className="woman-promo-btn">SHOP PANTS</span>
        </Link>
      </section>
      <section
        className="men-section"
        style={{ backgroundImage: `url(${menSectionBackground})` }}
        onClick={() => navigate("/men")}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            navigate("/men");
          }
        }}
      >
        <div className="men-section-overlay" aria-hidden="true" />
        <div className="men-cta-wrapper">
          <span>Shop Men</span>
          <Link to="/men" className="men-shop-now-link">
            SHOP NOW
          </Link>
        </div>
      </section>
      <section className="mens-new-arrivals-section">
        <Link
          id="mens-new-arrival-promo-shoes"
          to="/men?category=shoes"
          className="mens-new-arrival-product-promo"
          style={{ backgroundImage: `url(${menShoesCtaImage})` }}
        >
          <span className="mens-new-arrival-label">Men Shoes</span>
          <span className="mens-new-arrival-btn">SHOP SHOES</span>
        </Link>
        <Link
          id="mens-new-arrival-promo-shirts"
          to="/men?category=shirts"
          className="mens-new-arrival-product-promo"
          style={{ backgroundImage: `url(${menShirtsCtaImage})` }}
        >
          <span className="mens-new-arrival-label">Men Shirts</span>
          <span className="mens-new-arrival-btn">SHOP SHIRTS</span>
        </Link>
        <Link
          id="mens-new-arrival-promo-pants"
          to="/men?category=pants"
          className="mens-new-arrival-product-promo"
          style={{ backgroundImage: `url(${menPantsCtaImage})` }}
        >
          <span className="mens-new-arrival-label">Men Pants</span>
          <span className="mens-new-arrival-btn">SHOP PANTS</span>
        </Link>
      </section>
    </main>
  );
}

export default Home;
