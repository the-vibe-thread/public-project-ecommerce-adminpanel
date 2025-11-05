import { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { api } from "../api";

const BlogEditor = () => {
  const [form, setForm] = useState({
    title: "",
    slug: "",
    summary: "",
    content: "",
    author: "",
    date: "",
  });
  const [imageFile, setImageFile] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => formData.append(key, value));
      if (imageFile) formData.append("image", imageFile);

      await api.post("/api/blogs", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Blog posted successfully!");
      setForm({
        title: "",
        slug: "",
        summary: "",
        content: "",
        author: "",
        date: "",
      });
      setImageFile(null);
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to post blog. Try again."
      );
    }
  };

  return (
    <div className="container py-4" style={{ maxWidth: 700 }}>
      <h2 className="mb-4">Write a New Blog</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label>Title</label>
          <input className="form-control" name="title" value={form.title} onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <label>Slug (unique, URL-friendly)</label>
          <input className="form-control" name="slug" value={form.slug} onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <label>Image</label>
          <input
            className="form-control"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
          />
        </div>
        <div className="mb-3">
          <label>Summary</label>
          <textarea className="form-control" name="summary" value={form.summary} onChange={handleChange} rows={2} required />
        </div>
        <div className="mb-3">
          <label>Content</label>
          <textarea className="form-control" name="content" value={form.content} onChange={handleChange} rows={6} required />
        </div>
        <div className="mb-3">
          <label>Author</label>
          <input className="form-control" name="author" value={form.author} onChange={handleChange} />
        </div>
        <div className="mb-3">
          <label>Date</label>
          <input type="date" className="form-control" name="date" value={form.date} onChange={handleChange} />
        </div>
        <button className="btn btn-primary" type="submit">Post Blog</button>
      </form>
      <ToastContainer position="top-center" autoClose={2000} />
    </div>
  );
};

export default BlogEditor;