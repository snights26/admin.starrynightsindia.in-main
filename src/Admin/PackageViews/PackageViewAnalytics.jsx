import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaChartLine, FaCopy, FaEye, FaGhost, FaSearch, FaUserCheck } from "react-icons/fa";
import { Modal } from "../../Common";
import api from "../../Utils/api";
import "./PackageViewAnalytics.css";

const EMPTY_PAGE = { content: [], page: 0, size: 10, totalElements: 0, totalPages: 0 };
const MAIN_FILTERS = { search: "", viewerType: "ALL", fromDate: "", toDate: "", sortBy: "lastActivityAt", sortDirection: "DESC" };
const DETAIL_FILTERS = { search: "", fromDate: "", toDate: "", sortBy: "lastViewedAt", sortDirection: "DESC" };

const formatDate = (value) => value ? new Intl.DateTimeFormat("en-IN", {
  dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata"
}).format(new Date(value)) : "—";

const viewerLabel = (viewer) => viewer?.viewerType === "USER" ? (viewer.viewerName || "Unknown user") : "Guest user";
const viewerTypeLabel = (viewer) => viewer?.viewerType === "USER" ? "Registered user" : "Guest user";

function pageParameters(values) {
  const params = new URLSearchParams();
  Object.entries(values).forEach(([key, value]) => {
    if (value !== "" && value !== undefined && value !== null) params.set(key, value);
  });
  return params;
}

function Pagination({ data, onPageChange, onSizeChange, label }) {
  const totalPages = Math.max(data.totalPages || 0, 1);
  return (
    <div className="pva-pagination" aria-label={`${label} pagination`}>
      <span>{data.totalElements || 0} {data.totalElements === 1 ? "viewer" : label}</span>
      <label>
        Rows
        <select value={data.size || 10} onChange={(event) => onSizeChange(Number(event.target.value))}>
          {[10, 25, 50, 100].map((size) => <option key={size} value={size}>{size}</option>)}
        </select>
      </label>
      <button type="button" disabled={(data.page || 0) === 0} onClick={() => onPageChange((data.page || 0) - 1)}>Previous</button>
      <span>Page {(data.page || 0) + 1} of {totalPages}</span>
      <button type="button" disabled={(data.page || 0) + 1 >= totalPages} onClick={() => onPageChange((data.page || 0) + 1)}>Next</button>
    </div>
  );
}

