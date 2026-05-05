require("dotenv").config();
const pool = require("../config/db");

const pants = [
  // Women
  {
    name: "Light Blue Distressed Flare Jeans",
    price: 98,
    gender: "women",
    category: "pants",
    image: "/images/products/women-light-blue-denim-jeans.png",
  },
  {
    name: "Distressed Denim Short Shorts",
    price: 64,
    gender: "women",
    category: "pants",
    image: "/images/products/women-denim-short-shorts.png",
  },
  {
    name: "Black Faux Leather Skinny Pants",
    price: 110,
    gender: "women",
    category: "pants",
    image: "/images/products/women-tight-leather-pants.png",
  },
  {
    name: "Grunge Graphic Wide-Leg Pants",
    price: 85,
    gender: "women",
    category: "pants",
    image: "/images/products/women-printed-pattern-pants.png",
  },
  {
    name: "Pink Active Runner Shorts",
    price: 42,
    gender: "women",
    category: "pants",
    image: "/images/products/women-light-pink-gym-shorts.png",
  },
  {
    name: "Blue Active Runner Shorts",
    price: 42,
    gender: "women",
    category: "pants",
    image: "/images/products/women-light-blue-gym-shorts.png",
  },
  // Men
  {
    name: "Gold Athletic Shorts",
    price: 52,
    gender: "men",
    category: "pants",
    image: "/images/products/men-gold-gym-shorts.png",
  },
  {
    name: "Navy Athletic Shorts",
    price: 52,
    gender: "men",
    category: "pants",
    image: "/images/products/men-dark-blue-gym-shorts.png",
  },
  {
    name: "Light Blue Distressed Baggy Jeans",
    price: 94,
    gender: "men",
    category: "pants",
    image: "/images/products/men-ripped-denim-jeans.png",
  },
  {
    name: "Beige Relaxed Chinos",
    price: 78,
    gender: "men",
    category: "pants",
    image: "/images/products/men-casual-beige-pants.png",
  },
  {
    name: "Angel Print Wide-Leg Pants",
    price: 88,
    gender: "men",
    category: "pants",
    image: "/images/products/men-printed-pattern-pants.png",
  },
  {
    name: "Dark Indigo Denim Shorts",
    price: 58,
    gender: "men",
    category: "pants",
    image: "/images/products/men-denim-dark-blue-shorts.png",
  },
];

const seed = async () => {
  try {
    let inserted = 0;
    let skipped = 0;

    for (const product of pants) {
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
      `Pants seed complete. Inserted: ${inserted}, skipped: ${skipped}`,
    );
    process.exit(0);
  } catch (err) {
    console.error("Failed seeding pants products:", err);
    process.exit(1);
  }
};

seed();
