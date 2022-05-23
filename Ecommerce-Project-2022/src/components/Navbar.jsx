import React, { useEffect, useState } from "react"

import {
  Accordion,
  ActionIcon,
  Avatar,
  Badge,
  Button,
  Center,
  Container,
  Divider,
  Group,
  Image,
  Menu,
  Modal,
  Skeleton,
  Stack,
  Text,
  ThemeIcon,
  Tooltip,
} from "@mantine/core"
import {
  ShoppingCart,
  Logout,
  Help,
  Dashboard,
  CaretDown,
  DotsVertical,
} from "tabler-icons-react"
import { useUserAuth } from "../App"
import { Link } from "react-router-dom"
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore"
import db from "../firebase"
import { FiShoppingBag } from "react-icons/fi"
import { MdOutlineSell } from "react-icons/md"
import { useDisclosure } from "@mantine/hooks"
import moment from "moment"
import SellerModal from "./SellerModal"

const Navbar = ({ scrollIntoView, scrollTo }) => {
  const [carts, setCarts] = useState([])
  const [orderState, setOrderState] = useState([])
  const [creds, setCreds] = useState([])
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [opened, setOpened] = useState(false)
  const [openSellerModal, setOpenSellerModal] = useState(false)
  const [openMenu, handlers] = useDisclosure(false)

  const { logoutUser, userState } = useUserAuth()

  const handleOrder = async (idx, type) => {
    const { orderId } = orderState[idx]
    const orderRef = doc(db, "orders", orderId)

    setLoading(true)

    switch (type) {
      case "delivered":
        await updateDoc(orderRef, {
          status: "delivered",
          updatedAt: serverTimestamp(),
        })
          .then(() => setLoading(false))
          .catch((err) => {
            console.log(err.message)
            setLoading(false)
          })
        return
      case "cancel":
        await updateDoc(orderRef, {
          status: "cancelled",
          updatedAt: serverTimestamp(),
        })
          .then(() => setLoading(false))
          .catch((err) => {
            console.log(err.message)
            setLoading(false)
          })
        return
      default:
        return new Error(`Unknown Type: ${type}`)
    }
  }

  const handleColor = (value) => {
    switch (value) {
      case "refunded":
        return "red"
      case "cancelled":
        return "gray"
      case "delivered":
        return "green"
      default:
        return "yellow"
    }
  }

  const getMomentAgo = (date) => moment(date).fromNow()

  const formatNumber = (num) => `${num.toLocaleString("en-US")}`

  // Getting Cart
  useEffect(() => {
    setMounted(true)
    if (!userState) return

    const q = query(
      collection(db, "carts"),
      where("clientId", "==", userState?.uid),
      orderBy("createdAt", "asc")
    )

    const unsub = onSnapshot(q, (snapshot) => {
      const arr = []
      snapshot.docs.map((doc) => arr.push({ ...doc.data(), cartId: doc.id }))
      setCarts(arr)
      setLoading(false)
    })

    return () => unsub()
  }, [])

  // Get Orders
  useEffect(() => {
    if (!userState) return

    const q = query(
      collection(db, "orders"),
      where("clientId", "==", userState.uid)
    )

    const unsub = onSnapshot(q, (snapshot) => {
      const temp = []

      snapshot.docs.map((doc) => temp.push({ ...doc.data(), orderId: doc.id }))
      setOrderState(
        temp
          .sort((a, b) => b.updatedAt.toDate() - a.updatedAt.toDate())
          .filter((item) => item.status === "shipping")
          .map((item) => ({
            total: item.totalPayment,
            updatedAt: item.updatedAt.toDate(),
            status: item.status,
            orders: item.orders,
            orderId: item.orderId,
          }))
      )
      setLoading(false)
    })

    return () => unsub()
  }, [])

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

  if (!mounted) return null

  // Accordion Label Component
  function AccordionLabel({ status, total, updatedAt, idx }) {
    return (
      <Group
        className="text-black/80"
        position="apart"
        align="flex-start"
        noWrap
        grow
      >
        <div>
          <Text size="sm" color="baseColor" weight={800}>
            Status
          </Text>
          <Badge size="sm" color={handleColor(status)}>
            {status}
          </Badge>
        </div>
        <div>
          <Text size="sm" color="baseColor" weight={800}>
            Total
          </Text>
          <Text size="xs" weight={600}>
            &#8369; {formatNumber(total)}
          </Text>
        </div>
        <Stack align="center" spacing={4}>
          <Text color="baseColor" size="sm" weight={800}>
            Options
          </Text>
          <Menu
            control={
              <ActionIcon
                color="baseColor"
                onClick={(e) => e.stopPropagation()}
                variant="outline"
                size="sm"
                radius={99}
                loading={loading}
              >
                <DotsVertical size={12} />
              </ActionIcon>
            }
            placement="end"
            position="bottom"
            size="sm"
            withArrow
          >
            <Menu.Item
              className="font-bold"
              onClick={() => handleOrder(idx, "delivered")}
              color="baseColor"
            >
              Order Claimed
            </Menu.Item>
            <Menu.Item
              className="font-bold"
              onClick={() => handleOrder(idx, "delivered")}
              color="red"
            >
              Cancel Order
            </Menu.Item>
          </Menu>
        </Stack>
        <Text className="text-gray-600" align="center" size="xs">
          {getMomentAgo(updatedAt)}
        </Text>
      </Group>
    )
  }

  // Empty Order Component
  function EmptyOrder() {
    return (
      <Skeleton animate visible={loading}>
        <Center className="h-[350px]">
          <Stack align="center">
            <Image
              src="/empty-order.png"
              fit="contain"
              height={120}
              withPlaceholder
            />
            <Text color="violet" size="xl" weight={800}>
              You haven't placed any orders yet.
            </Text>
            <Text color="gray" size="sm" weight={500}>
              When you do, their status will appear here.
            </Text>
          </Stack>
        </Center>
      </Skeleton>
    )
  }

  return (
    <Container
      className="bg-white sm:px-8 py-2 shadow-md sticky top-0 shadow-black/10 w-full h-[60px] max-h-full z-50"
      fluid
    >
      <Stack className="flex-row h-full" align="center" justify="space-between">
        {/* Left */}
        <Stack
          align="center"
          className="flex-row h-full px-2 font-bold text-white"
          spacing={20}
        >
          {/* Help Me */}
          <ThemeIcon variant="outline" radius={99}>
            <Help size={18} />
          </ThemeIcon>

          {/* Logo */}
          <Text
            className="text-2xl"
            onClick={() => scrollTo({ y: 0 })}
            weight={800}
            variant="gradient"
            gradient={{ from: "#4C52BE", to: "#009CA0", deg: 90 }}
          >
            LADENO
          </Text>

          {/* Links */}
          <Group
            spacing={0}
            className="hidden h-full sm:flex flex-nowrap w-max"
          >
            <Text
              className="h-full w-max px-4 flex cursor-pointer items-center text-center rounded-md hover:bg-gray-100 text-[#212560]"
              onClick={() => scrollTo({ y: 0 })}
            >
              Home
            </Text>
            <Text
              className="h-full w-full px-6 flex cursor-pointer items-center text-center rounded-md hover:bg-gray-100 text-[#212560]"
              onClick={() => scrollIntoView()}
            >
              Products
            </Text>
          </Group>
        </Stack>

        {/* Right */}
        <Group spacing={12}>
          {/* Sign In Button */}
          {!userState && (
            <Button variant="outline" component={Link} to="/signin">
              Sign in
            </Button>
          )}

          {/* Cart Icon Button */}
          <Tooltip
            position="bottom"
            placement="center"
            withArrow
            label="My Carts"
            radius={99}
          >
            <ActionIcon
              component={Link}
              to="/cart"
              radius={999}
              variant="outline"
              color="baseColor"
              className="w-10 h-10 p-2"
            >
              <ShoppingCart size={80} />
              {carts.length > 0 && (
                <Badge
                  className="absolute text-xs pointer-events-none -top-1 -right-1 w-max h-5 py-1 px-[6px] grid place-content-center leading-none z-50 border bg-[#c94444]"
                  radius={999}
                  variant="filled"
                >
                  {carts.length}
                </Badge>
              )}
            </ActionIcon>
          </Tooltip>

          {/* Menu */}
          {userState && (
            <Menu
              classNames={{ itemHovered: "mantine-Menu-itemHovered" }}
              withArrow
              control={
                <Avatar
                  className="w-10 h-10"
                  component={ActionIcon}
                  radius={99}
                  color="baseColor"
                  src={userState?.photoUrl}
                >
                  {!userState?.photoUrl && userState?.email[0].toUpperCase()}
                </Avatar>
              }
              opened={openMenu}
              onOpen={handlers.open}
              onClose={handlers.close}
              trigger="hover"
              size="lg"
            >
              <Menu.Label>Account</Menu.Label>

              <Divider />

              <Menu.Item
                className="font-bold text-[#575CC2]"
                icon={<FiShoppingBag size={20} />}
                onClick={() => setOpened(true)}
              >
                My Orders
              </Menu.Item>
              {creds[0]?.role.find((item) => item === "seller") ? (
                <Menu.Item
                  className="font-bold text-[#575CC2]"
                  icon={<Dashboard size={20} />}
                  component={Link}
                  to="/vendor/product"
                >
                  Dashboard
                </Menu.Item>
              ) : (
                <Menu.Item
                  className="font-bold text-[#575CC2]"
                  onClick={() => setOpenSellerModal(true)}
                  icon={<MdOutlineSell size={20} />}
                >
                  Sell on Ladeno
                </Menu.Item>
              )}
              <Menu.Item
                onClick={logoutUser}
                className="font-bold text-[#575CC2]"
                icon={<Logout size={20} />}
              >
                Sign out
              </Menu.Item>
            </Menu>
          )}
        </Group>
      </Stack>

      <Modal
        classNames={{ modal: "w-full max-w-[750px]" }}
        title={
          <Text size="xl" weight={700}>
            My Orders
          </Text>
        }
        opened={opened}
        onClose={() => setOpened(false)}
      >
        {orderState.length === 0 ? (
          <EmptyOrder />
        ) : (
          <Accordion className="space-y-4 overflow-x-auto" p={4} iconSize={40}>
            {orderState.map(({ orders, orderId }, idx) => (
              <Accordion.Item
                className="min-w-[650px] overflow-y-hidden !duration-500 border-0 rounded-2xl"
                key={orderId}
                label={<AccordionLabel {...orderState[idx]} idx={idx} />}
                icon={
                  <ThemeIcon
                    size="sm"
                    radius={99}
                    color="baseColor"
                    variant="outline"
                  >
                    <CaretDown size={16} />
                  </ThemeIcon>
                }
              >
                <div className="w-full font-semibold min-w-[450px]">
                  {orders.map(({ cartId, name, qty, price, productImg }) => (
                    <Group
                      key={cartId}
                      py="md"
                      align="flex-start"
                      spacing={10}
                      grow
                      noWrap
                    >
                      <Image src={productImg} fit="contain" height={40} />
                      <div>
                        <Text size="sm" weight={700}>
                          Name
                        </Text>
                        <Text size="xs">{name}</Text>
                      </div>
                      <div>
                        <Text size="sm" weight={700}>
                          Quantity
                        </Text>
                        <Text size="xs">{qty}</Text>
                      </div>
                      <div>
                        <Text size="sm" weight={700}>
                          Price
                        </Text>
                        <Text size="xs">&#8369; {formatNumber(price)}</Text>
                      </div>
                    </Group>
                  ))}
                </div>
              </Accordion.Item>
            ))}
          </Accordion>
        )}
      </Modal>

      {/* Seller Modal */}
      <SellerModal
        opened={openSellerModal}
        setOpenSellerModal={setOpenSellerModal}
      />
    </Container>
  )
}

export default Navbar
