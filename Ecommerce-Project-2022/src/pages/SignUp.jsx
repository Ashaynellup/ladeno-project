import React from "react"
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { toast, ToastContainer } from "react-toastify"
import db, { auth } from "../firebase"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"

import "react-toastify/dist/ReactToastify.css"

const SignUp = () => {
  const [loading, setLoading] = useState(false)
  const [phoneNo, setPhoneNo] = useState("")
  const [inputState, setInputState] = useState({
    name: "",
    email: "",
    password: "",
    confirmPass: "",
  })
  const { name, email, password, confirmPass } = inputState

  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target

    setInputState({ ...inputState, [name]: value })
  }

  const handlePhoneInput = (e) => {
    const formattedPhoneNumber = formatPhoneNumber(e.target.value)
    setPhoneNo(formattedPhoneNumber)
  }

  const formatPhoneNumber = (value) => {
    if (!value) return value

    const phoneNumber = value.replace(/[^\d]/g, "")
    const phoneNumberLength = phoneNumber.length

    if (phoneNumberLength < 4) return phoneNumber

    if (phoneNumberLength < 8) {
      return `${phoneNumber.slice(0, 3)} ${phoneNumber.slice(3)}`
    }

    if (phoneNumber.startsWith("639") && phoneNumberLength >= 9) {
      return `+${phoneNumber.slice(0, 4)} ${phoneNumber.slice(
        4,
        8
      )} ${phoneNumber.slice(8, 12)}`
    }

    return `${phoneNumber.slice(0, 3)} ${phoneNumber.slice(
      3,
      7
    )} ${phoneNumber.slice(7, 11)}`
  }

  const validateInputs = () => {
    const phoneRegex = /^(09|\+639)\d{9}$/
    const emailRegex =
      /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/
    const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/

    if (!name || !email || !password || !confirmPass || !phoneNo) {
      toast.error("Please fill up all required fields")
      return false
    }

    if (!phoneRegex.test(phoneNo.split(" ").join(""))) {
      toast.warning("Phone number is invalid")
      return false
    }

    if (!emailRegex.test(email)) {
      toast.error("Invalid Email. Check if you forgot to add .com")
      return false
    }

    if (!passRegex.test(password)) {
      toast.error(
        "Minimum eight characters, at least one uppercase letter, one lowercase letter and one number.",
        { position: "bottom-center" }
      )
      return false
    }

    if (password !== confirmPass) {
      toast.error("Password does not match")
      return false
    }

    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const userCollection = collection(db, "users_info")

    const getValidationResult = validateInputs()
    if (!getValidationResult) return

    setLoading(true)

    try {
      await createUserWithEmailAndPassword(auth, email, password).then(
        (userCred) => {
          const { uid } = userCred.user
          addDoc(userCollection, {
            name,
            email,
            phoneNo,
            uid,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          })
        }
      )

      setLoading(false)
      navigate("/signin")
    } catch (error) {
      toast.error(`${error.message}`)
      setLoading(false)
    }
  }

  return (
    <div className="relative grid min-h-screen grid-cols-1 p-2 overflow-hidden bg-gray-100 xl:grid-cols-2">
      {/* Left */}
      <div className="relative z-20 flex flex-col p-6 text-[#212121]">
        <h2 className="text-4xl font-bold ">Create new account</h2>

        <div className="w-10 h-[6px] rounded-full bg-[#4C52BE] mt-2" />

        <form
          className="relative grid w-full grid-cols-1 mt-8 sm:grid-cols-2 gap-x-8 gap-y-14 h-max"
          onSubmit={handleSubmit}
        >
          <div className="space-y-10">
            {/* Name */}
            <div className="space-y-1">
              <label className="block font-bold" htmlFor="lName">
                Name
              </label>
              <input
                id="lName"
                type="text"
                className="h-12 px-6 text-lg text-[#4C52BE] font-medium leading-none rounded-full shadow-2xl w-full focus:outline-none"
                placeholder="Enter Your Name"
                name="name"
                value={name}
                onChange={handleChange}
              />
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="block font-bold" htmlFor="lEmail">
                Email
              </label>
              <input
                id="lEmail"
                type="email"
                className="h-12 px-6 text-lg text-[#4C52BE] font-medium leading-none rounded-full shadow-2xl w-full focus:outline-none"
                placeholder="you@example.com"
                name="email"
                value={email}
                onChange={handleChange}
              />
            </div>

            {/* Phone No. */}
            <div className="space-y-1">
              <label className="block font-bold" htmlFor="lPhoneNo">
                Phone No.
              </label>
              <input
                id="lPhoneNo"
                type="tel"
                className="h-12 px-6 text-lg text-[#4C52BE] font-medium leading-none rounded-full shadow-2xl w-full focus:outline-none"
                placeholder="(+639 / 09)"
                name="phoneNo"
                value={phoneNo}
                onChange={handlePhoneInput}
              />
            </div>
          </div>

          <div className="space-y-10">
            {/* Password */}
            <div className="space-y-1">
              <label className="block font-bold" htmlFor="lPassword">
                Password
              </label>
              <input
                id="lPassword"
                type="password"
                className="h-12 px-6 text-lg text-[#4C52BE] font-medium leading-none rounded-full shadow-2xl w-full focus:outline-none"
                placeholder="At least 8 characters"
                name="password"
                value={password}
                onChange={handleChange}
              />
            </div>

            {/* Confirm Password */}
            <div className="space-y-1">
              <label className="block font-bold" htmlFor="lCPassword">
                Confirm Password
              </label>
              <input
                id="lCPassword"
                type="password"
                className="h-12 px-6 text-lg text-[#4C52BE] font-medium leading-none rounded-full shadow-2xl w-full focus:outline-none"
                placeholder="Re-type Password"
                name="confirmPass"
                value={confirmPass}
                onChange={handleChange}
              />
            </div>
          </div>

          <button
            className="bg-[#4C52BE] disabled:bg-[#2d306a] h-12 rounded-full duration-150 active:scale-95 text-white font-medium text-lg"
            type="submit"
            disabled={loading}
          >
            {loading ? "Creating account..." : "Create"}
          </button>

          {/* Sign in link */}
          <div className="flex items-center max-h-full gap-x-1">
            Already have an account?{" "}
            <Link
              to="/signin"
              className="text-[#4C52BE] font-bold block hover:underline"
            >
              Sign in
            </Link>
          </div>
        </form>
      </div>

      {/* Right */}
      <div className="relative flex">
        <div className="relative m-auto w-[32rem] z-20 shadow-2xl overflow-hidden rounded-xl">
          <img
            className="object-cover w-full h-full bg-white"
            src="/undraw_Sign_in_re_o58h.png"
            alt=""
          />
        </div>

        <div className="absolute z-20 w-24 h-24 rounded-full -top-2 -left-2 md:top-14 md:left-14 bg-[#4C52BE] shadow-2xl shadow-[#4C52BE]" />
        <div className="absolute z-10 rounded-full w-44 h-44 -bottom-12 -right-12 md:bottom-8 md:right-8 bg-[#4C52BE] shadow-2xl shadow-[#4C52BE]" />
      </div>

      {/* Toast */}
      <ToastContainer position="top-right" theme="light" />
    </div>
  )
}

export default SignUp
