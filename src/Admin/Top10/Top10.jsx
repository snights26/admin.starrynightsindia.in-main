import "./Top10.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import api from "../../Utils/api";

function Top10() {
  const navigate = useNavigate();
  const [packages, setPackages] = useState([]);
  const [top10, setTop10] = useState([]);
  const [popup, setPopup] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [packageData, topData] = await Promise.all([api.get("/packages"), api.get("/top10")]);
        const packageList = Array.isArray(packageData) ? packageData : [];
        setPackages(packageList);
        const byPosition = new Map((Array.isArray(topData) ? topData : []).map((item) => [
          item.position,
          item.package?.packageCode || item.package?.code || item.package?.id || ""
        ]));
        setTop10(Array.from({ length: 10 }, (_, i) => ({
          position: i + 1,
          packageId: byPosition.get(i + 1) || ""
        })));
      } catch (error) {
        console.error("Failed to load top 10", error);
        setPackages([]);
        setTop10(Array.from({ length: 10 }, (_, i) => ({ position: i + 1, packageId: "" })));
      }
    };

    loadData();
  }, []);

  const codeOf = (pkg) => pkg.packageCode || pkg.code || pkg.id;

  const getOptions = (currentPosition) => {
    const selectedIds = top10
      .filter((item) => item.position !== currentPosition)
      .map((item) => item.packageId);

    return packages
      .filter((p) => !selectedIds.includes(codeOf(p)))
      .map((p) => ({ value: codeOf(p), label: `${codeOf(p)} - ${p.title || p.name}` }));
  };

  const handleChange = (position, selectedOption) => {
    setTop10((prev) =>
      prev.map((item) => item.position === position ? { ...item, packageId: selectedOption?.value || "" } : item)
    );
  };

  const handleSubmit = async () => {
    const filled = top10.filter((item) => item.packageId);
    if (filled.length !== 10) {
      setPopup({ message: "Please select all 10 packages", type: "error" });
      setTimeout(() => setPopup(null), 2000);
      return;
    }

    try {
      await api.post("/top10", top10);
      setPopup({ message: "Top 10 saved successfully", type: "success" });
      setTimeout(() => setPopup(null), 2000);
    } catch (error) {
      console.error("Failed to save top 10", error);
      setPopup({ message: "Unable to save Top 10", type: "error" });
      setTimeout(() => setPopup(null), 2000);
    }
  };

  return (
    <div className="top10-wrapper">
      <div className="top10-card">
        <div className="top10-header">
          <div className="top10-title">Top 10 Packages</div>
          <button className="top10-back" onClick={() => navigate("/dashboard")}>Back</button>
        </div>

        <div className="top10-list">
          {top10.map((item) => {
            const selectedPackage = packages.find((p) => codeOf(p) === item.packageId);
            return (
              <div key={item.position} className="top10-row">
                <div className="top10-pos">#{item.position}</div>
                <div className="top10-select">
                  <Select
                    options={getOptions(item.position)}
                    value={item.packageId ? {
                      value: item.packageId,
                      label: selectedPackage ? `${codeOf(selectedPackage)} - ${selectedPackage.title || selectedPackage.name}` : item.packageId
                    } : null}
                    onChange={(selected) => handleChange(item.position, selected)}
                    placeholder="Search & Select Package"
                    classNamePrefix="react-select"
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                  />
                </div>
              </div>
            );
          })}
        </div>

        <button className="top10-submit" onClick={handleSubmit}>Submit Top 10</button>
      </div>

      {popup && <div className={`top10-popup ${popup.type}`}>{popup.message}</div>}
    </div>
  );
}

export default Top10;
