import { useRef, useMemo } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";
import paperTextureSrc from "@/assets/paper-texture.jpg";
import invoiceTextureSrc from "@/assets/invoice-texture.jpg";

const PAPER_COUNT = 3;

const PapersStage = ({ progress }: { progress: number }) => {
  const groupRef = useRef<THREE.Group>(null);
  const meshRefs = useRef<THREE.Mesh[]>([]);

  const paperTex = useLoader(THREE.TextureLoader, paperTextureSrc);
  const invoiceTex = useLoader(THREE.TextureLoader, invoiceTextureSrc);

  const paperData = useMemo(() => {
    return Array.from({ length: PAPER_COUNT }, (_, i) => ({
      position: [
        (Math.random() - 0.5) * 8, // Keep strictly within screen width
        (Math.random() - 0.5) * 4, // Keep strictly within screen height
        -8 - Math.random() * 4, // Push deep into the scene (-12 to -8) so they have room to float without clipping edges
      ] as [number, number, number],
      rotation: [
        (Math.random() - 0.5) * 0.4,
        (Math.random() - 0.5) * 0.4,
        (Math.random() - 0.5) * 0.4,
      ] as [number, number, number],
      speed: 0.2 + Math.random() * 0.5,
      phase: Math.random() * Math.PI * 2,
      useInvoice: i % 3 === 0,
    }));
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    meshRefs.current.forEach((mesh, i) => {
      if (!mesh) return;
      const data = paperData[i];
      mesh.position.y = data.position[1] + Math.sin(t * data.speed + data.phase) * 0.3;
      mesh.position.x = data.position[0] + Math.cos(t * data.speed * 0.7 + data.phase) * 0.15;
      mesh.rotation.z = data.rotation[2] + Math.sin(t * data.speed * 0.5) * 0.1;
      mesh.rotation.x = data.rotation[0] + Math.cos(t * data.speed * 0.3) * 0.05;

      if (progress > 0.15) {
        const transProgress = Math.min(1, (progress - 0.15) / 0.18);
        
        // 3 pages side-by-side, kept close to center to avoid screen edge cut
        const gridX = (i - 1) * 4.0; 
        const gridY = 0;

        mesh.position.x = THREE.MathUtils.lerp(mesh.position.x, gridX, transProgress);
        mesh.position.y = THREE.MathUtils.lerp(mesh.position.y, gridY, transProgress);
        mesh.position.z = THREE.MathUtils.lerp(mesh.position.z, 0, transProgress);
        mesh.rotation.x = THREE.MathUtils.lerp(mesh.rotation.x, 0, transProgress);
        mesh.rotation.y = THREE.MathUtils.lerp(mesh.rotation.y, 0, transProgress);
        mesh.rotation.z = THREE.MathUtils.lerp(mesh.rotation.z, 0, transProgress);

        const scale = THREE.MathUtils.lerp(1, 0.5, transProgress); // Scale to fit nicely side-by-side
        mesh.scale.setScalar(scale);

        const mat = mesh.material as THREE.MeshStandardMaterial;
        mat.opacity = THREE.MathUtils.lerp(1, 0, Math.max(0, (transProgress - 0.7) / 0.3));
      }
    });

  });

  return (
    <group ref={groupRef}>
      {/* Lights removed - global constant lighting used instead */}

      {paperData.map((data, i) => (
        <mesh
          key={i}
          ref={(el) => { if (el) meshRefs.current[i] = el; }}
          position={data.position}
          rotation={data.rotation}
        >
          <planeGeometry args={[8.5, 11.0]} /> {/* Large, but fits within frustum without edge-cutting */}
          <meshStandardMaterial
            map={data.useInvoice ? invoiceTex : paperTex}
            side={THREE.DoubleSide}
            roughness={0.9}
            metalness={0}
            transparent
            opacity={1}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
};

export default PapersStage;
