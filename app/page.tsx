
"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Services from "@/components/Services";

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const cursorGlowRef = useRef<HTMLDivElement>(null);

    const [currentYear, setCurrentYear] = useState<number | null>(null);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    const canvasHost = canvasRef.current;

    if (!section || !canvasHost) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // GSAP entrance animation
    const ctx = gsap.context(() => {
      if (reducedMotion) return;

      const timeline = gsap.timeline({
        defaults: { ease: "power4.out" },
      });

      timeline
        .from("[data-hero-label]", {
          y: 20,
          opacity: 0,
          duration: 0.8,
        })
        .from(
          "[data-hero-line]",
          {
            yPercent: 110,
            rotate: 2,
            opacity: 0,
            duration: 1.15,
            stagger: 0.16,
          },
          "-=0.35"
        )
        .from(
          "[data-hero-copy]",
          {
            y: 25,
            opacity: 0,
            duration: 0.8,
          },
          "-=0.55"
        )
        .from(
          "[data-hero-cta]",
          {
            y: 18,
            opacity: 0,
            duration: 0.65,
            stagger: 0.12,
          },
          "-=0.45"
        )
        .from(
          "[data-hero-footer]",
          {
            opacity: 0,
            y: 12,
            duration: 0.7,
          },
          "-=0.25"
        );

      // Subtle scroll-linked headline movement
      gsap.to(headlineRef.current, {
        yPercent: -8,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom top",
          scrub: 1,
        },
      });
    }, section);

    // Three.js scene
    let renderer: THREE.WebGLRenderer | null = null;
    let frameId = 0;
    let resizeObserver: ResizeObserver | null = null;
    let pointerHandler: ((event: PointerEvent) => void) | null = null;

    let sculptureGeometry: THREE.BufferGeometry | null = null;
    let sculptureMaterial: THREE.Material | null = null;
    let innerGeometry: THREE.BufferGeometry | null = null;
    let innerMaterial: THREE.Material | null = null;
    let particlesGeometry: THREE.BufferGeometry | null = null;
    let particlesMaterial: THREE.Material | null = null;

    try {
      const scene = new THREE.Scene();

      const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
      camera.position.set(0, 0, 8);

      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: "low-power",
      });

      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      renderer.setClearColor(0x080907, 0);
      canvasHost.appendChild(renderer.domElement);

      // Main lime wireframe sculpture
      const sculptureGroup = new THREE.Group();
      scene.add(sculptureGroup);

      sculptureGeometry = new THREE.TorusKnotGeometry(
        1.3,
        0.34,
        220,
        24,
        2,
        5
      );

      sculptureMaterial = new THREE.MeshBasicMaterial({
        color: 0xc5ff43,
        wireframe: true,
        transparent: true,
        opacity: 0.8,
      });

      const sculpture = new THREE.Mesh(
        sculptureGeometry,
        sculptureMaterial
      );

      sculptureGroup.add(sculpture);

      // Inner geometric core
      innerGeometry = new THREE.IcosahedronGeometry(0.85, 2);

      innerMaterial = new THREE.MeshBasicMaterial({
        color: 0xf1f0ec,
        wireframe: true,
        transparent: true,
        opacity: 0.12,
      });

      const innerCore = new THREE.Mesh(innerGeometry, innerMaterial);
      sculptureGroup.add(innerCore);

      // Ambient particles
      const particleCount = 260;
      const positions = new Float32Array(particleCount * 3);

      for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 12;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 9;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 5;
      }

      particlesGeometry = new THREE.BufferGeometry();

      particlesGeometry.setAttribute(
        "position",
        new THREE.BufferAttribute(positions, 3)
      );

      particlesMaterial = new THREE.PointsMaterial({
        color: 0xc5ff43,
        size: 0.022,
        transparent: true,
        opacity: 0.55,
        sizeAttenuation: true,
      });

      const particles = new THREE.Points(
        particlesGeometry,
        particlesMaterial
      );

      scene.add(particles);

      // Smooth pointer interaction
      const pointer = { x: 0, y: 0 };
      const target = { x: 0, y: 0 };

      if (!reducedMotion) {
        pointerHandler = (event: PointerEvent) => {
          target.x =
            (event.clientX / window.innerWidth - 0.5) * 0.65;

          target.y =
            (event.clientY / window.innerHeight - 0.5) * 0.45;
        };

        window.addEventListener("pointermove", pointerHandler);
      }

      // Responsive canvas
      const resize = () => {
        if (!renderer) return;

        const width = canvasHost.clientWidth;
        const height = canvasHost.clientHeight;

        if (!width || !height) return;

        renderer.setSize(width, height);

        camera.aspect = width / height;
        camera.updateProjectionMatrix();

        if (width > 900) {
          sculptureGroup.position.set(width * 0.0018, 0.05, 0);
          sculptureGroup.scale.setScalar(1);
        } else {
          sculptureGroup.position.set(0.65, 0.15, 0);
          sculptureGroup.scale.setScalar(0.72);
        }
      };

      resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(canvasHost);
      resize();

      // PART 2 CONTINUES HERE

      // Animation loop
      const clock = new THREE.Clock();

      const baseScale = canvasHost.clientWidth > 900 ? 1 : 0.72;

      const animate = () => {
        frameId = window.requestAnimationFrame(animate);

        const elapsed = clock.getElapsedTime();

        // Smooth pointer interpolation
        pointer.x += (target.x - pointer.x) * 0.035;
        pointer.y += (target.y - pointer.y) * 0.035;

        if (!reducedMotion) {
          // Organic sculpture movement
          sculptureGroup.rotation.x = pointer.y + elapsed * 0.075;
          sculptureGroup.rotation.y = pointer.x + elapsed * 0.12;
          sculptureGroup.rotation.z =
            Math.sin(elapsed * 0.18) * 0.08;

          // Inner core rotation
          innerCore.rotation.x = -elapsed * 0.12;
          innerCore.rotation.y = elapsed * 0.16;

          // Ambient particle movement
          particles.rotation.y = elapsed * 0.012;
          particles.rotation.x =
            Math.sin(elapsed * 0.08) * 0.025;

          // Subtle breathing scale without cumulative scaling
          const breathing =
            1 + Math.sin(elapsed * 0.65) * 0.025;

          sculptureGroup.scale.setScalar(baseScale * breathing);
        }

        renderer?.render(scene, camera);
      };

      animate();
    } catch (error) {
      console.error(
        "Three.js scene initialization failed:",
        error
      );
    }

    // Custom cursor glow
    let cursorMoveHandler:
      | ((event: PointerEvent) => void)
      | null = null;

    if (cursorGlowRef.current && !reducedMotion) {
      const cursorGlow = cursorGlowRef.current;

      gsap.set(cursorGlow, {
        xPercent: -50,
        yPercent: -50,
      });

      cursorMoveHandler = (event: PointerEvent) => {
        gsap.to(cursorGlow, {
          x: event.clientX,
          y: event.clientY,
          duration: 0.65,
          ease: "power3.out",
          overwrite: true,
        });
      };

      window.addEventListener(
        "pointermove",
        cursorMoveHandler
      );
    }

    // Cleanup animation and rendering resources
    return () => {
      cancelAnimationFrame(frameId);

      if (pointerHandler) {
        window.removeEventListener(
          "pointermove",
          pointerHandler
        );
      }

      if (cursorMoveHandler) {
        window.removeEventListener(
          "pointermove",
          cursorMoveHandler
        );
      }

      resizeObserver?.disconnect();
      ctx.revert();

      if (renderer) {
        renderer.dispose();

        if (renderer.domElement.parentElement === canvasHost) {
          canvasHost.removeChild(renderer.domElement);
        }
      }

      sculptureGeometry?.dispose();
      sculptureMaterial?.dispose();

      innerGeometry?.dispose();
      innerMaterial?.dispose();

      particlesGeometry?.dispose();
      particlesMaterial?.dispose();
    };
  }, []);
