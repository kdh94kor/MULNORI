// import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom';
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  // <StrictMode>  // react에서 strinctmode시 두번씩 호출될 수 있음(api나 log)
    <BrowserRouter>
      <App />
    </BrowserRouter>
  // </StrictMode>,
)
