import React from "react";
import HeroSection from "./HeroSection";
import AboutSection from "./AboutSection";
import N64BoothsSection from "./N64BoothsSection";
import KaraokeSection from "./KaraokeSection";
import PoolSection from "./PoolSection";

const Home = () => {
  return (
    <div className="min-h-screen bg-black">
      <HeroSection />
      <div className="py-8 md:py-12">
        <AboutSection />
      </div>
      <div className="h-px bg-gradient-to-r from-transparent via-pink-500 to-transparent mx-4 md:mx-8 shadow-[0_0_10px_rgba(236,72,153,0.5)]"></div>
      <div className="py-8 md:py-12">
        <N64BoothsSection />
      </div>
      <div className="h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent mx-4 md:mx-8 shadow-[0_0_10px_rgba(34,211,238,0.5)]"></div>
      <div className="py-8 md:py-12">
        <KaraokeSection />
      </div>
      <div className="h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent mx-4 md:mx-8 shadow-[0_0_10px_rgba(168,85,247,0.5)]"></div>
      <div className="py-8 md:py-12">
        <PoolSection />
      </div>
    </div>
  );
};

export default Home;
