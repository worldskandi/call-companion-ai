import Navbar from '@/components/landing/Navbar';
import Hero from '@/components/landing/Hero';
import Features from '@/components/landing/Features';
import HowItWorks from '@/components/landing/HowItWorks';
import { Tokens } from '@/components/landing/Tokens';
import Pricing from '@/components/landing/Pricing';
import Testimonials from '@/components/landing/Testimonials';
import CTA from '@/components/landing/CTA';
import Footer from '@/components/landing/Footer';

const Landing = () => {
  return (
    <div className="min-h-screen relative">
      {/* Multi-tone continuous gradient background */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-b from-[#E0EAFC] via-[#D4DFF5] via-30% via-[#CFDBF0] via-50% via-[#D8DEF0] via-70% to-[#E8E4F0]" />
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <Tokens />
      <Pricing />
      <Testimonials />
      <CTA />
      <Footer />
    </div>
  );
};

export default Landing;
