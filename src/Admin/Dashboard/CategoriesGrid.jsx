import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../Utils/api";
import "./CategoriesGrid.css";

const categoryName = (category) => category?.title || category?.name || "";

export default function CategoriesGrid() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedParentCode, setSelectedParentCode] = useState(null);

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

  const selectedParent = useMemo(
    () => categories.find((category) => category.code === selectedParentCode) || null,
    [categories, selectedParentCode]
  );

  const visibleCategories = useMemo(() => {
    const query = search.trim().toLowerCase();
    const source = selectedParent
      ? (Array.isArray(selectedParent.children) ? selectedParent.children : [])
      : categories;

    if (!query) {
      return source;
    }

    return source.filter((category) => categoryName(category).toLowerCase().includes(query));
  }, [categories, search, selectedParent]);

  const openSubcategory = (category) => {
    navigate(`/admin/category/${category.code}`, {
      state: {
        categoryName: categoryName(category),
        categoryCode: category.code
      }
    });
  };

  const selectParent = (category) => {
    setSelectedParentCode(category.code);
    setSearch("");
  };

  const returnToParents = () => {
    setSelectedParentCode(null);
    setSearch("");
  };

  const isSubcategoryView = Boolean(selectedParent);
  const title = isSubcategoryView
    ? `${categoryName(selectedParent)} Subcategories`
    : "Category Management";

  return (
    <div className="admin-grid-container">
      <div className="grid-header">
        <div>
          <h2 className="grid-title">{title}</h2>
          {isSubcategoryView && (
            <button type="button" className="category-table-back" onClick={returnToParents}>
              ← All Parent Categories
            </button>
          )}
        </div>

        <input
          type="text"
          placeholder={isSubcategoryView ? "Search subcategory..." : "Search parent category..."}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="grid-search"
        />
      </div>

      <div className="category-table-wrapper">
        <table className="category-dashboard-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>{isSubcategoryView ? "Subcategory" : "Parent Category"}</th>
              <th>{isSubcategoryView ? "Packages" : "Subcategories"}</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {visibleCategories.length === 0 ? (
              <tr>
                <td colSpan="4" className="category-table-empty">
                  {isSubcategoryView ? "No subcategories found" : "No parent categories found"}
                </td>
              </tr>
            ) : visibleCategories.map((category) => {
              const children = Array.isArray(category.children) ? category.children : [];
              return (
                <tr
                  key={category.code}
                  className="category-dashboard-row"
                  onClick={() => isSubcategoryView ? openSubcategory(category) : selectParent(category)}
                >
                  <td className="category-table-code">{category.code}</td>
                  <td className="category-table-name">{categoryName(category)}</td>
                  <td>{isSubcategoryView ? "Manage packages" : children.length}</td>
                  <td>
                    <button
                      type="button"
                      className="category-table-action"
                      onClick={(event) => {
                        event.stopPropagation();
                        isSubcategoryView ? openSubcategory(category) : selectParent(category);
                      }}
                    >
                      {isSubcategoryView ? "Manage Packages" : "View Subcategories"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
