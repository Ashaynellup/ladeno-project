import React, { useRef, useState } from "react"
import db, { auth, storage } from "../firebase"
import { useUserAuth } from "../App"

import {
  Navbar,
  Title,
  Divider,
  Stack,
  Image,
  UnstyledButton,
  Group,
  Avatar,
  Text,
  ActionIcon,
  Modal,
  TextInput,
  Button,
  Tooltip,
  Skeleton,
  PasswordInput,
} from "@mantine/core"
import { FaShoppingBag, FaShoppingBasket } from "react-icons/fa"
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom"
import { useEffect } from "react"
import {
  collection,
  onSnapshot,
  query,
  where,
  updateDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore"
import { ArrowLeft, Edit, Menu2 } from "tabler-icons-react"
import { toast, ToastContainer } from "react-toastify"
import { updatePassword } from "firebase/auth"
import { useViewportSize } from "@mantine/hooks"
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage"

const data = [
  {
    icon: <FaShoppingBag size={18} />,
    title: "Products",
    active: false,
    link: "product",
  },
  {
    icon: <FaShoppingBasket size={18} />,
    title: "Orders",
    active: false,
    link: "orders",
  },
]

const Vendor = () => {
  const [user, setUser] = useState()
  const [openSidebar, setOpenSidebar] = useState(true)
  const [newPassword, setNewPassword] = useState("")
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [opened, setOpened] = useState(false)

  const { userState } = useUserAuth()
  const navigate = useNavigate()
  const { width } = useViewportSize()

  const toggleActiveLink = (i) => {
    let arrCopy = [...data]

    if (width < 480) setOpenSidebar(false)

    arrCopy.forEach((item) => {
      item.active = false
    })
    arrCopy[i].active = true
  }

  const handleChange = (e) => {
    const { name, value } = e.target

    setUser({ ...user, [name]: value })
  }

  const handlePhoneInput = (e) => {
    const { name, value } = e.target

    const formattedPhoneNumber = formatPhoneNumber(value)

    if (name === "phoneNo") setUser({ ...user, [name]: formattedPhoneNumber })
    if (name === "shopPhoneNo")
      setUser({ ...user, [name]: formattedPhoneNumber })
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

  const onImageSelected = (e) => {
    if (!userState) return

    const file = e.target.files[0]
    const brandRef = ref(storage, `brand/${userState.uid}/${file.name}`)
    const uploadTask = uploadBytesResumable(brandRef, file)
    setLoading(true)

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
      },
      (err) => {
        switch (err.code) {
          case "storage/unauthorized":
            // User doesn't have permission to access the object
            break
          case "storage/canceled":
            // User canceled the upload
            break
        }
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((URL) => {
          setUser({ ...user, brandImage: URL })
          setLoading(false)
        })
      }
    )
  }

  const updateAccount = async () => {
    setLoading(true)

    if (!user) return setLoading(false)

    const userRef = doc(db, "users_info", user?.userId)
    await updateDoc(userRef, {
      ...user,
      updatedAt: serverTimestamp(),
    })
      .then(() => {
        setLoading(false)
        toast.success("Account Updated")
      })
      .catch((err) => {
        setLoading(false)
        console.log(err.message)
      })
  }

  const saveNewPassword = () => {
    setLoading(true)
    const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/

    if (!passRegex.test(newPassword)) {
      toast.error(
        "Minimum eight characters, at least one uppercase letter, one lowercase letter and one number.",
        { position: "bottom-center" }
      )
      setLoading(false)
      return
    }

    updatePassword(auth.currentUser, newPassword)
      .then(() => {
        toast.success("New Password Saved")
        setLoading(false)
      })
      .catch((err) => {
        console.log(err.message)
        setLoading(false)
      })
  }

  // Get User's Info
  useEffect(() => {
    if (!userState) return navigate("/", { replace: true })
    setMounted(true)

    const q = query(
      collection(db, "users_info"),
      where("uid", "==", userState.uid)
    )

    const unsub = onSnapshot(q, (snapshot) => {
      const temp = []
      snapshot.docs.map((doc) => temp.push({ ...doc.data(), userId: doc.id }))
      setUser({
        ...temp[0],
        createdAt: temp[0]?.createdAt,
        updatedAt: temp[0]?.updatedAt?.toDate(),
      })
      setLoading(false)
    })

    return () => unsub()
  }, [])

  // Window Resize
  useEffect(() => {
    if (width < 480) {
      setOpenSidebar(false)
    } else {
      setOpenSidebar(true)
    }
  }, [width])

  if (!mounted) return null

  return (
    <div className="relative flex w-full min-h-full">
      {/* Left */}
      <Navbar
        className={`lg:sticky absolute left-0 duration-500 top-0 z-[99] flex space-y-4 ${
          openSidebar ? "w-[345px] min-w-[345px] p-4" : "min-w-0 w-0 py-4"
        } overflow-x-hidden min-h-full rounded-tr-xl rounded-br-xl shadow-2xl`}
      >
        {/* Header */}
        <Navbar.Section>
          <div className="flex items-center min-w-[145px] gap-x-2 bg-gradient-to-r from-[#4C52BE] to-[#BD4DB1] bg-clip-text text-transparent h-14">
            <Image src="/shop_logo.png" width={32} fit="contain" />
            <Title order={2}>LADENO</Title>
          </div>
        </Navbar.Section>

        {/* Body */}
        <Navbar.Section className="flex-grow min-w-[145px]">
          <Stack className="h-full" spacing={12}>
            {data.map(({ icon, title, active, link }, i) => (
              <UnstyledButton
                className={`h-12 px-2 text-xl font-bold duration-100 hover:bg-[#4C52BE] hover:text-white rounded-xl active:scale-95 ${
                  active ? "text-white bg-[#4C52BE]" : "text-black/80"
                }`}
                onClick={() => toggleActiveLink(i)}
                key={i}
                component={Link}
                to={`/vendor/${link}`}
              >
                <Group className="h-full" align="center" spacing={10}>
                  {icon} <span>{title}</span>
                </Group>
              </UnstyledButton>
            ))}
          </Stack>
        </Navbar.Section>

        {/* Footer */}
        <Navbar.Section>
          <Skeleton animate visible={loading}>
            <Group
              className="cursor-pointer min-w-[145px] text-black/70 rounded-xl hover:bg-gray-100"
              py={8}
              px={6}
              position="left"
              noWrap
            >
              {/* Avatar */}
              <Tooltip
                label="Back to home page"
                radius={99}
                color="baseColor"
                withArrow
                position="top"
                placement="end"
              >
                <Avatar
                  className="border"
                  component={Link}
                  to="/"
                  radius={99}
                  src=""
                  color="baseColor"
                  size="md"
                >
                  {user?.name[0]}
                </Avatar>
              </Tooltip>

              {/* Username */}
              <Stack spacing={0}>
                <Text size="sm" weight={800} color="baseColor">
                  {user?.name}
                </Text>
                <Text size="xs" weight={500}>
                  {user?.email}
                </Text>
              </Stack>

              {/* Button */}
              <Tooltip
                className="text-[#2f3484] ml-auto"
                label="Edit Account"
                radius={99}
                color="baseColor"
                withArrow
                position="top"
                placement="center"
              >
                <ActionIcon
                  onClick={() => setOpened(true)}
                  color="baseColor"
                  size="lg"
                  radius={99}
                  variant="outline"
                >
                  <Edit size={24} />
                </ActionIcon>
              </Tooltip>
            </Group>
          </Skeleton>
        </Navbar.Section>
      </Navbar>

      {/* Sidebar Button */}
      <Tooltip
        className={`absolute duration-500 shadow-2xl lg:left-4 shadow-gray-700 rounded-full z-[99] top-4 ${
          openSidebar ? "left-[300px]" : "left-4"
        }  lg:relative h-max`}
        label={openSidebar ? "Close Sidebar" : "Open Sidebar"}
        position="right"
        placement="center"
        withArrow
        color="baseColor"
        m={8}
      >
        <ActionIcon
          className="sticky top-0 bg-[#2f3484]"
          onClick={() => setOpenSidebar(!openSidebar)}
          variant="filled"
          radius={99}
          size={45}
          color="baseColor"
        >
          {openSidebar ? <ArrowLeft /> : <Menu2 />}
        </ActionIcon>
      </Tooltip>

      {/* Modal */}
      <Modal
        title={
          <Text size="xl" weight={700}>
            Edit Your Account
          </Text>
        }
        opened={opened}
        onClose={() => setOpened(false)}
        size="545px"
      >
        <Divider />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 auto-rows-max">
          {/* Name */}
          <TextInput
            name="name"
            value={user?.name}
            onChange={handleChange}
            label="Name"
            size="md"
            radius={99}
          />

          {/* Phone No. */}
          <TextInput
            name="phoneNo"
            value={user?.phoneNo}
            onChange={handlePhoneInput}
            label="Phone No."
            size="md"
            radius={99}
          />

          {/* Shop Name */}
          <TextInput
            name="shopName"
            value={user?.shopName}
            onChange={handleChange}
            label="Shop Name"
            size="md"
            radius={99}
          />

          {/* Shop Phone No. */}
          <TextInput
            name="shopPhoneNo"
            value={user?.shopPhoneNo}
            onChange={handlePhoneInput}
            label="Shop Phone Number"
            size="md"
            radius={99}
          />

          {/* Shop Address */}
          <TextInput
            name="shopAddress"
            value={user?.shopAddress}
            onChange={handleChange}
            label="Shop Address"
            size="md"
            radius={99}
          />

          {/* Save Button */}
          <Group className="col-span-2" position="right">
            <Button
              className="bg-[#4C52BE]"
              onClick={updateAccount}
              radius={99}
              variant="filled"
              color="baseColor"
              loading={loading}
            >
              Save Changes
            </Button>
          </Group>
        </div>

        {/* Brand Logo */}
        <Group position="apart" noWrap>
          {/* Left */}
          <div className="flex items-center gap-x-4">
            <Text weight={500}>Brand Logo</Text>
            <Image
              src={user?.brandImage || "/shop_logo.png"}
              fit="contain"
              height={45}
            />
          </div>

          {/* Right */}
          <Button
            className="bg-[#4C52BE]"
            component="label"
            htmlFor="brandImg"
            size="sm"
            radius={99}
            loading={loading}
          >
            Choose Photo
            <input
              id="brandImg"
              type="file"
              onChange={onImageSelected}
              hidden
            />
          </Button>
        </Group>

        <Divider />

        {/* Password Input */}
        <Stack>
          <PasswordInput
            label="Set New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Create new password"
            size="md"
            radius={99}
          />

          {/* Set New Password Button */}
          <Group position="right">
            <Button
              className="bg-[#4C52BE]"
              onClick={saveNewPassword}
              radius={99}
              disabled={!newPassword}
              loading={loading}
            >
              Save New Password
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Right */}
      <Outlet />

      {/* Toastify Notification */}
      <ToastContainer theme="light" position="bottom-right" />
    </div>
  )
}

export default Vendor
