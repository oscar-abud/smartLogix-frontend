import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// import './index.css'

// 1. Importar el CSS de Bootstrap
import 'bootstrap/dist/css/bootstrap.min.css'

// 2. Importar el CSS de React-Toastify
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import 'react-toastify/dist/ReactToastify.css' 
import { RouterProvider } from 'react-router-dom'
import { router } from '@/router/index'
import { Toaster } from 'sonner'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
    <Toaster position="bottom-right" richColors closeButton />
  </StrictMode>,
)