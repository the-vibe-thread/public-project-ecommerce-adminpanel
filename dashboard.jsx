import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar, ResponsiveContainer } from "recharts";
import { CSVLink } from "react-csv";
import { Container, Row, Col, Button, Card, Spinner, Alert, Form } from "react-bootstrap";
import { api } from "../api";
import DetailedDataDisplay from "./DisplayDetailedData";

const csvHeaders = {
  sales: [
    { label: "Order ID", key: "orderId" },
    { label: "Order Date", key: "orderDate" },
    { label: "User Email", key: "userEmail" },
    { label: "Product ID", key: "productId" },
    { label: "Product Name", key: "productName" },
    { label: "Quantity", key: "quantity" },
    { label: "Price", key: "price" },
    { label: "Total", key: "total" }
  ],
  products: [
    { label: "Product ID", key: "productId" },
    { label: "Product Name", key: "name" },
    { label: "Total Sold", key: "totalSold" },
    { label: "Revenue", key: "revenue" }
  ],
  orders: [
    { label: "Order ID", key: "orderId" },
    { label: "Order Date", key: "orderDate" },
    { label: "User Name", key: "userName" },
    { label: "User Email", key: "userEmail" },
    { label: "Product ID", key: "productId" },
    { label: "Product Name", key: "productName" },
    { label: "Quantity", key: "quantity" },
    { label: "Price", key: "price" },
    { label: "Total", key: "total" },
    { label: "Status", key: "status" },
    { label: "Payment Method", key: "paymentMethod" },
    { label: "Shipping Address", key: "shippingAddress" }
  ],
  users: [
    { label: "User ID", key: "_id" },
    { label: "Name", key: "name" },
    { label: "Email", key: "email" },
    { label: "Phone", key: "phone" },
    { label: "Created At", key: "createdAt" }
  ],
  revenue: [
    { label: "Order ID", key: "orderId" },
    { label: "Order Date", key: "orderDate" },
    { label: "Month", key: "month" },
    { label: "Year", key: "year" },
    { label: "User Email", key: "userEmail" },
    { label: "Total Price", key: "totalPrice" },
    { label: "Payment Method", key: "paymentMethod" }
  ]
};

