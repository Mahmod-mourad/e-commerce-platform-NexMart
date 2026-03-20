"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useTranslations } from "@/hooks/use-translations"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Separator } from "@/components/ui/separator"

export function ProductFilters() {
  const { t } = useTranslations()
  const router = useRouter()
  const searchParams = useSearchParams()

  const currentCategory = searchParams.get("category") || ""
  const currentMinPrice = Number(searchParams.get("minPrice") || "0")
  const currentMaxPrice = Number(searchParams.get("maxPrice") || "1000")
  const currentRating = Number(searchParams.get("rating") || "0")

  const [priceRange, setPriceRange] = useState<[number, number]>([currentMinPrice, currentMaxPrice])
  const [selectedCategories, setSelectedCategories] = useState<string[]>(currentCategory ? [currentCategory] : [])
  const [selectedRating, setSelectedRating] = useState<number>(currentRating)

  const categories = [
    { id: "electronics", name: t("categories.electronics") },
    { id: "fashion", name: t("categories.fashion") },
    { id: "home", name: t("categories.home") },
    { id: "beauty", name: t("categories.beauty") },
    { id: "books", name: t("categories.books") },
    { id: "toys", name: t("categories.toys") },
  ]

  const ratings = [
    { value: 4, label: t("filters.fourStarsAbove") },
    { value: 3, label: t("filters.threeStarsAbove") },
    { value: 2, label: t("filters.twoStarsAbove") },
    { value: 1, label: t("filters.oneStarAbove") },
  ]

  const handleCategoryChange = (category: string, checked: boolean) => {
    setSelectedCategories((prev) => {
      if (checked) {
        return [...prev, category]
      } else {
        return prev.filter((c) => c !== category)
      }
    })
  }

  const handleRatingChange = (rating: number) => {
    setSelectedRating(rating === selectedRating ? 0 : rating)
  }

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString())

    // Update category
    if (selectedCategories.length > 0) {
      params.set("category", selectedCategories.join(","))
    } else {
      params.delete("category")
    }

    // Update price range
    params.set("minPrice", priceRange[0].toString())
    params.set("maxPrice", priceRange[1].toString())

    // Update rating
    if (selectedRating > 0) {
      params.set("rating", selectedRating.toString())
    } else {
      params.delete("rating")
    }

    // Keep the search query if it exists
    const query = searchParams.get("query")
    if (query) {
      params.set("query", query)
    }

    router.push(`/products?${params.toString()}`)
  }

  const resetFilters = () => {
    setPriceRange([0, 1000])
    setSelectedCategories([])
    setSelectedRating(0)
    router.push("/products")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("filters.title")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="font-medium mb-4">{t("filters.categories")}</h3>
          <div className="space-y-3">
            {categories.map((category) => (
              <div key={category.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`category-${category.id}`}
                  checked={selectedCategories.includes(category.id)}
                  onCheckedChange={(checked) => handleCategoryChange(category.id, checked as boolean)}
                />
                <Label htmlFor={`category-${category.id}`}>{category.name}</Label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        <div>
          <div className="flex justify-between mb-4">
            <h3 className="font-medium">{t("filters.priceRange")}</h3>
            <span>
              ${priceRange[0]} - ${priceRange[1]}
            </span>
          </div>
          <Slider
            value={priceRange}
            min={0}
            max={1000}
            step={10}
            onValueChange={(value) => setPriceRange(value as [number, number])}
            className="my-6"
          />
        </div>

        <Separator />

        <div>
          <h3 className="font-medium mb-4">{t("filters.customerRating")}</h3>
          <div className="space-y-3">
            {ratings.map((rating) => (
              <div key={rating.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`rating-${rating.value}`}
                  checked={selectedRating === rating.value}
                  onCheckedChange={() => handleRatingChange(rating.value)}
                />
                <Label htmlFor={`rating-${rating.value}`}>{rating.label}</Label>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2 pt-4">
          <Button onClick={applyFilters}>{t("filters.applyFilters")}</Button>
          <Button variant="outline" onClick={resetFilters}>
            {t("filters.resetFilters")}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
