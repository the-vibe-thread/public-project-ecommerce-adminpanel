import { useState, useEffect,useCallback } from "react";
import { Container, Row, Col, Form, Button, Table, Alert } from "react-bootstrap";
import { api } from "../api";

function Discounts() {
  const [discounts, setDiscounts] = useState([]);
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState("fixed");
  const [discountValue, setDiscountValue] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [minOrderAmount, setMinOrderAmount] = useState("");
  const [productSlugs, setProductSlugs] = useState([]);
  const [buyXGetY, setBuyXGetY] = useState({ buy: 1, get: 1 });
  const [seasonalStartDate, setSeasonalStartDate] = useState("");
  const [seasonalEndDate, setSeasonalEndDate] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showExpired, setShowExpired] = useState(false);
  const [formError, setFormError] = useState(""); // Error state

 // Fetch function
 const fetchDiscounts = useCallback(async () => {
  try {
    const res = await api.get("/api/discounts/all", {
      headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
    });
    const activeDiscounts = res.data.discounts.filter(discount => showExpired || new Date(discount.expiryDate) > new Date());
    setDiscounts(activeDiscounts);
  } catch (error) {
    console.error("Error fetching discounts:", error.response?.data?.message || error.message);
  }
}, [showExpired]); // Depend on showExpired because it's used in the fetch logic

