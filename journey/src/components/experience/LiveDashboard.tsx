import { useEffect, useRef, useState } from "react";

// Animated matrix rain column
const MatrixColumn = ({ x, speed, chars }: { x: number; speed: number; chars: string }) => {
  const [offset, setOffset] = useState(Math.random() * 100);

  useEffect(() => {
    const interval = setInterval(() => {
      setOffset((prev) => prev + speed);
    }, 50);
    return () => clearInterval(interval);
  }, [speed]);

  return (
    <div
      className="absolute top-0 text-xs font-mono leading-4 select-none pointer-events-none"
      style={{
        left: `${x}%`,
        transform: `translateY(${(offset % 200) - 50}%)`,
        opacity: 0.15 + Math.random() * 0.1,
      }}
    >
      {chars.split("").map((c, i) => (
        <div
          key={i}
          style={{
            color: i === 0 ? "#4ade80" : i < 3 ? "#22c55e" : "#15803d",
            opacity: 1 - i * 0.08,
            textShadow: i === 0 ? "0 0 8px #4ade80" : "none",
          }}
        >
          {c}
        </div>
      ))}
    </div>
  );
};

// Live scrolling log
const LogLine = ({ text, type }: { text: string; type: "success" | "info" | "process" }) => {
  const colors = {
    success: "text-emerald-400",
    info: "text-cyan-400",
    process: "text-purple-400",
  };
  const icons = {
    success: "✓",
    info: "→",
    process: "⚡",
  };
  return (
    <div className={`font-mono text-[10px] md:text-xs ${colors[type]} opacity-70 whitespace-nowrap`}>
      <span className="opacity-40 mr-2">{new Date().toLocaleTimeString()}</span>
      <span className="mr-1">{icons[type]}</span>
      {text}
    </div>
  );
};

const LiveDashboard = () => {
  const [logs, setLogs] = useState<{ text: string; type: "success" | "info" | "process" }[]>([]);
  const [barHeights, setBarHeights] = useState([55, 72, 45, 85, 62, 78, 50, 80]);

  const logMessages = [
    { text: "Invoice #INV-4521 processed via OCR", type: "success" as const },
    { text: "TDS calculation completed for Q4", type: "process" as const },
    { text: "GSTR-3B auto-filed for March 2026", type: "success" as const },
    { text: "Payroll batch processing 248 employees", type: "process" as const },
    { text: "AI model detected anomaly in ledger entry", type: "info" as const },
    { text: "Tax audit report generated automatically", type: "success" as const },
    { text: "Reconciliation matched 99.7% entries", type: "success" as const },
    { text: "GST notice response drafted by AI", type: "process" as const },
    { text: "MIS dashboard data refreshed", type: "info" as const },
    { text: "Expense categorization ML model updated", type: "process" as const },
  ];

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setLogs((prev) => [...prev.slice(-6), logMessages[i % logMessages.length]]);
      i++;
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setBarHeights((prev) =>
        prev.map((h) => Math.max(25, Math.min(95, h + (Math.random() - 0.5) * 20)))
      );
    }, 1400);
    return () => clearInterval(interval);
  }, []);

  // Matrix rain data
  const matrixColumns = Array.from({ length: 20 }, (_, i) => ({
    x: i * 5 + Math.random() * 3,
    speed: 0.5 + Math.random() * 1.5,
    chars: Array.from({ length: 12 }, () =>
      String.fromCharCode(0x30A0 + Math.random() * 96)
    ).join(""),
  }));

  return (
    <div className="relative w-full max-w-6xl mx-auto px-4 py-12">
      {/* Matrix rain background */}
      <div className="absolute inset-0 overflow-hidden rounded-2xl opacity-30">
        {matrixColumns.map((col, i) => (
          <MatrixColumn key={i} {...col} />
        ))}
      </div>


      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Live bar chart */}
        <div className="bg-white/[0.03] backdrop-blur border border-white/[0.06] rounded-xl p-5">
          <p className="text-[10px] font-mono uppercase tracking-wider text-white/40 mb-4">Processing Volume — Live</p>
          <div className="flex items-end gap-2 h-40">
            {barHeights.map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                <div
                  className="w-full rounded-t transition-all duration-700 ease-out"
                  style={{
                    height: `${h}%`,
                    minHeight: '12px',
                    background: `linear-gradient(to top, ${
                      i % 2 === 0 ? "#16a34a" : "#0891b2"
                    }, ${i % 2 === 0 ? "#4ade80" : "#22d3ee"})`,
                    boxShadow: `0 0 14px ${i % 2 === 0 ? "rgba(74,222,128,0.35)" : "rgba(34,211,238,0.35)"}`,
                  }}
                />
                <span className="text-[8px] text-white/25 font-mono">
                  {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"][i]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Live log feed */}
        <div className="bg-white/[0.03] backdrop-blur border border-white/[0.06] rounded-xl p-5 overflow-hidden">
          <p className="text-[10px] font-mono uppercase tracking-wider text-white/40 mb-3 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            System Activity — Live
          </p>
          <div className="space-y-2">
            {logs.map((log, i) => (
              <LogLine key={i} {...log} />
            ))}
            {logs.length === 0 && (
              <p className="text-xs text-white/20 font-mono">Initializing systems...</p>
            )}
          </div>
        </div>
      </div>

      {/* AI Processing indicator */}
      <div className="relative z-10 mt-6 flex items-center justify-center gap-3">
        <div className="flex gap-1">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="w-1 h-6 rounded-full bg-gradient-to-t from-emerald-500 to-cyan-400"
              style={{
                animation: `pulse 1.5s ease-in-out ${i * 0.15}s infinite`,
                opacity: 0.4 + i * 0.12,
              }}
            />
          ))}
        </div>
        <span className="text-xs font-mono text-white/30">AI Engine Active</span>
        <div className="flex gap-1">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="w-1 h-6 rounded-full bg-gradient-to-t from-purple-500 to-pink-400"
              style={{
                animation: `pulse 1.5s ease-in-out ${i * 0.15 + 0.75}s infinite`,
                opacity: 0.4 + i * 0.12,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default LiveDashboard;
