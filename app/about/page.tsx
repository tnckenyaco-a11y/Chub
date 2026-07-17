import { getSitePage } from "@/lib/site-pages";
import { ComingSoon } from "@/components/coming-soon";

type AboutContent = {
  story: { eyebrow: string; title: string; body: string };
  mission: { eyebrow: string; title: string; body: string };
  problem: {
    title: string;
    intro: string;
    points: { label: string; body: string }[];
    resolution: string;
  };
  commitments: { title: string; body: string }[];
  team: { name: string; role: string }[];
};

export default async function AboutPage() {
  const page = await getSitePage<AboutContent>("about");
  if (!page) return <ComingSoon title="About Us" />;
  const { story, mission, problem, commitments, team } = page.content;

  return (
    <div className="mx-auto max-w-5xl px-6 py-20 lg:px-10">
      <section>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-volt">
          {story.eyebrow}
        </p>
        <h1 className="font-display mt-4 text-5xl uppercase text-paper sm:text-6xl">
          {story.title}
        </h1>
        <p className="mt-6 max-w-2xl text-paper/70">{story.body}</p>
      </section>

      <section className="mt-20 border-t border-line pt-16">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-volt">
          {mission.eyebrow}
        </p>
        <h2 className="font-display mt-4 text-4xl uppercase text-paper">{mission.title}</h2>
        <p className="mt-6 max-w-2xl text-paper/70">{mission.body}</p>
      </section>

      <section className="mt-20 border-t border-line pt-16">
        <h2 className="font-display text-4xl uppercase text-paper">{problem.title}</h2>
        <p className="mt-4 max-w-2xl text-paper/70">{problem.intro}</p>
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          {problem.points.map((p) => (
            <div key={p.label} className="rounded-2xl border border-line p-6">
              <p className="font-semibold text-volt">{p.label}</p>
              <p className="mt-2 text-sm text-paper/70">{p.body}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 max-w-2xl text-paper/70">{problem.resolution}</p>
      </section>

      <section className="mt-20 border-t border-line pt-16">
        <h2 className="font-display text-4xl uppercase text-paper">Our Core Commitments</h2>
        <div className="mt-8 grid gap-8 sm:grid-cols-3">
          {commitments.map((c) => (
            <div key={c.title}>
              <h3 className="font-semibold uppercase tracking-wide text-paper">{c.title}</h3>
              <p className="mt-2 text-sm text-paper/60">{c.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-20 border-t border-line pt-16 pb-4">
        <h2 className="font-display text-4xl uppercase text-paper">Our Leaders</h2>
        <div className="mt-8 grid gap-8 sm:grid-cols-3">
          {team.map((member) => (
            <div key={member.name}>
              <div className="aspect-square rounded-2xl bg-paper/10" />
              <h3 className="mt-4 font-semibold text-paper">{member.name}</h3>
              <p className="text-sm text-paper/50">{member.role}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
