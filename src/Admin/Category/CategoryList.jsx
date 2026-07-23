import "./CategoryList.css";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../Utils/api";

function CategoryList() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [expandedCategories, setExpandedCategories] = useState(() => new Set());

  const loadCategories = useCallback(async () => {
    try {
      const data = await api.get("/categories/tree");
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load categories", error);
      setCategories([]);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

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

  const removeCategory = async (code) => {
    if (!window.confirm("Delete this category?")) return;
    try {
      await api.delete(`/categories/${code}`);
      setExpandedCategories((previous) => {
        const next = new Set(previous);
        next.delete(code);
        return next;
      });
      await loadCategories();
    } catch (error) {
      console.error("Failed to delete category", error);
    }
  };

  const renderCategoryRow = (category, isChild = false) => {
    const children = Array.isArray(category.children) ? category.children : [];
    const isExpanded = expandedCategories.has(category.code);

    return (
      <tr key={category.code} className={isChild ? "category-child-row" : "category-parent-row"}>
        <td className="code">{category.code}</td>
        <td className="name">
          <div className={isChild ? "category-name category-name-child" : "category-name"}>
            {isChild && <span className="category-tree-branch" aria-hidden="true" />}
            {category.name}
          </div>
        </td>
        <td>
          <span className={isChild ? "badge sub" : "badge main"}>
            {isChild ? "Subcategory" : "Main"}
          </span>
        </td>
        <td>{isChild ? category.parent : "-"}</td>
        <td>
          <div className="category-list-actions">
            {!isChild && (
              <button
                type="button"
                className="category-toggle-btn"
                onClick={() => toggleCategory(category.code)}
                aria-expanded={isExpanded}
                disabled={children.length === 0}
              >
                {children.length === 0 ? "No subcategories" : isExpanded ? "Collapse" : "Expand"}
              </button>
            )}
            <button className="edit-btn" onClick={() => navigate(`/admin/categories/edit/${category.code}`)}>
              Edit
            </button>
            <button className="delete-btn" onClick={() => removeCategory(category.code)}>
              Delete
            </button>
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className="category-list-page">
      <div className="category-list-header">
        <div>
          <div className="category-list-title">Category Management</div>
          <div className="category-list-subtitle">Manage all your categories and subcategories</div>
        </div>

        <div className="category-list-header-actions">
          <button className="category-list-back-btn" onClick={() => navigate("/dashboard")}>
            Back
          </button>
          <button className="category-list-add-btn" onClick={() => navigate("/admin/categories/add")}>
            + Add Category
          </button>
        </div>
      </div>

      <div className="category-list-table-wrapper">
        <table className="category-list-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Name</th>
              <th>Type</th>
              <th>Parent</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {categories.length === 0 ? (
              <tr>
                <td colSpan="5" className="category-list-empty">No categories found</td>
              </tr>
            ) : categories.flatMap((category) => {
              const children = Array.isArray(category.children) ? category.children : [];
              const isExpanded = expandedCategories.has(category.code);
              const rows = [renderCategoryRow(category)];

              if (isExpanded) {
                rows.push(
                  ...children.map((child) => renderCategoryRow(child, true))
                );
              }

              return rows;
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
}

export default CategoryList;
