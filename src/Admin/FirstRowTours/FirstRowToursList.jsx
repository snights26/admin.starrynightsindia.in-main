import "./FirstRowToursList.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import api from "../../Utils/api";

function FirstRowToursList() {
  const navigate = useNavigate();
  const [selectedList, setSelectedList] = useState([]);
  const [allPackages, setAllPackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState("");
  const [message, setMessage] = useState("");

  const showToast = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 2000);
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const [packages, firstRow] = await Promise.all([
          api.get("/packages"),
          api.get("/first-row-tours")
        ]);
        setAllPackages(Array.isArray(packages) ? packages : []);
        setSelectedList(Array.isArray(firstRow) ? firstRow.map((item) => item.package) : []);
      } catch (error) {
        console.error("Failed to load first row tours", error);
        setAllPackages([]);
        setSelectedList([]);
      }
    };

    loadData();
  }, []);

  const codeOf = (item) => item.packageCode || item.code || item.id;

  const saveList = async (items) => {
    await api.post("/first-row-tours", items.map((item) => ({ packageCode: codeOf(item) })));
  };

  const handleAdd = async () => {
    if (!selectedPackage) return;
    if (selectedList.some((item) => codeOf(item) === selectedPackage)) {
      showToast("Already added");
      return;
    }
    const pkg = allPackages.find((p) => codeOf(p) === selectedPackage);
    if (!pkg) return;
    const nextList = [...selectedList, pkg];
    try {
      await saveList(nextList);
      setSelectedList(nextList);
      setSelectedPackage("");
      showToast("Added successfully");
    } catch (error) {
      console.error("Failed to save first row tours", error);
      showToast("Unable to save");
    }
  };

  const handleRemove = async (id) => {
    const nextList = selectedList.filter((item) => codeOf(item) !== id);
    try {
      await saveList(nextList);
      setSelectedList(nextList);
      showToast("Removed");
    } catch (error) {
      console.error("Failed to remove first row tour", error);
      showToast("Unable to remove");
    }
  };

  const availableOptions = allPackages
    .filter((pkg) => !selectedList.some((item) => codeOf(item) === codeOf(pkg)))
    .map((p) => ({ value: codeOf(p), label: p.title || p.name }));

  return (
    <div className="fr-page">
      <div className="fr-header">
        <div>
          <h1>First Row Tours</h1>
          <p>Manage highlighted packages for homepage</p>
        </div>

        <button className="fr-back-btn" onClick={() => navigate("/dashboard")}>
          Back
        </button>
      </div>

      <div className="fr-add-card">
        <Select
          className="fr-select"
          classNamePrefix="fr"
          placeholder="Search package..."
          options={availableOptions}
          value={selectedPackage ? availableOptions.find((opt) => opt.value === selectedPackage) : null}
          onChange={(selected) => setSelectedPackage(selected?.value || "")}
        />

        <button className="fr-add-btn" onClick={handleAdd}>+ Add Package</button>
      </div>

      <div className="fr-table-card">
        <table className="fr-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Package Name</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {selectedList.map((item, index) => (
              <tr key={codeOf(item)}>
                <td>{index + 1}</td>
                <td>{item.title || item.name}</td>
                <td>
                  <button className="fr-remove-btn" onClick={() => handleRemove(codeOf(item))}>
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {message && <div className="fr-toast">{message}</div>}
    </div>
  );
}

export default FirstRowToursList;
