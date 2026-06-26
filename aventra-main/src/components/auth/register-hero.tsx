import {
  AiOutlineBarChart,
  AiOutlineBulb,
  AiOutlineCheckCircle,
} from "react-icons/ai";

export function RegisterHero() {
  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-[#DCE7FF] bg-white/75 p-8 shadow-2xl shadow-[#4F7CFF]/10 backdrop-blur-xl dark:border-[#4F7CFF]/20 dark:bg-[#07111f]/90 dark:shadow-[#4F7CFF]/10 lg:p-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_40%,rgba(79,124,255,0.18),transparent_35%)]" />
      <div className="absolute left-10 top-20 h-2 w-2 rounded-full bg-[#4F7CFF]" />
      <div className="absolute right-24 top-28 h-1.5 w-1.5 rounded-full bg-[#7C3AED]" />
      <div className="absolute bottom-20 left-20 h-1.5 w-1.5 rounded-full bg-[#4361EE]" />

      <div className="relative z-10">
        <h1 className="max-w-xl text-4xl font-bold tracking-tight text-slate-950 dark:text-white">
          AI CV Intelligence Platform
        </h1>

        <h2 className="mt-4 max-w-lg bg-gradient-to-r from-[#4F7CFF] via-[#4361EE] to-[#7C3AED] bg-clip-text text-2xl font-bold leading-snug text-transparent">
          Smarter Analysis. Better Matching. Stronger Connections.
        </h2>

        <p className="mt-6 max-w-md text-base leading-8 text-slate-600 dark:text-slate-300">
          We use AI to analyze CVs, understand skills, and connect the right
          talent with the right opportunities.
        </p>

        <div className="relative mx-auto mt-12 h-72 max-w-xl">
          <div className="absolute left-1/2 top-6 h-56 w-72 -translate-x-1/2 rotate-3 rounded-[2rem] border border-[#DCE7FF] bg-white/70 p-6 shadow-2xl shadow-[#4F7CFF]/15 backdrop-blur-xl dark:border-[#4F7CFF]/20 dark:bg-white/5">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-semibold text-[#4361EE] dark:text-[#7EA2FF]">
                CV Analysis
              </span>

              <AiOutlineCheckCircle className="text-2xl text-[#4F7CFF]" />
            </div>

            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full border-8 border-[#4F7CFF]/25 text-3xl font-bold text-[#4361EE] dark:text-[#7EA2FF]">
              92
            </div>

            <p className="text-center text-xs font-medium text-[#4361EE] dark:text-[#7EA2FF]">
              Excellent Match
            </p>

            <div className="mt-5 flex items-end justify-center gap-2">
              {[32, 54, 76, 96].map((height) => (
                <span
                  key={height}
                  className="w-5 rounded-t-lg bg-gradient-to-t from-[#4F7CFF] via-[#4361EE] to-[#7C3AED]"
                  style={{ height }}
                />
              ))}
            </div>
          </div>

          <div className="absolute left-4 top-20 flex h-20 w-20 items-center justify-center rounded-3xl border border-[#DCE7FF] bg-white/80 text-4xl text-[#4361EE] shadow-xl shadow-[#4F7CFF]/10 backdrop-blur dark:border-[#4F7CFF]/20 dark:bg-white/5 dark:text-[#7EA2FF]">
            <AiOutlineBulb />
          </div>

          <div className="absolute right-4 top-24 flex h-28 w-28 items-center justify-center rounded-full border-[10px] border-[#4F7CFF] bg-white/80 text-3xl font-black text-[#4361EE] shadow-2xl shadow-[#4F7CFF]/30 dark:bg-[#07111f] dark:text-[#7EA2FF]">
            AI
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {[
            ["AI Analysis", "Understand skills and potential"],
            ["Smart Matching", "Connect with the right opportunities"],
            ["Better Results", "Data-driven insights that help you grow"],
          ].map(([title, desc]) => (
            <div
              key={title}
              className="rounded-2xl border border-[#DCE7FF] bg-white/70 p-4 shadow-lg shadow-[#4F7CFF]/10 backdrop-blur dark:border-[#4F7CFF]/20 dark:bg-white/5"
            >
              <AiOutlineBarChart className="mb-3 text-2xl text-[#4361EE] dark:text-[#7EA2FF]" />

              <h3 className="text-sm font-bold text-slate-950 dark:text-white">
                {title}
              </h3>

              <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                {desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}