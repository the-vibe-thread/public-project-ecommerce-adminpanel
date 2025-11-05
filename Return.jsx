import { useEffect, useState } from "react";
import {
  Container,
  Table,
  Button,
  Spinner,
  Badge,
  Modal,
  Image,
  Form,
  Row,
  Col,
  Pagination,
  InputGroup,
  Accordion,
} from "react-bootstrap";
import { api } from "../api";

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

function ReturnRequests() {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);

  // Dynamically fetched product info for replacement
  const [productInfo, setProductInfo] = useState(null);

  // Search & filter states
  const [filterStatus, setFilterStatus] = useState("");
  const [filterOrderId, setFilterOrderId] = useState("");
  const [filterEmail, setFilterEmail] = useState("");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");
  const [searchText, setSearchText] = useState("");

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[1]);
  const [totalPages, setTotalPages] = useState(1);

  // Modal & image preview
  const [selectedOrder, setSelectedOrder] = useState(null); // Stores full order object
  const [modalShow, setModalShow] = useState(false);
  const [previewImg, setPreviewImg] = useState(null);

  // Replacement modal states
  const [showReplacementModal, setShowReplacementModal] = useState(false);
  const [replacementSize, setReplacementSize] = useState("");
  const [replacementColor, setReplacementColor] = useState("");
  const [replacementLoading, setReplacementLoading] = useState(false);
  const [replacementProduct, setReplacementProduct] = useState(null);

  // Fetch Returns - now named so it can be called after actions
  const fetchReturns = async () => {
    setLoading(true);
    try {
      // Backend can return paginated orders with at least 1 returned product
      const params = {
        status: filterStatus,
        orderId: filterOrderId,
        email: filterEmail,
        startDate: filterStartDate,
        endDate: filterEndDate,
        search: searchText,
        page,
        pageSize,
      };
      Object.keys(params).forEach(
        (key) => params[key] === "" && delete params[key]
      );
      // Get orders with at least one returned/return-requested item
      const { data } = await api.get("/api/admin/returns", { params });
      setReturns(data.returns);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error("Error fetching return requests:", error);
    } finally {
      setLoading(false);
    }
  };

  // Table data: orders (each with products incl. returns info)
  useEffect(() => {
    fetchReturns();
    // eslint-disable-next-line
  }, [
    filterStatus,
    filterOrderId,
    filterEmail,
    filterStartDate,
    filterEndDate,
    searchText,
    page,
    pageSize,
  ]);

  // Fetch latest product info for replacement modal
  useEffect(() => {
    if (showReplacementModal && replacementProduct) {
      // Fetch from your product API using productId
      api
        .get(`/api/products/${replacementProduct.slug}`)
        .then(({ data }) => setProductInfo(data.product))
        .catch(() => setProductInfo(null));
    } else {
      setProductInfo(null);
    }
  }, [showReplacementModal, replacementProduct]);

  // Actions
  const handleReturnAction = async (orderId, productId, status) => {
    try {
      await api.put(`/api/admin/returns/${orderId}/${productId}`, { status });
      alert(
        `Return request ${
          status === "Return Approved" ? "approved" : "rejected"
        }!`
      );
      setModalShow(false);
      setSelectedOrder(null);
      await fetchReturns(); // update the UI immediately
    } catch (error) {
      alert("Failed to update return request.");
    }
  };

  // Mark as picked up for a specific product
  const handlePickup = async (orderId, productId) => {
    setReplacementLoading(true);
    try {
      await api.put(`/api/admin/returns/${orderId}/${productId}/pickup`);
      alert("Marked as Picked Up!");
      setModalShow(false);
      setSelectedOrder(null);
      await fetchReturns(); // update UI
    } catch (error) {
      alert("Failed to mark as picked up.");
    } finally {
      setReplacementLoading(false);
    }
  };

  // Replacement order handler for a specific product
  const handleReplacementSubmit = async (e) => {
    e.preventDefault();
    setReplacementLoading(true);
    try {
      await api.post(
        `/api/admin/returns/${selectedOrder.orderId}/replacement`,
        {
          products: [
            {
              productId: replacementProduct.productId,
              size: replacementSize,
              color: replacementColor,
            },
          ],
        }
      );
      alert("Replacement order placed!");
      setShowReplacementModal(false);
      setModalShow(false);
      setSelectedOrder(null);
      await fetchReturns(); // update UI
    } catch (error) {
      alert("Failed to place replacement order.");
    } finally {
      setReplacementLoading(false);
    }
  };

  // Refund handler
  const handleRefund = async (orderId, productId) => {
    try {
      await api.post(
        `/api/admin/orders/${orderId}/${productId}/refund`
      );
      alert("Refund processed!");
      setModalShow(false);
      setSelectedOrder(null);
      await fetchReturns(); // update UI
    } catch (err) {
      alert("Refund failed!");
    }
  };

  // Pagination controls
  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const renderPagination = () => (
    <Pagination>
      <Pagination.First
        onClick={() => handlePageChange(1)}
        disabled={page === 1}
      />
      <Pagination.Prev
        onClick={() => handlePageChange(page - 1)}
        disabled={page === 1}
      />
      {Array.from({ length: totalPages }, (_, i) => (
        <Pagination.Item
          key={i + 1}
          active={page === i + 1}
          onClick={() => handlePageChange(i + 1)}
        >
          {i + 1}
        </Pagination.Item>
      ))}
      <Pagination.Next
        onClick={() => handlePageChange(page + 1)}
        disabled={page === totalPages}
      />
      <Pagination.Last
        onClick={() => handlePageChange(totalPages)}
        disabled={page === totalPages}
      />
    </Pagination>
  );
  // Get available colors
  const availableColors = productInfo?.colors?.map((c) => c.name) || [];

  // Get available sizes for selected color
  const selectedColorObj = productInfo?.colors?.find(
    (c) => c.name === replacementColor
  );
  const availableSizes = selectedColorObj
    ? Object.keys(selectedColorObj.sizes)
    : [];

  useEffect(() => {
    if (returns.length > 0) {
      returns.forEach((order) => {
        console.log(`Order ${order.orderId} items:`, order.items);
      });
    }
  }, [returns]);

  return (
    <Container className="mt-4">
      <h2>🔄 Manage Return Requests</h2>

      {/* Filter/search bar */}
      <Form className="mb-3">
        <Row>
          <Col md={2}>
            <Form.Select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Statuses</option>
              <option value="Return Requested">Pending</option>
              <option value="Return Approved">Approved</option>
              <option value="Return Rejected">Rejected</option>
              <option value="Refunded">Refunded</option>
              <option value="Returned">Returned</option>
            </Form.Select>
          </Col>
          <Col md={2}>
            <Form.Control
              placeholder="Order ID"
              value={filterOrderId}
              onChange={(e) => {
                setFilterOrderId(e.target.value);
                setPage(1);
              }}
            />
          </Col>
          <Col md={2}>
            <Form.Control
              placeholder="User Email"
              value={filterEmail}
              onChange={(e) => {
                setFilterEmail(e.target.value);
                setPage(1);
              }}
            />
          </Col>
          <Col md={2}>
            <Form.Control
              type="date"
              value={filterStartDate}
              onChange={(e) => {
                setFilterStartDate(e.target.value);
                setPage(1);
              }}
              title="Start Date"
            />
          </Col>
          <Col md={2}>
            <Form.Control
              type="date"
              value={filterEndDate}
              onChange={(e) => {
                setFilterEndDate(e.target.value);
                setPage(1);
              }}
              title="End Date"
            />
          </Col>
          <Col md={2}>
            <InputGroup>
              <Form.Control
                placeholder="Search..."
                value={searchText}
                onChange={(e) => {
                  setSearchText(e.target.value);
                  setPage(1);
                }}
              />
              <Button
                variant="outline-secondary"
                onClick={() => setSearchText("")}
              >
                Clear
              </Button>
            </InputGroup>
          </Col>
        </Row>
        <Row className="mt-2">
          <Col md={2}>
            <Form.Select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
            >
              {PAGE_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>
                  Page Size: {size}
                </option>
              ))}
            </Form.Select>
          </Col>
        </Row>
      </Form>

      {loading ? (
        <div className="text-center">
          <Spinner animation="border" />
          <p>Loading return requests...</p>
        </div>
      ) : returns.length === 0 ? (
        <div className="text-center">
          <h5>No return requests found.</h5>
        </div>
      ) : (
        <>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>User</th>
                <th>Date</th>
                <th>Returned Products</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {returns.map((order) => (
                console.log("Rendering order:", order),
                <tr key={order.orderId}>
                  <td>{order.orderId}</td>
                  <td>{order.user.email}</td>
                  <td>
                    {order.createdAt
                      ? new Date(order.createdAt).toLocaleString()
                      : ""}
                  </td>
                  <td>
                    {
                      order.items.filter(
                        (item) =>
                          item.returnStatus &&
                          item.returnStatus.startsWith("Return")
                      ).length
                    }{" "}
                    / {order.items.length}
                  </td>
                  <td>
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedOrder(order);
                        setModalShow(true);
                        setReplacementSize("");
                        setReplacementColor("");
                        setReplacementProduct(null);
                      }}
                    >
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          <div className="d-flex justify-content-between align-items-center">
            <span>
              Showing page {page} of {totalPages}
            </span>
            {renderPagination()}
          </div>
        </>
      )}

      {/* Modal for order details incl. all products (with return details) */}
      <Modal
        show={modalShow}
        onHide={() => setModalShow(false)}
        centered
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Order Return Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedOrder && (
            <>
              <p>
                <strong>Order ID:</strong> {selectedOrder.orderId}
              </p>
              <p>
                <strong>User:</strong> {selectedOrder.user.email}
              </p>
              <p>
                <strong>Date:</strong>{" "}
                {selectedOrder.createdAt
                  ? new Date(selectedOrder.createdAt).toLocaleString()
                  : ""}
              </p>
              <Accordion defaultActiveKey="0" alwaysOpen>
                {selectedOrder.items.map((item, idx) => (
                  <Accordion.Item eventKey={String(idx)} key={item.productId}>
                    <Accordion.Header>
                      <span>
                        {item.name || "Unnamed Product"}{" "}
                        {item.returnStatus && (
                          <Badge
                            bg={
                              item.returnStatus === "Return Requested"
                                ? "warning"
                                : item.returnStatus === "Return Approved"
                                ? "success"
                                : item.returnStatus === "Return Rejected"
                                ? "danger"
                                : "info"
                            }
                            className="ms-2"
                          >
                            {item.returnStatus}
                          </Badge>
                        )}
                        {/* Show badge/link if replacement order exists */}
                        {item.replacementOrderId && (
                          <Badge bg="primary" className="ms-2">
                            Replacement Created
                          </Badge>
                        )}
                      </span>
                    </Accordion.Header>
                    <Accordion.Body>
                      <Row>
                        <Col md={4}>
                          {item.images && item.images.length > 0 && (
                            <div>
                              <b>Product Images:</b>
                              <div style={{ display: "flex", gap: 8 }}>
                                {item.images.map((img, idx) => (
                                  <Image
                                    key={idx}
                                    src={img}
                                    thumbnail
                                    style={{
                                      maxWidth: 80,
                                      maxHeight: 80,
                                      cursor: "pointer",
                                    }}
                                    onClick={() => setPreviewImg(img)}
                                  />
                                ))}
                              </div>
                            </div>
                          )}
                        </Col>
                        <Col md={8}>
                          <p>
                            <b>Color:</b> {item.color || "-"} <br />
                            <b>Size:</b> {item.size || "-"} <br />
                            <b>Quantity:</b> {item.quantity} <br />
                            <b>Price:</b> ₹{item.price} <br />
                            <b>SKU:</b> {item.sku || "-"} <br />
                            <b>Requested Color:</b>{" "}
                            {item.exchangeToColor || "-"}
                            <b>Requested Size:</b> {item.exchangeToSize || "-"}
                          </p>
                          {item.returnStatus && (
                            <div style={{ marginBottom: 12 }}>
                              <b>Return Details:</b>
                              <ul>
                                <li>
                                  <b>Status:</b> {item.returnStatus}
                                </li>
                                <li>
                                  <b>Reason:</b> {item.returnDetails?.reason}
                                </li>
                                <li>
                                  <b>Issue:</b> {item.returnDetails?.issue}
                                </li>
                                <li>
                                  <b>Resolution:</b>{" "}
                                  {item.returnDetails?.resolution}
                                </li>
                                <li>
                                  <b>Pickup Status:</b>{" "}
                                  {item.returnDetails?.pickupStatus}
                                </li>
                                <li>
                                  <b>Refund Amount:</b>{" "}
                                  {item.returnDetails?.refundAmount}
                                </li>
                                <li>
                                  <b>Refund Date:</b>{" "}
                                  {item.returnDetails?.refundDate &&
                                    new Date(
                                      item.returnDetails.refundDate
                                    ).toLocaleString()}
                                </li>
                              </ul>
                              {item.returnDetails?.images &&
                                item.returnDetails.images.length > 0 && (
                                  <div>
                                    <b>Return Images:</b>
                                    <div style={{ display: "flex", gap: 8 }}>
                                      {item.returnDetails.images.map(
                                        (img, idx) => (
                                          <Image
                                            key={idx}
                                            src={img}
                                            thumbnail
                                            style={{
                                              maxWidth: 80,
                                              maxHeight: 80,
                                              cursor: "pointer",
                                            }}
                                            onClick={() => setPreviewImg(img)}
                                          />
                                        )
                                      )}
                                    </div>
                                  </div>
                                )}
                            </div>
                          )}
                          {item.replacementOrderId && (
                            <a
                              href={`/admin/orders/${item.replacementOrderId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-2 d-block"
                            >
                              View Replacement Order
                            </a>
                          )}
                        </Col>
                      </Row>
                      {/* Actions: Approve/Reject, Pickup, Replacement, Refund */}
                      <div className="mt-2">
                        {item.returnStatus === "Return Requested" && (
                          <>
                            <Button
                              variant="success"
                              size="sm"
                              onClick={() =>
                                handleReturnAction(
                                  selectedOrder.orderId,
                                  item.productId,
                                  "Return Approved"
                                )
                              }
                              className="me-2"
                            >
                              Approve
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() =>
                                handleReturnAction(
                                  selectedOrder.orderId,
                                  item.productId,
                                  "Return Rejected"
                                )
                              }
                            >
                              Reject
                            </Button>
                          </>
                        )}
                        {item.returnStatus === "Return Approved" &&
                          item.returnDetails?.pickupStatus !== "Picked Up" && (
                            <Button
                              variant="info"
                              size="sm"
                              onClick={() =>
                                handlePickup(
                                  selectedOrder.orderId,
                                  item.productId
                                )
                              }
                              disabled={replacementLoading}
                              className="me-2"
                            >
                              {replacementLoading
                                ? "Processing..."
                                : "Mark Picked Up"}
                            </Button>
                          )}
                        {item.returnStatus === "Return Approved" &&
                          item.returnDetails?.pickupStatus === "Picked Up" &&
                          !item.replacementOrderId && (
                            <Button
                              variant="warning"
                              size="sm"
                              onClick={() => {
                                setShowReplacementModal(true);
                                setReplacementProduct(item);
                                setReplacementSize("");
                                setReplacementColor("");
                              }}
                              disabled={replacementLoading}
                              className="me-2"
                            >
                              Create Replacement/Exchange
                            </Button>
                          )}
                        {item.returnStatus === "Return Approved" &&
                          item.returnDetails?.pickupStatus === "Picked Up" && (
                            <Button
                              variant="success"
                              size="sm"
                              onClick={() =>
                                handleRefund(selectedOrder.orderId, item.productId)
                              }
                              className="me-2"
                            >
                              Process Refund
                            </Button>
                          )}
                      </div>
                    </Accordion.Body>
                  </Accordion.Item>
                ))}
              </Accordion>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setModalShow(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Replacement Modal for a product */}
      <Modal
        show={showReplacementModal}
        onHide={() => setShowReplacementModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Create Replacement/Exchange
            {replacementProduct && (
              <>
                <br />
                <small>
                  {replacementProduct.name} ({replacementProduct.color},{" "}
                  {replacementProduct.size})
                </small>
              </>
            )}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleReplacementSubmit}>
            <Form.Group>
              <Form.Label>New Color</Form.Label>
              <Form.Select
                value={replacementColor}
                onChange={(e) => {
                  setReplacementColor(e.target.value);
                  setReplacementSize(""); // reset size when color changes
                }}
              >
                <option value="">Select Color</option>
                {availableColors.map((color) => (
                  <option key={color} value={color}>
                    {color}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group>
              <Form.Label>New Size</Form.Label>
              <Form.Select
                value={replacementSize}
                onChange={(e) => setReplacementSize(e.target.value)}
                disabled={!replacementColor}
              >
                <option value="">Select Size</option>
                {availableSizes.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Button
              type="submit"
              disabled={replacementLoading}
              className="mt-3"
            >
              {replacementLoading
                ? "Processing..."
                : "Create Replacement Order"}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Image preview modal */}
      <Modal
        show={!!previewImg}
        onHide={() => setPreviewImg(null)}
        centered
        size="lg"
      >
        <Modal.Body className="text-center">
          <Image src={previewImg} fluid />
        </Modal.Body>
      </Modal>
    </Container>
  );
}

export default ReturnRequests;