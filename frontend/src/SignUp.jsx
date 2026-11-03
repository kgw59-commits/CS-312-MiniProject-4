import { useState } from 'react'

function SignUp({ onSwitchToSignIn }) {
  const [user_id, setUserId] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()

    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id,
          password,
          name
        })
      })

      const data = await response.json()

      if (response.ok) {
        setMessage(data.message)
        setUserId('')
        setPassword('')
        setName('')
      } else {
        setMessage(data.message)
      }
    } catch (error) {
      setMessage('Could not connect to the server.')
    }
  }

  return (
    <section className="post-form">
      <h2>Create an Account</h2>

      <form onSubmit={handleSubmit}>
        <label>Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          required
        />

        <label>User ID</label>
        <input
          type="text"
          value={user_id}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="Choose a user ID"
          required
        />

        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Choose a password"
          required
        />

        <button type="submit">Sign Up</button>
      </form>

      {message && <p>{message}</p>}

      <p>
        Already have an account?{' '}
        <button type="button" onClick={onSwitchToSignIn}>
          Sign In
        </button>
      </p>
    </section>
  )
}

export default SignUp
