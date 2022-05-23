import React from "react"
import Slider from "react-slick"

import "slick-carousel/slick/slick.css"
import "slick-carousel/slick/slick-theme.css"
import { Button, Image, Stack, Text } from "@mantine/core"

const Banner = ({ scrollIntoView }) => {
  const settings = {
    dots: true,
    infinite: true,
    autoplay: true,
    speed: 500,
    autoplaySpeed: 4000,
    slidesToShow: 1,
    slidesToScroll: 1,
    easing: "linear",
    className: "innerSlide",
  }

  const imagesData = [
    {
      image: "/Banner/1.jpg",
      desc: `T'BOLI ACCESSORIES A VERY UNIQUE AND AUTHENTIC WAY OF FASHION `,
    },
    {
      image: "/Banner/2.jpg",
      desc: `VERY 100% RATTAN MADE FRUIT BASKET THAT CAN MAKE YOUR FRUIT DISPLAY EVEN MORE ATTRACTIVE`,
    },
    {
      image: "/Banner/3.jpg",
      desc: `TRADITIONAL BASKET THAT CAN COMPLIMENT EVERY FASHION AND MAKE YOU STANDOUT`,
    },
    {
      image: "/Banner/4.jpg",
      desc: `A CUTE BASKET MADE WITH RATTAN`,
    },
    {
      image: "/Banner/5.jpg",
      desc: `100% RATTAN LOUNGE CHAIRS SO COMFORTABLE`,
    },
    {
      image: "/Banner/6.jpg",
      desc: `AUTHENTIC BAMBOO COUCH`,
    },
    {
      image: "/Banner/7.jpg",
      desc: `100% MADE WITH COCONUT JUICE THE VERY KNOWN SAUCE SUKANG PINAKURAT`,
    },
    {
      image: "/Banner/8.jpg",
      desc: `PALAPA A Maranao condiment that is crucial in Maranao dishes. It can be eaten raw or cooked or can be mixed with your dishes.`,
    },
  ]

  return (
    <div className="relative h-[85vh] overflow-x-hidden overflow-y-auto md:overflow-y-hidden">
      <Slider className="z-[99] w-[80%]" {...settings}>
        {imagesData.map(({ image, desc }) => (
          <div key={image}>
            <div className="relative flex flex-col sm:flex-row px-6 h-[480px] overflow-hidden">
              {/* Left */}
              <div
                className="z-30 flex items-center justify-center h-full text-center sm:text-left md:z-20 sm:w-full"
                px={16}
              >
                <Stack className="text-[#333333] w-full max-w-[485px] items-center sm:items-start">
                  <Text className="text-5xl font-semibold">
                    SHOP IN{" "}
                    <Text className="inline text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-tr from-[#4C52BE] to-[#009CA0]">
                      LADENO
                    </Text>
                  </Text>

                  <Text className="text-2xl" weight={700}>
                    {desc}
                  </Text>

                  <Button
                    className="w-max"
                    onClick={() => scrollIntoView()}
                    variant="outline"
                    radius={99}
                  >
                    Shop Now
                  </Button>
                </Stack>
              </div>

              {/* Right */}
              <div className="z-20 items-center justify-center hidden w-full h-full px-8 sm:flex sm:static">
                <Image
                  className="overflow-hidden w-full max-w-[380px] rounded-lg shadow-2xl"
                  src={image}
                  fit="contain"
                />
              </div>

              <div className="absolute -top-64 sm:-top-48 right-64 sm:-right-48 rounded-full h-[480px] w-[480px] bg-[#4954BD] shadow-xl shadow-black/25" />
            </div>
          </div>
        ))}
      </Slider>
    </div>
  )
}

export default Banner
