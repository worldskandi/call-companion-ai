import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

/* ── Floating particles that drift slowly ── */
const Particles = ({ count = 120 }) => {
  const mesh = useRef<THREE.Points>(null!);

  const [positions, sizes] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const sz = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 14;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 8;
      sz[i] = Math.random() * 3 + 1;
    }
    return [pos, sz];
  }, [count]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * 0.08;
    mesh.current.rotation.y = t;
    mesh.current.rotation.x = Math.sin(t * 0.4) * 0.1;
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-size" args={[sizes, 1]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        color="#93b5f7"
        transparent
        opacity={0.6}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};

/* ── Glowing connection lines (neural net vibe) ── */
const ConnectionLines = () => {
  const ref = useRef<THREE.Group>(null!);

  const lines = useMemo(() => {
    const arr: { start: THREE.Vector3; end: THREE.Vector3 }[] = [];
    const nodes: THREE.Vector3[] = [];
    for (let i = 0; i < 30; i++) {
      nodes.push(
        new THREE.Vector3(
          (Math.random() - 0.5) * 12,
          (Math.random() - 0.5) * 8,
          (Math.random() - 0.5) * 6
        )
      );
    }
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        if (nodes[i].distanceTo(nodes[j]) < 4) {
          arr.push({ start: nodes[i], end: nodes[j] });
        }
      }
    }
    return arr;
  }, []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * 0.05;
    ref.current.rotation.y = t;
    ref.current.rotation.z = Math.sin(t * 0.6) * 0.05;
  });

  return (
    <group ref={ref}>
      {lines.map((line, i) => {
        const geometry = new THREE.BufferGeometry().setFromPoints([line.start, line.end]);
        return (
          <line key={i} geometry={geometry}>
            <lineBasicMaterial
              color="#7aacfa"
              transparent
              opacity={0.12}
              blending={THREE.AdditiveBlending}
            />
          </line>
        );
      })}
    </group>
  );
};

/* ── Floating orbs ── */
const GlowOrb = ({ position, color, size }: { position: [number, number, number]; color: string; size: number }) => {
  return (
    <Float speed={1.2} rotationIntensity={0.2} floatIntensity={1.5}>
      <mesh position={position}>
        <sphereGeometry args={[size, 24, 24]} />
        <meshBasicMaterial color={color} transparent opacity={0.15} />
      </mesh>
      <mesh position={position}>
        <sphereGeometry args={[size * 1.4, 24, 24]} />
        <meshBasicMaterial color={color} transparent opacity={0.04} />
      </mesh>
    </Float>
  );
};

/* ── Main export ── */
const HeroBackground3D = () => {
  return (
    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>
      <Canvas
        camera={{ position: [0, 0, 7], fov: 55 }}
        dpr={[1, 1.5]}
        gl={{ alpha: true, antialias: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.3} />
        <Particles count={140} />
        <ConnectionLines />
        <GlowOrb position={[-3, 1.5, -2]} color="#6da4f7" size={0.5} />
        <GlowOrb position={[3.5, -1, -1]} color="#93b8fa" size={0.4} />
        <GlowOrb position={[0, 2.5, -3]} color="#a8c7fc" size={0.35} />
        <GlowOrb position={[-2, -2, -1.5]} color="#7db2f8" size={0.3} />
      </Canvas>
    </div>
  );
};

export default HeroBackground3D;
