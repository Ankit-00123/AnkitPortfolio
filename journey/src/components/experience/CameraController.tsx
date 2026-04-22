import { useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const CameraController = ({ progress }: { progress: number }) => {
  const { camera } = useThree();
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseRef.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useFrame(() => {
    const targetZ = THREE.MathUtils.lerp(12, 6, progress);
    const targetY = Math.sin(progress * Math.PI) * 1.5;
    const targetX = Math.cos(progress * Math.PI * 0.5) * 0.5;

    // Mouse parallax
    const mouseX = mouseRef.current.x * 0.3;
    const mouseY = mouseRef.current.y * -0.2;

    camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX + mouseX, 0.05);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY + mouseY, 0.05);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.05);

    camera.lookAt(0, 0, 0);
  });

  return null;
};

export default CameraController;
