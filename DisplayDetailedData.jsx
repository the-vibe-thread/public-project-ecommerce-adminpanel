import React from "react";
import Table from "react-bootstrap/Table";

export default function DetailedDataDisplay({ type, data }) {
  if (!Array.isArray(data) || data.length === 0) {
    return <p>No {type} data available.</p>;
  }

  if (type === "sales") {
    return (
      <Table striped bordered hover size="sm">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Date</th>
            <th>User Email</th>
            <th>Product ID</th>
            <th>Product Name</th>
            <th>Qty</th>
            <th>Price</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i}>
              <td>{row.orderId}</td>
              <td>{row.orderDate ? new Date(row.orderDate).toLocaleString() : ""}</td>
              <td>{row.userEmail}</td>
              <td>{row.productId}</td>
              <td>{row.productName}</td>
              <td>{row.quantity}</td>
              <td>{row.price}</td>
              <td>{row.total}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    );
  }

  if (type === "products") {
    return (
      <Table striped bordered hover size="sm">
        <thead>
          <tr>
            <th>Product ID</th>
            <th>Name</th>
            <th>Total Sold</th>
            <th>Revenue</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, i) => (
            <tr key={i}>
              <td>{item.productId}</td>
              <td>{item.name}</td>
              <td>{item.totalSold}</td>
              <td>{item.revenue}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    );
  }

  if (type === "orders") {
    return (
      <Table striped bordered hover size="sm">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Date</th>
            <th>User Name</th>
            <th>User Email</th>
            <th>Product ID</th>
            <th>Product Name</th>
            <th>Qty</th>
            <th>Price</th>
            <th>Total</th>
            <th>Status</th>
            <th>Payment Method</th>
            <th>Shipping Address</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i}>
              <td>{row.orderId}</td>
              <td>{row.orderDate ? new Date(row.orderDate).toLocaleString() : ""}</td>
              <td>{row.userName}</td>
              <td>{row.userEmail}</td>
              <td>{row.productId}</td>
              <td>{row.productName}</td>
              <td>{row.quantity}</td>
              <td>{row.price}</td>
              <td>{row.total}</td>
              <td>{row.status}</td>
              <td>{row.paymentMethod}</td>
              <td>{row.shippingAddress}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    );
  }

  if (type === "users") {
    return (
      <Table striped bordered hover size="sm">
        <thead>
          <tr>
            <th>User ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Created At</th>
          </tr>
        </thead>
        <tbody>
          {data.map((user, i) => (
            <tr key={i}>
              <td>{user._id}</td>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.phone}</td>
              <td>{user.createdAt ? new Date(user.createdAt).toLocaleString() : ""}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    );
  }

  if (type === "revenue") {
    return (
      <Table striped bordered hover size="sm">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Date</th>
            <th>Month</th>
            <th>Year</th>
            <th>User Email</th>
            <th>Total Price</th>
            <th>Payment Method</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i}>
              <td>{row.orderId}</td>
              <td>{row.orderDate ? new Date(row.orderDate).toLocaleString() : ""}</td>
              <td>{row.month}</td>
              <td>{row.year}</td>
              <td>{row.userEmail}</td>
              <td>{row.totalPrice}</td>
              <td>{row.paymentMethod}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    );
  }

  // fallback
  return (
    <pre className="bg-light p-2" style={{ whiteSpace: "pre-wrap" }}>
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}