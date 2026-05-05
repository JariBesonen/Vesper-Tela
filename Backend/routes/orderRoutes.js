const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const orderController = require("../controllers/orderController");

router.get("/", auth, orderController.getHistory);
router.post("/checkout", auth, orderController.checkout);

module.exports = router;
