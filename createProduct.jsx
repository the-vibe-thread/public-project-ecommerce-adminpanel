import React, { useState } from "react";
import {
  Card,
  Container,
  Form,
  Button,
  Row,
  Col,
  Alert,
  Modal,
} from "react-bootstrap";
import { api } from "../api";


const CreateProduct = () => {
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [discountPrice, setDiscountPrice] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [Trending, setTrending] = useState(false);
  const [NewArrival, setNewArrival] = useState(false);
  const [bestseller, setBestseller] = useState(false);
  const [weight, setWeight] = useState("");
  const [error, setError] = useState("");
  const [colors, setColors] = useState([]);
  const [moreDetails, setMoreDetails] = useState("");
  const [returnPolicy, setReturnPolicy] = useState("");
  const [howToCare, setHowToCare] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [metaKeywords, setMetaKeywords] = useState("");
  const [fabric, setFabric] = useState("");

  const [showImageModal, setShowImageModal] = useState(false);
  const [modalImageSrc, setModalImageSrc] = useState("");

  const [preorderAvailable, setPreorderAvailable] = useState(false);
  const [preorderDiscountType, setPreorderDiscountType] = useState("fixed");
  const [preorderDiscountValue, setPreorderDiscountValue] = useState(100);

  const allowedSizes = ["S", "M", "L", "XL", "XXL"];

  const handleCheckboxChange = (setter) => (e) => {
    setter(e.target.checked);
  };

  const totalStock = colors.reduce((total, color) => {
    return (
      total +
      allowedSizes.reduce((sum, size) => {
        return sum + (color.sizes[size]?.quantity || 0);
      }, 0)
    );
  }, 0);

  const handleImageUpload = async () => {
    try {
      const formData = new FormData();
      // Removed the direct image and video appending as per the suggestion

      // Upload color thumbnail images (if any)
      colors.forEach((color, colorIndex) => {
        if (color.icon) {
          formData.append(`colorIcons[${colorIndex}]`, color.icon);
        }
        (color.images || []).forEach((imgFile, imgIdx) => {
          formData.append(`colorMainImages[${colorIndex}][${imgIdx}]`, imgFile);
        });
      });

      const { data: uploadedImages } = await api.post(
        `/api/products/upload-images`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );

      // Map uploaded color images to each color
      const updatedColors = colors.map((color, index) => ({
        ...color,
        icon: uploadedImages.colorIcons ? uploadedImages.colorIcons[index] : color.icon,
        images: uploadedImages.colorVariantImages
          ? uploadedImages.colorVariantImages[index] || []
          : (color.images || []),
      }));

      return { mainImages: uploadedImages.mainImages, updatedColors };
    } catch (error) {
      console.error("Image upload failed:", error);
      alert("Image upload failed. Please try again.");
      return null;
    }
  };
  
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const uploadedImages = await handleImageUpload();
      if (!uploadedImages) return;

      // Only keep the fields needed for backend (no File objects or previews)
      const cleanedColors = uploadedImages.updatedColors.map(color => ({
        name: color.name,
        icon: color.icon, // This is now a URL
        images: color.images, // This is now an array of URLs
        sizes: color.sizes
      }));

      const productData = {
        name,
        brand,
        description,
        price,
        discountPrice,
        category,
        fabric,
        tags: tags.split(",").map((tag) => tag.trim().toLowerCase()),
        Trending,
        NewArrival,
        bestseller,
        weight,
        colors: cleanedColors,
        countInStock: totalStock,
        moreDetails,
        returnPolicy,
        howToCare,
        metaTitle,
        metaDescription,
        metaKeywords,
        preorderAvailable,
        preorderDiscountType,
        preorderDiscountValue,
      };

      await api.post(`/api/products/admin/products`, productData, { withCredentials: true });

      alert("Product Created Successfully!");

      // Reset Form
      setName("");
      setBrand("");
      setDescription("");
      setPrice("");
      setDiscountPrice("");
      setCategory("");
      setTags("");
      setTrending(false);
      setNewArrival(false);
      setBestseller(false);
      setWeight("");
      setColors([]);
      setMoreDetails("");
      setReturnPolicy("");
      setHowToCare("");
      setMetaTitle("");
      setMetaDescription("");
      setMetaKeywords("");
      setFabric("");
    } catch (err) {
      console.error("Error creating product:", err);
      setError(
        "Failed to create product. Please check your details and try again."
      );
    }
  };

  const addColor = () => {
    const sizes = {};
    allowedSizes.forEach((size) => {
      sizes[size] = { quantity: 0, sku: "" };
    });

    setColors([
      ...colors,
      {
        name: "",
        icon: "",
        iconPreview: "",
        images: [], // was mainImages
        imagePreviews: [], // was mainImagePreviews
        sizes,
      },
    ]);
  };

  const removeColor = (index) => {
    setColors(colors.filter((_, i) => i !== index));
  };

  const updateColor = (index, field, value) => {
    const updatedColors = [...colors];
    updatedColors[index][field] = value;
    setColors(updatedColors);
  };

  const updateColorSize = (index, size, field, value) => {
    const updatedColors = [...colors];
    updatedColors[index].sizes[size][field] =
      field === "quantity" ? parseInt(value) || 0 : value;
    setColors(updatedColors);
  };
  const uploadColorIcon = (e, index) => {
    const file = e.target.files[0];
    if (!file) return;
    const updatedColors = [...colors];
    updatedColors[index].icon = file;
    updatedColors[index].iconPreview = URL.createObjectURL(file);
    setColors(updatedColors);
  };

  const uploadColorMainImages = (e, index) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    const updatedColors = [...colors];
    updatedColors[index].images = [
      ...(updatedColors[index].images || []),
      ...files,
    ];
    updatedColors[index].imagePreviews = [
      ...(updatedColors[index].imagePreviews || []),
      ...files.map((file) => URL.createObjectURL(file)),
    ];
    setColors(updatedColors);
  };

  const handleShowImage = (src) => {
    setModalImageSrc(src);
    setShowImageModal(true);
  };

  const handleCloseImage = () => {
    setShowImageModal(false);
    setModalImageSrc("");
  };

  return (
    <Container>
      <h2 className="text-center my-4">Create New Product</h2>
      {error && <Alert variant="danger">{error}</Alert>}

      <Form onSubmit={handleSubmit}>
        {/* --- Basic Info --- */}
        <Card className="mb-4 shadow-sm">
          <Card.Body>
            <Card.Title>Basic Information</Card.Title>
            <Row>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Product Name</Form.Label>
                  <Form.Control
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Brand</Form.Label>
                  <Form.Control
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mt-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </Form.Group>
          </Card.Body>
        </Card>

        {/* --- Pricing & Category --- */}
        <Card className="mb-4 shadow-sm">
          <Card.Body>
            <Card.Title>Pricing & Category</Card.Title>
            <Row>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Price (₹)</Form.Label>
                  <Form.Control
                    type="number"
                    min="1"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Discount Price (₹)</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    value={discountPrice}
                    onChange={(e) => setDiscountPrice(e.target.value)}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row className="mt-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Category</Form.Label>
                  <Form.Control
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Fabric</Form.Label>
                  <Form.Control
                    value={fabric}
                    onChange={(e) => setFabric(e.target.value)}
                    placeholder="e.g. Cotton, Linen"
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row className="mt-3">
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Tags (comma separated)</Form.Label>
                  <Form.Control
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* --- Color Variants --- */}
        <Card className="mb-4 shadow-sm">
          <Card.Body>
            <Card.Title>Color Variants</Card.Title>
            {colors.map((color, index) => (
              <div key={index} className="color-variant-box">
                <Row>
                  <Col md={5}>
                    <Form.Control
                      type="text"
                      placeholder="Color Name"
                      value={color.name}
                      onChange={(e) =>
                        updateColor(index, "name", e.target.value)
                      }
                      required
                    />
                  </Col>
                  <Col md={5}>
                    <Form.Label>Color Icon (1 image)</Form.Label>
                    <Form.Control
                      type="file"
                      accept="image/*"
                      onChange={e => uploadColorIcon(e, index)}
                    />
                    {color.iconPreview && (
                      <div className="position-relative mt-2">
                        <img src={color.iconPreview} alt="Icon" className="preview-thumb" style={{
                          width: 60,
                          height: 60,
                          objectFit: "cover",
                          border: "1px solid #ccc",
                          borderRadius: 4,
                          cursor: "pointer"
                        }} />
                        <Button
                          variant="link"
                          className="position-absolute top-0 end-0"
                          onClick={() => handleShowImage(color.iconPreview)}
                        >
                          <i className="bi bi-zoom-in"></i>
                        </Button>
                      </div>
                    )}

                    <Form.Label className="mt-2">Main Images (multiple)</Form.Label>
                    <Form.Control
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={e => uploadColorMainImages(e, index)}
                    />
                    <div className="d-flex flex-wrap mt-2">
                      {color.imagePreviews && color.imagePreviews.map((src, i) => (
                        <div key={i} style={{ position: "relative", marginRight: 8, marginBottom: 8 }}>
                          <img
                            src={src}
                            alt="Main"
                            className="preview-thumb"
                            style={{ width: 60, height: 60, objectFit: "cover", cursor: "pointer", border: "1px solid #ccc", borderRadius: 4 }}
                            onClick={() => {
                              setModalImageSrc(src);
                              setShowImageModal(true);
                            }}
                          />
                          <Button
                            variant="danger"
                            size="sm"
                            style={{
                              position: "absolute",
                              top: 0,
                              right: 0,
                              padding: "0 6px",
                              borderRadius: "0 4px 0 4px",
                            }}
                            onClick={() => {
                              // Remove image from both images and previews
                              const updatedColors = [...colors];
                              updatedColors[index].images = updatedColors[index].images.filter((_, idx) => idx !== i);
                              updatedColors[index].imagePreviews = updatedColors[index].imagePreviews.filter((_, idx) => idx !== i);
                              setColors(updatedColors);
                            }}
                          >
                            ×
                          </Button>
                        </div>
                      ))}
                    </div>
                  </Col>
                  <Col md={2}>
                    <Button
                      variant="danger"
                      onClick={() => removeColor(index)}
                      className="mt-1"
                    >
                      ✕
                    </Button>
                  </Col>
                </Row>
                {/* --- Size Labels --- */}
                <Row className="mt-3 text-center fw-bold">
                  {allowedSizes.map((size) => (
                    <Col key={size}>
                      <div>{size}</div>
                    </Col>
                  ))}
                </Row>

                {/* --- Quantity and SKU Inputs --- */}
                <Row className="mb-3">
                  {allowedSizes.map((size) => (
                    <Col key={size}>
                      <Form.Group>
                        <Form.Control
                          type="number"
                          min="0"
                          placeholder={`Qty for ${size}`}
                          value={color.sizes[size].quantity}
                          onChange={(e) =>
                            updateColorSize(
                              index,
                              size,
                              "quantity",
                              e.target.value
                            )
                          }
                        />
                        <Form.Control
                          type="text"
                          placeholder={`SKU for ${size}`}
                          value={color.sizes[size].sku}
                          onChange={(e) =>
                            updateColorSize(index, size, "sku", e.target.value)
                          }
                          className="mt-1"
                        />
                      </Form.Group>
                    </Col>
                  ))}
                </Row>
              </div>
            ))}
            <Button variant="secondary" onClick={addColor}>
              + Add Color
            </Button>
          </Card.Body>
        </Card>

        {/* --- Additional Details --- */}
        <Card className="mb-4 shadow-sm">
          <Card.Body>
            <Card.Title>Additional Details</Card.Title>
            <Row>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Weight (grams)</Form.Label>
                  <Form.Control
                    type="number"
                    min="1"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Total Stock</Form.Label>
                  <div className="p-2 bg-light border rounded">
                    {totalStock} Items
                  </div>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Check
                  type="checkbox"
                  label="Trending"
                  checked={Trending}
                  onChange={handleCheckboxChange(setTrending)}
                />
                <Form.Check
                  type="checkbox"
                  label="New Arrival"
                  checked={NewArrival}
                  onChange={handleCheckboxChange(setNewArrival)}
                />
                <Form.Check
                  type="checkbox"
                  label="Bestseller"
                  checked={bestseller}
                  onChange={handleCheckboxChange(setBestseller)}
                />
              </Col>
            </Row>
            <Row className="mt-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>More Details</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={moreDetails}
                    onChange={(e) => setMoreDetails(e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Return Policy</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={returnPolicy}
                    onChange={(e) => setReturnPolicy(e.target.value)}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row className="mt-3">
              <Col>
                <Form.Group>
                  <Form.Label>How to Care</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={howToCare}
                    onChange={(e) => setHowToCare(e.target.value)}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row className="mt-3">
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Meta Title (SEO)</Form.Label>
                  <Form.Control
                    value={metaTitle}
                    onChange={(e) => setMetaTitle(e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Meta Description (SEO)</Form.Label>
                  <Form.Control
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Meta Keywords (comma separated, SEO)</Form.Label>
                  <Form.Control
                    value={metaKeywords}
                    onChange={(e) => setMetaKeywords(e.target.value)}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* --- Preorder Details --- */}
        <Card className="mb-4 shadow-sm">
          <Card.Body>
            <Card.Title>Preorder Details</Card.Title>
            <Form.Group>
              <Form.Check
                type="checkbox"
                label="Preorder Available"
                checked={preorderAvailable}
                onChange={e => setPreorderAvailable(e.target.checked)}
                name="preorderAvailable"
              />
            </Form.Group>

            {preorderAvailable && (
              <>
                <Form.Group>
                  <Form.Label>Preorder Discount Type</Form.Label>
                  <Form.Select
                    value={preorderDiscountType}
                    onChange={e => setPreorderDiscountType(e.target.value)}
                    name="preorderDiscountType"
                  >
                    <option value="fixed">Fixed (₹)</option>
                    <option value="percentage">Percentage (%)</option>
                  </Form.Select>
                </Form.Group>
                <Form.Group>
                  <Form.Label>Preorder Discount Value</Form.Label>
                  <Form.Control
                    type="number"
                    value={preorderDiscountValue}
                    onChange={e => setPreorderDiscountValue(e.target.value)}
                    name="preorderDiscountValue"
                    min="1"
                  />
                </Form.Group>
              </>
            )}
          </Card.Body>
        </Card>

        <Button type="submit" variant="primary" className="w-100">
          Create Product
        </Button>

        {/* --- Image Modal --- */}
        <Modal
          show={showImageModal}
          onHide={() => setShowImageModal(false)}
          centered
        >
          <Modal.Body className="text-center">
            <img
              src={modalImageSrc}
              alt="Full Preview"
              style={{ maxWidth: "100%", maxHeight: "80vh", borderRadius: 8 }}
            />
          </Modal.Body>
        </Modal>
      </Form>
    </Container>
  );
};

export default CreateProduct;