<Services />
  return (

    <main className="relative min-h-screen overflow-hidden bg-[#080907] text-[#f1f0ec]">
      {/* Ambient background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 72% 44%, rgba(197,255,67,0.075) 0%, rgba(8,9,7,0) 42%), radial-gradient(ellipse at 12% 85%, rgba(197,255,67,0.035) 0%, transparent 38%)",
        }}
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-10 opacity-[0.035]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.92' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.35'/%3E%3C/svg%3E\")",
        }}
      />

      {/* Navigation */}
      <header className="relative z-20 flex items-center justify-between border-b border-white/[0.09] px-6 py-5 sm:px-10 lg:px-16 lg:py-7">
        <a href="#home" aria-label="Forma home" className="group flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#c5ff43] text-[#080907] transition-transform duration-500 group-hover:rotate-45">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M5 5H19V19H5V5Z" stroke="currentColor" strokeWidth="1.5" />
              <path d="M5 12H19M12 5V19" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </span>
          <span className="text-sm font-semibold tracking-[0.24em]">
            FORMA<span className="text-[#c5ff43]">®</span>
          </span>
        </a>

        <nav aria-label="Main navigation" className="hidden items-center gap-9 text-[11px] uppercase tracking-[0.17em] text-white/60 md:flex">
          <a href="#approach" className="transition-colors hover:text-[#c5ff43]">Approach</a>
          <a href="#capabilities" className="transition-colors hover:text-[#c5ff43]">Capabilities</a>
          <a href="#contact" className="transition-colors hover:text-[#c5ff43]">Contact</a>
        </nav>

        <a href="#contact" className="group flex items-center gap-3 rounded-full border border-white/20 px-4 py-2.5 text-[10px] uppercase tracking-[0.15em] transition-all duration-300 hover:border-[#c5ff43] hover:text-[#c5ff43] sm:px-5">
          <span className="hidden sm:inline">Start a project</span>
          <span className="sm:hidden">Let's talk</span>
          <span className="transition-transform duration-300 group-hover:translate-x-1">↗</span>
        </a>
      </header>

      {/* Hero section */}
      <section
        id="home"
        ref={sectionRef}
        className="relative flex min-h-[calc(100svh-81px)] flex-col justify-center px-6 pb-12 pt-16 sm:px-10 sm:pt-20 lg:min-h-[calc(100svh-97px)] lg:px-16 lg:pb-14"
      >
        <div
          ref={canvasRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-[1] overflow-hidden"
        />

        <div className="relative z-[2] mx-auto flex w-full max-w-[1440px] flex-1 flex-col justify-center">
          <div className="mb-8 flex items-center gap-3 sm:mb-12">
            <span className="h-2 w-2 rounded-full bg-[#c5ff43]" style={{ boxShadow: "0 0 14px rgba(197,255,67,0.8)" }} />
            <p data-hero-label className="text-[10px] uppercase tracking-[0.24em] text-white/55 sm:text-xs">
              Independent creative studio · Est. 2020
            </p>
          </div>

          <div className="relative max-w-[1050px]">
            <h1
              ref={headlineRef}
              className="relative text-[clamp(3.4rem,10.5vw,9.5rem)] font-medium leading-[0.84] tracking-[-0.085em]"
            >
              <span className="block overflow-hidden pb-[0.09em]">
                <span data-hero-line className="block">WE MAKE</span>
              </span>
              <span className="block overflow-hidden pb-[0.09em]">
                <span data-hero-line className="block text-[#c5ff43]">IDEAS</span>
              </span>
              <span className="block overflow-hidden pb-[0.09em]">
                <span data-hero-line className="block">
                  MATTER<span className="text-[#c5ff43]">.</span>
                </span>
              </span>
            </h1>
          </div>

          <div className="mt-9 flex flex-col gap-8 sm:mt-12 sm:flex-row sm:items-end sm:justify-between lg:mt-14">
            <p data-hero-copy className="max-w-[390px] text-sm leading-[1.9] text-white/55 sm:text-base">
              We build distinctive digital experiences at the intersection
              of <span className="text-white/90">strategy, design,</span> and
              technology. Less noise. More meaning.
            </p>

            <div data-hero-cta className="flex flex-wrap items-center gap-4">
              <a href="#capabilities" className="group inline-flex min-h-14 items-center gap-8 rounded-full bg-[#c5ff43] px-6 text-xs font-semibold uppercase tracking-[0.12em] text-[#080907] transition-all duration-300 hover:bg-[#d7ff7e] sm:px-7">
                Explore our work
                <span className="text-base transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1">↗</span>
              </a>
              <a href="#approach" className="group inline-flex min-h-14 items-center gap-3 px-3 text-xs uppercase tracking-[0.12em] text-white/65 transition-colors hover:text-white">
                Our philosophy
                <span className="transition-transform duration-300 group-hover:translate-y-1">↓</span>
              </a>
            </div>
          </div>
        </div>

        <div data-hero-footer className="relative z-[2] mx-auto mt-16 flex w-full max-w-[1440px] flex-col justify-between gap-5 border-t border-white/[0.12] pt-5 sm:mt-20 sm:flex-row sm:items-center lg:mt-24">
          <p className="text-[9px] uppercase tracking-[0.2em] text-white/40 sm:text-[10px]">
            Strategy / Identity / Digital / Experience
          </p>
          <div className="flex items-center gap-5">
            <span className="text-[9px] uppercase tracking-[0.2em] text-white/40 sm:text-[10px]">Scroll to discover</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 text-sm text-[#c5ff43]">↓</span>
          </div>
          <p className="text-[9px] uppercase tracking-[0.2em] text-white/40 sm:text-right sm:text-[10px]">
            Available worldwide <span className="text-[#c5ff43]">●</span>
          </p>
        </div>
      </section>

      <Services />

      {/* Approach section */}
      <section id="approach" className="relative border-t border-white/[0.09] px-6 py-24 sm:px-10 sm:py-32 lg:px-16 lg:py-40">
        <div className="mx-auto grid max-w-[1440px] gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div>
            <p className="mb-6 flex items-center gap-3 text-[10px] uppercase tracking-[0.22em] text-white/45">
              <span className="h-1.5 w-1.5 rounded-full bg-[#c5ff43]" />
              01 / Our approach
            </p>
            <p className="max-w-xs text-sm leading-7 text-white/45">
              Good design looks beyond the surface. It finds the signal,
              defines the purpose, and makes every detail count.
            </p>
          </div>

          <div>
            <h2 className="max-w-4xl text-3xl font-medium leading-[1.15] tracking-[-0.055em] sm:text-5xl lg:text-7xl">
              We turn complexity into{" "}
              <span className="text-white/35">clarity.</span> And clarity
              into experiences people remember.
            </h2>
            <a href="#contact" className="group mt-10 inline-flex items-center gap-4 border-b border-[#c5ff43]/50 pb-3 text-xs uppercase tracking-[0.15em] transition-colors hover:border-[#c5ff43] hover:text-[#c5ff43]">
              Get to know us
              <span className="transition-transform duration-300 group-hover:translate-x-1">↗</span>
            </a>
          </div>
        </div>
      </section>

      {/* Capabilities section */}
      <section
        id="capabilities"
        className="relative border-t border-white/[0.09] px-6 py-24 sm:px-10 sm:py-32 lg:px-16 lg:py-40"
      >
        <div className="mx-auto max-w-[1440px]">
          <div className="mb-14 flex flex-col justify-between gap-6 sm:mb-20 sm:flex-row sm:items-end">
            <div>
              <p className="mb-6 flex items-center gap-3 text-[10px] uppercase tracking-[0.22em] text-white/45">
                <span className="h-1.5 w-1.5 rounded-full bg-[#c5ff43]" />
                02 / What we do
              </p>

              <h2 className="text-4xl font-medium tracking-[-0.07em] sm:text-6xl lg:text-8xl">
                Built with <span className="text-[#c5ff43]">intent.</span>
              </h2>
            </div>

            <p className="max-w-xs text-sm leading-7 text-white/45">
              Thoughtful solutions for ambitious brands ready to move forward.
            </p>
          </div>

          <div className="border-t border-white/[0.14]">
            {[
              {
                number: "01",
                title: "Brand identity",
                description:
                  "Distinctive positioning, visual systems, and brand worlds that give businesses a recognizable voice.",
                tags: "Strategy · Identity · Art direction",
              },
              {
                number: "02",
                title: "Digital experiences",
                description:
                  "Digital products and websites designed to feel intuitive, perform beautifully, and create lasting impact.",
                tags: "Web design · Development · UX/UI",
              },
              {
                number: "03",
                title: "Creative technology",
                description:
                  "Interactive environments and expressive technology that transform ideas into tangible experiences.",
                tags: "3D · Motion · Experiments",
              },
            ].map((service) => (
              <article
                key={service.number}
                className="group grid gap-5 border-b border-white/[0.14] py-8 transition-colors duration-300 hover:border-[#c5ff43]/50 sm:py-10 lg:grid-cols-[80px_1fr_1fr_32px] lg:items-center lg:gap-8 lg:py-12"
              >
                <span className="text-xs tracking-[0.15em] text-[#c5ff43]">
                  / {service.number}
                </span>

                <h3 className="text-2xl font-medium tracking-[-0.05em] transition-transform duration-300 group-hover:translate-x-1 sm:text-3xl lg:text-4xl">
                  {service.title}
                </h3>

                <div>
                  <p className="max-w-md text-sm leading-7 text-white/50">
                    {service.description}
                  </p>

                  <p className="mt-4 text-[9px] uppercase leading-5 tracking-[0.14em] text-white/35">
                    {service.tags}
                  </p>
                </div>

                <span className="hidden text-xl text-[#c5ff43] transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 lg:block">
                  ↗
                </span>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Contact section */}
      <section
        id="contact"
        className="relative overflow-hidden border-t border-white/[0.09] px-6 py-24 sm:px-10 sm:py-32 lg:px-16 lg:py-40"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-32 top-1/2 h-[420px] w-[420px] -translate-y-1/2 rounded-full border border-[#c5ff43]/10 sm:h-[600px] sm:w-[600px]"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 top-1/2 h-[300px] w-[300px] -translate-y-1/2 rounded-full border border-[#c5ff43]/10 sm:h-[440px] sm:w-[440px]"
        />

        <div className="relative mx-auto max-w-[1440px]">
          <p className="mb-8 flex items-center gap-3 text-[10px] uppercase tracking-[0.22em] text-white/45">
            <span className="h-1.5 w-1.5 rounded-full bg-[#c5ff43]" />
            03 / Have something in mind?
          </p>

          <h2 className="max-w-5xl text-5xl font-medium leading-[0.94] tracking-[-0.075em] sm:text-7xl lg:text-[9rem]">
            LET&apos;S MAKE
            <br />
            <span className="text-[#c5ff43]">IT MATTER.</span>
          </h2>

          <div className="mt-12 flex flex-col justify-between gap-8 sm:mt-16 sm:flex-row sm:items-end">
            <p className="max-w-sm text-sm leading-7 text-white/50">
              Have a big idea, a difficult problem, or a project that
              deserves more? We would love to hear about it.
            </p>

            <a
              href="mailto:hello@forma.studio?subject=Let's%20make%20something%20matter"
              className="group inline-flex min-h-16 items-center justify-between gap-10 rounded-full bg-[#c5ff43] px-7 text-xs font-semibold uppercase tracking-[0.12em] text-[#080907] transition-all duration-300 hover:bg-[#d7ff7e] sm:min-w-[270px] sm:px-8"
            >
              Tell us about it
              <span className="text-lg transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1">
                ↗
              </span>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-20 border-t border-white/[0.1] px-6 py-6 sm:px-10 lg:px-16">
        <div className="mx-auto flex max-w-[1440px] flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <a
            href="#home"
            className="w-fit text-sm font-semibold tracking-[0.24em]"
          >
            FORMA<span className="text-[#c5ff43]">®</span>
          </a>

          <p className="text-[10px] tracking-[0.06em] text-white/35">
            Independent by nature. Intentional by design.
          </p>

          <div className="flex flex-wrap items-center gap-5 text-[10px] uppercase tracking-[0.12em] text-white/45">
            <a
              href="#home"
              className="transition-colors hover:text-[#c5ff43]"
            >
              Back to top ↑
            </a>

            <span>© {currentYear ?? "2026"} Forma Studio</span>
          </div>
        </div>
      </footer>

      {/* Cursor glow */}
      <div
        ref={cursorGlowRef}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-30 hidden h-56 w-56 rounded-full opacity-40 mix-blend-screen md:block"
        style={{
          background:
            "radial-gradient(circle, rgba(197,255,67,0.055) 0%, rgba(197,255,67,0.018) 35%, transparent 70%)",
        }}
      />
    </main>
  );
}
