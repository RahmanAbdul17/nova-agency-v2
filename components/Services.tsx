
"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const services = [
  {
    number: "01",
    title: "Digital",
    accent: "Engineering",
    description:
      "We engineer high-performance digital products built to scale. Precision development, thoughtful architecture, and uncompromising performance.",
    capabilities: ["Next.js & React", "Digital Products", "Web Applications"],
    image:
      "https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&w=1400&q=85",
    index: "SYSTEMS / 001",
  },
  {
    number: "02",
    title: "Interface",
    accent: "Design",
    description:
      "We transform complex ideas into striking digital experiences. Every pixel, transition, and interaction has a reason to exist.",
    capabilities: ["Digital Art Direction", "UI / UX Design", "Design Systems"],
    image:
      "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=1400&q=85",
    index: "VISUALS / 002",
  },
  {
    number: "03",
    title: "Creative",
    accent: "Technology",
    description:
      "We push beyond the expected with immersive 3D, unconventional interactions, and motion that makes digital experiences unforgettable.",
    capabilities: ["Three.js Experiences", "Motion Design", "Creative Coding"],
    image:
      "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1400&q=85",
    index: "EXPERIMENTS / 003",
  },
];

export default function Services() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const canvasContainer = canvasRef.current;

    if (!section || !canvasContainer) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // Keep event-listener cleanup separate from GSAP context initialization.
    const cleanupListeners: (() => void)[] = [];

    const ctx = gsap.context(() => {
      if (reducedMotion) return;

      // Intro typography reveal
      gsap.from("[data-reveal]", {
        y: 65,
        opacity: 0,
        duration: 1.1,
        stagger: 0.12,
        ease: "power4.out",
        scrollTrigger: {
          trigger: "[data-intro]",
          start: "top 80%",
          once: true,
        },
      });

      // Service entrances and image reveals
      gsap.utils.toArray<HTMLElement>("[data-service]").forEach((row) => {
        const image = row.querySelector<HTMLElement>("[data-image]");
        const copy = row.querySelectorAll<HTMLElement>("[data-copy]");

        gsap.from(row, {
          opacity: 0,
          y: 45,
          duration: 0.85,
          ease: "power3.out",
          scrollTrigger: {
            trigger: row,
            start: "top 85%",
            once: true,
          },
        });

        if (image) {
          gsap.fromTo(
            image,
            { clipPath: "inset(10% 8% 10% 8%)", scale: 1.12 },
            {
              clipPath: "inset(0% 0% 0% 0%)",
              scale: 1,
              duration: 1.35,
              ease: "power4.out",
              scrollTrigger: {
                trigger: row,
                start: "top 82%",
                once: true,
              },
            }
          );
        }

        gsap.from(copy, {
          y: 24,
          opacity: 0,
          stagger: 0.1,
          duration: 0.7,
          ease: "power3.out",
          scrollTrigger: {
            trigger: row,
            start: "top 75%",
            once: true,
          },
        });
      });

      // Hover animations
      gsap.utils.toArray<HTMLElement>("[data-service]").forEach((row) => {
        const image = row.querySelector<HTMLElement>("[data-image]");
        const title = row.querySelector<HTMLElement>("[data-title]");
        const arrow = row.querySelector<HTMLElement>("[data-arrow]");

        const enter = () => {
          if (image) {
            gsap.to(image, {
              scale: 1.055,
              duration: 0.7,
              ease: "power3.out",
              overwrite: "auto",
            });
          }

          if (title) {
            gsap.to(title, {
              x: 9,
              duration: 0.45,
              ease: "power3.out",
              overwrite: "auto",
            });
          }

          if (arrow) {
            gsap.to(arrow, {
              rotation: 45,
              scale: 1.08,
              duration: 0.35,
              ease: "power2.out",
              overwrite: "auto",
            });
          }
        };

        const leave = () => {
          if (image) {
            gsap.to(image, {
              scale: 1,
              duration: 0.7,
              ease: "power3.out",
              overwrite: "auto",
            });
          }

          if (title) {
            gsap.to(title, {
              x: 0,
              duration: 0.45,
              ease: "power3.out",
              overwrite: "auto",
            });
          }

          if (arrow) {
            gsap.to(arrow, {
              rotation: 0,
              scale: 1,
              duration: 0.35,
              ease: "power2.out",
              overwrite: "auto",
            });
          }
        };

        row.addEventListener("mouseenter", enter);
        row.addEventListener("mouseleave", leave);

        // Clean up listeners when the component unmounts.
        cleanupListeners.push(() => {
          row.removeEventListener("mouseenter", enter);
          row.removeEventListener("mouseleave", leave);
        });
      });
    }, section);

    // Three.js scene setup
    let renderer: THREE.WebGLRenderer | null = null;
    let frameId = 0;
    let resizeObserver: ResizeObserver | null = null;
    let pointerHandler: ((event: PointerEvent) => void) | null = null;

    let geometry: THREE.BufferGeometry | null = null;
    let material: THREE.Material | null = null;
    let coreGeometry: THREE.BufferGeometry | null = null;
    let coreMaterial: THREE.Material | null = null;
    let particleGeometry: THREE.BufferGeometry | null = null;
    let particleMaterial: THREE.Material | null = null;

    try {
      const scene = new THREE.Scene();

      const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
      camera.position.z = 8;

      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: "low-power",
      });

      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      renderer.setClearColor(0x000000, 0);
      canvasContainer.appendChild(renderer.domElement);

      const sculpture = new THREE.Group();
      scene.add(sculpture);

      geometry = new THREE.TorusKnotGeometry(
        1.05,
        0.24,
        180,
        20,
        2,
        5
      );

      material = new THREE.MeshBasicMaterial({
        color: 0xc5ff43,
        wireframe: true,
        transparent: true,
        opacity: 0.65,
      });

      const knot = new THREE.Mesh(geometry, material);
      sculpture.add(knot);

      coreGeometry = new THREE.IcosahedronGeometry(0.65, 2);

      coreMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        wireframe: true,
        transparent: true,
        opacity: 0.09,
      });

      const core = new THREE.Mesh(coreGeometry, coreMaterial);
      sculpture.add(core);

      // Ambient particles
      const particleCount = 160;
      const particlePositions = new Float32Array(particleCount * 3);

      for (let i = 0; i < particleCount; i++) {
        particlePositions[i * 3] = (Math.random() - 0.5) * 9;
        particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 7;
        particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 3;
      }

      particleGeometry = new THREE.BufferGeometry();

      particleGeometry.setAttribute(
        "position",
        new THREE.BufferAttribute(particlePositions, 3)
      );

      particleMaterial = new THREE.PointsMaterial({
        color: 0xc5ff43,
        size: 0.018,
        transparent: true,
        opacity: 0.45,
      });

      const particles = new THREE.Points(
        particleGeometry,
        particleMaterial
      );

      scene.add(particles);

      const target = { x: 0, y: 0 };
      const current = { x: 0, y: 0 };

      if (!reducedMotion) {
        pointerHandler = (event: PointerEvent) => {
          target.x = (event.clientX / window.innerWidth - 0.5) * 0.65;
          target.y = (event.clientY / window.innerHeight - 0.5) * 0.4;
        };

        window.addEventListener("pointermove", pointerHandler);
      }

      const resize = () => {
        if (!renderer) return;

        const width = canvasContainer.clientWidth;
        const height = canvasContainer.clientHeight;

        if (!width || !height) return;

        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();

        sculpture.position.set(width > 768 ? 2 : 1.1, 0, 0);
        sculpture.scale.setScalar(width > 768 ? 1 : 0.75);
      };

      resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(canvasContainer);
      resize();

      // PART 2 CONTINUES HERE

      // Three.js animation loop
      const animate = () => {
        frameId = requestAnimationFrame(animate);

        if (!reducedMotion) {
          current.x += (target.x - current.x) * 0.035;
          current.y += (target.y - current.y) * 0.035;

          knot.rotation.x += 0.002;
          knot.rotation.y += 0.003;

          core.rotation.y -= 0.002;

          sculpture.rotation.x = current.y;
          sculpture.rotation.y = current.x;

          particles.rotation.y += 0.0002;
        }

        renderer?.render(scene, camera);
      };

      animate();
    } catch (error) {
      console.error("Unable to initialize the services 3D scene:", error);
    }

    // Cleanup for React and Next.js
    return () => {
      cleanupListeners.forEach((cleanup) => cleanup());

      ctx.revert();

      cancelAnimationFrame(frameId);
      resizeObserver?.disconnect();

      if (pointerHandler) {
        window.removeEventListener("pointermove", pointerHandler);
      }

      geometry?.dispose();
      material?.dispose();

      coreGeometry?.dispose();
      coreMaterial?.dispose();

      particleGeometry?.dispose();
      particleMaterial?.dispose();

      renderer?.dispose();
      renderer?.domElement.remove();
    };
  }, []);

  // Cursor-following spotlight
  const moveSpotlight = (event: React.PointerEvent<HTMLElement>) => {
    if (
      event.pointerType === "touch" ||
      !cursorRef.current ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const bounds = event.currentTarget.getBoundingClientRect();

    gsap.to(cursorRef.current, {
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top,
      duration: 0.45,
      ease: "power3.out",
      overwrite: "auto",
    });
  };

  return (
    <section
      ref={sectionRef}
      id="services"
      onPointerMove={moveSpotlight}
      className="relative isolate overflow-hidden bg-[#080907] text-[#f1f0ec]"
    >
      {/* Ambient background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 82% 18%, rgba(197,255,67,0.09), transparent 42%)",
        }}
      />

      {/* Cursor-following glow */}
      <div
        ref={cursorRef}
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-0 z-0 hidden h-[360px] w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl md:block"
        style={{
          background:
            "radial-gradient(circle, rgba(197,255,67,0.055), transparent 70%)",
        }}
      />

      {/* Three.js canvas */}
      <div
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      />

      <div className="relative z-10 mx-auto max-w-[1600px] px-5 py-28 sm:px-10 sm:py-36 lg:px-16 lg:py-44">
        {/* Introduction */}
        <div
          data-intro
          className="mb-24 grid gap-12 lg:mb-36 lg:grid-cols-12 lg:items-end"
        >
          <div className="lg:col-span-8">
            <div data-reveal className="mb-9 flex items-center gap-3">
              <span className="h-px w-9 bg-[#c5ff43]" />

              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/50">
                Capabilities / 2026
              </p>
            </div>

            <h2
              data-reveal
              className="text-[clamp(4rem,10vw,10rem)] font-medium leading-[0.79] tracking-[-0.09em]"
            >
              We make
              <br />
              <span className="text-white/35">digital</span>
              <br />
              <span className="text-[#c5ff43]">matter.</span>
            </h2>
          </div>

          <div data-reveal className="lg:col-span-3 lg:col-start-10">
            <p className="max-w-sm text-sm leading-7 text-white/60">
              We turn ambitious ideas into digital experiences that refuse to
              blend in. Strategy, design, and technology, built as one.
            </p>

            <div className="mt-8 flex items-center gap-3 font-mono text-[9px] uppercase tracking-[0.2em] text-white/45">
              <span className="h-1.5 w-1.5 rounded-full bg-[#c5ff43]" />
              Independent digital studio
            </div>
          </div>
        </div>

        {/* Services list */}
        <div className="border-t border-white/15">
          {services.map((service) => (
            <article
              data-service
              key={service.number}
              className="group border-b border-white/15"
            >
              <div className="grid gap-7 py-10 md:py-14 lg:grid-cols-12 lg:items-center lg:gap-8">
                {/* Service number */}
                <div className="flex items-center justify-between lg:col-span-1 lg:block lg:self-stretch">
                  <span className="font-mono text-xs text-[#c5ff43]">
                    / {service.number}
                  </span>

                  <span className="font-mono text-[9px] tracking-wider text-white/40 lg:hidden">
                    {service.index}
                  </span>
                </div>

                {/* Image reveal */}
                <div className="relative h-[250px] overflow-hidden bg-[#141611] sm:h-[340px] lg:col-span-4 lg:h-[300px]">
                  <img
                    data-image
                    src={service.image}
                    alt={`${service.title} ${service.accent}`}
                    loading="lazy"
                    className="h-full w-full object-cover grayscale transition-[filter] duration-700 group-hover:grayscale-0"
                  />

                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10" />

                  <span className="absolute bottom-4 left-4 font-mono text-[9px] uppercase tracking-[0.2em] text-white/75">
                    {service.index}
                  </span>

                  <span className="absolute right-4 top-4 font-mono text-[10px] text-[#c5ff43]">
                    DS—{service.number}
                  </span>
                </div>

                {/* Service title and description */}
                <div className="lg:col-span-4">
                  <h3 className="text-[clamp(2.8rem,5.1vw,5.3rem)] font-medium leading-[0.85] tracking-[-0.075em]">
                    <span data-title className="block">
                      {service.title}
                    </span>

                    <span className="mt-1 block text-white/35 transition-colors duration-500 group-hover:text-[#c5ff43]">
                      {service.accent}
                    </span>
                  </h3>

                  <p
                    data-copy
                    className="mt-6 max-w-md text-sm leading-7 text-white/55"
                  >
                    {service.description}
                  </p>
                </div>

                {/* Capabilities and arrow */}
                <div className="flex items-end justify-between gap-4 lg:col-span-3 lg:flex-col lg:items-start lg:justify-center">
                  <div>
                    <p className="mb-5 font-mono text-[9px] uppercase tracking-[0.2em] text-white/35">
                      What we do
                    </p>

                    <ul className="space-y-3">
                      {service.capabilities.map((capability) => (
                        <li
                          key={capability}
                          className="text-xs text-white/70 transition-colors duration-300 group-hover:text-white"
                        >
                          {capability}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div
                    data-arrow
                    aria-hidden="true"
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/20 text-xl text-[#c5ff43] transition-colors duration-300 group-hover:border-[#c5ff43] group-hover:bg-[#c5ff43] group-hover:text-black lg:mt-7"
                  >
                    ↗
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Closing CTA */}
        <div className="flex flex-col gap-8 pt-12 sm:flex-row sm:items-end sm:justify-between">
          <p className="max-w-md text-sm leading-7 text-white/50">
            No templates pretending to be original. No interactions without
            intention. Just ambitious digital work, made to matter.
          </p>

          <a
            href="#contact"
            className="group inline-flex w-fit items-center gap-5 border-b border-white/30 pb-3 text-xs uppercase tracking-[0.16em] transition-colors hover:border-[#c5ff43]"
          >
            Start a conversation

            <span className="text-[#c5ff43] transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1">
              ↗
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
