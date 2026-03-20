"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { useTranslations } from "@/hooks/use-translations"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash, Star } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { ProductForm } from "@/components/product-form"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { Product } from "@/types"

export function ProductList() {
  const { t } = useTranslations()
  const { toast } = useToast()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/products")
      const data = await response.json()
      setProducts(data.products)
    } catch (error) {
      console.error("Error fetching products:", error)
      toast({
        title: t("admin.products.error"),
        description: t("admin.products.errorFetching"),
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete product")
      }

      setProducts((prev) => prev.filter((product) => product.id !== id))

      toast({
        title: t("admin.products.deleted"),
        description: t("admin.products.productDeleted"),
      })
    } catch (error) {
      toast({
        title: t("admin.products.error"),
        description: t("admin.products.errorDeleting"),
        variant: "destructive",
      })
    }
  }

  const handleEdit = (product: Product) => {
    setSelectedProduct(product)
    setEditDialogOpen(true)
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("admin.products.productList")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-muted rounded w-1/4"></div>
            <div className="h-[300px] bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Fallback to sample products if API returns empty
  const displayProducts =
    products.length > 0
      ? products
      : [
          {
            id: "1",
            name: "Wireless Noise-Cancelling Headphones",
            description: "Premium wireless headphones with active noise cancellation",
            price: 299.99,
            images: ["/placeholder.svg?height=300&width=300"],
            category: "electronics",
            rating: 4.5,
            stock: 15,
            featured: true,
          },
          {
            id: "2",
            name: "Smart Fitness Watch",
            description: "Track your fitness goals with this advanced smartwatch",
            price: 199.99,
            images: ["/placeholder.svg?height=300&width=300"],
            category: "electronics",
            rating: 4.3,
            stock: 20,
            featured: true,
          },
        ]

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{t("admin.products.productList")}</CardTitle>
        </CardHeader>
        <CardContent>
          {displayProducts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">{t("admin.products.noProducts")}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">{t("admin.products.image")}</TableHead>
                    <TableHead>{t("admin.products.name")}</TableHead>
                    <TableHead>{t("admin.products.price")}</TableHead>
                    <TableHead>{t("admin.products.category")}</TableHead>
                    <TableHead>{t("admin.products.stock")}</TableHead>
                    <TableHead>{t("admin.products.status")}</TableHead>
                    <TableHead className="text-right">{t("admin.products.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <Image
                          src={product.images[0] || "/placeholder.svg?height=40&width=40"}
                          alt={product.name}
                          width={40}
                          height={40}
                          className="rounded-md object-cover"
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-muted-foreground flex items-center">
                            <Star className="h-3 w-3 text-yellow-400 fill-yellow-400 mr-1" />
                            {product.rating}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>${product.price.toFixed(2)}</TableCell>
                      <TableCell>{t(`categories.${product.category}`)}</TableCell>
                      <TableCell>{product.stock}</TableCell>
                      <TableCell>
                        {product.featured && <Badge>{t("admin.products.featured")}</Badge>}
                        {product.stock === 0 && <Badge variant="destructive">{t("products.outOfStock")}</Badge>}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(product)}>
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">{t("admin.products.edit")}</span>
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <Trash className="h-4 w-4" />
                                <span className="sr-only">{t("admin.products.delete")}</span>
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>{t("admin.products.confirmDelete")}</AlertDialogTitle>
                                <AlertDialogDescription>{t("admin.products.deleteWarning")}</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>{t("admin.products.cancel")}</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(product.id)}>
                                  {t("admin.products.delete")}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("admin.products.editProduct")}</DialogTitle>
            <DialogDescription>{t("admin.products.editProductDescription")}</DialogDescription>
          </DialogHeader>
          {selectedProduct && <ProductForm product={selectedProduct} />}
        </DialogContent>
      </Dialog>
    </>
  )
}
