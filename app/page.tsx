import { HeroSection } from "@/components/hero-section"
import { FeaturedProducts } from "@/components/featured-products"
import { Categories } from "@/components/categories"
import { DealsSection } from "@/components/deals-section"
import { BrandsSection } from "@/components/brands-section"
import { Newsletter } from "@/components/newsletter"

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <HeroSection />
      <Categories />
      <FeaturedProducts />
      <DealsSection />
      <BrandsSection />
      <Newsletter />
    </div>
  )
}
