const express = require("express");
const router = express.Router();
const savedController = require("../controllers/savedController");
const auth = require("../middleware/auth");

router.get("/", auth, savedController.getSaved);
router.post("/", auth, savedController.addSaved);
router.delete("/:productId", auth, savedController.removeSaved);

module.exports = router;
