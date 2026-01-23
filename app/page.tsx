import HeroSection from '@/components/sections/HeroSection';
import ProgramSection from '@/components/sections/ProgramSection';
import QuizSection from '@/components/sections/QuizSection';
import PortfolioSection from '@/components/sections/PortfolioSection';
import ReviewsSection from '@/components/sections/ReviewsSection';
import FAQSection from '@/components/sections/FAQSection';
import CTASection from '@/components/sections/CTASection';
import BottomNav from '@/components/layout/BottomNav';

export default function Home() {
  return (
    <>
      {/* Scroll Snap Container - как в Reels */}
      <main className="snap-container">
        <HeroSection />
        <ProgramSection />
        <QuizSection />
        <PortfolioSection />
        <ReviewsSection />
        <FAQSection />
        <CTASection />
      </main>
      <BottomNav />
    </>
  );
}
