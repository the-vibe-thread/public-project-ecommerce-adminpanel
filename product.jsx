import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Table,
  Form,
  Button,
  Modal,
  Alert,
  Spinner,
} from "react-bootstrap";
import io from "socket.io-client";
import { api } from "../api";

const socket = io(process.env.REACT_APP_BACKEND_URL);

const backendUrl = process.env.REACT_APP_BACKEND_URL ;

const Products = () => {
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [tagFilter, setTagFilter] = useState("");
  const [trendingFilter, setTrendingFilter] = useState("");
  const [newArrivalFilter, setNewArrivalFilter] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [page, setPage] = useState(1);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // 🔍 Image Preview State
  const [previewImages, setPreviewImages] = useState([]); // Store all images
  const [currentImageIndex, setCurrentImageIndex] = useState(0); // Track index
  const [showPreview, setShowPreview] = useState(false);

  // 📦 Variant Modal State
  const [variantModalProduct, setVariantModalProduct] = useState(null);

  const productsPerPage = 10;

  // ✅ Fetch Products with Filters and Search
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/api/products/`, {
          params: {
            searchTerm,
            category: categoryFilter,
            tag: tagFilter,
            trending: trendingFilter,
            newArrival: newArrivalFilter,
            sortBy,
          },
          withCredentials: true,
        });

        const updatedProducts = data.products.map((product) => {
          const variants = product.variants || [];
          let price, discountPrice;

          if (variants.length > 0) {
            const bestVariant = variants.reduce(
              (best, current) =>
                current.discountPrice < best.discountPrice ? current : best,
              variants[0]
            );
            price = bestVariant?.price;
            discountPrice = bestVariant?.discountPrice;
          } else {
            price = product.price;
            discountPrice = product.discount?.price;
          }

          return {
            ...product,
            minPrice: price || "N/A",
            discountPrice: discountPrice || "N/A",
            calculatedDiscount:
              price && discountPrice
                ? Math.round(((price - discountPrice) / price) * 100)
                : 0,
            totalStock:
              variants.reduce((sum, variant) => sum + variant.stock, 0) ||
              product.countInStock ||
              0,
          };
        });

        setProducts(updatedProducts);
      } catch (err) {
        console.error("Failed to fetch products", err);
        setError("Failed to load products. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();

    // ✅ Real-time Socket Updates
    socket.on("productUpdated", (updatedProduct) => {
      setProducts((prev) =>
        prev.map((product) =>
          product.slug === updatedProduct.slug ? updatedProduct : product
        )
      );
    });

    socket.on("productDeleted", (deletedSlug) => {
      setProducts((prev) =>
        prev.filter((product) => product.slug !== deletedSlug)
      );
    });

    return () => {
      socket.off("productUpdated");
      socket.off("productDeleted");
    };
  }, [
    searchTerm,
    categoryFilter,
    tagFilter,
    trendingFilter,
    newArrivalFilter,
    sortBy,
    page,
  ]);

  // ✅ Pagination
  const paginatedProducts = products.slice(
    (page - 1) * productsPerPage,
    page * productsPerPage
  );

  // ✅ Handlers
  const handleSelectProduct = (slug) => {
    setSelectedProducts((prev) =>
      prev.includes(slug)
        ? prev.filter((pSlug) => pSlug !== slug)
        : [...prev, slug]
    );
  };

  const handleBulkDelete = async () => {
    try {
      await api.post(
        `/api/products/admin/bulk-delete`,
        { slugs: selectedProducts, deleteVariants: true },
        { withCredentials: true }
      );

      selectedProducts.forEach((slug) => socket.emit("productDeleted", slug));
      setSelectedProducts([]);
    } catch (err) {
      setError("Failed to delete products. Please try again.");
    }
  };

  const handleDeleteProduct = async (slug) => {
    try {
      await api.delete(`/api/products/admin/${slug}`, { withCredentials: true });
      setProducts((prev) => prev.filter((product) => product.slug !== slug));
      socket.emit("productDeleted", slug);
    } catch (err) {
      setError("Failed to delete product. Please try again.");
    }
  };

  // 🔎 Show Image Preview Modal
  const handleImagePreview = (images) => {
    console.log("Images for preview:", images); // Debugging

    if (!images || images.length === 0) {
      console.error("No images available for preview.");
      return;
    }

    const fullImagePaths = images.map((img) =>
      img.startsWith("http") ? img : `${backendUrl}${img}`
    );

    setPreviewImages(fullImagePaths);
    setCurrentImageIndex(0);
    setShowPreview(true);
  };
  return (
    <Container>
      <h2 className="my-3 text-center">Manage Products</h2>

      {/* ✅ Error Handling */}
      {error && <Alert variant="danger">{error}</Alert>}

      {/* ✅ Loading Spinner */}
      {loading && <Spinner animation="border" className="d-block mx-auto" />}

      <Row className="mb-3 d-flex justify-content-between">
        <Col className="text-start">
          <Link to="/upload-stock">
            <Button variant="success">📦 Manage Stock</Button>
          </Link>
        </Col>

        <Col className="text-end">
          <Link to="/create-product">
            <Button variant="primary">➕ Create Product</Button>
          </Link>
        </Col>
      </Row>

      {/* ✅ Filters Section */}
      {/* ✅ Filters Section */}
      <Row className="mb-3 g-2">
        <Col xs={12} md={3}>
          <Form.Control
            type="text"
            placeholder="Search Products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Col>

        <Col xs={12} md={2}>
          <Form.Select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">All Categories</option>
            <option value="Electronics">Electronics</option>
            <option value="Fashion">Fashion</option>
            <option value="Home">Home</option>
          </Form.Select>
        </Col>

        <Col xs={12} md={2}>
          <Form.Control
            type="text"
            placeholder="Search Tags..."
            value={tagFilter}
            onChange={(e) => setTagFilter(e.target.value)}
          />
        </Col>

        <Col xs={12} md={2}>
          <Form.Select
            value={trendingFilter}
            onChange={(e) => setTrendingFilter(e.target.value)}
          >
            <option value="">Trending</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </Form.Select>
        </Col>

        <Col xs={12} md={2}>
          <Form.Select
            value={newArrivalFilter}
            onChange={(e) => setNewArrivalFilter(e.target.value)}
          >
            <option value="">New Arrival</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </Form.Select>
        </Col>

        <Col xs={12} md={3}>
          <Form.Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="">Sort By</option>
            <option value="priceLowHigh">Price: Low to High</option>
            <option value="priceHighLow">Price: High to Low</option>
          </Form.Select>
        </Col>
      </Row>

      {/* ✅ Bulk Delete Button */}
      {selectedProducts.length > 0 && (
        <Row className="mb-3">
          <Col className="text-end">
            <Button variant="danger" onClick={handleBulkDelete}>
              Delete Selected ({selectedProducts.length})
            </Button>
          </Col>
        </Row>
      )}

      {/* ✅ Product Table */}
      <Table striped bordered hover responsive="sm">
        <thead>
          <tr>
            <th>Select</th>
            <th>Image</th>
            <th>Name</th>
            <th>Price</th>
            <th>Discount Price</th>
            <th>Discount %</th>
            <th>Total Stock</th>
            <th>Variants</th>
            <th>Trending</th>
            <th>New Arrival</th>
            <th>Bestseller</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {paginatedProducts.map((product) => (
            <tr key={product.slug}>
              <td>
                <Form.Check
                  type="checkbox"
                  checked={selectedProducts.includes(product.slug)}
                  onChange={() => handleSelectProduct(product.slug)}
                />
              </td>
              <td>
                {(() => {
                  let images = [];

                  if (product.variants?.length > 0) {
                    images = product.variants.flatMap((v) => v.images || []);
                  } else if (product.images?.length > 0) {
                    images = product.images;
                  } else if (product.colors?.length > 0) {
                    images = product.colors.flatMap((c) =>
                      (c.images && c.images.length > 0)
                        ? c.images
                        : c.image
                        ? [c.image]
                        : []
                    );
                  }
                  if (images.length > 0) {
                    return (
                      <img
                        src={
                          images[0]?.startsWith("http")
                            ? images[0]
                            : `${backendUrl}${images[0]}`
                        }
                        alt={product.name}
                        style={{ width: "50px", cursor: "pointer" }}
                        onClick={() => handleImagePreview(images)}
                        onError={(e) => (e.target.src = "/fallback-image.jpg")}
                      />
                    );
                  } else {
                    return <span>No Image</span>;
                  }
                })()}
              </td>
              <td>{product.name}</td>
              <td>₹{product.price}</td>
              <td>₹{product.discount?.price || "N/A"}</td>
              <td>{product.calculatedDiscount || 0}%</td>
              <td>{product.totalStock}</td>
              <td>
                {product.variants?.length > 0 ? (
                  <div style={{ display: "flex", gap: 4 }}>
                    {product.variants.map((variant, vIdx) =>
                      (variant.images || []).map((img, i) => (
                        <img
                          key={vIdx + "-" + i}
                          src={
                            img.startsWith("http") ? img : `${backendUrl}${img}`
                          }
                          alt={variant.color}
                          style={{
                            width: 30,
                            height: 30,
                            objectFit: "cover",
                            borderRadius: 4,
                            cursor: "pointer",
                          }}
                          title={`${variant.color} / ${variant.size}`}
                          onClick={() => handleImagePreview(variant.images)}
                          onError={(e) =>
                            (e.target.src = "/fallback-image.jpg")
                          }
                        />
                      ))
                    )}
                  </div>
                ) : product.colors?.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {product.colors.map((color, cIdx) => (
                      <div key={cIdx} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        {/* Color Icon/Thumbnail */}
                        {color.icon && (
                          <img
                            src={color.icon.startsWith("http") ? color.icon : `${backendUrl}${color.icon}`}
                            alt={color.name + " icon"}
                            style={{
                              width: 32,
                              height: 32,
                              objectFit: "cover",
                              border: "2px solid #eee",
                              borderRadius: 6,
                              marginRight: 4,
                            }}
                            title={color.name + " icon"}
                          />
                        )}
                        {/* Main Images */}
                        {(color.images || []).map((img, i) => (
                          <img
                            key={i}
                            src={img.startsWith("http") ? img : `${backendUrl}${img}`}
                            alt={color.name}
                            style={{
                              width: 40,
                              height: 40,
                              objectFit: "cover",
                              borderRadius: 4,
                              marginRight: 4,
                              cursor: "pointer",
                            }}
                            title={color.name}
                            onClick={() => handleImagePreview([img])}
                            onError={(e) => (e.target.src = "/fallback-image.jpg")}
                          />
                        ))}
                        <span style={{ minWidth: 60, fontSize: 12 }}>{color.name}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span>No Variants</span>
                )}
              </td>
              <td>{product.Trending ? "✅" : "❌"}</td>
              <td>{product.NewArrival ? "✅" : "❌"}</td>
              <td>{product.bestseller ? "✅" : "❌"}</td>{" "}
              {/* Bestseller status */}
              <td>
                <Link to={`/edit-product/${product.slug}`}>
                  <Button variant="warning" className="me-2">
                    Edit
                  </Button>
                </Link>
                <Button
                  variant="danger"
                  onClick={() => handleDeleteProduct(product.slug)}
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* 🔎 Image Preview Modal */}
      <Modal show={showPreview} onHide={() => setShowPreview(false)} centered>
        <Modal.Body className="text-center">
          {previewImages.length > 0 && (
            <>
              <img
                src={previewImages[currentImageIndex]}
                alt="Preview"
                className="w-100"
                style={{ maxHeight: "400px", objectFit: "contain" }}
              />

              {/* Navigation Buttons */}
              {previewImages.length > 1 && (
                <div className="d-flex justify-content-between mt-3">
                  <Button
                    variant="secondary"
                    disabled={currentImageIndex === 0}
                    onClick={() => setCurrentImageIndex((prev) => prev - 1)}
                  >
                    ◀ Prev
                  </Button>

                  <Button
                    variant="secondary"
                    disabled={currentImageIndex === previewImages.length - 1}
                    onClick={() => setCurrentImageIndex((prev) => prev + 1)}
                  >
                    Next ▶
                  </Button>
                </div>
              )}
            </>
          )}
        </Modal.Body>
      </Modal>

      {/* 📦 Variants Modal */}
      <Modal
        show={!!variantModalProduct}
        onHide={() => setVariantModalProduct(null)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Variants for {variantModalProduct?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {variantModalProduct?.variants?.map((variant, idx) => (
            <div key={idx} className="mb-3">
              <strong>
                {variant.color} / {variant.size}
              </strong>
              <div style={{ display: "flex", gap: 4 }}>
                {(variant.images || []).map((img, i) => (
                  <img
                    key={i}
                    src={img.startsWith("http") ? img : `${backendUrl}${img}`
                    }
                    alt={variant.color}
                    style={{
                      width: 40,
                      height: 40,
                      objectFit: "cover",
                      borderRadius: 4,
                    }}
                    onError={(e) => (e.target.src = "/fallback-image.jpg")}
                  />
                ))}
              </div>
            </div>
          ))}

          {/* Color Variants (if any) */}
          {variantModalProduct?.colors?.map((color, idx) => (
            <div key={idx} className="mb-3">
              <strong>{color.name}</strong>
              <div style={{ display: "flex", gap: 4 }}>
                {(color.images || []).map((img, i) => (
                  <img
                    key={i}
                    src={img.startsWith("http") ? img : `${backendUrl}${img}`
                    }
                    alt={color.name}
                    style={{
                      width: 40,
                      height: 40,
                      objectFit: "cover",
                      borderRadius: 4,
                    }}
                    onError={(e) => (e.target.src = "/fallback-image.jpg")}
                  />
                ))}
              </div>
            </div>
          ))}
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default Products;
