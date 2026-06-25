import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Toast from "../Common/Toast";
import api from "../Utils/api";
import "./ShowCategory.css";
import { FiTrash2 } from "react-icons/fi";

export default function ShowCategory() {
  const location = useLocation();
  const navigate = useNavigate();
  const { code } = useParams();

  const { categoryName, categoryCode } = location.state || {};
  const resolvedCode = categoryCode || code;

  const [category, setCategory] = useState({ code: resolvedCode, name: categoryName || resolvedCode });
  const [packages, setPackages] = useState([]);
  const [allPackages, setAllPackages] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState("");
  const [selected, setSelected] = useState([]);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(""), 2000);
  };

  const loadData = async () => {
    try {
      const [categoryData, categoryPackages, packageData] = await Promise.all([
        api.get(`/categories/${resolvedCode}`),
        api.get(`/categories/${resolvedCode}/packages`),
        api.get("/packages")
      ]);
      setCategory(categoryData || { code: resolvedCode, name: categoryName || resolvedCode });
      setPackages(Array.isArray(categoryPackages) ? categoryPackages : []);
      setAllPackages(Array.isArray(packageData) ? packageData : []);
    } catch (error) {
      console.error("Failed to load category packages", error);
      setPackages([]);
      setAllPackages([]);
    }
  };

  useEffect(() => {
    loadData();
  }, [resolvedCode]);

  const handleRemove = async (packageCode) => {
    try {
      const data = await api.delete(`/categories/${resolvedCode}/packages/${packageCode}`);
      setPackages(Array.isArray(data) ? data : packages.filter((p) => p.packageCode !== packageCode && p.code !== packageCode));
      showToast("Package removed");
    } catch (error) {
      console.error("Failed to remove package", error);
      showToast("Could not remove package");
    }
  };

  const handleSelect = (packageCode) => {
    setSelected((prev) =>
      prev.includes(packageCode) ? prev.filter((s) => s !== packageCode) : [...prev, packageCode]
    );
  };

  const handleAdd = async () => {
    try {
      let latest = packages;
      for (const packageCode of selected) {
        const data = await api.post(`/categories/${resolvedCode}/packages/${packageCode}`);
        if (Array.isArray(data)) {
          latest = data;
        }
      }
      setPackages(latest);
      setSelected([]);
      setShowModal(false);
      showToast("Package added");
    } catch (error) {
      console.error("Failed to add packages", error);
      showToast("Could not add package");
    }
  };

  const existingCodes = useMemo(
    () => new Set(packages.map((p) => p.packageCode || p.code || p.id)),
    [packages]
  );

  const filteredPackages = packages.filter((p) =>
    (p.name || p.title || "").toLowerCase().includes(search.toLowerCase())
  );

  const availablePackages = allPackages.filter((p) => !existingCodes.has(p.packageCode || p.code || p.id));

  return (
    <div className="category-page">
      <div className="category-header">
        <div className="left-header">
          <button className="back-btn" onClick={() => navigate(-1)}>
            Back
          </button>

          <div>
            <h1>{category.name || category.title}</h1>
            <span className="category-code">{resolvedCode}</span>
          </div>
        </div>

        <button className="add-btn" onClick={() => setShowModal(true)}>
          + Add Packages
        </button>
      </div>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search Package..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="table-container">
        {filteredPackages.map((p) => {
          const packageCode = p.packageCode || p.code || p.id;
          return (
            <div key={packageCode} className="package-card">
              <div className="package-id">{packageCode}</div>
              <div className="package-name">{p.name || p.title}</div>

              <button className="remove-btn" onClick={() => handleRemove(packageCode)}>
                Remove
              </button>

              <button className="delete-icon" onClick={() => handleRemove(packageCode)}>
                <FiTrash2 />
              </button>
            </div>
          );
        })}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>Select Packages</h3>

            <div className="package-list">
              {availablePackages.map((p) => {
                const packageCode = p.packageCode || p.code || p.id;
                return (
                  <label key={packageCode} className="checkbox-row">
                    <input
                      type="checkbox"
                      checked={selected.includes(packageCode)}
                      onChange={() => handleSelect(packageCode)}
                    />
                    {p.name || p.title}
                  </label>
                );
              })}
            </div>

            <div className="modal-actions">
              <button className="submit-btn" onClick={handleAdd}>
                Submit
              </button>

              <button className="close-btn" onClick={() => setShowModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast} />}
    </div>
  );
}
