import React, { useEffect, useState } from "react"
import { collection, onSnapshot, query, where } from "firebase/firestore"
import { Link, useNavigate, useParams } from "react-router-dom"
import {
  ActionIcon,
  Badge,
  Button,
  Divider,
  Group,
  Image,
  Skeleton,
  Stack,
  Text,
  Tooltip,
} from "@mantine/core"

import { useUserAuth } from "../App"
import db from "../firebase"
import { ArrowLeft } from "tabler-icons-react"

const Product = () => {
  const [loading, setLoading] = useState(true)
  const [isMounted, setIsMounted] = useState(false)
  const [product, setProduct] = useState([])

  const { userState } = useUserAuth()
  const { productId } = useParams()

  // Getting Products
  useEffect(() => {
    setIsMounted(true)

    const q = query(collection(db, "products"))

    const unsub = onSnapshot(q, (snapshot) => {
      const temp = []
      snapshot.docs.map((doc) => temp.push({ ...doc.data(), id: doc.id }))
      setProduct(temp.filter((item) => item.id === productId))
      setLoading(false)
    })

    return () => unsub()
  }, [])

  if (!isMounted) return null

  const formatNumber = (num) => num.toLocaleString("en-US")

  return (
    <div className="relative flex flex-col w-full min-h-screen sm:flex-row">
      {/* Left */}
      <div className="sticky top-0 z-10 overflow-hidden w-full h-full sm:min-w-[385px]">
        <Stack spacing={10} p={8}>
          {/* Home Button */}
          <Group position="left" spacing={10} p={8}>
            <Tooltip
              label="Back to home page"
              withArrow
              placement="end"
              color="baseColor"
            >
              <ActionIcon
                radius={99}
                size="lg"
                color="baseColor"
                variant="outline"
                component={Link}
                to="/"
              >
                <ArrowLeft size={20} />
              </ActionIcon>
            </Tooltip>
          </Group>

          {/* Product Image */}
          <Skeleton visible={loading}>
            <Image
              src={product[0]?.productImg}
              fit="contain"
              height={240}
              width="100%"
            />
          </Skeleton>
        </Stack>
      </div>

      {/* Right */}
      <div className="relative z-10 w-full p-4 sm:p-10">
        <Stack spacing={14}>
          {/* Product Name */}
          <Skeleton animate className="min-h-[40px]" visible={loading}>
            <Text className="w-full text-2xl" weight={700}>
              {product[0]?.name}
            </Text>
          </Skeleton>

          <Divider />

          {/* Seller Name and Shop Name */}
          <Skeleton animate visible={loading}>
            <Group position="apart" align="flex-start" grow>
              <Text align="left" weight={700}>
                <span className="font-medium text-gray-700">Seller Name:</span>{" "}
                {product[0]?.sellerName}
              </Text>
              <Text align="left" weight={700}>
                <span className="font-medium text-gray-700">Shop Name:</span>{" "}
                {product[0]?.shopName}
              </Text>
            </Group>
          </Skeleton>

          {/* Shop Address and Phone Number */}
          <Skeleton animate visible={loading}>
            <Group position="apart" align="flex-start" grow>
              <Text align="left" weight={700}>
                <span className="font-medium text-gray-700">Shop Address:</span>{" "}
                {product[0]?.shopAddress}
              </Text>
              <Text align="left" weight={700}>
                <span className="font-medium text-gray-700">
                  Shop Phone Number:
                </span>{" "}
                {product[0]?.shopPhoneNo}
              </Text>
            </Group>
          </Skeleton>

          {/* Shop Logo */}
          <Skeleton animate visible={loading}>
            <Group align="flex-end" spacing={8}>
              <Text
                className="font-medium text-gray-700"
                align="left"
                weight={600}
              >
                Brand Logo:
              </Text>
              <Image
                src={
                  product[0]?.brandImage
                    ? product[0]?.brandImage
                    : "/shop_logo.png"
                }
                width={40}
                fit="contain"
              />
            </Group>
          </Skeleton>

          {/* Shop Price */}
          <Skeleton visible={loading} mt={18}>
            <Text className="text-[#4C52BE] text-2xl" weight="bolder">
              &#8369; {product.length > 0 && formatNumber(product[0]?.price)}
            </Text>
          </Skeleton>

          {/* Sizes */}
          <Skeleton visible={loading}>
            <Stack className="text-gray-700" spacing={6}>
              <Text weight={500}>Sizes</Text>
              <Group
                className="h-[48px] overflow-y-auto"
                align="flex-start"
                spacing={6}
              >
                {product[0]?.sizes.length < 1 ? (
                  <Text size="sm" weight={500}>
                    None
                  </Text>
                ) : (
                  product[0]?.sizes.map((size) => (
                    <Badge
                      key={size}
                      color="baseColor"
                      variant="light"
                      size="lg"
                    >
                      {size}
                    </Badge>
                  ))
                )}
              </Group>
            </Stack>
          </Skeleton>

          {/* Colors */}
          <Skeleton visible={loading}>
            <Stack className="text-gray-700" spacing={6}>
              <Text weight={500}>Colors</Text>
              <Group
                className="h-[48px] overflow-y-auto"
                align="flex-start"
                spacing={6}
              >
                {product[0]?.colors.map((color) => (
                  <Badge
                    key={color}
                    color="baseColor"
                    variant="light"
                    size="lg"
                  >
                    {color}
                  </Badge>
                ))}
              </Group>
            </Stack>
          </Skeleton>

          {/* Description */}
          <Skeleton visible={loading}>
            <Stack className="min-h-[148px]" spacing={6}>
              <Text className="text-gray-700" align="left" weight={500}>
                Description
              </Text>
              <Text size="sm">{product[0]?.description}</Text>
            </Stack>
          </Skeleton>
        </Stack>
      </div>

      {/* Design Objects */}
      <div className="fixed -right-28 -bottom-28 md:-left-28 shadow-sm rounded-full bg-[#4C52BE] h-80 w-80" />
    </div>
  )
}

export default Product
