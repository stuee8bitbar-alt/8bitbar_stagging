import React from "react";

const AboutSection = () => {
  return (
    <section className="bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-['Orbitron'] text-3xl md:text-4xl font-bold mb-6 pt-8 pb-4 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-cyan-400">
            Welcome to 8 Bit Bar – Your Retro Playground!
          </h2>
          <div className="max-w-4xl mx-auto space-y-6 text-gray-300 text-lg leading-relaxed">
            <p>
              Step into 8 Bit Bar, the ultimate fusion of classic arcade thrills
              and delicious tapas bites. Dive into nostalgia with our lineup of
              arcade games, a vintage pinball machine, and free pool (just grab
              a drink!).
            </p>
            <p>
              Level up your night with handcrafted cocktails, sing your heart
              out in our private hire Karaoke room, or chill with your crew in a
              cozy N64 booth—perfect for up to 4 players.
            </p>
            <p>
              Whether you're planning a party or just dropping in, 8 Bit Bar is
              your go-to spot for good vibes, games, and great food.
            </p>
            <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-cyan-400">
              Eat, Drink, Play and Repeat
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
