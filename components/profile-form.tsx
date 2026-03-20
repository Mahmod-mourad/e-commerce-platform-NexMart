"use client"

import type React from "react"

import { useState } from "react"
import { useTranslations } from "@/hooks/use-translations"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import type { User } from "@/types"

interface ProfileFormProps {
  user: User
}

export function ProfileForm({ user }: ProfileFormProps) {
  const { t } = useTranslations()
  const { toast } = useToast()
  const { logout } = useAuth()

  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Password validation
      if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
        toast({
          title: t("profile.error"),
          description: t("profile.passwordsDoNotMatch"),
          variant: "destructive",
        })
        return
      }

      // In a real app, this would be an API call
      // For now, we'll just simulate updating the user in localStorage
      const users = JSON.parse(localStorage.getItem("users") || "[]")
      const userIndex = users.findIndex((u: any) => u.id === user.id)

      if (userIndex === -1) {
        throw new Error("User not found")
      }

      // Check current password
      if (formData.currentPassword && users[userIndex].password !== formData.currentPassword) {
        toast({
          title: t("profile.error"),
          description: t("profile.incorrectPassword"),
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      // Update user data
      users[userIndex].name = formData.name
      users[userIndex].email = formData.email

      if (formData.newPassword) {
        users[userIndex].password = formData.newPassword
      }

      localStorage.setItem("users", JSON.stringify(users))

      // Update current user in localStorage
      const updatedUser = {
        ...user,
        name: formData.name,
        email: formData.email,
      }
      localStorage.setItem("user", JSON.stringify(updatedUser))

      toast({
        title: t("profile.success"),
        description: t("profile.profileUpdated"),
      })

      // Clear password fields
      setFormData((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }))

      // If email was changed, log the user out
      if (formData.email !== user.email) {
        toast({
          title: t("profile.emailChanged"),
          description: t("profile.pleaseLoginAgain"),
        })
        setTimeout(() => {
          logout()
        }, 2000)
      }
    } catch (error) {
      toast({
        title: t("profile.error"),
        description: t("profile.errorUpdating"),
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("profile.personalInfo")}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t("profile.name")}</Label>
            <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">{t("profile.email")}</Label>
            <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
          </div>

          <div className="pt-4 border-t">
            <h3 className="text-lg font-medium mb-4">{t("profile.changePassword")}</h3>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">{t("profile.currentPassword")}</Label>
                <Input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  value={formData.currentPassword}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">{t("profile.newPassword")}</Label>
                <Input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  value={formData.newPassword}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{t("profile.confirmPassword")}</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? t("profile.saving") : t("profile.saveChanges")}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
