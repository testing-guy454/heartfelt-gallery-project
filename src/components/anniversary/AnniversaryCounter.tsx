import { useEffect, useState } from "react";
import { Flourish, HeartIcon } from "@/components/album/Ornaments";

function diffYMD(start: Date, now: Date) {
  let years = now.getFullYear() - start.getFullYear();
  let months = now.getMonth() - start.getMonth();
  let days = now.getDate() - start.getDate();
  if (days < 0) {
    months -= 1;
    const prev = new Date(now.getFullYear(), now.getMonth(), 0);
    days += prev.getDate();
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  return { years, months, days };
}

export function AnniversaryCounter({
  startDate,
  tagline,
}: {
  startDate: string | null;
  tagline: string | null;
}) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);

  if (!startDate) {
    return (
      <div className="text-center py-10">
        <p className="hand text-2xl text-[color:var(--pink-vivid)]">our story begins</p>
        <p className="serif italic text-ink/70 mt-3">
          Add a start date in the admin editor to begin the counter.
        </p>
      </div>
    );
  }

  const start = new Date(startDate + "T00:00:00");
  const { years, months, days } = diffYMD(start, now ?? start);

  return (
    <section aria-labelledby="anniv-counter-heading" className="text-center py-8">
      <p className="stamp-font text-[0.6rem] tracking-[0.5em] text-[color:var(--sepia)] uppercase">
        together for
      </p>
      <h2
        id="anniv-counter-heading"
        aria-live="polite"
        className="serif italic text-ink mt-3 leading-[1.05]"
      >
        <span className="inline-flex flex-wrap items-baseline justify-center gap-x-4 gap-y-1">
          <CountPart n={years} label={years === 1 ? "Year" : "Years"} />
          <Sep />
          <CountPart n={months} label={months === 1 ? "Month" : "Months"} />
          <Sep />
          <CountPart n={days} label={days === 1 ? "Day" : "Days"} />
        </span>
      </h2>
      <Flourish className="mt-5 mb-3" />
      <p className="hand text-xl text-[color:var(--pink-vivid)] flex items-center justify-center gap-2">
        <HeartIcon className="w-4 h-4" />
        {tagline ?? "Every day has become another beautiful memory."}
      </p>
    </section>
  );
}

function CountPart({ n, label }: { n: number; label: string }) {
  return (
    <span className="inline-flex items-baseline gap-2">
      <span className="text-6xl md:text-7xl text-[color:var(--rose-deep)] tabular-nums">
        {n}
      </span>
      <span className="text-2xl md:text-3xl text-ink/75">{label}</span>
    </span>
  );
}

function Sep() {
  return (
    <span
      aria-hidden
      className="hidden md:inline-block w-1.5 h-1.5 rounded-full bg-[color:var(--gold)]/60 self-center"
    />
  );
}
