import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css' // Este CSS foi modificado
import App from './App.jsx'
import { Auth0Provider } from '@auth0/auth0-react'

createRoot(document.getElementById('root')).render(
  <Auth0Provider
      domain="dev-vlbhbshl7b1pxe8e.us.auth0.com" // Mantenha seus dados de domínio
      clientId="eo8WNkaTwrcGujuCMSkRZG3yMYuQvXTy" // Mantenha seu clientId
      authorizationParams={{
        audience: "https://dev-vlbhbshl7b1pxe8e.us.auth0.com/api/v2/", // Mantenha sua audience
        redirect_uri: window.location.origin
      }}
    >
    <App />
  </Auth0Provider>,
)