import { PageCta, SitePage } from "@/modules/home/site-page";

const plans = [
  { name: "Free", price: "$0", description: "For exploring the editor and building small projects.", features: ["Unlimited local editing", "Starter templates", "Live preview"] },
  { name: "Pro", price: "$12", description: "For independent builders shipping projects regularly.", features: ["Everything in Free", "AI coding assistance", "Priority WebContainer sessions"] },
  { name: "Team", price: "$29", description: "For teams that need a shared, productive workspace.", features: ["Everything in Pro", "Shared projects", "Team support"] },
];

export default function PricingPage() {
  return (
    <SitePage eyebrow="Pricing" title="Choose the pace that fits you." description="Start free, then upgrade when your projects and collaboration needs grow.">
      <div className="mt-14 grid gap-5 lg:grid-cols-3">
        {plans.map((plan) => (
          <div key={plan.name} className="flex flex-col rounded-2xl border border-zinc-200 bg-white/80 p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/80">
            <h2 className="text-xl font-bold">{plan.name}</h2>
            <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">{plan.description}</p>
            <p className="mt-7 text-4xl font-black">{plan.price}<span className="text-sm font-medium text-zinc-500"> / month</span></p>
            <ul className="mt-7 space-y-3 text-sm text-zinc-600 dark:text-zinc-300">
              {plan.features.map((feature) => <li key={feature}>✓ {feature}</li>)}
            </ul>
            <PageCta href="/dashboard">Get started</PageCta>
          </div>
        ))}
      </div>
    </SitePage>
  );
}
