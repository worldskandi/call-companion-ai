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
      {/* Single continuous gradient background behind all sections */}
      <div className="fixed inset-0 bg-gradient-to-b from-[#D6E4F7] via-[#CDDAF0] to-[#C4D4EC] -z-10" />
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
