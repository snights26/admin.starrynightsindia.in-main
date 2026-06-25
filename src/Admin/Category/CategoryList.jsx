import "./CategoryList.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../Utils/api";

function CategoryList() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await api.get("/categories");
        setCategories(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to load categories", error);
        setCategories([]);
      }
    };

    loadCategories();
  }, []);

  const removeCategory = async (code) => {
    if (!window.confirm("Delete this category?")) return;
    try {
      await api.delete(`/categories/${code}`);
      setCategories((prev) => prev.filter((item) => item.code !== code));
    } catch (error) {
      console.error("Failed to delete category", error);
    }
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
            {categories.map((c) => (
              <tr key={c.code}>
                <td className="code">{c.code}</td>
                <td className="name">{c.name}</td>
                <td>
                  <span className={c.isSub || c.isSubcategory ? "badge sub" : "badge main"}>
                    {c.isSub || c.isSubcategory ? "Subcategory" : "Main"}
                  </span>
                </td>
                <td>{c.parent}</td>
                <td>
                  <div className="category-list-actions">
                    <button className="edit-btn" onClick={() => navigate(`/admin/categories/edit/${c.code}`)}>
                      Edit
                    </button>
                    <button className="delete-btn" onClick={() => removeCategory(c.code)}>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}

export default CategoryList;