export default function PackageViewAnalytics() {
  const navigate = useNavigate();
  const [viewerPage, setViewerPage] = useState(EMPTY_PAGE);
  const [mainFilters, setMainFilters] = useState(MAIN_FILTERS);
  const [mainPage, setMainPage] = useState(0);
  const [mainSize, setMainSize] = useState(10);
  const [mainLoading, setMainLoading] = useState(true);
  const [mainError, setMainError] = useState("");
  const [selectedViewer, setSelectedViewer] = useState(null);
  const [detailPage, setDetailPage] = useState(EMPTY_PAGE);
  const [detailFilters, setDetailFilters] = useState(DETAIL_FILTERS);
  const [detailPageNumber, setDetailPageNumber] = useState(0);
  const [detailSize, setDetailSize] = useState(10);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");

  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(() => {
      setMainLoading(true);
      setMainError("");
      const params = pageParameters({ ...mainFilters, page: mainPage, size: mainSize });
      api.get(`/package-views/viewers?${params.toString()}`)
        .then((response) => active && setViewerPage({ ...EMPTY_PAGE, ...(response || {}) }))
        .catch(() => {
          if (active) {
            setViewerPage(EMPTY_PAGE);
            setMainError("Unable to load view history. Please try again.");
          }
        })
        .finally(() => active && setMainLoading(false));
    }, 250);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [mainFilters, mainPage, mainSize]);

  useEffect(() => {
    if (!selectedViewer) return undefined;
    let active = true;
    const timer = window.setTimeout(() => {
      setDetailLoading(true);
      setDetailError("");
      const params = pageParameters({
        ...detailFilters,
        viewerType: selectedViewer.viewerType,
        page: detailPageNumber,
        size: detailSize
      });
      api.get(`/package-views/viewers/${encodeURIComponent(selectedViewer.viewerIdentifier)}/packages?${params.toString()}`)
        .then((response) => active && setDetailPage({ ...EMPTY_PAGE, ...(response || {}) }))
        .catch(() => {
          if (active) {
            setDetailPage(EMPTY_PAGE);
            setDetailError("Unable to load this viewer's package history. Please try again.");
          }
        })
        .finally(() => active && setDetailLoading(false));
    }, 180);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [selectedViewer, detailFilters, detailPageNumber, detailSize]);

  const updateMainFilter = (key, value) => {
    setMainPage(0);
    setMainFilters((current) => ({ ...current, [key]: value }));
  };

  const updateDetailFilter = (key, value) => {
    setDetailPageNumber(0);
    setDetailFilters((current) => ({ ...current, [key]: value }));
  };

  const openViewerHistory = (viewer) => {
    setSelectedViewer(viewer);
    setDetailFilters(DETAIL_FILTERS);
    setDetailPageNumber(0);
    setDetailSize(10);
    setDetailPage(EMPTY_PAGE);
  };

  const closeViewerHistory = () => {
    setSelectedViewer(null);
    setDetailPage(EMPTY_PAGE);
    setDetailError("");
  };

  const copyGuestId = async (guestId) => {
    try {
      await navigator.clipboard?.writeText(guestId);
    } catch {
      // Clipboard access can be unavailable in a non-secure local browser context.
    }
  };

  return (
    <main className="pva-page">
      <header className="pva-header">
        <div>
          <span>System Management Suite</span>
          <h1>Package View Analytics</h1>
          <p>Review registered and guest activity by viewer, then drill into their package history.</p>
        </div>
        <button type="button" className="pva-back" onClick={() => navigate("/dashboard")}>Back</button>
      </header>

      <section className="pva-filters" aria-label="Viewer history filters">
        <label className="pva-search-field"><span><FaSearch /> Search viewers</span><input value={mainFilters.search} onChange={(event) => updateMainFilter("search", event.target.value)} placeholder="Name, user ID, email, or guest UUID" /></label>
        <label><span>Viewer type</span><select value={mainFilters.viewerType} onChange={(event) => updateMainFilter("viewerType", event.target.value)}><option value="ALL">All viewers</option><option value="USER">Registered users</option><option value="GUEST">Guest users</option></select></label>
        <label><span>From activity date</span><input type="date" value={mainFilters.fromDate} onChange={(event) => updateMainFilter("fromDate", event.target.value)} /></label>
        <label><span>To activity date</span><input type="date" value={mainFilters.toDate} onChange={(event) => updateMainFilter("toDate", event.target.value)} /></label>
        <label><span>Sort viewers by</span><select value={mainFilters.sortBy} onChange={(event) => updateMainFilter("sortBy", event.target.value)}><option value="lastActivityAt">Last activity</option><option value="firstActivityAt">First activity</option><option value="totalViewCount">Total views</option><option value="distinctPackageCount">Packages viewed</option><option value="viewerName">Viewer name</option><option value="viewerIdentifier">Viewer ID</option></select></label>
        <label><span>Direction</span><select value={mainFilters.sortDirection} onChange={(event) => updateMainFilter("sortDirection", event.target.value)}><option value="DESC">Newest / highest first</option><option value="ASC">Oldest / lowest first</option></select></label>
        <button type="button" className="pva-reset" onClick={() => { setMainFilters(MAIN_FILTERS); setMainPage(0); }}>Reset filters</button>
      </section>

      <section className="pva-panel">
        <div className="pva-panel__heading"><div><FaChartLine /><h2>View History</h2></div><span>{mainLoading ? "Loading…" : `${viewerPage.totalElements || 0} ${viewerPage.totalElements === 1 ? "viewer" : "viewers"}`}</span></div>
        {mainError && <div className="pva-error" role="alert">{mainError}</div>}
        {mainLoading ? <div className="pva-empty">Loading viewer history…</div> : viewerPage.content.length === 0 ? <div className="pva-empty">No view history found.</div> : (
          <div className="pva-table-wrap"><table className="pva-table"><thead><tr><th>Viewer</th><th>Viewer ID</th><th>Viewer Type</th><th>Packages Viewed</th><th>Total Views</th><th>First Activity</th><th>Last Activity</th><th>Action</th></tr></thead><tbody>
            {viewerPage.content.map((viewer) => <tr key={`${viewer.viewerType}-${viewer.viewerIdentifier}`}><td><strong>{viewerLabel(viewer)}</strong>{viewer.viewerType === "USER" && <small>Registered account</small>}</td><td><span className="pva-identifier" title={viewer.viewerIdentifier}>{viewer.viewerIdentifier}</span>{viewer.viewerType === "GUEST" && <button type="button" className="pva-copy" onClick={() => copyGuestId(viewer.viewerIdentifier)} title="Copy guest UUID" aria-label="Copy guest UUID"><FaCopy /></button>}</td><td><span className={`pva-type pva-type--${viewer.viewerType?.toLowerCase()}`}>{viewerTypeLabel(viewer)}</span></td><td><button type="button" className="pva-count-link" onClick={() => openViewerHistory(viewer)}>{viewer.distinctPackageCount}</button></td><td><b>{viewer.totalViewCount}</b></td><td>{formatDate(viewer.firstActivityAt)}</td><td>{formatDate(viewer.lastActivityAt)}</td><td><button type="button" className="pva-view-action" onClick={() => openViewerHistory(viewer)}><FaEye /> View History</button></td></tr>)}
          </tbody></table></div>
        )}
        {!mainLoading && viewerPage.totalElements > 0 && <Pagination data={viewerPage} label="viewers" onPageChange={setMainPage} onSizeChange={(size) => { setMainSize(size); setMainPage(0); }} />}
      </section>

      <Modal open={Boolean(selectedViewer)} onClose={closeViewerHistory} title="Viewer Package History" className="pva-detail-modal" actions={<button type="button" className="pva-back" onClick={closeViewerHistory}>Close</button>}>
        {selectedViewer && <>
          <section className="pva-viewer-summary">
            <div><span>Viewer</span><strong>{viewerLabel(selectedViewer)}</strong></div>
            <div><span>Viewer ID</span><strong className="pva-viewer-summary__id">{selectedViewer.viewerIdentifier}</strong></div>
            <div><span>Type</span><strong>{viewerTypeLabel(selectedViewer)}</strong></div>
            <div><span>Packages viewed</span><strong>{selectedViewer.distinctPackageCount}</strong></div>
            <div><span>Total views</span><strong>{selectedViewer.totalViewCount}</strong></div>
            <div><span>Last activity</span><strong>{formatDate(selectedViewer.lastActivityAt)}</strong></div>
          </section>

          <section className="pva-detail-filters" aria-label="Selected viewer package history filters">
            <label className="pva-search-field"><span><FaSearch /> Search packages</span><input value={detailFilters.search} onChange={(event) => updateDetailFilter("search", event.target.value)} placeholder="Package name or ID" /></label>
            <label><span>From date</span><input type="date" value={detailFilters.fromDate} onChange={(event) => updateDetailFilter("fromDate", event.target.value)} /></label>
            <label><span>To date</span><input type="date" value={detailFilters.toDate} onChange={(event) => updateDetailFilter("toDate", event.target.value)} /></label>
            <label><span>Sort by</span><select value={detailFilters.sortBy} onChange={(event) => updateDetailFilter("sortBy", event.target.value)}><option value="lastViewedAt">Last viewed</option><option value="firstViewedAt">First viewed</option><option value="viewCount">View count</option><option value="packageName">Package name</option><option value="packageCode">Package ID</option></select></label>
            <label><span>Direction</span><select value={detailFilters.sortDirection} onChange={(event) => updateDetailFilter("sortDirection", event.target.value)}><option value="DESC">Newest / highest first</option><option value="ASC">Oldest / lowest first</option></select></label>
            <button type="button" className="pva-reset" onClick={() => { setDetailFilters(DETAIL_FILTERS); setDetailPageNumber(0); }}>Reset filters</button>
          </section>

          {detailError && <div className="pva-error" role="alert">{detailError}</div>}
          {detailLoading ? <div className="pva-empty">Loading package history…</div> : detailPage.content.length === 0 ? <div className="pva-empty">No package history found for this viewer.</div> : <div className="pva-table-wrap"><table className="pva-table pva-detail-table"><thead><tr><th>Package</th><th>Parent Category</th><th>Subcategory</th><th>View Count</th><th>First Viewed</th><th>Last Viewed</th></tr></thead><tbody>{detailPage.content.map((item) => <tr key={item.packageId}><td><strong>{item.packageName}</strong><small>{item.packageCode}</small></td><td>{item.parentCategories || "—"}</td><td>{item.subcategories || "—"}</td><td><b>{item.viewCount}</b></td><td>{formatDate(item.firstViewedAt)}</td><td>{formatDate(item.lastViewedAt)}</td></tr>)}</tbody></table></div>}
          {!detailLoading && detailPage.totalElements > 0 && <Pagination data={detailPage} label="packages" onPageChange={setDetailPageNumber} onSizeChange={(size) => { setDetailSize(size); setDetailPageNumber(0); }} />}
        </>}
      </Modal>
    </main>
  );
}
