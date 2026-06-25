import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../Utils/api";
import { resolveAssetUrl } from "../../Utils/fileUpload";
import "./UserLikedPackages.css";

function packageImage(pkg = {}) {
  return resolveAssetUrl(pkg.image || pkg.thumbnailUrl || "");
}

async function loadLikedPackageReport() {
  const directReport = await api.get("/users/liked-packages/report").catch(() => []);
  if (Array.isArray(directReport) && directReport.some((user) => Array.isArray(user.likedPackages) && user.likedPackages.length > 0)) {
    return directReport;
  }

  const users = await api.get("/users").catch(() => []);
  if (!Array.isArray(users) || users.length === 0) {
    return Array.isArray(directReport) ? directReport : [];
  }

  const detailedUsers = await Promise.all(
    users.map(async (user) => {
      const id = user.id || user.userId || user.email;
      if (!id) {
        return user;
      }
      const detail = await api.get(`/users/${encodeURIComponent(id)}`).catch(() => user);
      return {
        ...user,
        ...detail,
        likedPackages: Array.isArray(detail?.likedPackages)
          ? detail.likedPackages
          : Array.isArray(user.likedPackages)
            ? user.likedPackages
            : []
      };
    })
  );

  return detailedUsers;
}

export default function UserLikedPackages() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    loadLikedPackageReport()
      .then((data) => {
        if (active) {
          setRows(Array.isArray(data) ? data : []);
        }
      })
      .catch((error) => {
        console.error("Failed to load user liked packages", error);
        if (active) {
          setRows([]);
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return rows;
    }
    return rows.filter((user) => {
      const haystack = [
        user.userId,
        user.name,
        user.email,
        ...(user.likedPackages || []).flatMap((pkg) => [pkg.packageCode, pkg.title, pkg.name])
      ].filter(Boolean).join(" ").toLowerCase();
      return haystack.includes(query);
    });
  }, [rows, search]);

  return (
    <main className="ulp-page">
      <header className="ulp-header">
        <div>
          <span>User Preference Report</span>
          <h1>User Liked Packages</h1>
          <p>Review bucket-list package interest by user before follow-up or booking conversion.</p>
        </div>
        <div className="ulp-actions">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search user or package..."
          />
          <button type="button" onClick={() => navigate("/dashboard")}>Back</button>
        </div>
      </header>

      <section className="ulp-list">
        {loading && <div className="ulp-empty">Loading user package preferences...</div>}

        {!loading && filteredRows.length === 0 && (
          <div className="ulp-empty">No liked packages found for the selected search.</div>
        )}

        {!loading && filteredRows.map((user) => {
          const likedPackages = Array.isArray(user.likedPackages) ? user.likedPackages : [];
          return (
            <article className="ulp-user-card" key={user.id || user.userId}>
              <div className="ulp-user-summary">
                <div className="ulp-avatar">{(user.name || user.userId || "U").charAt(0).toUpperCase()}</div>
                <div>
                  <h2>{user.name || "Unnamed User"}</h2>
                  <p><strong>{user.userId}</strong> <span>{user.email}</span></p>
                  {user.contact && <small>{user.contact}</small>}
                </div>
                <span className="ulp-count">{likedPackages.length} liked</span>
              </div>

              {likedPackages.length > 0 ? (
                <div className="ulp-package-row">
                  {likedPackages.map((pkg) => (
                    <button
                      type="button"
                      className="ulp-package-card"
                      key={pkg.packageCode || pkg.id}
                      onClick={() => navigate(`/admin/packages/edit/${pkg.packageCode || pkg.code || pkg.id}`)}
                    >
                      <div className="ulp-package-media">
                        {packageImage(pkg) ? (
                          <img src={packageImage(pkg)} alt={pkg.title || pkg.name} />
                        ) : (
                          <span>{(pkg.title || pkg.name || "P").charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                      <div>
                        <strong>{pkg.title || pkg.name || pkg.packageCode}</strong>
                        <span>{pkg.packageCode || pkg.code}</span>
                        <small>{pkg.duration || (pkg.days ? `${pkg.days} Days` : "Duration pending")}</small>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="ulp-no-packages">No packages liked yet.</div>
              )}
            </article>
          );
        })}
      </section>
    </main>
  );
}
