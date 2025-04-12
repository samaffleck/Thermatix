"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const features = [
  {
    title: "Advanced Cycle Design",
    description:
      "Simulate multi-step PSA cycles including CoBLO, CnBLO, LPP, and custom purge steps. Evaluate layered beds, dynamic breakthrough, and tailor isotherm behavior with precision.",
    image: "/demo_image.png",
  },
  {
    title: "High-Speed Simulation Engine",
    description:
      "Engineered for rapid iteration. Our 1D dynamic solver delivers full cycle results in minutes — enabling optimization and comparison at unprecedented speed.",
    image: "/results-image.png",
  },
  {
    title: "Web-Based and Scalable",
    description:
      "Launch complex simulations right in your browser. No install, no overhead — just powerful process modeling with global accessibility and flexible licensing.",
    image: "/browser-image.png",
  },
];

export default function Features() {
  return (
    <section className="px-6 pt-[10vh] pb-28 bg-background text-foreground">
      <div className="max-w-7xl mx-auto space-y-32">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold">
            Design with StokesFlow
          </h2>
        </div>

        {features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: index * 0.2 }}
            viewport={{ once: true }}
            className={`flex flex-col lg:flex-row items-center gap-12 ${
              index % 2 === 1 ? "lg:flex-row-reverse" : ""
            }`}
          >
            {/* Text - 1/3 width */}
            <div className="w-full lg:basis-1/3">
              <h3 className="text-3xl font-semibold mb-4">{feature.title}</h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>

            {/* Image - 2/3 width */}
            <div className="w-full lg:basis-2/3 backdrop-blur-md bg-white/10 border border-blue-500 rounded-xl p-2 shadow-lg">
              <Image
                src={feature.image}
                alt={feature.title}
                width={1800}
                height={1200}
                className="w-full h-auto rounded-sm"
                />
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
