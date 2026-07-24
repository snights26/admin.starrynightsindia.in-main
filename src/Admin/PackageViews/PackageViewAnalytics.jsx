import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaChartLine, FaEye, FaGhost, FaUserCheck } from "react-icons/fa";
import api from "../../Utils/api";
import { categoryCode, categoryNames, parentCategoriesFromTree, subcategoriesForParent } from "../../Utils/categoryFilters";
import "./PackageViewAnalytics.css";

const formatDate = (value) => value ? new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium", timeStyle: "short"
}).format(new Date(value)) : "—";

export default function PackageViewAnalytics() {
  const navigate = useNavigate();
  const [data, setData] = useState({ histories: [], popularPackages: [], summary: {} });
  const [categoryTree, setCategoryTree] = useState([]);
  const [filters, setFilters] = useState({ viewerType: "ALL", parentCategory: "", subcategory: "", userSearch: "", packageSearch: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/categories/tree").then((tree) => setCategoryTree(Array.isArray(tree) ? tree : [])).catch(() => setCategoryTree([]));
  }, []);

  const parentCategories = useMemo(() => parentCategoriesFromTree(categoryTree), [categoryTree]);
  const subcategories = useMemo(() => subcategoriesForParent(parentCategories, filters.parentCategory), [filters.parentCategory, parentCategories]);

  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(() => {
      setLoading(true);
      const params = new URLSearchParams(filters);
      api.get(`/package-views/analytics?${params.toString()}`)
        .then((response) => {
          if (active) setData({
            histories: Array.isArray(response?.histories) ? response.histories : [],
            popularPackages: Array.isArray(response?.popularPackages) ? response.popularPackages : [],
            summary: response?.summary || {}
          });
        })
        .catch(() => active && setData({ histories: [], popularPackages: [], summary: {} }))
        .finally(() => active && setLoading(false));
    }, 220);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [filters]);

  const updateFilter = (key, value) => setFilters((current) => ({
    ...current,
    [key]: value,
    ...(key === "parentCategory" ? { subcategory: "" } : {})
  }));

  return (
    <main className="pva-page">
      <header className="pva-header">
        <div>
          <span>System Management Suite</span>
          <h1>Package View Analytics</h1>
          <p>Understand logged-in and guest package interest from one durable view-history source.</p>
        </div>
        <button type="button" className="pva-back" onClick={() => navigate("/dashboard")}>Back</button>
      </header>

      <section className="pva-filters" aria-label="Package view filters">
        <label><span>History type</span><select value={filters.viewerType} onChange={(event) => updateFilter("viewerType", event.target.value)}><option value="ALL">All viewers</option><option value="USER">Logged-in users</option><option value="GUEST">Guest users</option></select></label>
        <label><span>Parent category</span><select value={filters.parentCategory} onChange={(event) => updateFilter("parentCategory", event.target.value)}><option value="">All parent categories</option>{parentCategories.map((category) => <option key={category.code} value={category.code}>{category.name}</option>)}</select></label>
        <label><span>Subcategory</span><select value={filters.subcategory} onChange={(event) => updateFilter("subcategory", event.target.value)}><option value="">All subcategories</option>{subcategories.map((category) => { const code = categoryCode(category); return <option key={code} value={code}>{category.name || category.categoryName || code}</option>; })}</select></label>
        <label><span>User search</span><input value={filters.userSearch} onChange={(event) => updateFilter("userSearch", event.target.value)} placeholder="Name, ID, or email" /></label>
        <label><span>Package search</span><input value={filters.packageSearch} onChange={(event) => updateFilter("packageSearch", event.target.value)} placeholder="Package name or code" /></label>
      </section>

      <section className="pva-summary">
        <article><FaEye /><span>Total views</span><strong>{data.summary.totalViews || 0}</strong></article>
        <article><FaUserCheck /><span>Logged-in histories</span><strong>{data.summary.loggedInRecords || 0}</strong></article>
        <article><FaGhost /><span>Guest histories</span><strong>{data.summary.ghostRecords || 0}</strong></article>
      </section>

      <section className="pva-panel">
        <div className="pva-panel__heading"><div><FaChartLine /><h2>Most Viewed Packages</h2></div><span>Combined logged-in and guest views</span></div>
        {data.popularPackages.length === 0 ? <div className="pva-empty">No package views match these filters.</div> : (
          <div className="pva-popular-grid">
            {data.popularPackages.map((item) => <article key={item.packageCode}><span>{item.packageCode}</span><strong>{item.name || item.title}</strong><small>{categoryNames(item, "parent")} · {categoryNames(item, "subcategory")}</small><b>{item.totalViews || 0} views</b></article>)}
          </div>
        )}
      </section>

      <section className="pva-panel">
        <div className="pva-panel__heading"><div><FaEye /><h2>View History</h2></div><span>{loading ? "Loading..." : `${data.histories.length} records`}</span></div>
        {!loading && data.histories.length === 0 ? <div className="pva-empty">No package views found for the selected filters.</div> : (
          <div className="pva-table-wrap"><table className="pva-table"><thead><tr><th>Viewer</th><th>Package</th><th>Parent Category</th><th>Subcategory</th><th>Views</th><th>First Viewed</th><th>Last Viewed</th></tr></thead><tbody>
            {data.histories.map((item) => <tr key={item.id}><td>{item.viewerType === "USER" ? <><strong>{item.userName || "Unknown user"}</strong><small>{item.userId}</small></> : <><strong>Ghost user</strong><small>{item.sessionIdentifier || "Session unavailable"}</small></>}</td><td><strong>{item.name || item.title}</strong><small>{item.packageCode}</small></td><td>{categoryNames(item, "parent")}</td><td>{categoryNames(item, "subcategory")}</td><td><b>{item.viewCount || 0}</b></td><td>{formatDate(item.firstViewedAt)}</td><td>{formatDate(item.lastViewedAt)}</td></tr>)}
          </tbody></table></div>
        )}
      </section>
    </main>
  );
}
