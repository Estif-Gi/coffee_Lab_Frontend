import { Route, Routes } from 'react-router-dom'
import HomePage from './pages/HomePage'
import MenuPage from './pages/MenuPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import CRUDPage from './pages/CRUD'
import OwnerNewOrderPage from './pages/OwnerNewOrderPage'
import AdminOrdersPage from './pages/AdminOrdersPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/menu" element={<MenuPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/admin" element={<CRUDPage />} />
      <Route path="/owner/orders" element={<OwnerNewOrderPage />} />
      <Route path="/admin/orders" element={<AdminOrdersPage />} />
    </Routes>
  )
}

export default App
