import { useState, useEffect } from 'react'
import './App.css'
import SignUp from './SignUp'
import SignIn from './SignIn'
import BlogPostForm from './BlogPostForm'
import PostList from './PostList'

function App() {
  const [posts, setPosts] = useState([])
  const [user, setUser] = useState(null)
  const [view, setView] = useState('signin')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [message, setMessage] = useState('')

  // Load current user and blog posts
  useEffect(() => {
    async function loadData() {
      try {
        const userResponse = await fetch('/api/me')
        const userData = await userResponse.json()

        if (userData.user) {
          setUser(userData.user)
          setView('blog')
        }

        const postsResponse = await fetch('/api/posts')
        const postsData = await postsResponse.json()

        setPosts(postsData)
      } catch (error) {
        console.error('Error loading data:', error)
      }
    }

    loadData()
  }, [])

  // Refresh posts from backend
  async function loadPosts() {
    const response = await fetch('/api/posts')
    const data = await response.json()
    setPosts(data)
  }

  // Handle successful login
  async function handleLogin(userData) {
    setUser(userData)
    setView('blog')
    setMessage('')
    await loadPosts()
  }

  // Sign out
  async function handleSignOut() {
    try {
      await fetch('/api/signout', {
        method: 'POST'
      })

      setUser(null)
      setView('signin')
      setEditingId(null)
      setTitle('')
      setContent('')
      setMessage('You have signed out.')
      await loadPosts()
    } catch (error) {
      setMessage('Could not sign out.')
    }
  }

  // Create or update a post
  async function handleSubmit(e) {
    e.preventDefault()

    if (!title.trim() || !content.trim()) {
      setMessage('Please complete all fields.')
      return
    }

    const isEditing = editingId !== null

    try {
      const response = await fetch(
        isEditing ? `/api/posts/${editingId}` : '/api/posts',
        {
          method: isEditing ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ title, content })
        }
      )

      const data = await response.json()

      if (!response.ok) {
        setMessage(data.message)
        return
      }

      setMessage(data.message)
      setTitle('')
      setContent('')
      setEditingId(null)

      await loadPosts()
    } catch (error) {
      setMessage('Could not connect to the server.')
    }
  }

  // Load post into edit form
  function handleEdit(post) {
    if (!post.isOwner) return

    setEditingId(post.id)
    setTitle(post.title)
    setContent(post.content)
    setMessage('')

    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Cancel editing
  function handleCancel() {
    setEditingId(null)
    setTitle('')
    setContent('')
  }

  // Delete a post
  async function handleDelete(id) {
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return
    }

    try {
      const response = await fetch(`/api/posts/${id}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (!response.ok) {
        setMessage(data.message)
        return
      }

      setMessage(data.message)
      await loadPosts()
    } catch (error) {
      setMessage('Could not delete the post.')
    }
  }

  return (
    <div className="app">
      <header>
        <h1>Kelvin's Blog</h1>
        <p>Share your thoughts and ideas.</p>

        {user && (
          <div>
            <p>Welcome, {user.name}!</p>
            <button onClick={handleSignOut}>Sign Out</button>
          </div>
        )}
      </header>

      <main>
        {!user ? (
          view === 'signup' ? (
            <SignUp
              onSwitchToSignIn={() => {
                setView('signin')
                setMessage('')
              }}
            />
          ) : (
            <SignIn
              onLogin={handleLogin}
              onSwitchToSignUp={() => {
                setView('signup')
                setMessage('')
              }}
            />
          )
        ) : (
          <>
            <BlogPostForm
              title={title}
              setTitle={setTitle}
              content={content}
              setContent={setContent}
              editingId={editingId}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
            />

            <PostList
              posts={posts}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </>
        )}

        {message && <p>{message}</p>}
      </main>
    </div>
  )
}

export default App
