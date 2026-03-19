import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
//IMPORTED PAGES//
import Home from "./Pages/home/Home.jsx";
import Cart from "./Pages/Cart/Cart.jsx";
import Login from './Pages/Login/Login.jsx';
import Register from './Pages/Register/Register.jsx';
import Men from "./Pages/Men/Men.jsx";
import Woman from "./Pages/Woman/Woman.jsx";
//IMPORTED COMPONENTS//
import Footer from "./Components/Footer/Footer.jsx";
import GenderNav from "./Components/GenderNav/GenderNav.jsx";
import Navbar from "./Components/Navbar/Navbar.jsx";
import Search from "./Components/Search/Search.jsx";
function App() {
  return (
    <Router>
      <Routes>
        <Route />
      </Routes>
    </Router>
  );
}

export default App;
