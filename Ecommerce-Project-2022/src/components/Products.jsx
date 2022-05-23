import React, { useEffect, useState } from "react"

import {
  Card,
  Group,
  Image,
  Title,
  Text,
  Button,
  Stack,
  Tooltip,
  Badge,
  Skeleton,
  Divider,
} from "@mantine/core"
import { ShoppingCartPlus } from "tabler-icons-react"
import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore"
import { toast, ToastContainer } from "react-toastify"
import { Link } from "react-router-dom"

import db from "../firebase"
import { useUserAuth } from "../App"

const Products = ({ targetRef }) => {
  const [products, setProductItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  const { userState } = useUserAuth()

  const formatNumber = (num) => `${num.toLocaleString("en-US")}`

  const addCart = async (idx) => {
    // console.log(products[idx])
    setLoading(true)

    const cartCollection = collection(db, "carts")

    await addDoc(cartCollection, {
      ...products[idx],
      clientId: userState.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      qty: 1,
    })
      .then(() => {
        toast.success("Added to cart")
        setLoading(false)
      })
      .catch((err) => console.log(err.message))
  }

  // Get products
  useEffect(() => {
    setMounted(true)

    const q = query(collection(db, "products"), orderBy("createdAt", "desc"))
    const unsub = onSnapshot(q, (querySnapshot) => {
      const arr = []
      querySnapshot.docs.map((doc) => {
        arr.push({ ...doc.data(), id: doc.id })
      })

      setProductItems([...arr])
      setLoading(false)
    })

    return () => unsub()
  }, [])

  if (!mounted) return null

  return (
    <section
      ref={targetRef}
      id="#products"
      className="relative flex flex-col w-full h-full px-8 mt-4 space-y-4 overflow-auto"
    >
      <Title className="text-black/80" mt={14} order={1}>
        Products
      </Title>

      <Skeleton visible={loading}>
        <div className="h-[80vh] px-4 overflow-y-auto rounded-md">
          <div className="grid w-full  grid-cols-[repeat(auto-fit,_265px)] auto-rows-[minmax(0,_auto)] py-4 gap-4">
            {products.map(
              ({ colors, name, price, productImg, sizes, id }, i) => (
                <Card
                  className="shadow-2xl flex flex-col border justify-between shadow-[#0000003b] text-black/80"
                  key={id}
                  py={16}
                  radius={12}
                >
                  {/* Product Image */}
                  <Card.Section>
                    <Link to={`/product/${id}`}>
                      <Image
                        className="cursor-pointer"
                        classNames={{ image: "hover:scale-105 duration-150" }}
                        p={8}
                        src={productImg || ""}
                        height={165}
                        fit="contain"
                        placeholder
                      />
                    </Link>
                  </Card.Section>

                  <Divider />

                  {/* Product Name */}
                  <Tooltip
                    label={name}
                    gutter={2}
                    position="top"
                    placement="end"
                    wrapLines
                    width={220}
                    color="violet"
                  >
                    <Text
                      className="cursor-pointer"
                      my={18}
                      size="lg"
                      weight={600}
                      lineClamp={1}
                    >
                      {name}
                    </Text>
                  </Tooltip>

                  <Stack mb={10}>
                    {/* Sizes */}
                    <Stack
                      className="text-gray-600"
                      justify="flex-start"
                      spacing={2}
                    >
                      <Text size="xs" weight={700}>
                        AVAILABLE SIZE
                      </Text>

                      {sizes.length > 0 ? (
                        <Group
                          className="overflow-y-auto h-[60px]"
                          align="flex-start"
                          spacing={8}
                        >
                          {sizes.map((size) => (
                            <Badge
                              key={size}
                              size="sm"
                              variant="light"
                              color="baseColor"
                            >
                              {size}
                            </Badge>
                          ))}
                        </Group>
                      ) : (
                        <Group
                          className="overflow-y-auto h-[60px]"
                          align="flex-start"
                          spacing={8}
                        >
                          <Text size="sm">None</Text>
                        </Group>
                      )}
                    </Stack>

                    {/* Colors */}
                    <Stack
                      className="text-gray-600"
                      justify="flex-start"
                      spacing={2}
                    >
                      <Text size="xs" weight={700}>
                        AVAILABLE COLOR
                      </Text>

                      {colors.length > 0 ? (
                        <Group
                          className="h-[60px] overflow-y-auto"
                          align="flex-start"
                          spacing={8}
                        >
                          {colors.map((color) => (
                            <Badge
                              key={color}
                              size="sm"
                              variant="light"
                              color="baseColor"
                            >
                              {color}
                            </Badge>
                          ))}
                        </Group>
                      ) : (
                        <Group
                          className="overflow-y-auto h-[60px]"
                          align="flex-start"
                          spacing={8}
                        >
                          <Text size="sm">None</Text>
                        </Group>
                      )}
                    </Stack>
                  </Stack>

                  {/* Price */}
                  <Group mb={8} position="left">
                    <Text size="lg" weight={600}>
                      &#8369; {formatNumber(price)}
                    </Text>
                  </Group>

                  {/* Button */}
                  <Group position="left">
                    <Button
                      leftIcon={<ShoppingCartPlus size={18} />}
                      className="bg-[#575cc2]"
                      radius={99}
                      p={10}
                      onClick={() => addCart(i)}
                      loading={loading}
                      loaderPosition="right"
                    >
                      Add to cart
                    </Button>
                  </Group>
                </Card>
              )
            )}
          </div>
        </div>
      </Skeleton>

      <ToastContainer position="bottom-right" theme="light" />
    </section>
  )
}

export default Products
