import {
  AiOutlineBarChart,
  AiOutlineBulb,
  AiOutlineCheckCircle,
} from "react-icons/ai";

export function RegisterHero() {
  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-primary/15 bg-background/80 p-8 shadow-2xl shadow-primary/10 backdrop-blur-xl dark:border-sky/20 dark:bg-[#07111f]/90 dark:shadow-sky/10 lg:p-10">
      <div className="absolute inset-0 bg-primary/10 dark:bg-sky/10" />
      <div className="absolute left-10 top-20 h-2 w-2 rounded-full bg-primary dark:bg-sky" />
      <div className="absolute right-24 top-28 h-1.5 w-1.5 rounded-full bg-primary/70 dark:bg-sky/70" />
      <div className="absolute bottom-20 left-20 h-1.5 w-1.5 rounded-full bg-primary/80 dark:bg-sky/80" />

      <div className="relative z-10">
        <h1 className="max-w-xl text-4xl font-bold tracking-tight text-foreground">
          AI CV Intelligence Platform
        </h1>

        <h2 className="mt-4 max-w-lg bg-gradient-to-r from-primary via-primary to-primary/70 bg-clip-text text-2xl font-bold leading-snug text-transparent dark:from-sky dark:via-sky dark:to-sky/70">
          Smarter Analysis. Better Matching. Stronger Connections.
        </h2>

        <p className="mt-6 max-w-md text-base leading-8 text-muted-foreground">
          We use AI to analyze CVs, understand skills, and connect the right
          talent with the right opportunities.
        </p>

        <div className="relative mx-auto mt-12 h-72 max-w-xl">
          <div className="absolute left-1/2 top-6 h-56 w-72 -translate-x-1/2 rotate-3 rounded-[2rem] border border-primary/15 bg-background/70 p-6 shadow-2xl shadow-primary/15 backdrop-blur-xl dark:border-sky/20 dark:bg-white/5 dark:shadow-sky/15">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-semibold text-primary dark:text-sky">
                CV Analysis
              </span>

              <AiOutlineCheckCircle className="text-2xl text-primary dark:text-sky" />
            </div>

            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full border-8 border-primary/25 text-3xl font-bold text-primary dark:border-sky/25 dark:text-sky">
              92
            </div>

            <p className="text-center text-xs font-medium text-primary dark:text-sky">
              Excellent Match
            </p>

            <div className="mt-5 flex items-end justify-center gap-2">
              {[32, 54, 76, 96].map((height) => (
                <span
                  key={height}
                  className="w-5 rounded-t-lg bg-gradient-to-t from-primary via-primary to-primary/60 dark:from-sky dark:via-sky dark:to-sky/60"
                  style={{ height }}
                />
              ))}
            </div>
          </div>

          <div className="absolute left-4 top-20 flex h-20 w-20 items-center justify-center rounded-3xl border border-primary/15 bg-background/80 text-4xl text-primary shadow-xl shadow-primary/10 backdrop-blur dark:border-sky/20 dark:bg-white/5 dark:text-sky dark:shadow-sky/10">
            <AiOutlineBulb />
          </div>

          <div className="absolute right-4 top-24 flex h-28 w-28 items-center justify-center rounded-full border-[10px] border-primary bg-background/80 text-3xl font-black text-primary shadow-2xl shadow-primary/30 dark:border-sky dark:bg-[#07111f] dark:text-sky dark:shadow-sky/30">
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
              className="rounded-2xl border border-primary/15 bg-background/70 p-4 shadow-lg shadow-primary/10 backdrop-blur dark:border-sky/20 dark:bg-white/5 dark:shadow-sky/10"
            >
              <AiOutlineBarChart className="mb-3 text-2xl text-primary dark:text-sky" />

              <h3 className="text-sm font-bold text-foreground">{title}</h3>

              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                {desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}