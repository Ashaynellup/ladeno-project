import React, { useEffect, useState } from "react"
import {
  ColorSwatch,
  Card,
  Container,
  Group,
  Image,
  Stack,
  Text,
  Title,
  Button,
  ActionIcon,
  Divider,
  Center,
  Skeleton,
  Modal,
  TextInput,
  Stepper,
  Badge,
  Tooltip,
} from "@mantine/core"
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
  addDoc,
  serverTimestamp,
} from "firebase/firestore"
import db from "../firebase"
import {
  Plus,
  Minus,
  ArrowNarrowLeft,
  At,
  AddressBook,
  Building,
  TruckDelivery,
  Cash,
} from "tabler-icons-react"
import { useUserAuth } from "../App"
import { toast, ToastContainer } from "react-toastify"
import { Link, useNavigate } from "react-router-dom"

const checkoutState = {
  firstName: "",
  lastName: "",
  address: "",
  city: "",
  email: "",
}

const Cart = () => {
  const [carts, setCarts] = useState([])
  const [total, setTotal] = useState(0)
  const [checkoutForm, setCheckoutForm] = useState()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loading2, setLoading2] = useState(false)
  const [state, setState] = useState(checkoutState)
  const [active, setActive] = useState(0)
  const [error, setError] = useState({})

  const { firstName, lastName, address, city, email } = state

  const { userState } = useUserAuth()
  const navigate = useNavigate()

  const formatNumber = (num) => `${num.toLocaleString("en-US")}`

  const nextStep = () =>
    setActive((current) => (current < 2 ? current + 1 : current))
  const prevStep = () =>
    setActive((current) => (current > 0 ? current - 1 : current))

  const checkOut = () => setOpen(true)

  const removeCart = async (id) => {
    setLoading(true)

    await deleteDoc(doc(db, "carts", id))
      .then(() => {
        toast.success("Cart Deleted")
        setLoading(false)
      })
      .catch((err) => {
        toast.error(err.message)
        setLoading(false)
      })
  }

  const removeAllCarts = () => {
    carts.forEach((cart) =>
      deleteDoc(doc(db, "carts", cart.cartId)).catch((err) => {
        err.message
      })
    )
  }

  const addQty = async (idx) => {
    const cartRef = doc(db, "carts", carts[idx].cartId)

    const currQty = carts[idx].qty + 1

    await updateDoc(cartRef, {
      ...carts[idx],
      qty: currQty,
    }).catch((err) => {
      console.log(err.message)
    })
  }

  const substractQty = async (idx) => {
    const cartRef = doc(db, "carts", carts[idx].cartId)

    const currentQty = carts[idx].qty - 1

    if (currentQty <= 0) {
      await deleteDoc(doc(db, "carts", carts[idx].cartId))
      return
    }

    await updateDoc(cartRef, {
      ...carts[idx],
      qty: currentQty,
    }).catch((err) => {
      console.log(err.message)
    })
  }

  const handleChange = (e) => {
    const { name, value } = e.target

    setState({ ...state, [name]: value })
  }

  const validateForm = () => {
    let err = {}
    const emailReg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/

    if (!firstName || !lastName || !email || !address || !email) {
      err.required = "Field Required"
      setError(err)
      return true
    }
    if (!emailReg.test(email)) {
      err.email = "Invalid email"
      setError(err)
      return true
    }

    return false
  }

  const handleShippingForm = async (e) => {
    e.preventDefault()
    setError({})

    const isError = validateForm()
    if (isError) return

    if (active === 0) {
      nextStep()
      setCheckoutForm({
        ...state,
        orders: carts,
        totalPayment: total,
        sellerId: carts[0].sellerId,
        clientId: userState?.uid,
      })
    }

    if (active === 1) {
      setLoading2(true)

      await addDoc(collection(db, "orders"), {
        ...checkoutForm,
        status: "shipping",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
        .then(() => {
          removeAllCarts()
          nextStep()
          setLoading2(false)
        })
        .catch((err) => {
          console.log(err.message)
          setLoading2(false)
        })
    }
  }

  // Getting Cart
  useEffect(() => {
    if (!userState) return navigate("/signin")

    const q = query(
      collection(db, "carts"),
      where("clientId", "==", userState.uid),
      orderBy("createdAt", "asc")
    )

    const unsub = onSnapshot(q, (snapshot) => {
      const arr = []
      snapshot.docs.map((doc) =>
        arr.push({
          ...doc.data(),
          cartId: doc.id,
          selectedColor: "None",
          selectedSize: "None",
        })
      )
      setCarts(arr)
      setTotal(arr.reduce((a, item) => (a += item.price * item.qty), 0))
      setLoading(false)
    })

    return () => unsub()
  }, [db])

  if (loading)
    return (
      <Container
        className="relative flex flex-col justify-center min-h-screen"
        px={50}
        fluid
      >
        <Container className="w-full space-y-8 h-max" fluid>
          <Skeleton width={180} height={20} radius={99} />

          <div className="grid w-full grid-cols-[repeat(auto-fit,_minmax(256px,_350px))] auto-rows-[max-content] h-[400px] overflow-auto py-4 gap-4">
            {[1, 2, 3, 4].map((item) => (
              <Skeleton key={item} height={400} radius={12} animate />
            ))}
          </div>
        </Container>
      </Container>
    )

  return (
    <Container
      className="relative flex flex-col justify-center min-h-screen overflow-hidden"
      px={50}
      fluid
    >
      <Container className="relative z-20 w-full space-y-8 h-max" fluid>
        <Stack spacing={8}>
          <Title order={1}>My Shopping Cart</Title>

          <Divider />

          {carts.length === 0 ? (
            <Center className="h-[400px] text-black/80">
              <Stack align="center">
                <Image
                  className="overflow-hidden shadow-xl rounded-xl"
                  src="/empty-cart.png"
                  fit="contain"
                  width={310}
                />
                <Text className="text-4xl" weight={600} align="center">
                  Empty Cart
                </Text>
                <Text size="md" weight={600} align="center">
                  You have no items in your shopping cart.
                </Text>
                <Button
                  className="text-sm w-max"
                  component={Link}
                  to="/"
                  variant="outline"
                  radius={99}
                  leftIcon={<ArrowNarrowLeft size={20} />}
                >
                  Start adding some!
                </Button>
              </Stack>
            </Center>
          ) : (
            <div className="grid w-full grid-cols-[repeat(auto-fit,_minmax(256px,_350px))] auto-rows-[max-content] h-[400px] overflow-auto py-4 md:p-4 gap-4">
              {carts.map(
                (
                  { name, price, colors, sizes, productImg, qty, cartId },
                  i
                ) => (
                  <Card
                    key={cartId}
                    className="shadow-md shadow-[#00000026] text-black/80"
                    py={16}
                    radius={12}
                  >
                    {/* Image Section */}
                    <Card.Section>
                      <Image
                        p={8}
                        src={productImg || ""}
                        height={165}
                        fit="contain"
                        placeholder
                      />
                    </Card.Section>

                    <Text my={18} size="xl" lineClamp={2} weight={700}>
                      {name}
                    </Text>

                    {/* SIZES */}
                    <Stack
                      className="text-gray-600"
                      my={20}
                      align="flex-start"
                      spacing={2}
                    >
                      <Text size="xs" weight={700}>
                        SIZE
                      </Text>

                      {sizes.length !== 0 ? (
                        <Stack align="flex-start" spacing={12}>
                          {sizes.map((size) => (
                            <Badge key={size} size="sm" variant="outline">
                              {size}
                            </Badge>
                          ))}
                        </Stack>
                      ) : (
                        <Text size="md" weight={600}>
                          None
                        </Text>
                      )}
                    </Stack>

                    {/* COLOR */}
                    <Stack
                      className="text-gray-600"
                      my={20}
                      align="flex-start"
                      spacing={2}
                    >
                      <Text size="xs" weight={700}>
                        COLOR
                      </Text>

                      {colors.length !== 0 ? (
                        <Group
                          className="h=[65px] overflow-auto"
                          align="flex-start"
                          spacing={12}
                        >
                          {colors.map((color) => (
                            <Badge key={color} size="sm" variant="outline">
                              {color}
                            </Badge>
                          ))}
                        </Group>
                      ) : (
                        <Text size="md" weight={600}>
                          None
                        </Text>
                      )}
                    </Stack>

                    {/* Price */}
                    <Group mb={8} position="apart">
                      <Text size="lg" weight={600}>
                        &#8369; {formatNumber(price * qty)}
                      </Text>

                      {/* Group Add - Subtract buttons */}
                      <Group position="apart" spacing={10}>
                        <ActionIcon
                          onClick={() => substractQty(i)}
                          radius={99}
                          color="baseColor"
                          variant="outline"
                          size="md"
                        >
                          <Minus size={18} />
                        </ActionIcon>

                        <Text size="md" color="baseColor" weight={700}>
                          {qty}
                        </Text>

                        <ActionIcon
                          onClick={() => addQty(i)}
                          radius={99}
                          color="baseColor"
                          variant="outline"
                          size="md"
                        >
                          <Plus size={18} />
                        </ActionIcon>
                      </Group>
                    </Group>

                    {/* Remove Button */}
                    <Group position="center">
                      <Button
                        onClick={() => removeCart(cartId)}
                        className="bg-[#d43e3e]"
                        color="red"
                        radius={99}
                        loading={loading}
                        loaderPosition="left"
                      >
                        Remove
                      </Button>
                    </Group>
                  </Card>
                )
              )}
            </div>
          )}
        </Stack>

        <Divider />

        {/* Footer */}
        <Group position="apart">
          <Text className="text-xl" weight={600}>
            SUBTOTAL: &#8369; {formatNumber(total)}
          </Text>

          {/* Checkout Button */}
          {carts.length > 0 && (
            <Group>
              <Button
                onClick={removeAllCarts}
                className="bg-[#d43e3e]"
                color="red"
                radius={99}
                loaderPosition="right"
                loading={loading}
              >
                EMPTY CART
              </Button>
              <Button
                className="bg-[#4C52BE]"
                onClick={checkOut}
                radius={99}
                loaderPosition="right"
                loading={loading}
              >
                CHECKOUT
              </Button>
            </Group>
          )}
        </Group>

        {/* Checkout Modal */}
        <Modal
          size="650px"
          opened={open}
          onClose={() => setOpen(false)}
          centered
          title={
            <Text className="text-2xl" weight={600}>
              Checkout
            </Text>
          }
        >
          <Stepper active={active} onStepClick={setActive} breakpoint="xs">
            <Stepper.Step
              label="First step"
              description="Shipping Address"
              allowStepSelect={active > 0}
              icon={<TruckDelivery size={24} />}
            >
              <Text className="text-xl" weight={600} my={20}>
                Shipping Address
              </Text>
              <form
                onSubmit={handleShippingForm}
                className="grid grid-cols-1 gap-6 md:grid-cols-2 auto-rows-max"
              >
                <TextInput
                  name="firstName"
                  placeholder="First Name"
                  size="md"
                  value={firstName}
                  onChange={handleChange}
                  radius={99}
                  variant="default"
                  error={error?.required}
                />
                <TextInput
                  name="lastName"
                  placeholder="Last Name"
                  size="md"
                  value={lastName}
                  onChange={handleChange}
                  radius={99}
                  variant="default"
                  error={error?.required}
                />
                <TextInput
                  name="email"
                  placeholder="Email"
                  size="md"
                  value={email}
                  onChange={handleChange}
                  radius={99}
                  variant="default"
                  icon={<At size={18} />}
                  error={error?.required || error?.email}
                />
                <TextInput
                  name="address"
                  placeholder="Address"
                  size="md"
                  value={address}
                  onChange={handleChange}
                  radius={99}
                  variant="default"
                  icon={<AddressBook size={18} />}
                  error={error?.required}
                />
                <TextInput
                  name="city"
                  placeholder="City"
                  size="md"
                  value={city}
                  onChange={handleChange}
                  radius={99}
                  variant="default"
                  icon={<Building size={18} />}
                  error={error?.required}
                />
              </form>
            </Stepper.Step>

            <Stepper.Step
              label="Second step"
              description="Payment Details"
              allowStepSelect={active > 1}
              icon={<Cash size={24} />}
            >
              <Text className="text-xl" weight={600} my={20}>
                Order Summary
              </Text>

              <Stack spacing={20}>
                {carts.map(({ name, price, cartId, qty }) => (
                  <Group key={cartId} position="apart">
                    {/* Left */}
                    <Stack spacing={0}>
                      <Tooltip
                        label={name}
                        position="bottom"
                        placement="end"
                        wrapLines
                        withArrow
                        width={235}
                        color="baseColor"
                      >
                        <Text
                          className="w-64 truncate cursor-pointer"
                          size="lg"
                          weight={600}
                        >
                          {name}
                        </Text>
                      </Tooltip>
                      <Text className="text-gray-400" size="sm">
                        Quantity {qty}
                      </Text>
                    </Stack>

                    {/* Right */}
                    <Text size="md" weight={600}>
                      &#8369; {formatNumber(price * qty)}
                    </Text>
                  </Group>
                ))}

                {/* Total */}
                <Group position="apart">
                  <Text size="lg" weight={600}>
                    Total
                  </Text>
                  <Text weight={600}>&#8369; {formatNumber(total)}</Text>
                </Group>
              </Stack>
            </Stepper.Step>
          </Stepper>

          {active === 2 && (
            <Center>
              <Title order={1}>Thank you for buying</Title>
            </Center>
          )}

          <Divider />

          {/* Modal Footer */}
          <Group position="apart">
            {active !== 2 && (
              <Button
                variant="outline"
                radius={99}
                onClick={prevStep}
                disabled={active === 0}
              >
                Back
              </Button>
            )}

            {active < 1 ? (
              <Button
                type="submit"
                onClick={handleShippingForm}
                className="bg-[#4C52BE]"
                radius={99}
              >
                Next
              </Button>
            ) : (
              active === 1 && (
                <Button
                  type="submit"
                  onClick={handleShippingForm}
                  className="bg-[#4C52BE]"
                  radius={99}
                  loading={loading2}
                  loaderPosition="right"
                >
                  Place Order
                </Button>
              )
            )}
          </Group>
        </Modal>
      </Container>
      <ToastContainer position="bottom-right" theme="light" />
    </Container>
  )
}

export default Cart
