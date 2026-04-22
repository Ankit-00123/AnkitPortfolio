import ExperienceJourney from "@/components/experience/ExperienceJourney";
import LiveDashboard from "@/components/experience/LiveDashboard";

const Index = () => {
  return (
    <div className="min-h-screen bg-transparent w-full">
      {/* Hero / Header */}
      <section className="py-24 flex items-center justify-center relative overflow-hidden">
        {/* Background gradient removed to show global portfolio background */}
        <div className="relative z-10 text-center px-6">
          <h1 className="text-5xl md:text-7xl font-bold text-white uppercase tracking-[0.2em] mb-6 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
            Career Journey
          </h1>
          <div className="mt-12 animate-bounce">
            <svg className="w-6 h-6 mx-auto text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </section>

      {/* 3D Experience Journey */}
      <ExperienceJourney />

      {/* Live AI Dashboard Section */}
      <section className="relative py-20 bg-transparent overflow-hidden w-full">
        <div className="text-center mb-12 px-6">
          <p className="text-emerald-400 text-xs font-mono uppercase tracking-[0.3em] mb-3">
            What I Build Today
          </p>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            AI-Powered{" "}
            <span className="text-cyan-400">
              Automation
            </span>
          </h2>
          <p className="text-white/60 max-w-lg mx-auto text-sm font-bold">
            I don't just manage compliance—I automate it.
          </p>
        </div>
        <LiveDashboard />
      </section>
    </div>
  );
};

export default Index;
