import { useNavigate } from "react-router-dom";
import ScheduledBookings from "../Admin/Dashboard/ScheduledBookings";
import CategoriesGrid from "../Admin/Dashboard/CategoriesGrid";
import AdminModulesPanel from "../Admin/Dashboard/AdminModulesPanel";
import { clearSession } from "../Utils/auth";
import "./Dashboard.css";

function Dashboard() {

  const navigate = useNavigate();

  const handleLogout = () => {
    clearSession();
    navigate("/");
  };

  return (

    <div className="dbx-wrapper">

      {/* HEADER */}
      <div className="dbx-header">

        <div className="dbx-title">
          <h2>Operations Command Center</h2>
          <span>Unified control for bookings, tours, and business operations</span>
        </div>

        <button
          className="dbx-logout-btn"
          onClick={handleLogout}
        >
          Logout
        </button>

      </div>

      {/* MAIN */}
      <div className="dbx-container">

        {/* LEFT */}
        <div className="dbx-left">

          <div className="dbx-card dbx-scroll">
            <ScheduledBookings />
          </div>

          


          <div className="dbx-card dbx-category-shell">
            <CategoriesGrid />
          </div>

        </div>

        {/* RIGHT */}
        <div className="dbx-right">

          <div className="dbx-card dbx-sticky">
            <AdminModulesPanel />
          </div>

        </div>

      </div>

    </div>

  );
}

export default Dashboard;
