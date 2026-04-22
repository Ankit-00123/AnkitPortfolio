import { useRef, useState, useEffect, useMemo } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";
import { Html } from "@react-three/drei";
import dashboardTextureSrc from "@/assets/dashboard-texture.jpg";
import webappTextureSrc from "@/assets/webapp-texture.jpg";

const generateRandomData = () => {
    return Array.from({ length: 4 }).map((_, i) => ({
      id: `TXN-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
      status: Math.random() > 0.15 ? "VERIFIED" : "PENDING",
      amount: `$${(Math.random() * 9500 + 500).toFixed(2)}`,
      time: new Date(Date.now() - Math.random() * 50000).toLocaleTimeString()
    }));
};

const DashboardStage = ({ progress }: { progress: number }) => {
  const groupRef = useRef<THREE.Group>(null);
  const panelRefs = useRef<THREE.Mesh[]>([]);
  const uiRef = useRef<THREE.Group>(null);
  const [data, setData] = useState(generateRandomData());

  const dashTex = useLoader(THREE.TextureLoader, dashboardTextureSrc);
  const webTex = useLoader(THREE.TextureLoader, webappTextureSrc);

  const panels = useMemo(() => [
    { pos: [0, 1.8, 0] as [number, number, number], size: [10, 6.4] as [number, number], tex: "dash" },
    { pos: [-4.6, -2.0, 0.8] as [number, number, number], size: [4.8, 3.3] as [number, number], tex: "webapp" },
    { pos: [4.6, -2.0, 0.8] as [number, number, number], size: [4.8, 3.3] as [number, number], tex: "webapp" },
  ], []);

  useEffect(() => {
    const interval = setInterval(() => {
        setData(generateRandomData());
    }, 2500); 
    return () => clearInterval(interval);
  }, []);

  useFrame((state) => {
    if (!groupRef.current) return;
    const stageVisible = progress >= 0.55;
    groupRef.current.visible = stageVisible;
    if (!stageVisible) return;

    const stageProgress = Math.min(1, (Math.max(0, progress - 0.6)) / 0.15);
    const eased = 1 - Math.pow(1 - stageProgress, 3);
    const t = state.clock.elapsedTime;
    
    panelRefs.current.forEach((mesh, i) => {
      if (!mesh) return;
      const delay = i * 0.12;
      const p = Math.min(1, Math.max(0, (stageProgress - delay) / 0.4));
      const pEased = 1 - Math.pow(1 - p, 3);

      mesh.scale.set(pEased, pEased, 1);
      mesh.position.z = panels[i].pos[2] + (1 - pEased) * 3;
      mesh.rotation.y = (1 - pEased) * 0.3 + Math.sin(t * 0.3 + i) * 0.015;

      const mat = mesh.material as THREE.MeshStandardMaterial;
      mat.opacity = pEased;
    });

    if (uiRef.current) {
        uiRef.current.scale.set(eased, eased, 1);
        uiRef.current.position.z = (1 - eased) * 4;
        uiRef.current.position.y = -2.5 + Math.sin(t * 0.5) * 0.2;
        
        const htmlEl = document.getElementById("dashboardHtmlContent");
        if (htmlEl) {
          htmlEl.style.opacity = eased.toString();
          htmlEl.style.pointerEvents = eased > 0.05 ? 'auto' : 'none';
        }
    }
  });

  return (
    <group ref={groupRef} visible={false}>
      {/* Lights removed - global constant lighting used instead */}

      {panels.map((panel, i) => (
        <mesh
          key={i}
          ref={(el) => { if (el) panelRefs.current[i] = el; }}
          position={panel.pos}
        >
          <planeGeometry args={panel.size} />
          <meshStandardMaterial
            map={panel.tex === "dash" ? dashTex : webTex}
            transparent
            opacity={0}
            side={THREE.DoubleSide}
            roughness={0.4}
            metalness={0}
            depthWrite={false}
          />
        </mesh>
      ))}

    </group>
  );
};

export default DashboardStage;
