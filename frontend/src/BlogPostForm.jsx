function BlogPostForm({
  title,
  setTitle,
  content,
  setContent,
  editingId,
  onSubmit,
  onCancel
}) {
  return (
    <section className="post-form">
      <h2>
        {editingId !== null ? 'Edit Post' : 'Create a New Post'}
      </h2>

      <form onSubmit={onSubmit}>
        <label>Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Post title"
          required
        />

        <label>Content</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your blog post..."
          rows="5"
          required
        />

        <button type="submit">
          {editingId !== null ? 'Update Post' : 'Publish Post'}
        </button>

        {editingId !== null && (
          <button type="button" onClick={onCancel}>
            Cancel Edit
          </button>
        )}
      </form>
    </section>
  )
}

export default BlogPostForm
