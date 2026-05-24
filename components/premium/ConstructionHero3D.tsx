"use client";

import { Canvas } from "@react-three/fiber";
import { Float, OrbitControls } from "@react-three/drei";

function BuildingBlocks() {
  return (
    <group rotation={[0.2, -0.55, 0]}>
      {Array.from({ length: 7 }).map((_, index) => (
        <Float key={index} floatIntensity={0.8} rotationIntensity={0.4} speed={1.2 + index * 0.1}>
          <mesh position={[(index % 3) * 1.05 - 1.05, Math.floor(index / 3) * 0.82 - 0.8, 0]}>
            <boxGeometry args={[0.82, 0.72 + (index % 2) * 0.45, 0.82]} />
            <meshStandardMaterial color={index % 2 ? "#facc15" : "#1d4ed8"} metalness={0.25} roughness={0.28} />
          </mesh>
        </Float>
      ))}
      <mesh position={[0.1, -1.45, 0]}>
        <boxGeometry args={[4.4, 0.16, 1.4]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.45} roughness={0.18} />
      </mesh>
    </group>
  );
}

export function ConstructionHero3D() {
  return (
    <div className="h-[360px] w-full overflow-hidden rounded-[2rem] border border-white/15 bg-white/10 shadow-glass backdrop-blur-xl">
      <Canvas camera={{ position: [0, 0, 5.6], fov: 42 }}>
        <ambientLight intensity={0.8} />
        <directionalLight intensity={1.8} position={[3, 5, 4]} />
        <pointLight color="#facc15" intensity={9} position={[-2, 1, 3]} />
        <BuildingBlocks />
        <OrbitControls enablePan={false} enableZoom={false} autoRotate autoRotateSpeed={0.9} />
      </Canvas>
    </div>
  );
}
