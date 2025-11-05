import React, { useState, useEffect, useRef } from "react";
import { Table, Button, Form, Spinner } from "react-bootstrap";
import { api } from "../api";

const BASE_URL = process.env.REACT_APP_BACKEND_URL;

const getMediaUrl = (url) =>
  url?.startsWith("http") ? url : `${BASE_URL}${url}`;

const CarouselManagement = () => {
  const [carouselImages, setCarouselImages] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [caption, setCaption] = useState("");
  const [link, setLink] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const fileInputRef = useRef(null);

  // Fetch Carousel Images
  useEffect(() => {
    fetchCarouselImages();
  }, []);

  const fetchCarouselImages = async () => {
    try {
      const res = await api.get("/api/carousel");
      setCarouselImages(res.data.images || []);
    } catch (err) {
      setError("Failed to fetch carousel items.");
    }
  };

  // Handle File Upload
  const handleFileChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  // Upload New Carousel Image/Video
  const handleAddCarouselImage = async (e) => {
    e.preventDefault();
    if (!imageFile) {
      setError("Please select an image or video file.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("image", imageFile);
      formData.append("caption", caption);
      formData.append("link", link);
      formData.append("isActive", isActive);

      await api.post("/api/carousel/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setCaption("");
      setLink("");
      setIsActive(true);
      setImageFile(null);
      fileInputRef.current.value = "";
      fetchCarouselImages();
    } catch (err) {
      setError("Failed to upload. Please try again.");
    }
    setLoading(false);
  };

  // Delete Carousel Image/Video
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    try {
      await api.delete(`/api/carousel/${id}`);
      fetchCarouselImages();
    } catch (err) {
      setError("Failed to delete. Please try again.");
    }
  };

  return (
    <div className="container py-4">
      <h2 className="mb-4">Carousel Management</h2>
      <Form onSubmit={handleAddCarouselImage} className="mb-4">
        <Form.Group>
          <Form.Label>Upload Image or Video</Form.Label>
          <Form.Control
            type="file"
            accept="image/*,video/*"
            onChange={handleFileChange}
            required
            ref={fileInputRef}
          />
        </Form.Group>
        <Form.Group className="mt-2">
          <Form.Label>Caption</Form.Label>
          <Form.Control
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Enter caption"
          />
        </Form.Group>
        <Form.Group className="mt-2">
          <Form.Label>Link (optional)</Form.Label>
          <Form.Control
            type="text"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="Enter link"
          />
        </Form.Group>
        <Form.Group className="mt-2">
          <Form.Check
            type="checkbox"
            label="Active"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
          />
        </Form.Group>
        <Button className="mt-3" type="submit" disabled={loading}>
          {loading ? <Spinner size="sm" /> : "Add to Carousel"}
        </Button>
        {error && <div className="text-danger mt-2">{error}</div>}
      </Form>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Preview</th>
            <th>Caption</th>
            <th>Link</th>
            <th>Active</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {carouselImages.map((image) => {
            const isVideo = /\.(mp4|webm|ogg)$/i.test(image.imageUrl);
            return (
              <tr key={image._id}>
                <td>
                  {isVideo ? (
                    <video
                      src={getMediaUrl(image.imageUrl)}
                      style={{ width: "100px", cursor: "pointer" }}
                      onClick={() =>
                        setPreviewImage(getMediaUrl(image.imageUrl))
                      }
                      controls
                    />
                  ) : (
                    <img
                      src={getMediaUrl(image.imageUrl)}
                      alt={image.caption || "Carousel Media"}
                      style={{ width: "100px", cursor: "pointer" }}
                      onClick={() =>
                        setPreviewImage(getMediaUrl(image.imageUrl))
                      }
                    />
                  )}
                </td>
                <td>{image.caption}</td>
                <td>
                  {image.link ? (
                    <a
                      href={image.link}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {image.link}
                    </a>
                  ) : (
                    "-"
                  )}
                </td>
                <td>{image.isActive ? "Yes" : "No"}</td>
                <td>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(image._id)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>

      {/* Fullscreen Preview */}
      {previewImage && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
          onClick={() => setPreviewImage(null)}
        >
          {/\.(mp4|webm|ogg)$/i.test(previewImage) ? (
            <video
              src={previewImage}
              style={{ maxWidth: "90%", maxHeight: "90%", borderRadius: "5px" }}
              controls
              autoPlay
            />
          ) : (
            <img
              src={previewImage}
              alt="Preview"
              style={{ maxWidth: "90%", maxHeight: "90%", borderRadius: "5px" }}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default CarouselManagement;
