import React from "react"
import { Stack, Text } from "@mantine/core"

const Footer = () => {
  return (
    <>
      <div className="flex flex-col bg-gray-100 gap-y-8 h-max p-14">
        <Stack spacing={4}>
          <Text
            className="text-2xl"
            variant="gradient"
            gradient={{ from: "#4C52BE", to: "#009CA0", deg: 90 }}
            weight={700}
          >
            LADENO
          </Text>

          <Text className="w-72" size="sm">
            LaDeNo is committed to provide high-quality products and great
            customer service.
          </Text>
        </Stack>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Stack>
            <Text size="xl" weight={700}>
              SERVICE
            </Text>

            <Stack spacing={6}>
              <Text size="md">Online Help</Text>
              <Text size="md">Contact Us</Text>
              <Text size="md">Order Status</Text>
              <Text size="md">FAQ's</Text>
            </Stack>
          </Stack>
          <Stack>
            <Text size="xl" weight={700}>
              QUICK SHOP
            </Text>

            <Stack spacing={6}>
              <Text size="md">DELICACY</Text>
              <Text size="md">ACCESSORIES</Text>
              <Text size="md">CLOTHING</Text>
              <Text size="md">FURNITURES</Text>
              <Text size="md">HANDICRAFTS</Text>
            </Stack>
          </Stack>
          <Stack>
            <Text size="xl" weight={700}>
              POLICIES
            </Text>

            <Stack spacing={6}>
              <Text size="md">Terms of Use</Text>
              <Text size="md">Privacy Policy</Text>
              <Text size="md">Reservation System</Text>
            </Stack>
          </Stack>
          <Stack>
            <Text size="xl" weight={700}>
              ABOUT LADENO
            </Text>

            <Stack spacing={6}>
              <Text size="md">Company Information</Text>
              <Text size="md">Careers</Text>
              <Text size="md">Store Location</Text>
            </Stack>
          </Stack>
        </div>
      </div>
      <div className="py-2 text-sm text-white leading-none bg-[#575CC2] px-14">
        Copyright &copy; LADENO 2022
      </div>
    </>
  )
}

export default Footer
