import { ActionIcon, Affix } from "@mantine/core"
import { useScrollIntoView, useWindowScroll } from "@mantine/hooks"
import React, { useState } from "react"
import { CaretUp } from "tabler-icons-react"

import Banner from "../components/Banner"
import Footer from "../components/Footer"
import Navbar from "../components/Navbar"
import Products from "../components/Products"

const Home = () => {
  const [scroll, scrollTo] = useWindowScroll()
  const { scrollIntoView, targetRef } = useScrollIntoView({ offset: 64 })

  return (
    <div className="relative flex flex-col w-full min-h-screen">
      <Navbar scrollIntoView={scrollIntoView} scrollTo={scrollTo} />
      <Banner scrollIntoView={scrollIntoView} />
      <Products targetRef={targetRef} />
      <Footer />

      {/* Affix Button */}
      <Affix
        className={`duration-150 ${
          scroll.y > 120
            ? "opacity-100 pointer-events-auto"
            : "translate-y-4 opacity-0 pointer-events-none"
        }`}
        position={{ bottom: 20, right: 20 }}
      >
        <ActionIcon
          className="bg-[#4C52BE] shadow-xl"
          onClick={() => scrollTo({ y: 0 })}
          radius={99}
          color="baseColor"
          variant="filled"
          size="xl"
        >
          <CaretUp size={24} />
        </ActionIcon>
      </Affix>
    </div>
  )
}

export default Home
