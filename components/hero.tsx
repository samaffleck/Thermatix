"use client"

import Image from 'next/image'
import Link from 'next/link'

export default function Hero() {
  return (
    <section className="w-full bg-background text-foreground py-28 px-6 lg:px-16">
      <div className="max-w-7xl mx-auto flex flex-col-reverse lg:flex-row items-center gap-16">

        {/* Left Content */}
        <div className="flex-1 flex flex-col items-start">
          <div className="w-12 h-1 bg-accent-blue mb-6" />

          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight leading-tight mb-8">
            Accelerated adsorption system design
          </h1>

          <p className="text-xl text-muted-foreground mb-10 max-w-xl">
            StokesFlow is a high-performance modeling platform for pressure and temperature swing adsorption simulations
          </p>

          <Link
            href="/protected"
            className="px-8 py-4 text-lg font-medium text-white bg-accent-blue hover:bg-accent-blue-hover rounded-full shadow-lg transition-transform hover:scale-105"
          >
            Launch the App
          </Link>
        </div>

        {/* Right Image */}
        <div className="flex-1">
          <Image
            src="/reactor-image-6.png"
            alt="StokesFlow Preview"
            width={1600}
            height={1200}
            className="w-full h-auto rounded-xl shadow-xl"
            priority
          />
        </div>
      </div>
    </section>
  )
}
