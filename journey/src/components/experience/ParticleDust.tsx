import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const PARTICLE_COUNT = 200;

const ParticleDust = ({ progress }: { progress: number }) => {
  const pointsRef = useRef<THREE.Points>(null);

  const [positions, velocities] = useMemo(() => {
    const pos = new Float32Array(PARTICLE_COUNT * 3);
    const vel = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 15;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 8;
      vel[i * 3] = (Math.random() - 0.5) * 0.01;
      vel[i * 3 + 1] = (Math.random() - 0.5) * 0.01;
      vel[i * 3 + 2] = (Math.random() - 0.5) * 0.01;
    }
    return [pos, vel];
  }, []);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const geo = pointsRef.current.geometry;
    const posAttr = geo.attributes.position as THREE.BufferAttribute;
    const t = state.clock.elapsedTime;

    // More active during transitions
    const transitionIntensity =
      (progress > 0.15 && progress < 0.35 ? (progress - 0.15) / 0.1 : 0) +
      (progress > 0.5 && progress < 0.7 ? (progress - 0.5) / 0.1 : 0);
    const intensity = Math.min(1, transitionIntensity);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      posAttr.array[i * 3] += velocities[i * 3] + Math.sin(t + i) * 0.002 * (1 + intensity * 3);
      posAttr.array[i * 3 + 1] += velocities[i * 3 + 1] + Math.cos(t * 0.7 + i) * 0.002 * (1 + intensity * 3);
      posAttr.array[i * 3 + 2] += Math.sin(t * 0.5 + i * 0.3) * 0.001;

      // Wrap around
      if (Math.abs(posAttr.array[i * 3]) > 8) posAttr.array[i * 3] *= -0.5;
      if (Math.abs(posAttr.array[i * 3 + 1]) > 6) posAttr.array[i * 3 + 1] *= -0.5;
    }
    posAttr.needsUpdate = true;

    // Color transition
    const mat = pointsRef.current.material as THREE.PointsMaterial;
    if (progress < 0.33) {
      mat.color.set("#f5a623");
    } else if (progress < 0.66) {
      mat.color.set("#8ab4f8");
    } else {
      mat.color.set("#8b5cf6");
    }
    mat.opacity = 0.3 + intensity * 0.5;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={positions}
          count={PARTICLE_COUNT}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        transparent
        opacity={0.4}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

export default ParticleDust;
