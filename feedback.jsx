import{ useState, useEffect } from "react";
import { Table, Container, Row, Col, Button, Alert } from "react-bootstrap";
import { api } from "../api";

const AdminFeedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [errorMsg, setErrorMsg] = useState(""); // Add a state for error messages

  useEffect(() => {
    // Fetch feedback from the backend API
    const fetchFeedback = async () => {
      try {
        const res = await api.get("/api/feedback/");
        setFeedbacks(res.data.feedbacks);
      } catch (error) {
        console.error("Error fetching feedback:", error);
        setErrorMsg("Failed to fetch feedback."); // Set error message on catch
      }
    };

    fetchFeedback();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this feedback?")) return;
    try {
      const res = await api.delete(`/api/feedback/${id}`);
      if (res.data.success) {
        // Remove deleted feedback from the state
        setFeedbacks(feedbacks.filter((feedback) => feedback._id !== id));
      } else {
        alert("Error deleting feedback");
      }
    } catch (error) {
      console.error("Error deleting feedback:", error);
      setErrorMsg("Failed to delete feedback."); // Set error message on catch
    }
  };

  return (
    <Container className="mt-4">
      <Row>
        <Col md={12}>
          <h3>Admin Panel - User Feedback</h3>
          {errorMsg && <Alert variant="danger">{errorMsg}</Alert>} {/* Show error message if exists */}
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Message</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {feedbacks.map((feedback) => (
                <tr key={feedback._id}>
                  <td>{feedback.name}</td>
                  <td>{feedback.email}</td>
                  <td>{feedback.message}</td>
                  <td>
                    <Button
                      variant="danger"
                      onClick={() => handleDelete(feedback._id)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminFeedback;
