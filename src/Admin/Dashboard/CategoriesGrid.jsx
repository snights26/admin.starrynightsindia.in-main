import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CategoryCard from "../../Common/CategoryCard";
import api from "../../Utils/api";
import { resolveAssetUrl } from "../../Utils/fileUpload";
import "./CategoriesGrid.css";

export default function CategoriesGrid() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await api.get("/categories");
        const list = Array.isArray(data) ? data : [];
        const subcategories = list.filter((cat) => cat.isSub || cat.isSubcategory);
        setCategories(subcategories.length ? subcategories : list);
      } catch (error) {
        console.error("Failed to load categories", error);
        setCategories([]);
      }
    };

    loadCategories();
  }, []);

  const handleClick = (cat) => {
    navigate(`/admin/category/${cat.code}`, {
      state: {
        categoryName: cat.title || cat.name,
        categoryCode: cat.code
      }
    });
  };

  const filteredCategories = categories.filter((cat) =>
    (cat.title || cat.name || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="admin-grid-container">
      <div className="grid-header">
        <h2 className="grid-title">Category Management</h2>

        <input
          type="text"
          placeholder="Search category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="grid-search"
        />
      </div>

      <div className="categories-grid">
        {filteredCategories.map((cat) => (
          <CategoryCard
            key={cat.code}
            title={cat.title || cat.name}
            image={resolveAssetUrl(cat.image || cat.thumbnailUrl)}
            onClick={() => handleClick(cat)}
          />
        ))}
      </div>
    </div>
  );
}
