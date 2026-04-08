"use client";

import { Canvas } from "@react-three/fiber";
import { Environment, Float, MeshDistortMaterial, Sphere } from "@react-three/drei";
import { useReducedMotion } from "motion/react";

function OrbCluster({ reducedMotion }: { reducedMotion: boolean }) {
  const primaryDistort = reducedMotion ? 0 : 0.28;
  const secondaryDistort = reducedMotion ? 0 : 0.2;

  return (
    <>
      <Float speed={reducedMotion ? 0 : 0.9} rotationIntensity={reducedMotion ? 0 : 0.7} floatIntensity={0.8}>
        <Sphere args={[1.35, 64, 64]} position={[0.1, 0.05, 0]}>
          <MeshDistortMaterial
            color="#6d4bff"
            roughness={0.18}
            metalness={0.2}
            distort={primaryDistort}
            speed={reducedMotion ? 0 : 1.8}
          />
        </Sphere>
      </Float>

      <Float speed={reducedMotion ? 0 : 1.2} rotationIntensity={reducedMotion ? 0 : 0.9} floatIntensity={1.2}>
        <Sphere args={[0.48, 48, 48]} position={[1.7, -0.9, 0.2]}>
          <MeshDistortMaterial
            color="#ff6f61"
            roughness={0.22}
            metalness={0.12}
            distort={secondaryDistort}
            speed={reducedMotion ? 0 : 2.2}
          />
        </Sphere>
      </Float>

      <Float speed={reducedMotion ? 0 : 1.1} rotationIntensity={reducedMotion ? 0 : 0.8} floatIntensity={0.9}>
        <Sphere args={[0.38, 36, 36]} position={[-1.6, 1, -0.2]}>
          <MeshDistortMaterial
            color="#39d98a"
            roughness={0.24}
            metalness={0.1}
            distort={secondaryDistort}
            speed={reducedMotion ? 0 : 1.9}
          />
        </Sphere>
      </Float>
    </>
  );
}

export function HeroOrbCanvas() {
  const reducedMotion = useReducedMotion();

  return (
    <Canvas camera={{ position: [0, 0, 4], fov: 50 }} dpr={[1, 1.8]}>
      <ambientLight intensity={0.45} />
      <directionalLight position={[2.4, 2.8, 1.5]} intensity={0.7} color="#e8dbff" />
      <directionalLight position={[-2.8, -2.4, 1.2]} intensity={0.45} color="#ffd1bf" />
      <OrbCluster reducedMotion={Boolean(reducedMotion)} />
      <Environment preset="city" />
    </Canvas>
  );
}