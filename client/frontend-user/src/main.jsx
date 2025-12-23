import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// 1. Import the merged index.css first. 
// This contains Tailwind and the Scoped Academic Theme.
import './index.css' 

// 2. If you still have App.css, import it AFTER index.css.
// Note: Make sure you cleared the #root styles in App.css as discussed!
import './App.css' 

import App from './App.jsx'
import { AuthProvider } from "../src/components/auth/AuthContext"

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
)