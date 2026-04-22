import { useRef, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import PapersStage from "./PapersStage";
import GridStage from "./GridStage";
import DashboardStage from "./DashboardStage";
import CameraController from "./CameraController";
import ParticleDust from "./ParticleDust";
import TextOverlay from "./TextOverlay";

gsap.registerPlugin(ScrollTrigger);

const ExperienceJourney = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;

    const trigger = ScrollTrigger.create({
      trigger: containerRef.current,
      start: "top top",
      end: "bottom bottom",
      pin: containerRef.current.querySelector(".journey-pinned") as HTMLElement,
      scrub: 1,
      onUpdate: (self) => {
        setProgress(self.progress);
      },
    });

    return () => {
      trigger.kill();
    };
  }, []);

  return (
    <div ref={containerRef} className="relative" style={{ height: "400vh" }}>
      <div className="journey-pinned w-full h-screen relative overflow-hidden bg-transparent">
        <Canvas
          camera={{ position: [0, 0, 12], fov: 50 }}
          dpr={[1, 1.5]}
          gl={{ antialias: true, alpha: true }}
        >
          {/* Global constant lighting */}
          <ambientLight intensity={0.7} color="#ffffff" />
          <directionalLight position={[1, 4, 5]} intensity={1.4} color="#ffffff" />
          
          {/* Fog removed for transparent background */}
          <CameraController progress={progress} />
          <PapersStage progress={progress} />
          <GridStage progress={progress} />
          <DashboardStage progress={progress} />
          <ParticleDust progress={progress} />
        </Canvas>

        {/* Text overlays */}
        <TextOverlay progress={progress} />

        {/* Scroll hint */}
        {progress < 0.05 && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-pulse">
            <span className="text-white/40 text-xs font-mono uppercase tracking-widest">Scroll to explore</span>
            <div className="w-5 h-8 border border-white/20 rounded-full flex items-start justify-center p-1">
              <div className="w-1 h-2 bg-white/40 rounded-full animate-bounce" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExperienceJourney;
