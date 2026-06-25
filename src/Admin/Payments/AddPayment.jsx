import "./AddPayment.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../Utils/api";

function AddPayment() {
  const navigate = useNavigate();

  const [tourId, setTourId] = useState("");
  const [tour, setTour] = useState(null);
  const [amount, setAmount] = useState("");
  const [txn, setTxn] = useState("");
  const [mode, setMode] = useState("Bank Transfer");
  const [showPopup, setShowPopup] = useState(false);

  const fetchTour = async () => {
    try {
      const data = await api.get(`/tours/${tourId}`);
      setTour(data);
    } catch (error) {
      console.error("Failed to fetch tour", error);
      setTour(null);
      alert("Tour not found");
    }
  };

  const submit = async (e) => {
    e.preventDefault();

    try {
      await api.post("/payments", {
        tourId,
        amount,
        transactionId: txn,
        mode
      });
      setShowPopup(true);
    } catch (error) {
      console.error("Failed to submit payment", error);
      alert("Unable to save payment");
    }
  };

  const resetForm = () => {
    setTourId("");
    setTour(null);
    setAmount("");
    setTxn("");
    setMode("Bank Transfer");
    setShowPopup(false);
  };

  const goToPayments = () => {
    navigate("/admin/payments");
  };

  const viewInvoice = () => {
    navigate(`/admin/payments/invoice/${tourId}`);
  };

  return (
    <div className="add-payment-wrapper">
      <div className="payment-card">
        <div className="payment-header">
          <h2>Add New Payment</h2>

          <button className="back-btn" onClick={() => navigate("/admin/payments")}>
            Back
          </button>
        </div>

        <form onSubmit={submit}>
          <label>Tour ID</label>

          <div className="tour-row">
            <input
              value={tourId}
              onChange={(e) => setTourId(e.target.value)}
              placeholder="Enter Tour ID"
              required
            />

            <button type="button" className="fetch-btn" onClick={fetchTour}>
              Fetch
            </button>
          </div>

          {tour && (
            <div className="tour-details">
              <input value={`Name: ${tour.name || tour.fullName}`} disabled />
              <input value={`Contact: ${tour.contact || tour.mobile}`} disabled />
              <input value={`Destination: ${tour.packageName || tour.packageCode}`} disabled />
              <input value={`Tour Start: ${tour.pickupDate || tour.date}`} disabled />
              <input value={`Total Cost: INR ${tour.totalCost || 0}`} disabled />
            </div>
          )}

          <label>Received Amount</label>
          <input
            type="number"
            placeholder="Enter received amount"
            value={amount}
            required
            onChange={(e) => setAmount(e.target.value)}
          />

          <label>Transaction ID</label>
          <input
            placeholder="Enter transaction ID"
            value={txn}
            required
            onChange={(e) => setTxn(e.target.value)}
          />

          <label>Mode</label>
          <input value={mode} onChange={(e) => setMode(e.target.value)} />

          <button className="submit-btn">Submit Payment</button>
        </form>
      </div>

      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-box">
            <h3>Payment Added Successfully</h3>

            <p className="tour-id-text">
              Tour ID: <strong>{tourId}</strong>
            </p>

            <div className="popup-buttons">
              <button onClick={resetForm}>Add Another</button>
              <button onClick={viewInvoice}>View Invoice</button>
              <button onClick={goToPayments}>Go To Payments</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AddPayment;
