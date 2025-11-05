import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Form, Button, Alert, Spinner, Row, Col } from "react-bootstrap";
import io from "socket.io-client";
import {api} from "../api"

const socket = io(process.env.REACT_APP_BACKEND_URL);
const backendUrl = process.env.REACT_APP_BACKEND_URL;

const EditProduct = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [productData, setProductData] = useState({
    name: "",
    brand: "",
    description: "",
    price: "",
    discountPrice: "",
    category: "",
    tags: "",
    Trending: false,
    NewArrival: false,
    bestseller: false,
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
    weight: "",
    moreDetails: "",
    returnPolicy: "",
    howToCare: "",
    images: [],
    colors: [],
    stockStatus: "",
    fabric: "", // <-- Add this line
  });

  const [imagePreviews, setImagePreviews] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [availableSizes, setAvailableSizes] = useState([]); // e.g. [{ size: "M", outOfStock: false }, ...]

  // Fetch product and sizes
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await api.get(`/api/products/${slug}`, {
          withCredentials: true,
        });

        // Set available sizes from API response
        const defaultSizes = ["S", "M", "L", "XL", "XXL"];
        const apiSizes = (data.product.outOfStockSizes || []).map(s => s.size);
        const allSizes = Array.from(new Set([...defaultSizes, ...apiSizes]));
        setAvailableSizes(allSizes.map(size => ({ size })));

        const existingImages = data.product.images || [];
        const existingColors = data.product.colors || [];

        setProductData({
          name: data.product.name || "",
          brand: data.product.brand || "",
          description: data.product.description || "",
          price: data.product.price || "",
          discountPrice: data.product.discount ? data.product.discount.price : "",
          category: data.product.category || "",
          tags: Array.isArray(data.product.tags)
            ? data.product.tags.join(", ")
            : "",
          Trending: data.product.Trending || false,
          NewArrival: data.product.NewArrival || false,
          bestseller: data.product.bestseller || false,
          metaTitle: data.product.metaTitle || "",
          metaDescription: data.product.metaDescription || "",
          metaKeywords: Array.isArray(data.product.metaKeywords)
            ? data.product.metaKeywords.join(", ")
            : (data.product.metaKeywords || ""),
          weight: data.product.weight || "",
          moreDetails: data.product.moreDetails || "",
          returnPolicy: data.product.returnPolicy || "",
          howToCare: data.product.howToCare || "",
          images: existingImages,
          colors: existingColors.map(color => ({
            ...color,
            images: color.images || [],
            icon: color.icon || (color.images && color.images.length > 0 ? color.images[0] : null),
            iconPreview: color.icon
              ? (color.icon.startsWith("http") ? color.icon : `${backendUrl}${color.icon}`)
              : (color.images && color.images.length > 0
                  ? (color.images[0].startsWith("http") ? color.images[0] : `${backendUrl}${color.images[0]}`)
                  : null),
            sizes: (data.product.outOfStockSizes || []).reduce((acc, sizeObj) => {
              const sizeName = sizeObj.size;
              acc[sizeName] = {
                quantity: Number(color.sizes?.[sizeName]?.quantity) || 0,
                sku: color.sizes?.[sizeObj.size]?.sku || sizeObj.size.toLowerCase(),
              };
              return acc;
            }, {}),
          })),
          stockStatus: data.product.stockStatus || "",
          fabric: data.product.fabric || "", // <-- Add this line
          preorderAvailable: data.product.preorderAvailable || false,
          preorderDiscountType: data.product.preorderDiscountType || "fixed",
          preorderDiscountValue: data.product.preorderDiscountValue || 100,
        });

        // Set previews as URLs for existing images
        setImagePreviews(
          existingImages.map(img => {
            if (typeof img === "string") {
              // If already absolute URL, use as is
              if (img.startsWith("http")) return img;
              // Ensure exactly one slash between backend URL and path
              const backend = (backendUrl || "").replace(/\/$/, "");
              const path = img.startsWith("/") ? img : `/${img}`;
              return `${backend}${path}`;
            }
            // For File objects
            return URL.createObjectURL(img);
          })
        );
      } catch (err) {
        console.error("Failed to fetch product", err);
        setError("Failed to load product data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setProductData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setProductData((prev) => ({
      ...prev,
      images: [...prev.images, ...files],
    }));

    const previewUrls = files.map((file) => URL.createObjectURL(file));
    setImagePreviews((prev) => [...prev, ...previewUrls]);

    e.target.value = "";
  };

  const removeImage = (index) => {
    setProductData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const updateColor = (index, field, value) => {
    const updatedColors = [...productData.colors];
    updatedColors[index][field] = value;
    setProductData((prevData) => ({
      ...prevData,
      colors: updatedColors,
    }));
  };

  const uploadColorImage = (e, index) => {
    const file = e.target.files[0];
    if (file) {
      const updatedColors = [...productData.colors];
      updatedColors[index].image = file;
      updatedColors[index].imagePreview = URL.createObjectURL(file);
      setProductData((prevData) => ({
        ...prevData,
        colors: updatedColors,
      }));
    }
  };

  const uploadColorImages = (e, colorIndex) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    const updatedColors = [...productData.colors];
    updatedColors[colorIndex].images = [
      ...(updatedColors[colorIndex].images || []),
      ...files,
    ];
    updatedColors[colorIndex].imagePreviews = [
      ...(updatedColors[colorIndex].imagePreviews || []),
      ...files.map((file) => URL.createObjectURL(file)),
    ];
    setProductData((prev) => ({
      ...prev,
      colors: updatedColors,
    }));
  };

  const updateColorSize = (index, size, value) => {
    const updatedColors = [...productData.colors];
    updatedColors[index].sizes[size] = {
      ...updatedColors[index].sizes[size],
      quantity: Number(value),
    };
    setProductData((prevData) => ({
      ...prevData,
      colors: updatedColors,
    }));
  };

  const removeColor = (index) => {
    const updatedColors = [...productData.colors];
    updatedColors.splice(index, 1);
    setProductData((prevData) => ({
      ...prevData,
      colors: updatedColors,
    }));
  };

  const addColor = () => {
    setProductData((prevData) => ({
      ...prevData,
      colors: [
        ...prevData.colors,
        {
          name: "",
          sizes: (availableSizes || []).reduce((acc, sizeObj) => {
            acc[sizeObj.size] = { quantity: 0, sku: sizeObj.size.toLowerCase() };
            return acc;
          }, {}),
          image: null,
          imagePreview: null,
        },
      ],
    }));
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    
    setUpdating(true);
    setError(null);

    try {
      const formData = new FormData();

      // Append form data (except for images and colors)
      Object.keys(productData).forEach((key) => {
        if (key !== "images" && key !== "colors" && productData[key] !== undefined && productData[key] !== null) {
          formData.append(key, productData[key]);
        }
      });

      // Append images
      productData.images.forEach((image) => {
        if (image instanceof File) {
          formData.append("images", image);
        }
      });

      // Append colors
      productData.colors.forEach((color, index) => {
        if (color.name) {
          formData.append(`colors[${index}][name]`, color.name);
          formData.append(`colors[${index}][sizes]`, JSON.stringify(color.sizes));
          // Append icon
          if (color.icon instanceof File) {
            formData.append(`colorIcons[${index}]`, color.icon);
          } else if (typeof color.icon === "string" && color.icon) {
            formData.append(`colors[${index}][icon]`, color.icon);
          }
          // Append images
          (color.images || []).forEach((imgFile) => {
            if (imgFile instanceof File) {
              formData.append(`colorImages[${index}]`, imgFile);
            } else if (typeof imgFile === "string" && imgFile) {
              formData.append(`colors[${index}][images][]`, imgFile);
            }
          });
        }
      });

      // New: Handle tags and metaKeywords as arrays
      formData.append("tags", productData.tags.split(",").map(t => t.trim()));
      formData.append("metaKeywords", productData.metaKeywords.split(",").map(k => k.trim()));

      const { data } = await api.put(`/api/products/admin/${slug}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      socket.emit("productUpdated", data.product);
      alert("Product updated successfully!");
      navigate("/admin/products");
    } catch (err) {
      console.error("Failed to update product", err);
      setError("Failed to update product. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  const uploadColorIcon = (e, index) => {
    const file = e.target.files[0];
    if (file) {
      const updatedColors = [...productData.colors];
      updatedColors[index].icon = file;
      updatedColors[index].iconPreview = URL.createObjectURL(file);
      setProductData((prevData) => ({
        ...prevData,
        colors: updatedColors,
      }));
    }
  };

  if (loading)
    return <Spinner animation="border" className="d-block mx-auto" />;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <Container>
      <h2 className="my-3 text-center">Edit Product</h2>
      <Form onSubmit={handleUpdateProduct}>
        <Row>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={productData.name}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Brand</Form.Label>
              <Form.Control
                type="text"
                name="brand"
                value={productData.brand}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>
        </Row>

        <Form.Group>
          <Form.Label>Description</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            name="description"
            value={productData.description}
            onChange={handleChange}
          />
        </Form.Group>

        <Row>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Price</Form.Label>
              <Form.Control
                type="number"
                name="price"
                value={productData.price}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Discount Price</Form.Label>
              <Form.Control
                type="number"
                name="discountPrice"
                value={productData.discountPrice}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>
        </Row>

        {/* Category */}
        <Form.Group>
          <Form.Label>Category</Form.Label>
          <Form.Control
            type="text"
            name="category"
            value={productData.category}
            onChange={handleChange}
          />
        </Form.Group>

        {/* Tags */}
        <Form.Group>
          <Form.Label>Tags</Form.Label>
          <Form.Control
            type="text"
            name="tags"
            value={productData.tags}
            onChange={handleChange}
          />
        </Form.Group>

        {/* Trending */}
        <Form.Group>
          <Form.Check
            type="checkbox"
            name="Trending"
            label="Trending"
            checked={productData.Trending}
            onChange={handleChange}
          />
        </Form.Group>

        {/* New Arrival */}
        <Form.Group>
          <Form.Check
            type="checkbox"
            name="NewArrival"
            label="New Arrival"
            checked={productData.NewArrival}
            onChange={handleChange}
          />
        </Form.Group>

        {/* Bestseller */}
        <Form.Group>
          <Form.Check
            type="checkbox"
            name="bestseller"
            label="Bestseller"
            checked={productData.bestseller}
            onChange={handleChange}
          />
        </Form.Group>

        {/* Meta Title (SEO) */}
        <Row className="mt-3">
          <Col md={4}>
            <Form.Group>
              <Form.Label>Meta Title (SEO)</Form.Label>
              <Form.Control
                type="text"
                name="metaTitle"
                value={productData.metaTitle}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label>Meta Description (SEO)</Form.Label>
              <Form.Control
                type="text"
                name="metaDescription"
                value={productData.metaDescription}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label>Meta Keywords (comma separated, SEO)</Form.Label>
              <Form.Control
                type="text"
                name="metaKeywords"
                value={productData.metaKeywords}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>
        </Row>

        {/* More Details */}
        <Form.Group>
          <Form.Label>More Details</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            name="moreDetails"
            value={productData.moreDetails}
            onChange={handleChange}
          />
        </Form.Group>

        {/* Return Policy */}
        <Form.Group>
          <Form.Label>Return Policy</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            name="returnPolicy"
            value={productData.returnPolicy}
            onChange={handleChange}
          />
        </Form.Group>

        {/* How to Care */}
        <Form.Group>
          <Form.Label>How to Care</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            name="howToCare"
            value={productData.howToCare}
            onChange={handleChange}
          />
        </Form.Group>

        {/* Stock Status */}
        <Form.Group>
          <Form.Label>Stock Status</Form.Label>
          <Form.Control
            type="text"
            name="stockStatus"
            value={productData.stockStatus}
            onChange={handleChange}
          />
        </Form.Group>

        {/* Fabric */}
        <Form.Group>
          <Form.Label>Fabric</Form.Label>
          <Form.Control
            type="text"
            name="fabric"
            value={productData.fabric}
            onChange={handleChange}
            placeholder="e.g. Cotton, Linen"
          />
        </Form.Group>

        {/* Image Upload */}
        <Form.Group>
          <Form.Label>Product Images</Form.Label>
          <Form.Control type="file" multiple onChange={handleImageChange} />
          <div className="d-flex gap-2 mt-2 flex-wrap">
            {imagePreviews.map((img, i) => (
              <div key={i} className="position-relative">
                <img src={img} alt="preview" height="80" />
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => removeImage(i)}
                >
                  ×
                </Button>
              </div>
            ))}
          </div>
        </Form.Group>

        {/* Color Variants */}
        <hr />
        <h5>Color Variants</h5>
        {productData.colors.map((color, index) => (
          <div key={index} className="mb-3 p-2 border rounded">
            <Row>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Color Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="colorName"
                    value={color.name}
                    onChange={(e) => updateColor(index, 'name', e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Color Icon (thumbnail)</Form.Label>
                  <div className="mb-2">
                    {color.iconPreview || (typeof color.icon === "string" && color.icon) ? (
                      <img
                        src={color.iconPreview || (color.icon.startsWith("http") ? color.icon : `${backendUrl}${color.icon}`)}
                        alt="Color Icon"
                        style={{ width: 60, height: 60, objectFit: "cover", border: "1px solid #ccc", borderRadius: 4 }}
                      />
                    ) : (
                      <span className="text-muted">No image</span>
                    )}
                  </div>
                  <Form.Control
                    type="file"
                    accept="image/*"
                    onChange={e => uploadColorIcon(e, index)}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group>
              <Form.Label>Main Images (multiple)</Form.Label>
              <Form.Control
                type="file"
                multiple
                accept="image/*"
                onChange={e => uploadColorImages(e, index)}
              />
              <div className="d-flex flex-wrap mt-2">
                {(color.imagePreviews || []).map((src, i) => (
                  <div key={i} style={{ position: "relative", marginRight: 8, marginBottom: 8 }}>
                    <img
                      src={src}
                      alt="Main"
                      style={{ width: 60, height: 60, objectFit: "cover", border: "1px solid #ccc", borderRadius: 4 }}
                    />
                  </div>
                ))}
              </div>
            </Form.Group>
            <div>
              {availableSizes.map((sizeObj) => (
                <Row key={sizeObj.size}>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>{sizeObj.size.toUpperCase()} Quantity</Form.Label>
                      <Form.Control
                        type="number"
                        value={color.sizes[sizeObj.size]?.quantity || 0}
                        onChange={(e) =>
                          updateColorSize(index, sizeObj.size, e.target.value)
                        }
                      />
                    </Form.Group>
                  </Col>
                </Row>
              ))}
            </div>
            <Button
              variant="danger"
              size="sm"
              onClick={() => removeColor(index)}
              className="mt-2"
            >
              Remove Color
            </Button>
          </div>
        ))}
        <Button onClick={addColor}>+ Add Color</Button>

        {/* --- Preorder Details --- */}
        <hr />
        <h5>Preorder Details</h5>
        <Form.Group>
          <Form.Check
            type="checkbox"
            label="Preorder Available"
            name="preorderAvailable"
            checked={productData.preorderAvailable}
            onChange={handleChange}
          />
        </Form.Group>

        {productData.preorderAvailable && (
          <>
            <Form.Group>
              <Form.Label>Preorder Discount Type</Form.Label>
              <Form.Select
                name="preorderDiscountType"
                value={productData.preorderDiscountType || "fixed"}
                onChange={handleChange}
              >
                <option value="fixed">Fixed (₹)</option>
                <option value="percentage">Percentage (%)</option>
              </Form.Select>
            </Form.Group>
            <Form.Group>
              <Form.Label>Preorder Discount Value</Form.Label>
              <Form.Control
                type="number"
                name="preorderDiscountValue"
                value={productData.preorderDiscountValue || 100}
                min="1"
                onChange={handleChange}
              />
            </Form.Group>
          </>
        )}

        {/* Submit Button */}
        <div className="mt-4">
          <Button type="submit" variant="primary" disabled={updating}>
            {updating ? "Updating..." : "Update Product"}
          </Button>
        </div>
      </Form>
    </Container>
  );
};

export default EditProduct;
