
"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function ScrollReveal() {
  const container = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const elements = gsap.utils.toArray<HTMLElement>("[data-reveal]");

      elements.forEach((element) => {
        gsap.fromTo(
          element,
          {
            y: 36,
            opacity: 0,
          },
          {
            y: 0,
            opacity: 1,
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: {
              trigger: element,
              start: "top 85%",
              once: true,
            },
          }
        );
      });
    },
    { scope: container }
  );

  return (
    <section
      ref={container}
      className="bg-[#0A0A0A] px-6 py-24 text-white"
    >
      <p
        data-reveal
        className="mb-5 font-mono text-xs uppercase tracking-[0.25em] text-neutral-400"
      >
        Independent digital studio
      </p>

      <h2
        data-reveal
        className="max-w-4xl text-6xl font-medium leading-[0.95] tracking-tight sm:text-8xl"
      >
        We build things
        <br />
        that move people.
      </h2>

      <p
        data-reveal
        className="mt-8 max-w-md text-sm leading-7 text-neutral-400"
      >
        Strategy, design and engineering for ambitious digital brands.
      </p>
    </section>
  );
}
