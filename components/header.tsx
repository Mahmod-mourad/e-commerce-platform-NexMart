"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTranslations } from "@/hooks/use-translations"
import { useCart } from "@/hooks/use-cart"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { LanguageToggle } from "@/components/language-toggle"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Search, ShoppingCart, User, Menu, Package, LogOut, Heart } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export default function Header() {
  const { t, locale } = useTranslations()
  const pathname = usePathname()
  const { itemCount } = useCart()
  const { user, logout } = useAuth()
  const [isScrolled, setIsScrolled] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    window.location.href = `/products?query=${encodeURIComponent(searchQuery)}`
  }

  const isRtl = locale === "ar"

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all ${
        isScrolled ? "bg-background/95 backdrop-blur shadow-sm" : "bg-background"
      }`}
      dir={isRtl ? "rtl" : "ltr"}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Sheet>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side={isRtl ? "right" : "left"}>
                <div className="grid gap-6 py-6">
                  <Link href="/" className="flex items-center gap-2 font-semibold">
                    <Package className="h-6 w-6" />
                    <span className="">AmaClone</span>
                  </Link>
                  <div className="grid gap-3">
                    <Link
                      href="/"
                      className={`flex items-center gap-2 text-lg font-medium ${
                        pathname === "/" ? "text-primary" : ""
                      }`}
                    >
                      {t("nav.home")}
                    </Link>
                    <Link
                      href="/products"
                      className={`flex items-center gap-2 text-lg font-medium ${
                        pathname === "/products" ? "text-primary" : ""
                      }`}
                    >
                      {t("nav.products")}
                    </Link>
                    <Link
                      href="/cart"
                      className={`flex items-center gap-2 text-lg font-medium ${
                        pathname === "/cart" ? "text-primary" : ""
                      }`}
                    >
                      {t("nav.cart")}
                    </Link>
                    {user && (
                      <Link
                        href="/profile"
                        className={`flex items-center gap-2 text-lg font-medium ${
                          pathname === "/profile" ? "text-primary" : ""
                        }`}
                      >
                        {t("nav.profile")}
                      </Link>
                    )}
                    {user?.role === "admin" && (
                      <Link
                        href="/admin/products"
                        className={`flex items-center gap-2 text-lg font-medium ${
                          pathname === "/admin/products" ? "text-primary" : ""
                        }`}
                      >
                        {t("nav.adminProducts")}
                      </Link>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            <Link href="/" className="flex items-center gap-2 font-semibold">
              <Package className="h-6 w-6" />
              <span className="hidden md:inline-block">AmaClone</span>
            </Link>

            <nav className="hidden lg:flex lg:gap-6 lg:ml-6">
              <Link
                href="/"
                className={`text-sm font-medium ${
                  pathname === "/" ? "text-primary" : "text-muted-foreground"
                } transition-colors hover:text-primary`}
              >
                {t("nav.home")}
              </Link>
              <Link
                href="/products"
                className={`text-sm font-medium ${
                  pathname.startsWith("/products") ? "text-primary" : "text-muted-foreground"
                } transition-colors hover:text-primary`}
              >
                {t("nav.products")}
              </Link>
            </nav>
          </div>

          <div className="hidden md:flex md:flex-1 md:items-center md:justify-center md:px-2">
            <form onSubmit={handleSearch} className="w-full max-w-lg">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder={t("search.placeholder")}
                  className="w-full pl-8 pr-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button type="submit" size="sm" className="absolute right-1 top-1 h-7">
                  {t("search.button")}
                </Button>
              </div>
            </form>
          </div>

          <div className="flex items-center gap-2">
            <LanguageToggle />
            <ThemeToggle />

            {isClient && (
              <>
                <Link href="/wishlist">
                  <Button variant="ghost" size="icon">
                    <Heart className="h-5 w-5" />
                    <span className="sr-only">{t("nav.wishlist")}</span>
                  </Button>
                </Link>

                <Link href="/cart">
                  <Button variant="ghost" size="icon" className="relative">
                    <ShoppingCart className="h-5 w-5" />
                    {itemCount > 0 && (
                      <Badge
                        variant="destructive"
                        className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px]"
                      >
                        {itemCount}
                      </Badge>
                    )}
                    <span className="sr-only">{t("nav.cart")}</span>
                  </Button>
                </Link>

                {user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <User className="h-5 w-5" />
                        <span className="sr-only">{t("nav.account")}</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>{user.name}</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/profile">{t("nav.profile")}</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/orders">{t("nav.orders")}</Link>
                      </DropdownMenuItem>
                      {user.role === "admin" && (
                        <DropdownMenuItem asChild>
                          <Link href="/admin/products">{t("nav.adminProducts")}</Link>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={logout}>
                        <LogOut className="h-4 w-4 mr-2" />
                        {t("nav.logout")}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Link href="/login">
                    <Button variant="ghost" size="sm">
                      {t("nav.login")}
                    </Button>
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <div className="md:hidden border-t py-2">
        <form onSubmit={handleSearch} className="container px-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={t("search.placeholder")}
              className="w-full pl-8 pr-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button type="submit" size="sm" className="absolute right-1 top-1 h-7">
              {t("search.button")}
            </Button>
          </div>
        </form>
      </div>
    </header>
  )
}
