import React, { useState } from "react"
import { auth } from "../firebase"
import {
  browserSessionPersistence,
  sendEmailVerification,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth"
import { toast, ToastContainer } from "react-toastify"

import "react-toastify/dist/ReactToastify.css"
import { Link, useNavigate } from "react-router-dom"

const Login = () => {
  const [loading, setLoading] = useState(false)
  const [inputState, setInputState] = useState({
    email: "",
    password: "",
  })
  const { email, password } = inputState

  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target

    setInputState({ ...inputState, [name]: value })
  }

  const validateInputs = () => {
    const emailRegex =
      /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/

    if (!email || !password) {
      toast.error("Please fill up all required fields")
      return false
    }

    if (!emailRegex.test(email)) {
      toast.error("Invalid Email. Check if you forgot to add .com")
      return false
    }

    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const user = auth.currentUser

    setLoading(true)

    const getValidationResult = validateInputs()
    if (!getValidationResult) return setLoading(false)

    try {
      await setPersistence(auth, browserSessionPersistence).then(() =>
        signInWithEmailAndPassword(auth, email, password)
      )

      if (user && !user.emailVerified) {
        sendEmailVerification(user)
          .then(() => {
            toast.info("Email verification sent")
            setLoading(false)
          })
          .then(() => signOut(user))
          .catch((err) => {
            console.log(err.message)
            setLoading(false)
          })
        return
      }

      navigate("/", { replace: true })

      setLoading(false)
    } catch (error) {
      toast.error(`${error.message}`)
      console.log(error.message)
      setLoading(false)
    }
  }

  return (
    <div className="relative grid min-h-screen grid-cols-1 p-2 overflow-hidden bg-gray-100 md:grid-cols-2">
      {/* Left */}
      <div className="relative z-20 flex items-center gap-y-8 justify-center flex-col p-6 text-[#212121]">
        <div className="space-y-2 w-80">
          <h2 className="text-4xl font-bold ">Sign in</h2>

          <div className="w-10 h-[6px] rounded-full bg-[#4C52BE] mt-2" />
        </div>

        <form
          className="relative grid grid-cols-1 w-max gap-x-8 gap-y-14 h-max"
          onSubmit={handleSubmit}
        >
          {/* Email */}
          <div className="space-y-1">
            <label className="block font-bold" htmlFor="lEmail">
              Email
            </label>
            <input
              id="lEmail"
              type="email"
              className="h-12 px-6 text-lg text-[#4C52BE] font-medium leading-none rounded-full shadow-2xl w-80 focus:outline-none"
              placeholder="you@example.com"
              name="email"
              value={email}
              onChange={handleChange}
            />
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="block font-bold" htmlFor="lPassword">
              Password
            </label>
            <input
              id="lPassword"
              type="password"
              className="h-12 px-6 text-lg text-[#4C52BE] font-medium leading-none rounded-full shadow-2xl w-80 focus:outline-none"
              placeholder="At least 8 characters"
              name="password"
              value={password}
              onChange={handleChange}
            />
          </div>

          {/* Sign in */}
          <button
            className="bg-[#4C52BE] disabled:bg-[#2d306a] h-12 rounded-full duration-150 active:scale-95 text-white font-medium text-lg"
            type="submit"
            disabled={loading}
          >
            {loading ? "Signing in please wait..." : "Sign in"}
          </button>

          {/* Sign in link */}
          <div className="flex items-center max-h-full gap-x-1">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-[#4C52BE] font-bold block hover:underline"
            >
              Sign up for free
            </Link>
          </div>
        </form>
      </div>

      {/* Right */}
      <div className="relative flex">
        <div className="relative m-auto w-[32rem] z-20 shadow-2xl overflow-hidden rounded-xl">
          <img
            className="object-cover w-full h-full bg-white"
            src="/undraw_Login.png"
            alt=""
          />
        </div>

        <div className="absolute z-20 w-24 h-24 rounded-full top-2 left-2 md:top-14 md:left-14 bg-[#4C52BE] shadow-2xl shadow-[#4C52BE]" />
        <div className="absolute z-10 rounded-full w-44 h-44 -bottom-6 -right-6 md:bottom-8 md:right-8 bg-[#4C52BE] shadow-2xl shadow-[#4C52BE]" />
      </div>

      {/* Toast */}
      <ToastContainer position="top-right" theme="light" />
    </div>
  )
}

export default Login
