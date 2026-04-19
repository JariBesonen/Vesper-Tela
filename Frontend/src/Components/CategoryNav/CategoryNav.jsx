import "./CategoryNav.css";

function CategoryNav({
  page = "category",
  selectedCategory = "shirts",
  onCategoryChange,
}) {
  const categories = ["shirts", "pants", "shoes"];
  const visibleCategories = categories.filter(
    (cat) => cat !== selectedCategory,
  );

  return (
    <nav className="category-nav">
      <span className="category-span">{page}</span>
      <span className="subcategory-span">{selectedCategory}</span>
      <ul className="category-list">
        {visibleCategories.map((cat) => (
          <li
            key={cat}
            onClick={() => onCategoryChange && onCategoryChange(cat)}
          >
            {cat}
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default CategoryNav;