const filterFields = {
  sales: [
    { name: "productId", label: "Product ID", type: "text" },
    { name: "userEmail", label: "User Email", type: "text" },
    { name: "dateFrom", label: "Date From", type: "date" },
    { name: "dateTo", label: "Date To", type: "date" }
  ],
  products: [
    { name: "productId", label: "Product ID", type: "text" },
    { name: "name", label: "Product Name", type: "text" },
    { name: "dateFrom", label: "Date From", type: "date" },
    { name: "dateTo", label: "Date To", type: "date" }
  ],
  orders: [
    { name: "productId", label: "Product ID", type: "text" },
    { name: "userEmail", label: "User Email", type: "text" },
    { name: "status", label: "Order Status", type: "text" },
    { name: "dateFrom", label: "Date From", type: "date" },
    { name: "dateTo", label: "Date To", type: "date" }
  ],
  users: [
    { name: "email", label: "Email", type: "text" },
    { name: "name", label: "Name", type: "text" },
    { name: "dateFrom", label: "Signup From", type: "date" },
    { name: "dateTo", label: "Signup To", type: "date" }
  ],
  revenue: [
    { name: "userEmail", label: "User Email", type: "text" },
    { name: "dateFrom", label: "Date From", type: "date" },
    { name: "dateTo", label: "Date To", type: "date" }
  ]
};

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [detailedData, setDetailedData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDataType, setSelectedDataType] = useState("sales");
  const [filters, setFilters] = useState({});
  const [fetchingDetails, setFetchingDetails] = useState(false);

  useEffect(() => {
    api.get(`/api/admin/analytics`, { withCredentials: true })
      .then((res) => {
        setAnalytics(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to load analytics data");
        setLoading(false);
      });
  }, []);

  // Fetch detailed data whenever selectedDataType or filters change
  useEffect(() => {
    fetchDetailedData();
    // eslint-disable-next-line
  }, [selectedDataType, JSON.stringify(filters)]);

  const fetchDetailedData = async () => {
    setFetchingDetails(true);
    const params = new URLSearchParams(filters).toString();
    const res = await api.get(`/api/admin/analytics/${selectedDataType}${params ? "?" + params : ""}`, { withCredentials: true });
    const key = Object.keys(res.data).find(k => Array.isArray(res.data[k]));
    setDetailedData(key ? res.data[key] : []);
    setFetchingDetails(false);
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleClearFilters = () => {
    setFilters({});
  };

  return (
    <Container fluid className="p-3">
      <h2 className="text-center mb-4">Admin Analytics Dashboard</h2>
      {loading && <Spinner animation="border" variant="primary" className="d-block mx-auto my-3" />}
      {error && <Alert variant="danger">{error}</Alert>}

      {!loading && analytics && (
        <>
          <Row className="mb-4">
            <Col lg={6} md={12} className="mb-3">
              <Card className="p-3">
                <h3>Sales & Users Trends</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analytics.sales || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="sales" stroke="#8884d8" />
                    <Line type="monotone" dataKey="users" stroke="#82ca9d" />
                  </LineChart>
                </ResponsiveContainer>
                <Button variant="primary" className="mt-3" onClick={() => setSelectedDataType("sales")}>
                  View Detailed Sales Data
                </Button>
              </Card>
            </Col>
            <Col lg={6} md={12} className="mb-3">
              <Card className="p-3">
                <h3>Top Selling Products</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.products || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="sales" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
                <Button variant="primary" className="mt-3" onClick={() => setSelectedDataType("products")}>
                  View Detailed Product Data
                </Button>
              </Card>
            </Col>
          </Row>
          <Row className="mb-4">
            <Col lg={6} md={12} className="mb-3">
              <Card className="p-3">
                <h3>Revenue Trends</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analytics.revenue || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" stroke="#ff7300" />
                  </LineChart>
                </ResponsiveContainer>
                <Button variant="primary" className="mt-3" onClick={() => setSelectedDataType("revenue")}>
                  View Detailed Revenue Data
                </Button>
              </Card>
            </Col>
            <Col md={6} className="mb-3">
              <Card className="p-3">
                <h3>Order Statistics</h3>
                <ul>
                  <li>Completed Orders: {analytics.orders?.completed || 0}</li>
                  <li>Pending Orders: {analytics.orders?.pending || 0}</li>
                  <li>Shipped Orders: {analytics.orders?.shipped || 0}</li>
                  <li>Canceled Orders: {analytics.orders?.canceled || 0}</li>
                </ul>
                <Button variant="primary" onClick={() => setSelectedDataType("orders")}>
                  View Detailed Order Data
                </Button>
              </Card>
            </Col>
          </Row>
          {/* Filter Form */}
          <Row>
            <Col md={12}>
              <Card className="p-3 mb-2">
                <h5>Filter {selectedDataType.charAt(0).toUpperCase() + selectedDataType.slice(1)} Data</h5>
                <Form>
                  <Row>
                    {filterFields[selectedDataType].map((field) => (
                      <Col md={3} key={field.name}>
                        <Form.Group className="mb-2">
                          <Form.Label>{field.label}</Form.Label>
                          <Form.Control
                            type={field.type}
                            name={field.name}
                            value={filters[field.name] || ""}
                            onChange={handleFilterChange}
                          />
                        </Form.Group>
                      </Col>
                    ))}
                  </Row>
                  <Button variant="primary" onClick={(e) => { e.preventDefault(); fetchDetailedData(); }} className="me-2">
                    Apply Filters
                  </Button>
                  <Button variant="secondary" onClick={handleClearFilters}>
                    Clear
                  </Button>
                </Form>
              </Card>
            </Col>
          </Row>
          {/* CSV Download */}
          <Row>
            <Col className="text-center">
              <h3>Download Analytics Data</h3>
              {fetchingDetails ? (
                <Spinner animation="border" />
              ) : (
                detailedData && detailedData.length > 0 ? (
                  <CSVLink
                    data={detailedData}
                    headers={csvHeaders[selectedDataType]}
                    filename={`${selectedDataType}-detailed.csv`}
                  >
                    <Button variant="success">Download Filtered Data</Button>
                  </CSVLink>
                ) : (
                  <p>No {selectedDataType} data available for download</p>
                )
              )}
            </Col>
          </Row>
          {/* Detailed Data Section */}
          <Row className="mt-4">
            <Col>
              <Card className="p-3">
                <h3>
                  Detailed {selectedDataType.charAt(0).toUpperCase() + selectedDataType.slice(1)} Data
                </h3>
                {fetchingDetails ? (
                  <Spinner animation="border" />
                ) : (
                  <DetailedDataDisplay
                    type={selectedDataType}
                    data={detailedData}
                  />
                )}
              </Card>
            </Col>
          </Row>
        </>
      )}
    </Container>
  );
};

export default AdminDashboard;