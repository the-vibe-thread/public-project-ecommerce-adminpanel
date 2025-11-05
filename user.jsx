import { useState, useEffect } from "react";
import { Table, Form, InputGroup, Button, Spinner, Modal, Alert } from "react-bootstrap";
import { FaSearch, FaEye, FaTrash } from "react-icons/fa";
import { api } from "../api";

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch users from backend
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await api.get("/api/admin/users", { withCredentials: true });
        setUsers(data);
      } catch (error) {
        console.error("Error fetching users:", error.response?.data?.message || error.message);
        setError(error.response?.data?.message || "Failed to fetch users.");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // Handle search filtering
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase())
  );

  // Open View User Modal
  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  // Open Delete Confirmation Modal
  const handleDeleteUser = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  // Delete User Function
  const confirmDeleteUser = async () => {
    if (!selectedUser) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/api/admin/users/${selectedUser._id}`, { withCredentials: true });

      // Remove the deleted user from the state
      setUsers(prevUsers => prevUsers.filter(user => user._id !== selectedUser._id));

      setShowDeleteModal(false);
      setSelectedUser(null);
    } catch (error) {
      console.error("Error deleting user:", error.response?.data?.message || error.message);
      setError("Failed to delete user.");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <h2>Users Management</h2>

      {/* Error Message */}
      {error && <Alert variant="danger">{error}</Alert>}

      {/* Search Bar */}
      <InputGroup className="mb-3">
        <InputGroup.Text><FaSearch /></InputGroup.Text>
        <Form.Control
          type="text"
          placeholder="Search users by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </InputGroup>

      {/* Loading Spinner */}
      {loading && <Spinner animation="border" variant="primary" />}

      {/* Users Table */}
      {!loading && (
        <Table striped bordered hover responsive>
          <thead className="bg-dark text-white">
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user, index) => (
              <tr key={user._id}>
                <td>{index + 1}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>{user.isActive ? "Active" : "Inactive"}</td>
                <td>
                  <Button variant="info" size="sm" onClick={() => handleViewUser(user)}>
                    <FaEye /> View
                  </Button>{" "}
                  <Button variant="danger" size="sm" onClick={() => handleDeleteUser(user)}>
                    <FaTrash /> Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* User Details Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>User Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedUser && (
            <div>
              <p><strong>Name:</strong> {selectedUser.name}</p>
              <p><strong>Email:</strong> {selectedUser.email}</p>
              <p><strong>Role:</strong> {selectedUser.role}</p>
              <p><strong>Status:</strong> {selectedUser.isActive ? "Active" : "Inactive"}</p>
              <p><strong>Created At:</strong> {new Date(selectedUser.createdAt).toLocaleString()}</p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Close</Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedUser && (
            <p>Are you sure you want to delete user <strong>{selectedUser.name}</strong>?</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
          <Button variant="danger" onClick={confirmDeleteUser} disabled={deleteLoading}>
            {deleteLoading ? "Deleting..." : "Delete"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdminUsersPage;
