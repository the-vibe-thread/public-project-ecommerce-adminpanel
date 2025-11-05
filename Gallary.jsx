import { useState, useEffect, useRef } from "react";
import { api } from "../api"; // Adjust the import path as needed

export default function AdminGalleryPanel() {
  const [videos, setVideos] = useState([]);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef();

  // Fetch all gallery videos on mount
  useEffect(() => {
    api
      .get("/api/gallery")
      .then((res) => setVideos(res.data.videos || []))
      .catch((err) => {
        console.error("Fetch videos error:", err.response?.data || err);
      });
  }, []);

  // Handle upload by file only
  const handleFileSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      alert("No file selected!");
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("image", file); // Must match backend Multer config
      const res = await api.post("/api/gallery", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data.video) setVideos([res.data.video, ...videos]);
      setFile(null);
      fileInputRef.current.value = "";
    } catch (err) {
      console.error("Upload by file error:", err.response?.data || err);
      alert(err.response?.data?.error || "Failed to add video by file");
    } finally {
      setLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this video?")) return;
    try {
      await api.delete(`/api/gallery/${id}`);
      setVideos(videos.filter((v) => v._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div
      style={{
        maxWidth: 600,
        margin: "2rem auto",
        padding: 24,
        border: "1px solid #eee",
        borderRadius: 12,
      }}
    >
      <h2>Gallery Videos Admin</h2>

      <form onSubmit={handleFileSubmit} style={{ marginBottom: 24 }}>
        <input
          type="file"
          accept="video/*"
          onChange={(e) => setFile(e.target.files[0])}
          ref={fileInputRef}
          style={{ marginRight: 8 }}
          disabled={loading}
        />
        <button type="submit" disabled={loading || !file}>
          Upload Video File
        </button>
      </form>

      <div>
        <h3>Gallery Videos ({videos.length})</h3>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {videos.map((v) => (
            <li
              key={v._id}
              style={{
                marginBottom: 18,
                borderBottom: "1px solid #eee",
                paddingBottom: 12,
              }}
            >
              <div style={{ marginBottom: 8 }}>
                <video
                  src={v.url}
                  controls
                  style={{ maxWidth: "100%", maxHeight: 260 }}
                />
              </div>
              <div>
                <code style={{ fontSize: 12, wordBreak: "break-all" }}>
                  {v.url}
                </code>
              </div>
              <button
                onClick={() => handleDelete(v._id)}
                style={{ marginTop: 6, color: "red" }}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>

      {loading && <p>Working...</p>}
    </div>
  );
}
