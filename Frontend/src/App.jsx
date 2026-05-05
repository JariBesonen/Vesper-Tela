import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
//IMPORTED PAGES//
import Home from "./Pages/Home/Home.jsx";
import Cart from "./Pages/Cart/Cart.jsx";
import Checkout from "./Pages/Checkout/Checkout.jsx";
import Login from "./Pages/Login/Login.jsx";
import Register from "./Pages/Register/Register.jsx";
import Men from "./Pages/Men/Men.jsx";
import Woman from "./Pages/Woman/Woman.jsx";
import Saved from "./Pages/Saved/Saved.jsx";
import Product from "./Pages/Product/Product.jsx";
import Orders from "./Pages/Orders/Orders.jsx";
//IMPORTED COMPONENTS//
import Footer from "./Components/Footer/Footer.jsx";
import Navbar from "./Components/Navbar/Navbar.jsx";
import Search from "./Components/Search/Search.jsx";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import "./Global.css";
function App() {
  return (
    <Router>
      <AuthProvider>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/saved" element={<Saved />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/men" element={<Men />} />
          <Route path="/women" element={<Woman />} />
          <Route path="/product/:id" element={<Product />} />
          <Route path="/orders" element={<Orders />} />
        </Routes>
        <Footer />
        <Search />
      </AuthProvider>
    </Router>
  );
}

export default App;
