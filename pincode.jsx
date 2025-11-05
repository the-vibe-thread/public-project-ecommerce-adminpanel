import { useState, useEffect } from "react";
import { Button, Table, Modal, Form, Row, Col } from "react-bootstrap";
import "./pincode.css";
import { api } from "../api";

const AdminPincode = () => {
  const [pincodes, setPincodes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [pincodeData, setPincodeData] = useState({
    pincode: "",
    city: "",
    state: "",
  });
  const [confirmManual, setConfirmManual] = useState(false);

  useEffect(() => {
    fetchPincodes();
  }, []);

  const fetchPincodes = async () => {
    try {
      const { data } = await api.get("/api/pincodes/");
      setPincodes(data);
    } catch (err) {
      console.error("Failed to fetch pincodes:", err);
    }
  };

  const handleAddPincode = async () => {
    if (!pincodeData.pincode.match(/^\d{6}$/)) {
      alert("Please enter a valid 6-digit pincode.");
      return;
    }

    try {
      await api.post("/api/pincodes/", { pincode: pincodeData.pincode });
      fetchPincodes();
      resetModal();
    } catch (error) {
      const msg = error?.response?.data?.message || "";
      if (msg.includes("Do you want to add manually")) {
        setConfirmManual(true);
      } else {
        alert(msg);
      }
    }
  };

  const handleConfirmManual = async () => {
    try {
      await api.post("/api/pincodes/manual", pincodeData);
      fetchPincodes();
      resetModal();
    } catch (error) {
      alert(error?.response?.data?.message || "Manual addition failed.");
    }
  };

  const handleDelete = async (pincode) => {
    if (window.confirm("Are you sure you want to delete this pincode?")) {
      try {
        await api.delete(`/api/pincodes/${pincode}`);
        fetchPincodes();
      } catch (error) {
        alert("Failed to delete pincode.");
      }
    }
  };

  const resetModal = () => {
    setPincodeData({ pincode: "", city: "", state: "" });
    setShowModal(false);
    setConfirmManual(false);
  };

  return (
    <div className="admin-pincode-container">
      <Button
        variant="primary"
        className="mb-3 add-pincode-button"
        onClick={() => setShowModal(true)}
      >
        Add Pincode
      </Button>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Pincode</th>
            <th>City</th>
            <th>State</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {pincodes.map((pincode) => (
            <tr key={pincode.pincode}>
              <td>{pincode.pincode}</td>
              <td>{pincode.city}</td>
              <td>{pincode.state}</td>
              <td>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDelete(pincode.pincode)}
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal show={showModal} onHide={resetModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add Pincode</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Control
                type="text"
                placeholder="Pincode"
                value={pincodeData.pincode}
                onChange={(e) =>
                  setPincodeData({ ...pincodeData, pincode: e.target.value })
                }
              />
            </Form.Group>

            {confirmManual && (
              <>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Control
                        type="text"
                        placeholder="City"
                        value={pincodeData.city}
                        onChange={(e) =>
                          setPincodeData({ ...pincodeData, city: e.target.value })
                        }
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Control
                        type="text"
                        placeholder="State"
                        value={pincodeData.state}
                        onChange={(e) =>
                          setPincodeData({ ...pincodeData, state: e.target.value })
                        }
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={resetModal}>
            Cancel
          </Button>
          {confirmManual ? (
            <Button variant="success" onClick={handleConfirmManual}>
              Confirm Manual Addition
            </Button>
          ) : (
            <Button variant="primary" onClick={handleAddPincode}>
              Validate & Add
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdminPincode;
