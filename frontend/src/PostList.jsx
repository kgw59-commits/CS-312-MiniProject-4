function PostList({ posts, onEdit, onDelete }) {
  return (
    <section className="post-list">
      <h2>Blog Posts</h2>

      {posts.length === 0 ? (
        <p>No posts yet. Be the first to publish!</p>
      ) : (
        posts.map(post => (
          <article className="post-card" key={post.id}>
            <h3>{post.title}</h3>

            <p>{post.content}</p>

            <small>
              By {post.author} | {post.date}
            </small>

            {post.isOwner && (
              <div className="post-actions">
                <button onClick={() => onEdit(post)}>
                  Edit
                </button>

                <button onClick={() => onDelete(post.id)}>
                  Delete
                </button>
              </div>
            )}
          </article>
        ))
      )}
    </section>
  )
}

export default PostList
