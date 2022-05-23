import "./index.css"

import { useEffect, useState, createContext, useContext } from "react"
import { Routes, Route, useNavigate } from "react-router-dom"

import SignIn from "./pages/SignIn"
import SignUp from "./pages/SignUp"
import Home from "./pages/Home"
import ProtectedRoutes from "./components/ProtectedRoutes"
import { onAuthStateChanged, signOut } from "firebase/auth"
import { auth } from "./firebase"
import Cart from "./pages/Cart"
import Vendor from "./pages/Vendor"
import ProductList from "./components/ProductList"
import Orders from "./components/Orders"
import Product from "./pages/Product"

export const UserContext = createContext()

function App() {
  const [userState, setUser] = useState(
    JSON.parse(
      sessionStorage.getItem(
        "firebase:authUser:AIzaSyCFb5qLDoz2hpWDnJ2Vf-ie1-3Fvt3F_Ds:[DEFAULT]"
      )
    )
  )
  const navigate = useNavigate()

  const logoutUser = async () => {
    await signOut(auth)
    navigate("/", { replace: true })
  }

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setUser(user)
    })

    return () => unsub()
  }, [])

  return (
    <div className="min-h-screen font-Roboto bg-[#ffffff]">
      <UserContext.Provider value={{ userState, setUser, logoutUser }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/signin" element={<SignIn />} />
          <Route
            path="/vendor"
            element={
              <ProtectedRoutes>
                <Vendor />
              </ProtectedRoutes>
            }
          >
            <Route path="product" element={<ProductList />} />
            <Route path="orders" element={<Orders />} />
          </Route>
          <Route path="product/:productId" element={<Product />} />
          <Route path="/cart" element={<Cart />} />
        </Routes>
      </UserContext.Provider>
    </div>
  )
}

export const useUserAuth = () => useContext(UserContext)

export default App
