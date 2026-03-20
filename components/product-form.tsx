"use client"

import type React from "react"

import { useState } from "react"
import { useTranslations } from "@/hooks/use-translations"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import type { Product } from "@/types"

export function ProductForm({ product }: { product?: Product }) {
  const { t } = useTranslations()
  const { toast } = useToast()
  const isEditing = !!product

  const [formData, setFormData] = useState({
    name: product?.name || "",
    description: product?.description || "",
    price: product?.price?.toString() || "",
    category: product?.category || "",
    brand: product?.brand || "",
    model: product?.model || "",
    stock: product?.stock?.toString() || "0",
    featured: product?.featured || false,
    images: product?.images || [""],
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }))
  }

  const handleImageChange = (index: number, value: string) => {
    const newImages = [...formData.images]
    newImages[index] = value
    setFormData((prev) => ({ ...prev, images: newImages }))
  }

  const addImageField = () => {
    setFormData((prev) => ({ ...prev, images: [...prev.images, ""] }))
  }

  const removeImageField = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index)
    setFormData((prev) => ({ ...prev, images: newImages.length ? newImages : [""] }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const productData = {
        ...formData,
        price: Number.parseFloat(formData.price),
        stock: Number.parseInt(formData.stock, 10),
        images: formData.images.filter(Boolean),
      }

      const url = isEditing ? `/api/products/${product.id}` : "/api/products"
      const method = isEditing ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      })

      if (!response.ok) {
        throw new Error("Failed to save product")
      }

      const savedProduct = await response.json()

      toast({
        title: isEditing ? t("admin.products.updated") : t("admin.products.created"),
        description: savedProduct.name,
      })

      if (!isEditing) {
        // Reset form after creating a new product
        setFormData({
          name: "",
          description: "",
          price: "",
          category: "",
          brand: "",
          model: "",
          stock: "0",
          featured: false,
          images: [""],
        })
      }
    } catch (error) {
      toast({
        title: t("admin.products.error"),
        description: t("admin.products.errorSaving"),
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? t("admin.products.editProduct") : t("admin.products.addProduct")}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t("admin.products.name")}</Label>
            <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{t("admin.products.description")}</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">{t("admin.products.price")}</Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock">{t("admin.products.stock")}</Label>
              <Input
                id="stock"
                name="stock"
                type="number"
                min="0"
                value={formData.stock}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">{t("admin.products.category")}</Label>
            <Select value={formData.category} onValueChange={(value) => handleSelectChange("category", value)}>
              <SelectTrigger>
                <SelectValue placeholder={t("admin.products.selectCategory")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="electronics">{t("categories.electronics")}</SelectItem>
                <SelectItem value="fashion">{t("categories.fashion")}</SelectItem>
                <SelectItem value="home">{t("categories.home")}</SelectItem>
                <SelectItem value="beauty">{t("categories.beauty")}</SelectItem>
                <SelectItem value="books">{t("categories.books")}</SelectItem>
                <SelectItem value="toys">{t("categories.toys")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="brand">{t("admin.products.brand")}</Label>
              <Input id="brand" name="brand" value={formData.brand} onChange={handleChange} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="model">{t("admin.products.model")}</Label>
              <Input id="model" name="model" value={formData.model} onChange={handleChange} />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="featured">{t("admin.products.featured")}</Label>
              <Switch
                id="featured"
                checked={formData.featured}
                onCheckedChange={(checked) => handleSwitchChange("featured", checked)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t("admin.products.images")}</Label>
            {formData.images.map((image, index) => (
              <div key={index} className="flex gap-2 mt-2">
                <Input
                  placeholder={t("admin.products.imageUrl")}
                  value={image}
                  onChange={(e) => handleImageChange(index, e.target.value)}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => removeImageField(index)}
                  disabled={formData.images.length === 1}
                >
                  -
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={addImageField} className="mt-2">
              {t("admin.products.addImage")}
            </Button>
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting
              ? t("admin.products.saving")
              : isEditing
                ? t("admin.products.updateProduct")
                : t("admin.products.createProduct")}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
