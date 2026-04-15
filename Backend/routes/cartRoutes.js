const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");
const auth = require("../middleware/auth");

router.get("/", auth, cartController.getCart);
router.post("/", auth, cartController.addCart);
router.delete("/:productId", auth, cartController.removeCart);

module.exports = router;
