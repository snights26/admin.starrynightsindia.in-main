import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../Utils/api";
import Pagination, { usePagination } from "../../Common/Pagination";
import BackButton from "../../Common/BackButton";
import "./PaymentsList.css";

export default function PaymentsList() {

  const navigate = useNavigate();

  const [payments, setPayments] = useState([]);
  const { page, pageCount, pageItems, setPage } = usePagination(payments);

  useEffect(() => {

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });

    const loadPayments = async () => {
      try {
        const data = await api.get("/payments");
        setPayments(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to load payments", error);
        setPayments([]);
      }
    };

    loadPayments();

  }, []);

  const handleDownload = (tourId) => {

    navigate(`/admin/payments/invoice/${tourId}`);

  };

  const deleteEntry = async (id) => {

    if (window.confirm("Delete this payment entry?")) {

      try {
        await api.delete(`/payments/${id}`);
        setPayments(payments.filter((p) => p.id !== id));
      } catch (error) {
        console.error("Failed to delete payment", error);
      }

    }

  };

  return (

    <div className="payments-page">

      {/* HEADER */}

      <div className="payments-header">

        <h1>💳 Payments</h1>

        <p>Manage customer payments & download invoices</p>

      </div>

      {/* ADD PAYMENT BUTTON */}

      <div className="payments-actions">

        <button
          className="add-payment-btn"
          onClick={() => navigate("/admin/payments/new")}
        >
          + Add New Payment
        </button>

      </div>

      {/* TABLE CARD */}

      <div className="payments-card">

        <table className="payments-table">

          <thead>

            <tr>

              <th>Tour ID</th>
              <th>Payment Date</th>
              <th>Total</th>
              <th>Paid</th>
              <th>Due</th>
              <th>Invoice</th>
              <th>Action</th>

            </tr>

          </thead>

          <tbody>

            {pageItems.map((payment) => {

              const dueAmount = Number(payment.totalAmount || 0) - Number(payment.paidAmount || 0);

              return (

                <tr key={payment.id}>

                  <td>{payment.tourId}</td>

                  <td>{payment.paymentDate}</td>

                  <td>₹ {payment.totalAmount}</td>

                  <td>₹ {payment.paidAmount}</td>

                  <td>

                    <span
                      className={
                        dueAmount > 0
                          ? "status pending"
                          : "status paid"
                      }
                    >
                      ₹ {dueAmount}
                    </span>

                  </td>

                  <td>

                    <button
                      className="invoice-btn"
                      onClick={() =>
                        handleDownload(payment.tourId)
                      }
                    >
                      View
                    </button>

                  </td>

                  <td>

                    <button
                      className="delete-btn"
                      onClick={() =>
                        deleteEntry(payment.id)
                      }
                    >
                      Delete
                    </button>

                  </td>

                </tr>

              );

            })}

          </tbody>

        </table>

      </div>
      <Pagination page={page} pageCount={pageCount} setPage={setPage} itemCount={payments.length} label="payments" />

      {/* BACK BUTTON */}

      <div className="payments-topbar">

        <BackButton />

      </div>

    </div>

  );

}
