import { useMemo } from "react";

interface Stage {
  label: string;
  title: string;
  company: string;
  dates: string;
  bullets: string[];
  range: [number, number];
}

const stages: Stage[] = [
  {
    label: "Manual Work",
    title: "Junior Accountant",
    company: "Proprietorship Service Co.",
    dates: "Sep 2020 – Aug 2022",
    bullets: ["Expense Sheet Management", "Daily Accounting", "Inventory Management"],
    range: [0, 0.28],
  },
  {
    label: "Structured Data",
    title: "Tax Accountant",
    company: "CA Firm (Multiple)",
    dates: "Aug 2022 – Nov 2025",
    bullets: ["MIS & Tax Audit", "GSTR Filings", "Payroll Processing", "GST Notice Handling", "Process Automation"],
    range: [0.28, 0.6],
  },
  {
    label: "Automation Systems",
    title: "Sr. Executive",
    company: "Taxmann",
    dates: "Nov 2025 – Present",
    bullets: ["Payroll & TDS", "Tax Audit Automation", "Internal Software Dev", "Web App Development"],
    range: [0.6, 0.9],
  },
];

const TextOverlay = ({ progress }: { progress: number }) => {
  const activeStage = useMemo(() => {
    return stages.find((s) => progress >= s.range[0] && progress < s.range[1]);
  }, [progress]);

  const showFinal = progress >= 0.9;

  const getOpacity = (stage: Stage) => {
    const fadeIn = Math.min(1, (progress - stage.range[0]) / 0.05);
    const fadeOut = Math.min(1, (stage.range[1] - progress) / 0.05);
    return Math.max(0, Math.min(fadeIn, fadeOut));
  };

  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-between px-8 md:px-16">
      {/* Left side - Stage info */}
      <div className="max-w-xl">
        {stages.map((stage) => {
          const opacity = getOpacity(stage);
          if (opacity <= 0) return null;
          return (
            <div
              key={stage.label}
              className="absolute top-1/2 -translate-y-1/2 left-8 md:left-16"
              style={{ opacity, transition: "opacity 0.1s" }}
            >
              <p className="text-xl md:text-2xl text-white font-mono font-bold tracking-widest mb-4 drop-shadow-[0_0_8px_rgba(0,0,0,1)]">
                {stage.dates}
              </p>
              <h3 className="text-4xl md:text-6xl font-black text-white mb-3 leading-tight drop-shadow-[0_0_15px_rgba(0,0,0,1)]">
                {stage.title}
              </h3>
              <p className="text-2xl md:text-3xl text-white font-semibold drop-shadow-[0_0_10px_rgba(0,0,0,1)]">
                {stage.company}
              </p>
            </div>
          );
        })}
      </div>

      {/* Final text removed as requested */}

      {/* Progress indicator */}
      <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col items-center gap-3">
        {stages.map((stage, i) => {
          const isActive = activeStage === stage;
          return (
            <div key={i} className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  isActive ? "bg-blue-400 scale-150" : progress > stage.range[1] ? "bg-white/60" : "bg-white/20"
                }`}
              />
              <span
                className={`text-[10px] font-mono uppercase tracking-wider transition-opacity ${
                  isActive ? "text-white/80 opacity-100" : "opacity-0"
                }`}
              >
                {stage.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TextOverlay;