useEffect(() => {
  fetchDiscounts();
}, [fetchDiscounts]); // Include fetchDiscounts as a dependency

  const addOrUpdateDiscount = async () => {
    if (!code || !discountValue || !expiryDate) {
      alert("All fields are required!");
      return;
    }

    setLoading(true);
    setFormError(""); // Reset error state
    try {
      const discountData = {
        code: code.toUpperCase(), // <-- Always uppercase before submit
        discountType,
        discountValue,
        expiryDate,
        minOrderAmount,
        productSlugs,
        buyXGetY,
        seasonalStartDate,
        seasonalEndDate,
      };
      const headers = { Authorization: `Bearer ${localStorage.getItem("adminToken")}` };

      if (editingId) {
        const res = await api.put(`/api/discounts/update/${editingId}`, discountData, { headers });
        setDiscounts(discounts.map((d) => (d._id === editingId ? res.data.discount : d)));
      } else {
        const res = await api.post("/api/discounts/create", discountData, { headers });
        setDiscounts([...discounts, res.data.discount]);
      }

      resetForm();
    } catch (error) {
      console.error("Error saving discount:", error.response?.data?.message || error.message);
      setFormError(error.response?.data?.message || error.message); // Set error message
    }
    setLoading(false);
  };

  const deleteDiscount = async (id) => {
    if (!window.confirm("Are you sure you want to delete this discount?")) return;

    try {
      await api.delete(`/api/discounts/delete/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
      });
      setDiscounts(discounts.filter((discount) => discount._id !== id));
    } catch (error) {
      console.error("Error deleting discount:", error.response?.data?.message || error.message);
    }
  };

  const editDiscount = (discount) => {
    setCode(discount.code);
    setDiscountType(discount.discountType);
    setDiscountValue(discount.discountValue);
    setMinOrderAmount(discount.minOrderAmount || "");
    setExpiryDate(discount.expiryDate.split("T")[0]);
    setProductSlugs(discount.productSlugs || []);
    setBuyXGetY(discount.buyXGetY || { buy: 1, get: 1 });
    setSeasonalStartDate(discount.seasonalStartDate ? discount.seasonalStartDate.split("T")[0] : "");
    setSeasonalEndDate(discount.seasonalEndDate ? discount.seasonalEndDate.split("T")[0] : "");
    setEditingId(discount._id);
  };

  const resetForm = () => {
    setCode("");
    setDiscountType("fixed");
    setDiscountValue("");
    setMinOrderAmount("");
    setExpiryDate("");
    setProductSlugs([]);
    setBuyXGetY({ buy: 1, get: 1 });
    setSeasonalStartDate("");
    setSeasonalEndDate("");
    setEditingId(null);
  };

  return (
    <Container className="mt-4">
      <h2 className="text-center mb-4">Manage Discounts</h2>

      <Row className="mb-4">
        <Col md={6} className="mx-auto">
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Discount Code</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter discount code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Discount Type</Form.Label>
              <Form.Select value={discountType} onChange={(e) => setDiscountType(e.target.value)}>
                <option value="fixed">Fixed Amount (₹)</option>
                <option value="percentage">Percentage (%)</option>
                <option value="first_order">First Order</option>
                <option value="loyalty">Loyalty</option>
                <option value="cart_discount">Cart Discount</option>
                <option value="bulk_discount">Bulk Discount</option>
                <option value="seasonal">Seasonal</option>
                <option value="referral">Referral</option>
                <option value="buy_x_get_y">Buy X Get Y</option>
                <option value="free_shipping">Free Shipping</option>
                <option value="payment_method">Payment Method</option>
                <option value="app_discount">App Discount</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Discount Value</Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter discount value"
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Minimum Order Amount (₹)</Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter minimum order amount"
                value={minOrderAmount}
                onChange={(e) => setMinOrderAmount(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Expiry Date</Form.Label>
              <Form.Control
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Product Slugs (Optional, comma-separated)</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter product slugs separated by commas"
                value={productSlugs.join(", ")}
                onChange={(e) => setProductSlugs(
                  e.target.value.split(",").map(slug => slug.trim()).filter(Boolean)
                )}
              />
            </Form.Group>

            {discountType === "buy_x_get_y" && (
              <div>
                <Form.Group className="mb-3">
                  <Form.Label>Buy Quantity</Form.Label>
                  <Form.Control
                    type="number"
                    value={buyXGetY.buy}
                    onChange={(e) => setBuyXGetY({ ...buyXGetY, buy: e.target.value })}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Get Quantity</Form.Label>
                  <Form.Control
                    type="number"
                    value={buyXGetY.get}
                    onChange={(e) => setBuyXGetY({ ...buyXGetY, get: e.target.value })}
                  />
                </Form.Group>
              </div>
            )}

            {discountType === "seasonal" && (
              <div>
                <Form.Group className="mb-3">
                  <Form.Label>Seasonal Start Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={seasonalStartDate}
                    onChange={(e) => setSeasonalStartDate(e.target.value)}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Seasonal End Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={seasonalEndDate}
                    onChange={(e) => setSeasonalEndDate(e.target.value)}
                  />
                </Form.Group>
              </div>
            )}

            <Button variant="primary" className="me-2" onClick={addOrUpdateDiscount} disabled={loading}>
              {loading ? "Processing..." : editingId ? "Update" : "Add"} Discount
            </Button>
            <Button variant="secondary" onClick={resetForm} disabled={!editingId}>
              Cancel
            </Button>

            {formError && <Alert variant="danger" className="mt-3">{formError}</Alert>} {/* Show error in UI */}
          </Form>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={6} className="mx-auto">
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Search Discounts</Form.Label>
              <Form.Control
                type="text"
                placeholder="Search by code"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Show Expired Discounts"
                checked={showExpired}
                onChange={(e) => setShowExpired(e.target.checked)}
              />
            </Form.Group>
          </Form>
        </Col>
      </Row>

      <Row>
        <Col>
          <Table striped bordered hover responsive>
            <thead className="table-dark">
              <tr>
                <th>Code</th><th>Type</th><th>Discount</th><th>Min Order (₹)</th>
                <th>Expiry Date</th><th>Product Slugs</th><th>Used Count</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {discounts.length > 0 ? (
                discounts.map((discount) => (
                  <tr key={discount._id}>
                    <td>{discount.code}</td>
                    <td>{discount.discountType}</td>
                    <td>{discount.discountType === "percentage" ? `${discount.discountValue}%` : `₹${discount.discountValue}`}</td>
                    <td>{discount.minOrderAmount ? `₹${discount.minOrderAmount}` : "N/A"}</td>
                    <td>{new Date(discount.expiryDate).toLocaleDateString()}</td>
                    <td>{discount.productSlugs?.length ? discount.productSlugs.join(", ") : "All Products"}</td>
                    <td>{discount.usedCount || 0}</td>  {/* Show usage count */}
                    <td>
                      <Button variant="warning" size="sm" className="me-2" onClick={() => editDiscount(discount)}>
                        Edit
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => deleteDiscount(discount._id)}>
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center">No discount codes available.</td>
                </tr>
              )}
            </tbody>
          </Table>
        </Col>
      </Row>
    </Container>
  );
}

export default Discounts;
