import "./ScheduledBookingsList.css";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../../Utils/api";

function ScheduledBookingsList() {

  const navigate = useNavigate();
  const [data, setData] = useState([]);

  useEffect(() => {
    const loadTours = async () => {
      try {
        const tours = await api.get("/tours");
        setData(Array.isArray(tours) ? tours : []);
      } catch (error) {
        console.error("Failed to load bookings", error);
        setData([]);
      }
    };

    loadTours();
  }, []);

  const removeBooking = async (tourId) => {
    if (!window.confirm("Remove this booking?")) return;
    try {
      await api.delete(`/tours/${tourId}`);
      setData((prev) => prev.filter((item) => (item.tourId || item.id) !== tourId));
    } catch (error) {
      console.error("Failed to remove booking", error);
    }
  };

  return (
    <div className="sb-page">

      <div className="sb-header">
        <h2>Scheduled Bookings</h2>

        <div className="sb-actions">
          <button onClick={() => navigate("/admin/bookings/new")}>
            + Add
          </button>

          <button onClick={() => navigate("/dashboard")}>
            ← Back
          </button>
        </div>
      </div>

      <div className="sb-table-box">
        <table>
          <thead>
            <tr>
              <th>Tour ID</th>
              <th>Name</th>
              <th>Date</th>
              <th>Contact</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {data.map((b, i) => (
              <tr key={i}>
                <td>{b.tourId || b.id}</td>
                <td>{b.name}</td>
                <td>{b.date || b.pickupDate}</td>
                <td>{b.contact}</td>
                <td className={
  b.status === "Confirmed"
    ? "status-confirmed"
    : "status-pending"
}>
  {b.status}
</td>
                <td>
                  <button onClick={() => navigate(`/admin/bookings/edit/${b.tourId || b.id}`)}>Edit</button>
                  <button onClick={() => removeBooking(b.tourId || b.id)}>Remove</button>
                </td>
              </tr>
            ))}
          </tbody>

        </table>
      </div>

    </div>
  );
}

export default ScheduledBookingsList;
