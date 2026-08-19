"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useTranslations } from "@/hooks/use-translations"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Star } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

interface Review {
  id: string
  userId: string
  productId: string
  rating: number
  comment: string
  createdAt: string
  user: {
    id: string
    name: string
    image?: string
  }
}

interface ProductReviewsProps {
  productId: string
}

export function ProductReviews({ productId }: ProductReviewsProps) {
  const { t } = useTranslations()
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [userReview, setUserReview] = useState({
    rating: 0,
    comment: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    let cancelled = false

    const fetchReviews = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/reviews?productId=${encodeURIComponent(productId)}`)

        if (!response.ok) {
          throw new Error("Failed to load reviews")
        }

        const data: Review[] = await response.json()
        if (!cancelled) setReviews(data)
      } catch (error) {
        console.error("Error fetching reviews:", error)
        if (!cancelled) setReviews([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchReviews()

    return () => {
      cancelled = true
    }
  }, [productId])

  const handleRatingChange = (rating: number) => {
    setUserReview((prev) => ({ ...prev, rating }))
  }

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUserReview((prev) => ({ ...prev, comment: e.target.value }))
  }

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      router.push(`/login?redirect=/products/${productId}`)
      return
    }

    if (userReview.rating === 0) {
      toast({
        title: t("reviews.error"),
        description: t("reviews.selectRating"),
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          rating: userReview.rating,
          comment: userReview.comment,
        }),
      })

      if (!response.ok) {
        // The API rejects a review from someone who has not bought the product,
        // and a second review from the same person.
        const { error } = await response.json()
        throw new Error(error || t("reviews.errorSubmitting"))
      }

      const created: Review = await response.json()
      setReviews((prev) => [created, ...prev])

      setUserReview({
        rating: 0,
        comment: "",
      })

      toast({
        title: t("reviews.success"),
        description: t("reviews.reviewSubmitted"),
      })
    } catch (error) {
      toast({
        title: t("reviews.error"),
        description: error instanceof Error ? error.message : t("reviews.errorSubmitting"),
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString()
  }

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>{t("reviews.title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {user && (
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-4">{t("reviews.writeReview")}</h3>
              <form onSubmit={handleSubmitReview}>
                <div className="mb-4">
                  <div className="flex items-center gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Button
                        key={star}
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleRatingChange(star)}
                      >
                        <Star
                          className={`h-6 w-6 ${
                            userReview.rating >= star ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground"
                          }`}
                        />
                        <span className="sr-only">{t("reviews.ratingValue", { value: star })}</span>
                      </Button>
                    ))}
                    <span className="ml-2 text-sm text-muted-foreground">
                      {userReview.rating > 0
                        ? t("reviews.selectedRating", { value: userReview.rating })
                        : t("reviews.selectRating")}
                    </span>
                  </div>
                  <Textarea
                    placeholder={t("reviews.commentPlaceholder")}
                    value={userReview.comment}
                    onChange={handleCommentChange}
                    rows={4}
                  />
                </div>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? t("reviews.submitting") : t("reviews.submitReview")}
                </Button>
              </form>
            </div>
          )}

          <Separator />

          {loading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-20 bg-muted rounded"></div>
              <div className="h-20 bg-muted rounded"></div>
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">{t("reviews.noReviews")}</p>
            </div>
          ) : (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review.id} className="flex gap-4">
                  <Avatar className="w-10 h-10 border">
                    <AvatarImage src={review.user.image || "/placeholder-user.jpg"} alt={review.user.name} />
                    <AvatarFallback>{review.user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-medium">{review.user.name}</h4>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              review.rating >= star ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-muted-foreground">{formatDate(review.createdAt)}</span>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{review.comment}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
