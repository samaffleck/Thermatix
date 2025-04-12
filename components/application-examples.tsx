"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";

const applications = [
  {
    title: "Direct Air Capture",
    description:
      "Simulate and optimize sorbent-based systems for removing CO₂ directly from the atmosphere. Model dynamic breakthrough behavior, pressure swings, and regeneration strategies with ease.",
    image: "/images/DAC.png", 
  },
  {
    title: "Industrial Carbon Capture",
    description:
      "Design tailored adsorption processes for capturing CO₂ from flue gases and industrial streams. Analyze performance trade-offs and scale with confidence.",
    image: "/images/industrial.png",
  },
  {
    title: "Air Separation",
    description:
      "Model PSA and TSA cycles for oxygen, nitrogen, and argon recovery. Unlock process insights through precise control of thermodynamics, mass transfer, and cycle timing.",
    image: "/images/air-separation.png",
  },
  {
    title: "Hydrogen Production",
    description:
      "Simulate purification stages for hydrogen production via SMR, electrolysis, or biomass routes. Evaluate adsorbent performance and breakthrough for CO, CO₂, CH₄, and H₂O removal.",
    image: "/images/hydrogen.png",
  },
];

export function Applications() {
  return (
    <section className="w-full bg-background py-[10vh] px-6 md:px-16 xl:px-32">
      <div className="max-w-screen-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-5xl font-bold mb-6">
            Transforming Gas Separation Technology
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            From carbon removal to clean hydrogen, our simulation engine powers the development of advanced adsorption systems across climate and industrial applications.
          </p>
        </motion.div>

        <div className="grid gap-20 md:grid-cols-2">
          {applications.map((app, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="flex flex-col lg:flex-row items-center gap-8"
            >
              <div className="w-full lg:w-1/2">
                <Image
                  src={app.image}
                  alt={app.title}
                  width={800}
                  height={600}
                  className="rounded-2xl shadow-xl object-cover"
                />
              </div>
              <div className="w-full lg:w-1/2">
                <h3 className="text-3xl font-semibold mb-3">{app.title}</h3>
                <p className="text-muted-foreground text-lg">{app.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mt-28 text-center"
        >
          <Link
            href="/protected"
            className="inline-block px-10 py-5 text-lg font-medium text-white bg-accent-blue hover:bg-accent-blue-hover rounded-full shadow-xl transition-transform hover:scale-105"
          >
            Launch the App
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
