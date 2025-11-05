import React, { useState } from "react";
import { Container, Row, Col, Button, Form, Spinner, Toast } from "react-bootstrap";
import { api } from "../api";
import dayjs from "dayjs";

export default function AdminBulkInvoices() {
  const [period, setPeriod] = useState("month");
  const [date, setDate] = useState(dayjs().format("YYYY-MM-DD")); // Default: today
  const [status, setStatus] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [error, setError] = useState("");

  const handleDownload = async () => {
    setLoading(true);
    setError("");
    setShowToast(false);

    try {
      // Build query string
      const params = new URLSearchParams();
      params.append("period", period);
      if (period === "month") params.append("date", date);
      if (status) params.append("status", status);
      if (email) params.append("email", email);

      // Use your auth token if required
      const response = await api.get(
        `/api/invoices/admin/bulk?${params.toString()}`, 
        {
          responseType: "blob", // To handle ZIP file
          // headers: { Authorization: `Bearer ${token}` }, // if needed
        }
      );

      // Download file
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "invoices-admin.zip");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError("Could not download invoices. " + (err.response?.data?.message || err.message));
      setShowToast(true);
    }
    setLoading(false);
  };

  return (
    <Container className="my-5">
      <h2>Bulk Invoice Download (Admin)</h2>
      <Form>
        <Row className="align-items-end gy-3">
          <Col xs={12} sm={4} md={3}>
            <Form.Label>Period</Form.Label>
            <Form.Select value={period} onChange={e => setPeriod(e.target.value)}>
              <option value="month">Month</option>
              <option value="day">Day</option>
              <option value="week">Week</option>
              <option value="all">All</option>
            </Form.Select>
          </Col>
          {(period === "month" || period === "day" || period === "week") && (
            <Col xs={12} sm={4} md={3}>
              <Form.Label>Date</Form.Label>
              <Form.Control
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
              />
            </Col>
          )}
          <Col xs={12} sm={4} md={3}>
            <Form.Label>Status (optional)</Form.Label>
            <Form.Control
              type="text"
              placeholder="e.g. Delivered"
              value={status}
              onChange={e => setStatus(e.target.value)}
            />
          </Col>
          <Col xs={12} sm={4} md={3}>
            <Form.Label>User Email (optional)</Form.Label>
            <Form.Control
              type="email"
              placeholder="user@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </Col>
          <Col xs={12} sm={4} md={3}>
            <Button
              variant="primary"
              onClick={handleDownload}
              disabled={loading}
              className="mt-3"
            >
              {loading ? <Spinner size="sm" animation="border" /> : "Download ZIP"}
            </Button>
          </Col>
        </Row>
      </Form>
      <Toast
        show={showToast && !!error}
        onClose={() => setShowToast(false)}
        delay={3500}
        autohide
        style={{
          position: "fixed",
          top: 20,
          right: 20,
          minWidth: "250px",
          zIndex: 9999,
        }}
        bg="danger"
      >
        <Toast.Header>
          <strong className="me-auto">Error</strong>
        </Toast.Header>
        <Toast.Body className="text-white">{error}</Toast.Body>
      </Toast>
    </Container>
  );
}