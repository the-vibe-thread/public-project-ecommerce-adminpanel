import { useState } from "react";
import { Container, Button, Form, Alert, Table } from "react-bootstrap";
import {api} from "../api"; // ✅ Import your API utility

const StockUpload = () => {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");

  // ✅ Handle File Change
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // ✅ Handle File Upload
  const handleUpload = async () => {
    if (!file) {
      setMessage("Please select a file.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const { data } = await api.post(
        "/api/admin/upload-stock",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true, // ✅ Ensure cookies are sent for authentication
        }
      );
      setMessage(data.message);
    } catch (error) {
      setMessage(error.response?.data?.message || "Error uploading file.");
    }
  };

  return (
    <Container className="p-4 border rounded bg-white shadow-sm">
      <h2 className="text-center mb-3">Upload Stock CSV</h2>

      {/* ✅ File Upload Section */}
      <Form.Group className="mb-3">
        <Form.Control type="file" accept=".csv" onChange={handleFileChange} />
      </Form.Group>

      <div className="d-flex justify-content-center">
        <Button variant="success" onClick={handleUpload} className="w-100">
          Upload
        </Button>
      </div>

      {message && <Alert variant="info" className="mt-3">{message}</Alert>}

      {/* ✅ CSV Format Reference Table */}
      <div className="mt-4">
        <h5>CSV Structure for Stock Update</h5>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>slug</th>
              <th>color</th>
              <th>size</th>
              <th>stock</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>product-1</td>
              <td>Black</td>
              <td>M</td>
              <td>50</td>
            </tr>
            <tr>
              <td>product-2</td>
              <td>White</td>
              <td>L</td>
              <td>30</td>
            </tr>
            <tr>
              <td>product-3</td>
              <td>Red</td>
              <td>XL</td>
              <td>20</td>
            </tr>
          </tbody>
        </Table>
      </div>
    </Container>
  );
};

export default StockUpload;
