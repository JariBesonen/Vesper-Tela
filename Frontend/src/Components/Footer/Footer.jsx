import "./Footer.css";

function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="footer-top-row">
        <div className="footer-brand-block">
          <span className="footer-brand">Vesper Tela</span>
          <p className="footer-copy">
            Refined wardrobe essentials shaped through a quiet, modern point of
            view.
          </p>
        </div>

        <div className="footer-links-group">
          <a href="/women">Women</a>
          <a href="/men">Men</a>
          <a href="/saved">Saved</a>
          <a href="/cart">Cart</a>
        </div>

        <div className="footer-links-group footer-links-secondary">
          <a href="/login">Account</a>
          <a href="/orders">Orders</a>
          <button
            type="button"
            className="footer-search-btn"
            onClick={() =>
              window.dispatchEvent(new CustomEvent("vesper-search-open"))
            }
          >
            Search
          </button>
        </div>
      </div>

      <div className="footer-bottom-row">
        <span>© {year} Vesper Tela</span>
        <span>Minimal tailoring, everyday ease</span>
      </div>
    </footer>
  );
}

export default Footer;
