import React from "react";
import { Menu as MenuIcon, Gamepad2, Users, Music } from "lucide-react";

const FeaturesSection = () => {
  const features = [
    {
      icon: Gamepad2,
      title: "Classic Arcade Games",
      description:
        "Over 50 retro arcade machines from the golden age of gaming",
    },
    {
      icon: MenuIcon,
      title: "Neon Cocktails",
      description: "Signature drinks that glow as bright as your high scores",
    },
    {
      icon: Music,
      title: "Karaoke Rooms",
      description: "Private rooms with the latest tracks and classic hits",
    },
    {
      icon: Users,
      title: "Group Events",
      description:
        "Perfect venue for parties, corporate events, and celebrations",
    },
  ];

  return (
    <section className="py-20 bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-['Orbitron'] text-3xl md:text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-cyan-400">
            GAME FEATURES
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Everything you need for the ultimate retro gaming experience
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-black/50 border border-gray-800 rounded-lg p-6 text-center transition-all duration-300 hover:border-pink-500/50 hover:bg-black/70 hover:scale-105 group"
            >
              <div className="mb-4 flex justify-center">
                <feature.icon className="h-12 w-12 text-pink-500 group-hover:text-pink-400 transition-colors" />
              </div>
              <h3 className="font-['Orbitron'] text-lg font-bold mb-2 text-white group-hover:text-pink-400 transition-colors">
                {feature.title}
              </h3>
              <p className="text-gray-400 group-hover:text-gray-300 transition-colors">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
