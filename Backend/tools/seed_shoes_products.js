require("dotenv").config();
const pool = require("../config/db");

const shoes = [
  // Women
  {
    name: "Rose Cloud Runner",
    price: 148,
    gender: "women",
    category: "shoes",
    image: "/images/products/women-pink-cloud-sneakers.png",
  },
  {
    name: "Sky Cloud Runner",
    price: 148,
    gender: "women",
    category: "shoes",
    image: "/images/products/women-blue-cloud-sneakers.png",
  },
  {
    name: "Coffee Buckle Pump",
    price: 165,
    gender: "women",
    category: "shoes",
    image: "/images/products/women-coffee-heels.png",
  },
  {
    name: "Onyx Buckle Pump",
    price: 165,
    gender: "women",
    category: "shoes",
    image: "/images/products/women-black-heels.png",
  },
  {
    name: "Black Star Ankle Boot",
    price: 195,
    gender: "women",
    category: "shoes",
    image: "/images/products/women-black-ankle-boots.png",
  },
  // Men
  {
    name: "Slate Cloud Runner",
    price: 148,
    gender: "men",
    category: "shoes",
    image: "/images/products/men-grey-black-sneakers.png",
  },
  {
    name: "Mocha Cloud Runner",
    price: 148,
    gender: "men",
    category: "shoes",
    image: "/images/products/men-coffee-tone-sneakers.png",
  },
  {
    name: "Black Cap-Toe Oxford",
    price: 220,
    gender: "men",
    category: "shoes",
    image: "/images/products/men-black-oxford-shoes.png",
  },
  {
    name: "Cognac Cap-Toe Oxford",
    price: 220,
    gender: "men",
    category: "shoes",
    image: "/images/products/men-brown-oxford-shoes.png",
  },
  {
    name: "Black Leather Trainer",
    price: 135,
    gender: "men",
    category: "shoes",
    image: "/images/products/men-black-casual-sneakers.png",
  },
];

const seed = async () => {
  try {
    let inserted = 0;
    let skipped = 0;

    for (const product of shoes) {
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
      `Shoe seed complete. Inserted: ${inserted}, skipped: ${skipped}`,
    );
    process.exit(0);
  } catch (err) {
    console.error("Failed seeding shoe products:", err);
    process.exit(1);
  }
};

seed();
