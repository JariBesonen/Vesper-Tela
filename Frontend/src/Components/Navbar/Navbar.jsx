import './Navbar.css';
function Navbar() {
    return (
        <nav>
            <ul className="ul-left">
                <li><a href="/men">Men</a></li>
                <li><a href="/women">Woman</a></li>
            </ul>
            <h1>Vesper Tela</h1>
            <ul className="ul-right">
                <li><a href="/cart">Cart</a></li>
                <li><a href="/saved">Saved</a></li>
            </ul>
        </nav>
    )
}

export default Navbar;