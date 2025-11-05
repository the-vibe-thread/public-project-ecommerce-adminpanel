import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import {
  Table,
  Button,
  Container,
  Spinner,
  Modal,
  Form,
  Alert,
} from "react-bootstrap";
import { api } from "../api";

const socket = io(process.env.REACT_APP_BACKEND_URL);

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [updating, setUpdating] = useState(null);
  const [shippedFrom, setShippedFrom] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [shippingCarrier, setShippingCarrier] = useState("");
  const [orderLoading, setOrderLoading] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await api.get("/api/admin/orders", {
          withCredentials: true,
        });
        setOrders(data); // <-- Fixed: use data.orders
      } catch (err) {
        setError("Failed to fetch orders");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();

    socket.on("orderUpdated", (updatedOrder) => {
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === updatedOrder._id ? updatedOrder : order
        )
      );
    });

    return () => {
      socket.off("orderUpdated");
    };
  }, []);

  const fetchOrderDetails = async (id) => {
    setOrderLoading(true);
    try {
      const { data } = await api.get(`/api/admin/${id}`, {
        withCredentials: true,
      });
      setSelectedOrder(data);
    } catch (err) {
      alert("Failed to fetch order details");
    } finally {
      setOrderLoading(false);
    }
  };

  const updateOrderStatus = async (id, newStatus) => {
    setUpdating(id);
    try {
      const requestData = { status: newStatus };

      if (newStatus === "Shipped") {
        if (!shippedFrom || !trackingNumber || !shippingCarrier) {
          alert("Please fill in all shipping details.");
          setUpdating(null);
          return;
        }

        requestData.shippedFrom = shippedFrom;
        requestData.trackingNumber = trackingNumber;
        requestData.shippingCarrier = shippingCarrier;
      }

      const { data } = await api.put(
        `/api/admin/orders/${id}/status`,
        requestData,
        { withCredentials: true }
      );

      setOrders((prevOrders) =>
        prevOrders.map((order) => (order._id === id ? data.order : order))
      );
      socket.emit("orderUpdated", data.order);
      setSelectedOrder(null); // Close modal after updating
    } catch {
      alert("Failed to update order status");
    } finally {
      setUpdating(null);
    }
  };

  const filteredOrders = statusFilter
    ? orders.filter((order) => order.status === statusFilter)
    : orders;

  return (
    <Container className="mt-4">
      <h2 className="mb-3">Manage Orders</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      {loading && (
        <Spinner animation="border" className="d-block mx-auto my-3" />
      )}

      <Form.Group className="mb-3">
        <Form.Label>Filter by Status</Form.Label>
        <Form.Select onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All</option>
          <option value="Pending">Pending</option>
          <option value="Shipped">Shipped</option>
          <option value="Delivered">Delivered</option>
          <option value="Cancelled">Cancelled</option>
        </Form.Select>
      </Form.Group>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Customer</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredOrders.map((order) => (
            <tr key={order.orderId}>
              <td>{order.orderId}</td>
              <td>{order.customer}</td>
              <td>
                <span
                  className={`badge bg-${
                    order.status === "Pending"
                      ? "warning"
                      : order.status === "Shipped"
                      ? "info"
                      : order.status === "Delivered"
                      ? "success"
                      : "danger"
                  }`}
                >
                  {order.status}
                </span>
                {order.paymentMethod === "replacement" && (
                  <span className="badge bg-secondary ms-2">Replacement</span>
                )}
              </td>
              <td>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => fetchOrderDetails(order._id)}
                >
                  View
                </Button>{" "}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Order Details Modal */}
      {selectedOrder && (
        <Modal show onHide={() => setSelectedOrder(null)} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Order Details</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {orderLoading ? (
              <Spinner animation="border" />
            ) : (
              <>
                <p>
                  <strong>Order ID:</strong> {selectedOrder._id}
                  {selectedOrder.paymentMethod === "replacement" && (
                    <span className="badge bg-secondary ms-2">Replacement</span>
                  )}
                </p>
                <p>
                  <strong>Customer:</strong> {selectedOrder.customer}
                </p>
                <p>
                  <strong>Status:</strong> {selectedOrder.status}
                </p>
                <p>
                  <strong>Payment:</strong> {selectedOrder.paymentStatus} via{" "}
                  {selectedOrder.paymentMethod} — ₹{selectedOrder.totalAmount}
                </p>
                <p>
                  <strong>Items:</strong>
                </p>
                <ul>
                  {(selectedOrder?.items || []).map((item, index) => (
                    console.log(item) ,
                    <li key={index}>
                      {item.name} — Qty: {item.quantity}, SKU: {item.sku}
                      Color: {item.color}, Size: {item.size}
                      {item.replacementOrderId && (
                        <span className="ms-2">
                          <strong>Replacement Order:</strong>{" "}
                          <a
                            href={`/admin/orders/${item.replacementOrderId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {item.replacementOrderId}
                          </a>
                        </span>
                      )}
                    </li>
                  ))}
                </ul>

                {/* Shipping Info */}
                {selectedOrder.status !== "Pending" && (
                  <>
                    <p>
                      <strong>Shipped From:</strong>{" "}
                      {selectedOrder.shippedFrom || "N/A"}
                    </p>
                    <p>
                      <strong>Tracking Number:</strong>{" "}
                      {selectedOrder.trackingNumber || "N/A"}
                    </p>
                    <p>
                      <strong>Carrier:</strong>{" "}
                      {selectedOrder.shippingCarrier || "N/A"}
                    </p>
                  </>
                )}

                {/* Tracking Fields for Pending Orders */}
                {selectedOrder.status === "Pending" && (
                  <>
                    <Form.Group className="mt-3">
                      <Form.Label>Shipped From</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Enter warehouse location"
                        value={shippedFrom}
                        onChange={(e) => setShippedFrom(e.target.value)}
                      />
                    </Form.Group>

                    <Form.Group className="mt-3">
                      <Form.Label>Tracking Number</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Enter tracking number"
                        value={trackingNumber}
                        onChange={(e) => setTrackingNumber(e.target.value)}
                      />
                    </Form.Group>

                    <Form.Group className="mt-3">
                      <Form.Label>Shipping Carrier</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Enter shipping carrier (UPS, FedEx, etc.)"
                        value={shippingCarrier}
                        onChange={(e) => setShippingCarrier(e.target.value)}
                      />
                    </Form.Group>
                  </>
                )}
              </>
            )}
          </Modal.Body>

          <Modal.Footer>
            <Button variant="secondary" onClick={() => setSelectedOrder(null)}>
              Close
            </Button>

            {selectedOrder.status === "Pending" && (
              <Button
                variant="success"
                onClick={() => updateOrderStatus(selectedOrder._id, "Shipped")}
                disabled={updating}
              >
                {updating === selectedOrder._id
                  ? "Updating..."
                  : "Mark as Shipped"}
              </Button>
            )}

            {selectedOrder.status === "Shipped" && (
              <Button
                variant="primary"
                onClick={() =>
                  updateOrderStatus(selectedOrder._id, "Delivered")
                }
                disabled={updating}
              >
                {updating === selectedOrder._id
                  ? "Updating..."
                  : "Mark as Delivered"}
              </Button>
            )}
          </Modal.Footer>
        </Modal>
      )}
    </Container>
  );
};

export default Orders;
