require("dotenv").config();
const pool = require("../config/db");

const shirts = [
  {
    name: "Dark Green Draped Shirt",
    price: 89,
    gender: "men",
    category: "shirts",
    image: "/images/products/men-dress-long-sleeve-shirt-green.png",
  },
  {
    name: "Navy Essential Tee",
    price: 38,
    gender: "men",
    category: "shirts",
    image: "/images/products/men-casual-dark-blue-tshirt.png",
  },
  {
    name: "Dark Olive Tank",
    price: 34,
    gender: "men",
    category: "shirts",
    image: "/images/products/men-dark-green-tank-top.png",
  },
  {
    name: "Stone Tank",
    price: 34,
    gender: "men",
    category: "shirts",
    image: "/images/products/men-beige-tank-top.png",
  },
  {
    name: "Grey Fuzzy Crewneck",
    price: 95,
    gender: "men",
    category: "shirts",
    image: "/images/products/men-grey-long-sleeve-fuzzy-sweater.png",
  },
  {
    name: "Distressed Black Oversized Tee",
    price: 48,
    gender: "men",
    category: "shirts",
    image: "/images/products/men-black-ripped-tshirt.png",
  },
  {
    name: "Emerald Silk Shirt",
    price: 89,
    gender: "women",
    category: "shirts",
    image: "/images/products/women-green-long-sleeve-shirt.png",
  },
  {
    name: "Burgundy Silk Shirt",
    price: 89,
    gender: "women",
    category: "shirts",
    image: "/images/products/women-long-sleeve-red-shirt.png",
  },
  {
    name: "Charcoal Drape Tank",
    price: 36,
    gender: "women",
    category: "shirts",
    image: "/images/products/women-tank-top-dark-grey.png",
  },
  {
    name: "Ivory Drape Tank",
    price: 36,
    gender: "women",
    category: "shirts",
    image: "/images/products/women-beige-tank-top.png",
  },
  {
    name: "Soft Grey Fuzzy Sweater",
    price: 95,
    gender: "women",
    category: "shirts",
    image: "/images/products/women-grey-fuzzy-long-sleeve-sweater.png",
  },
];

const seed = async () => {
  try {
    let inserted = 0;
    let skipped = 0;

    for (const product of shirts) {
      const exists = await pool.query(
        "SELECT id FROM products WHERE image = $1 LIMIT 1",
        [product.image],
      );

      if (exists.rows.length > 0) {
        skipped += 1;
        continue;
      }

      await pool.query(
        "INSERT INTO products (name, price, gender, category, image) VALUES ($1, $2, $3, $4, $5)",
        [
          product.name,
          product.price,
          product.gender,
          product.category,
          product.image,
        ],
      );
      inserted += 1;
    }

    console.log(
      `Shirt seed complete. Inserted: ${inserted}, skipped: ${skipped}`,
    );
    process.exit(0);
  } catch (err) {
    console.error("Failed seeding shirt products:", err);
    process.exit(1);
  }
};

seed();
