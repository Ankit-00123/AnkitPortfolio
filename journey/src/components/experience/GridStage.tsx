import { useRef, useMemo } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";
import excelTextureSrc from "@/assets/excel-texture.jpg";

const GridStage = ({ progress }: { progress: number }) => {
  const groupRef = useRef<THREE.Group>(null);
  const mainPanelRef = useRef<THREE.Mesh>(null);
  const cellRefs = useRef<THREE.Mesh[]>([]);

  const excelTex = useLoader(THREE.TextureLoader, excelTextureSrc);

  const fragments = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => ({
      position: [
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 7,
        -1 - Math.random() * 2,
      ] as [number, number, number],
      rotation: [(Math.random() - 0.5) * 0.3, (Math.random() - 0.5) * 0.3, (Math.random() - 0.5) * 0.2] as [number, number, number],
      scale: 0.4 + Math.random() * 0.4,
      speed: 0.3 + Math.random() * 0.4,
    }));
  }, []);

  useFrame((state) => {
    if (!groupRef.current) return;

    const t = state.clock.elapsedTime;
    const appear = Math.min(1, Math.max(0, (progress - 0.25) / 0.1));

    if (mainPanelRef.current) {
      const mat = mainPanelRef.current.material as THREE.MeshStandardMaterial;
      mat.opacity = appear;
      mainPanelRef.current.scale.setScalar(THREE.MathUtils.lerp(0.8, 1, appear));
      mainPanelRef.current.rotation.y = Math.sin(t * 0.2) * 0.03;

      if (progress > 0.55) {
        const liftP = (progress - 0.55) / 0.15;
        mainPanelRef.current.position.z = liftP * 2;
        mat.opacity = Math.max(0, 1 - liftP);
      } else {
        mainPanelRef.current.position.z = 0;
      }
    }

    cellRefs.current.forEach((mesh, i) => {
      if (!mesh) return;
      const frag = fragments[i];
      mesh.position.y = frag.position[1] + Math.sin(t * frag.speed + i) * 0.2;
      mesh.rotation.z = frag.rotation[2] + Math.sin(t * 0.3 + i) * 0.05;
      const fragMat = mesh.material as THREE.MeshStandardMaterial;
      fragMat.opacity = appear * 0.6;

      if (progress > 0.55) {
        const liftP = (progress - 0.55) / 0.15;
        fragMat.opacity = Math.max(0, 0.6 - liftP);
      }
    });
  });

  return (
    <group ref={groupRef}>
      {/* Lights removed - global constant lighting used instead */}

      {/* Main large Excel panel */}
      <mesh ref={mainPanelRef} position={[0, 0, 0]}>
        <planeGeometry args={[14, 9]} />
        <meshStandardMaterial
          map={excelTex}
          transparent
          opacity={0}
          side={THREE.DoubleSide}
          roughness={0.4}
          metalness={0}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
};

export default GridStage;
