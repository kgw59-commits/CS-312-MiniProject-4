import { useState } from 'react'

function SignIn({ onLogin, onSwitchToSignUp }) {
  const [user_id, setUserId] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()

    try {
      const response = await fetch('/api/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id,
          password
        })
      })

      const data = await response.json()

      if (response.ok) {
        onLogin(data.user)
      } else {
        setMessage(data.message)
      }
    } catch (error) {
      setMessage('Could not connect to the server.')
    }
  }

  return (
    <section className="post-form">
      <h2>Sign In</h2>

      <form onSubmit={handleSubmit}>
        <label>User ID</label>
        <input
          type="text"
          value={user_id}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="Your user ID"
          required
        />

        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Your password"
          required
        />

        <button type="submit">Sign In</button>
      </form>

      {message && <p>{message}</p>}

      <p>
        Don't have an account?{' '}
        <button type="button" onClick={onSwitchToSignUp}>
          Sign Up
        </button>
      </p>
    </section>
  )
}

export default SignIn
