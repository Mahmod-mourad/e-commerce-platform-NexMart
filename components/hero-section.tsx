"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useTranslations } from "@/hooks/use-translations"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

export function HeroSection() {
  const { t } = useTranslations()
  const [currentSlide, setCurrentSlide] = useState(0)

  const slides = [
    {
      image: "/placeholder.svg?height=600&width=1200",
      title: t("hero.slide1.title"),
      description: t("hero.slide1.description"),
      link: "/products?category=electronics",
    },
    {
      image: "/placeholder.svg?height=600&width=1200",
      title: t("hero.slide2.title"),
      description: t("hero.slide2.description"),
      link: "/products?category=fashion",
    },
    {
      image: "/placeholder.svg?height=600&width=1200",
      title: t("hero.slide3.title"),
      description: t("hero.slide3.description"),
      link: "/products?category=home",
    },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [slides.length])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  return (
    <div className="relative overflow-hidden rounded-lg mb-8">
      <div
        className="flex transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {slides.map((slide, index) => (
          <div key={index} className="w-full flex-shrink-0 relative">
            <Image
              src={slide.image || "/placeholder.svg"}
              alt={slide.title}
              width={1200}
              height={600}
              className="w-full h-[300px] md:h-[400px] lg:h-[500px] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent flex flex-col justify-end p-6 md:p-10">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2">{slide.title}</h2>
              <p className="text-sm md:text-base mb-4 max-w-md">{slide.description}</p>
              <Button asChild className="w-fit">
                <Link href={slide.link}>{t("hero.shopNow")}</Link>
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/50 hover:bg-background/80"
        onClick={prevSlide}
      >
        <ChevronLeft className="h-6 w-6" />
        <span className="sr-only">{t("hero.previous")}</span>
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/50 hover:bg-background/80"
        onClick={nextSlide}
      >
        <ChevronRight className="h-6 w-6" />
        <span className="sr-only">{t("hero.next")}</span>
      </Button>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full ${index === currentSlide ? "bg-primary" : "bg-muted"}`}
            onClick={() => setCurrentSlide(index)}
          >
            <span className="sr-only">{t("hero.goToSlide", { number: index + 1 })}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
