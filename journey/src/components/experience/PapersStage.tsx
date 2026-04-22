import { useRef, useMemo } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";
import paperTextureSrc from "@/assets/paper-texture.jpg";
import invoiceTextureSrc from "@/assets/invoice-texture.jpg";

const PAPER_COUNT = 5;

const PapersStage = ({ progress }: { progress: number }) => {
  const groupRef = useRef<THREE.Group>(null);
  const meshRefs = useRef<THREE.Mesh[]>([]);

  const paperTex = useLoader(THREE.TextureLoader, paperTextureSrc);
  const invoiceTex = useLoader(THREE.TextureLoader, invoiceTextureSrc);

  const paperData = useMemo(() => {
    return Array.from({ length: PAPER_COUNT }, (_, i) => ({
      position: [
        (Math.random() - 0.5) * 36,
        (Math.random() - 0.5) * 18,
        (Math.random() - 0.5) * 12,
      ] as [number, number, number],
      rotation: [
        (Math.random() - 0.5) * 0.6,
        (Math.random() - 0.5) * 0.4,
        (Math.random() - 0.5) * 0.8,
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
        const gridX = ((i % 5) - 2) * 2.8;
        const gridY = (Math.floor(i / 5) - 1.5) * 2.0;

        mesh.position.x = THREE.MathUtils.lerp(mesh.position.x, gridX, transProgress);
        mesh.position.y = THREE.MathUtils.lerp(mesh.position.y, gridY, transProgress);
        mesh.position.z = THREE.MathUtils.lerp(mesh.position.z, 0, transProgress);
        mesh.rotation.x = THREE.MathUtils.lerp(mesh.rotation.x, 0, transProgress);
        mesh.rotation.y = THREE.MathUtils.lerp(mesh.rotation.y, 0, transProgress);
        mesh.rotation.z = THREE.MathUtils.lerp(mesh.rotation.z, 0, transProgress);

        const scale = THREE.MathUtils.lerp(1, 0.6, transProgress);
        mesh.scale.setScalar(scale);

        const mat = mesh.material as THREE.MeshStandardMaterial;
        mat.opacity = THREE.MathUtils.lerp(1, 0, Math.max(0, (transProgress - 0.7) / 0.3));
      }
    });

    if (groupRef.current) {
      groupRef.current.visible = progress < 0.45;
    }
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
          <planeGeometry args={[7.0, 8.8]} />
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
