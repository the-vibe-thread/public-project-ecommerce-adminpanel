import { useState, useEffect } from "react";
import { Container, Form, Button, Alert, Row, Col, Card } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { api } from "../api";

const AdminShippingCost = () => {
  const [shippingData, setShippingData] = useState({
    baseCost: 0,
    minCost: 0,
    maxCost: 500,
    freeShippingThreshold: 1000,
    tieredCosts: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchShippingData();
  }, []);

  const fetchShippingData = async () => {
    try {
      const { data } = await api.get("/api/shipping/shipping", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });

      if (data && !data.message) {
        setShippingData(data);
      }
    } catch (err) {
      setError("Failed to load shipping data");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    // Prevent negative values
    if (Number(e.target.value) < 0) return;

    setShippingData({ ...shippingData, [e.target.name]: Number(e.target.value) });
  };

  const handleTierChange = (index, field, value) => {
    const updatedTiers = [...shippingData.tieredCosts];
    updatedTiers[index][field] = Number(value);
    setShippingData({ ...shippingData, tieredCosts: updatedTiers });
  };

  const addTier = () => {
    setShippingData({
      ...shippingData,
      tieredCosts: [...shippingData.tieredCosts, { minOrderValue: 0, shippingCost: 0 }],
    });
  };

  const removeTier = (index) => {
    const updatedTiers = shippingData.tieredCosts.filter((_, i) => i !== index);
    setShippingData({ ...shippingData, tieredCosts: updatedTiers });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess(false);
    setError(null);

    try {
      await api.put("/api/shipping/", shippingData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
      setSuccess("Shipping settings updated successfully!");
    } catch (err) {
      setError("Failed to update shipping settings");
    }
  };

  return (
    <Container className="mt-4">
      <Card className="shadow p-4">
        <h2 className="mb-3 text-center">Manage Shipping Cost</h2>

        {loading ? (
          <Alert variant="info">Loading...</Alert>
        ) : error ? (
          <Alert variant="danger">{error}</Alert>
        ) : (
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Base Cost</Form.Label>
              <Form.Control
                type="number"
                name="baseCost"
                value={shippingData.baseCost}
                onChange={handleChange}
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Min Cost</Form.Label>
                  <Form.Control
                    type="number"
                    name="minCost"
                    value={shippingData.minCost}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Max Cost</Form.Label>
                  <Form.Control
                    type="number"
                    name="maxCost"
                    value={shippingData.maxCost}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Free Shipping Threshold</Form.Label>
              <Form.Control
                type="number"
                name="freeShippingThreshold"
                value={shippingData.freeShippingThreshold}
                onChange={handleChange}
              />
            </Form.Group>

            <h4 className="mt-3">Tiered Costs</h4>
            {shippingData.tieredCosts.map((tier, index) => (
              <Row key={index} className="mb-2 align-items-center">
                <Col md={5}>
                  <Form.Control
                    type="number"
                    placeholder="Min Order Value"
                    value={tier.minOrderValue}
                    onChange={(e) => handleTierChange(index, "minOrderValue", e.target.value)}
                  />
                </Col>
                <Col md={5}>
                  <Form.Control
                    type="number"
                    placeholder="Shipping Cost"
                    value={tier.shippingCost}
                    onChange={(e) => handleTierChange(index, "shippingCost", e.target.value)}
                  />
                </Col>
                <Col md={2}>
                  <Button variant="danger" onClick={() => removeTier(index)}>
                    ✖
                  </Button>
                </Col>
              </Row>
            ))}

            <Button variant="primary" className="mt-2" onClick={addTier}>
              + Add Tier
            </Button>

            <Button type="submit" variant="success" className="w-100 mt-4">
              Save Changes
            </Button>

            {success && <Alert variant="success" className="mt-3">{success}</Alert>}
          </Form>
        )}
      </Card>
    </Container>
  );
};

export default AdminShippingCost;
