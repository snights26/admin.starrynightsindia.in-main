import "./PackagesList.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../Utils/api";

function PackagesList() {
  const navigate = useNavigate();
  const [packages, setPackages] = useState([]);

  const loadPackages = async () => {
    try {
      const data = await api.get("/packages");
      setPackages(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load packages", error);
      setPackages([]);
    }
  };

  useEffect(() => {
    loadPackages();
  }, []);

  const removePackage = async (code) => {
    if (!window.confirm("Remove this package?")) return;
    try {
      await api.delete(`/packages/${code}`);
      setPackages((prev) => prev.filter((pkg) => (pkg.packageCode || pkg.code || pkg.id) !== code));
    } catch (error) {
      console.error("Failed to remove package", error);
    }
  };

  return (
    <div className="pkg-list-container">
      <div className="pkg-header">
        <div className="header-left">
          <button onClick={() => navigate("/dashboard")}>Back</button>
          <h2>Packages</h2>
        </div>

        <button onClick={() => navigate("/admin/packages/new")}>+ Add Package</button>
      </div>

      <table className="pkg-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {packages.map((pkg) => {
            const code = pkg.packageCode || pkg.code || pkg.id;
            return (
              <tr key={code}>
                <td>{code}</td>
                <td>{pkg.title || pkg.name}</td>
                <td>
                  <button onClick={() => navigate(`/admin/packages/edit/${code}`)}>Edit</button>
                  <button className="delete-btn" onClick={() => removePackage(code)}>
                    Remove
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default PackagesList;
