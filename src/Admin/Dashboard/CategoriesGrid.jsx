import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import CategoryCard from "../../Common/CategoryCard";
import api from "../../Utils/api";
import { resolveAssetUrl } from "../../Utils/fileUpload";
import "./CategoriesGrid.css";

export default function CategoriesGrid() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [expandedCategories, setExpandedCategories] = useState(() => new Set());

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await api.get("/categories/tree");
        setCategories(Array.isArray(data) ? data : []);
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

  const toggleCategory = (code) => {
    setExpandedCategories((previous) => {
      const next = new Set(previous);
      if (next.has(code)) {
        next.delete(code);
      } else {
        next.add(code);
      }
      return next;
    });
  };

  const normalizedSearch = search.trim().toLowerCase();
  const filteredCategories = useMemo(() => categories.reduce((result, category) => {
    const children = Array.isArray(category.children) ? category.children : [];
    const matchesParent = (category.title || category.name || "").toLowerCase().includes(normalizedSearch);
    const matchingChildren = children.filter((child) =>
      (child.title || child.name || "").toLowerCase().includes(normalizedSearch)
    );

    if (!normalizedSearch || matchesParent || matchingChildren.length > 0) {
      result.push({
        category,
        children: normalizedSearch && !matchesParent ? matchingChildren : children,
        showSearchResults: normalizedSearch && matchingChildren.length > 0
      });
    }

    return result;
  }, []), [categories, normalizedSearch]);

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
        {filteredCategories.map(({ category, children, showSearchResults }) => {
          const isExpanded = expandedCategories.has(category.code);
          const showChildren = isExpanded || showSearchResults;

          return (
            <section className="category-tree-group" key={category.code}>
              <div className="category-tree-parent">
                <CategoryCard
                  title={category.title || category.name}
                  image={resolveAssetUrl(category.image || category.thumbnailUrl)}
                  onClick={() => handleClick(category)}
                />
                <button
                  type="button"
                  className="category-expand-btn"
                  onClick={() => toggleCategory(category.code)}
                  aria-expanded={isExpanded}
                  disabled={children.length === 0}
                >
                  {children.length === 0 ? "No subcategories" : isExpanded ? "Collapse" : "Expand"}
                </button>
              </div>

              {showChildren && children.length > 0 && (
                <div className="category-tree-children">
                  {children.map((child) => (
                    <div className="category-tree-child" key={child.code}>
                      <span className="category-tree-branch" aria-hidden="true" />
                      <CategoryCard
                        title={child.title || child.name}
                        image={resolveAssetUrl(child.image || child.thumbnailUrl)}
                        onClick={() => handleClick(child)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
