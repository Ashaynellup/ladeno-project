import React, { useEffect, useState } from "react"
import {
  ActionIcon,
  Button,
  Center,
  Group,
  Image,
  Modal,
  RingProgress,
  Text,
  TextInput,
  ThemeIcon,
  Tooltip,
} from "@mantine/core"
import {
  AddressBook,
  BuildingArch,
  Check,
  Phone,
  Photo,
} from "tabler-icons-react"
import {
  updateDoc,
  doc,
  query,
  collection,
  where,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore"
import { toast } from "react-toastify"

import db from "../firebase"
import { useUserAuth } from "../App"

const state = {
  shopName: "",
  shopAddress: "",
  shopPhoneNo: "",
  brandImage: null,
}
const SellerModal = ({ opened, setOpenSellerModal }) => {
  const [errorState, setErrorState] = useState(null)
  const [sellerState, setSellerState] = useState(state)
  const [creds, setCreds] = useState([])
  const [progress, setProgress] = useState(0)
  const [loading, setLoading] = useState(false)

  const { shopName, shopAddress, shopPhoneNo, brandImage } = sellerState
  const { userState } = useUserAuth()

  const onModalClose = () => {
    setSellerState({ ...state })
    setOpenSellerModal(false)
  }

  const formatNumber = (val) => {
    const phoneNumber = val.replace(/[^\d]/g, "")
    const phoneLength = phoneNumber.length

    if (phoneLength < 4) return phoneNumber

    if (phoneLength < 8)
      return `${phoneNumber.slice(0, 3)} ${phoneNumber.slice(3)}`

    if (phoneNumber.startsWith("639") && phoneLength >= 9)
      return `+${phoneNumber.slice(0, 4)} ${phoneNumber.slice(
        4,
        8
      )} ${phoneNumber.slice(8, 12)}`

    return `${phoneNumber.slice(0, 3)} ${phoneNumber.slice(
      3,
      7
    )} ${phoneNumber.slice(7, 11)}`
  }

  const handleChange = (e) => {
    const { name, value } = e.target

    if (name.startsWith("brandImage")) {
      setSellerState({
        ...sellerState,
        [name]: URL.createObjectURL(e.target.files[0]),
      })
      return
    }

    if (name.startsWith("shopPhoneNo")) {
      const formattedNumber = formatNumber(value)

      setSellerState({ ...sellerState, [name]: formattedNumber })
      return
    }

    setSellerState({ ...sellerState, [name]: value })
  }

  const validateForm = () => {
    let error = {}
    const phoneReg = /^(09|\+639)\d{9}$/g

    if (!shopName && !shopAddress && !shopPhoneNo) {
      error.shopName = "Required"
      error.shopAddress = "Required"
      error.shopPhoneNo = "Required"
      setErrorState(error)
      return true
    }

    if (!shopName) {
      error.shopName = "Shop Name is required"
      setErrorState(error)
      return true
    }

    if (!shopAddress) {
      error.shopAddress = "Shop Address is required"
      setErrorState(error)
      return true
    }

    if (!shopPhoneNo) {
      error.shopPhoneNo = "Shop Phone Number is required"
      setErrorState(error)
      return true
    }

    if (!phoneReg.test(shopPhoneNo.split(" ").join(""))) {
      error.shopPhoneNo = "Invalid Phone Number"
      setErrorState(error)
      return true
    }

    return false
  }

  const submitForm = async (e) => {
    e.preventDefault()
    setErrorState(null)
    setLoading(true)

    const isError = validateForm()
    if (isError) {
      setLoading(false)
      return
    }

    const userRef = doc(db, "users_info", creds[0].userId)
    await updateDoc(userRef, {
      ...sellerState,
      brandImage: !brandImage ? null : brandImage,
      role: ["seller"],
      updatedAt: serverTimestamp(),
    })
      .then(() => {
        toast.success("You are now a seller!")
        setSellerState({ ...state })
        setLoading(false)
      })
      .catch((err) => {
        console.log(err.message)
        setLoading(false)
      })
  }

  // Getting Your Data
  useEffect(() => {
    if (!userState) return

    const q = query(
      collection(db, "users_info"),
      where("uid", "==", userState.uid)
    )

    const unsub = onSnapshot(q, (snapshot) => {
      const temp = []
      snapshot.docs.map((doc) => temp.push({ ...doc.data(), userId: doc.id }))
      setCreds(temp)
    })

    return () => unsub()
  }, [])

  // Ring Label Component
  function RingLabel() {
    return (
      <Center>
        {progress > 0 ? (
          <Text color="baseColor" weight={700}>
            {progress}%
          </Text>
        ) : (
          <ThemeIcon radius={99} size="lg" color="baseColor">
            <Check size={20} />
          </ThemeIcon>
        )}
      </Center>
    )
  }

  return (
    <>
      <Modal
        opened={opened}
        onClose={onModalClose}
        size="580px"
        radius="lg"
        title={
          <Text size="xl" weight={700}>
            BECOME A SELLER
          </Text>
        }
      >
        <form className="grid grid-cols-1 gap-8" onSubmit={submitForm}>
          <TextInput
            name="shopName"
            label="Shop Name"
            value={shopName}
            onChange={handleChange}
            size="md"
            variant="filled"
            radius={99}
            required
            error={errorState?.shopName}
            icon={<BuildingArch size={20} />}
          />
          <TextInput
            name="shopAddress"
            label="Shop Address"
            value={shopAddress}
            onChange={handleChange}
            size="md"
            variant="filled"
            radius={99}
            required
            error={errorState?.shopAddress}
            icon={<AddressBook size={20} />}
          />
          <TextInput
            name="shopPhoneNo"
            label="Shop Phone Number"
            value={shopPhoneNo}
            onChange={handleChange}
            size="md"
            variant="filled"
            radius={99}
            required
            error={errorState?.shopPhoneNo}
            icon={<Phone size={20} />}
          />

          {/* Image Logo */}
          <Group align="center" position="left" spacing={80}>
            {/* Image Button  */}
            <Tooltip
              label="Select your brand logo"
              color="baseColor"
              placement="center"
              position="bottom"
              withArrow
            >
              <ActionIcon
                size="xl"
                radius={99}
                variant="outline"
                color="baseColor"
                component="label"
                htmlFor="logoImage"
              >
                <Photo size={20} />
              </ActionIcon>
              <input
                name="brandImage"
                accept="image/*"
                onChange={handleChange}
                id="logoImage"
                type="file"
                hidden
              />
            </Tooltip>

            <Image
              className="overflow-hidden rounded-xl"
              src={brandImage ? brandImage : "/shop_logo.png"}
              withPlaceholder
              placeholder={<Photo size={85} />}
              height={185}
              width={185}
              fit="contain"
            />

            {/* Ring Progress */}
            {progress !== 0 && (
              <RingProgress
                sections={[{ value: progress, color: "#5B51BC" }]}
                label={<RingLabel />}
                thickness={10}
                roundCaps
                size={100}
              />
            )}
          </Group>

          {/* Submit Button */}
          <Group position="right">
            <Button
              className="bg-[#4C52BE]"
              onClick={submitForm}
              radius={99}
              size="md"
              loading={loading}
            >
              Submit
            </Button>
          </Group>
        </form>
      </Modal>
    </>
  )
}

export default SellerModal
