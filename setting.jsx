import { useState, useEffect } from "react";
import { Form, Button, Container, Alert, Card } from "react-bootstrap";
import { api } from "../api";


const AdminSettings = () => {
  const [email, setEmail] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    // Fetch admin email on load
    api.get("/api/admin/profile", { withCredentials: true })
      .then(response => setEmail(response.data.email))
      .catch(err => setError("Error fetching admin data"));
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!newEmail && !password) {
      setError("Enter at least one field to update");
      return;
    }

    if (password && password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const { data } = await api.put("/api/admin/update-profile", 
        { email: newEmail || email, password },
        { withCredentials: true }
      );
      setMessage(data.success);
      setEmail(newEmail || email); // Update UI
      setNewEmail("");
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err.response?.data?.error || "Update failed");
    }
  };

  return (
    <Container className="mt-4">
      <Card className="p-4 shadow">
        <h3 className="text-center">Admin Settings</h3>
        {message && <Alert variant="success">{message}</Alert>}
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleUpdate}>
          {/* Current Email */}
          <Form.Group className="mb-3">
            <Form.Label>Current Email</Form.Label>
            <Form.Control type="email" value={email} disabled />
          </Form.Group>

          {/* New Email */}
          <Form.Group className="mb-3">
            <Form.Label>New Email (Optional)</Form.Label>
            <Form.Control
              type="email"
              placeholder="Enter new email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
            />
          </Form.Group>

          {/* New Password */}
          <Form.Group className="mb-3">
            <Form.Label>New Password (Optional)</Form.Label>
            <Form.Control
              type="password"
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Form.Group>

          {/* Confirm Password */}
          <Form.Group className="mb-3">
            <Form.Label>Confirm Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </Form.Group>

          {/* Update Button */}
          <Button variant="primary" type="submit" className="w-100">Update Profile</Button>
        </Form>
      </Card>
    </Container>
  );
};

export default AdminSettings;
