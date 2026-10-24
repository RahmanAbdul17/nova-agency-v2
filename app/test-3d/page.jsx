
"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { gsap } from "gsap";

export default function Test3D() {
  const containerRef = useRef(null);

  useEffect(() => {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#111827");

    const camera = new THREE.PerspectiveCamera(
      75,
      1,
      0.1,
      100
    );
    camera.position.z = 3;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(320, 320);
    containerRef.current.appendChild(renderer.domElement);

    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshNormalMaterial();
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    const resize = () => {
      const width = containerRef.current.clientWidth || 320;
      const height = 320;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    resize();

    const animation = gsap.to(cube.rotation, {
      y: Math.PI * 2,
      x: Math.PI * 2,
      duration: 3,
      repeat: -1,
      ease: "none",
    });

    let frameId;
    const render = () => {
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(render);
    };
    render();

    return () => {
      cancelAnimationFrame(frameId);
      animation.kill();
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return (
    <main style={{ padding: 24, color: "white", background: "#030712" }}>
      <h1>Three.js + GSAP Test</h1>
      <div ref={containerRef} style={{ width: "min(100%, 320px)" }} />
      <p>If the cube rotates, both libraries are working!</p>
    </main>
  );
}
