"use client"

import Link from "next/link"
import { useTranslations } from "@/hooks/use-translations"
import { Package, Facebook, Twitter, Instagram, Youtube, ArrowUp } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Footer() {
  const { t, locale } = useTranslations()
  const isRtl = locale === "ar"

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <footer className="bg-muted" dir={isRtl ? "rtl" : "ltr"}>
      <div className="border-t">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <p className="text-sm text-muted-foreground">{t("footer.backToTop")}</p>
          <Button variant="ghost" size="sm" onClick={scrollToTop}>
            <ArrowUp className="h-4 w-4 mr-2" />
            {t("footer.top")}
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h3 className="font-semibold mb-4">{t("footer.getToKnowUs")}</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground">
                  {t("footer.aboutUs")}
                </Link>
              </li>
              <li>
                <Link href="/careers" className="text-sm text-muted-foreground hover:text-foreground">
                  {t("footer.careers")}
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-sm text-muted-foreground hover:text-foreground">
                  {t("footer.blog")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">{t("footer.makeMoneyWithUs")}</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/sell" className="text-sm text-muted-foreground hover:text-foreground">
                  {t("footer.sellProducts")}
                </Link>
              </li>
              <li>
                <Link href="/affiliate" className="text-sm text-muted-foreground hover:text-foreground">
                  {t("footer.becomeAffiliate")}
                </Link>
              </li>
              <li>
                <Link href="/advertise" className="text-sm text-muted-foreground hover:text-foreground">
                  {t("footer.advertise")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">{t("footer.letUsHelpYou")}</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/account" className="text-sm text-muted-foreground hover:text-foreground">
                  {t("footer.yourAccount")}
                </Link>
              </li>
              <li>
                <Link href="/orders" className="text-sm text-muted-foreground hover:text-foreground">
                  {t("footer.yourOrders")}
                </Link>
              </li>
              <li>
                <Link href="/help" className="text-sm text-muted-foreground hover:text-foreground">
                  {t("footer.help")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-4">
              <Package className="h-6 w-6" />
              <span className="font-semibold">AmaClone</span>
            </div>
            <div className="flex space-x-4 mb-4">
              <Link href="#" className="text-muted-foreground hover:text-foreground">
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground">
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground">
                <Youtube className="h-5 w-5" />
                <span className="sr-only">YouTube</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t">
        <div className="container mx-auto px-4 py-6">
          <p className="text-sm text-center text-muted-foreground">
            &copy; {new Date().getFullYear()} AmaClone. {t("footer.allRightsReserved")}
          </p>
        </div>
      </div>
    </footer>
  )
}
