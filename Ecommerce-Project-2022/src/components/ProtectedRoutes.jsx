import React, { Suspense } from "react"
import { useContext } from "react"
import { Navigate } from "react-router-dom"
import { UserContext } from "../App"

function ProtectedRoutes({ children }) {
  const { userState } = useContext(UserContext)

  if (!userState) return <Navigate to="/" />

  return <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
}

export default ProtectedRoutes
