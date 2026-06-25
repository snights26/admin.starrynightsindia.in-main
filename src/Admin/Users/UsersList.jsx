import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../Utils/api";
import "./UsersList.css";

function UsersList() {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [searchId, setSearchId] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const loadUsers = async () => {
    try {
      const data = await api.get("/users");
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load users", error);
      setUsers([]);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = users.filter((u) =>
    (u.userId || u.email || "").toLowerCase().includes(searchId.toLowerCase())
  );

  const confirmDelete = (user) => {
    setSelectedUser(user);
    setShowConfirm(true);
  };

  const deleteUser = async () => {
    if (!selectedUser) return;
    try {
      await api.delete(`/users/${selectedUser.userId || selectedUser.id}`);
      setUsers((prev) => prev.filter((u) => u.id !== selectedUser.id));
    } catch (error) {
      console.error("Failed to delete user", error);
    } finally {
      setShowConfirm(false);
      setSelectedUser(null);
    }
  };

  return (
    <div className="ul-page">
      {showConfirm && (
        <div className="ul-popup">
          <div className="ul-popup-box">
            <h3>Confirm Delete</h3>
            <p>{selectedUser?.name}</p>

            <div className="ul-popup-actions">
              <button onClick={() => setShowConfirm(false)}>Cancel</button>
              <button onClick={deleteUser} className="danger">Delete</button>
            </div>
          </div>
        </div>
      )}

      <div className="ul-header">
        <h2>Users</h2>

        <div>
          <input
            type="text"
            placeholder="Search by User ID..."
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            className="ul-search"
          />

          <button onClick={() => navigate("/dashboard")}>Back</button>
        </div>
      </div>

      <div className="ul-table-box">
        <table>
          <thead>
            <tr>
              <th>User ID</th>
              <th>Name</th>
              <th>Contact</th>
              <th>ID Type</th>
              <th>Location</th>
              <th>Emergency</th>
              <th>Updated</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredUsers.map((u) => (
              <tr key={u.id || u.userId}>
                <td>{u.userId}</td>
                <td>{u.name}</td>
                <td>{u.contact}</td>
                <td>{u.idType}</td>
                <td>{[u.city, u.state].filter(Boolean).join(", ")}</td>
                <td>{u.emergencyContact}</td>
                <td>{u.updatedAt}</td>
                <td className="actions">
                  <button onClick={() => navigate(`/admin/users/edit/${u.userId || u.id}`)}>
                    View
                  </button>

                  <button onClick={() => confirmDelete(u)} className="danger">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default UsersList;
