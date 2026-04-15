"use client";

import { FeaturePage } from "@/components/feature-page";
import { usePlatform } from "@/components/platform-state";
import { formatCurrency, formatPercent } from "@/lib/format";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export default function DashboardPage() {
  const { bootstrap, refreshBootstrap, refreshWardrobe, token, loading } = usePlatform();
  const liveWardrobe = bootstrap?.user?.wardrobe ?? [];
  const catalogProducts = bootstrap?.products ?? [];
  const sourceItems = liveWardrobe.length ? liveWardrobe : catalogProducts.map((product) => ({ product, passport: product.passport })).filter((item) => item.passport);
  const circularItems = sourceItems.filter((item) => (item.passport?.circularityScore ?? 0) >= 70).length;
  const fastItems = Math.max(sourceItems.length - circularItems, 0);
  const totalCarbon = sourceItems.reduce((sum, item) => sum + (item.passport?.carbonFootprintKg ?? 0), 0);
  const carbonSavings = sourceItems.reduce((sum, item) => sum + Math.max(0, 32 - (item.passport?.carbonFootprintKg ?? 0)), 0);
  const donutData = [
    { name: "Circular", value: circularItems || 0 },
    { name: "Fast-fashion", value: fastItems || 0 }
  ];
  const categoryData = Object.values(
    sourceItems.reduce<Record<string, { label: string; carbon: number; count: number }>>((accumulator, item) => {
      const key = item.product.category;
      const current = accumulator[key] ?? { label: key, carbon: 0, count: 0 };
      current.carbon += item.passport?.carbonFootprintKg ?? 0;
      current.count += 1;
      accumulator[key] = current;
      return accumulator;
    }, {})
  );

  return (
    <FeaturePage
      eyebrow="Impact Dashboard"
      title="Live wardrobe analytics and circularity tracking"
      description="This dashboard is wired to the live platform bundle and user wardrobe history, with responsive analytics for circular share, carbon savings, inventory value, and repair-readiness."
      highlights={["Realtime KPIs", "Donut charts", "Impact history"]}
    >
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <div className="grid gap-4">
          <div className="dashboard-grid rounded-shell border border-stone-200 bg-white p-5 shadow-soft">
            <article className="rounded-3xl bg-sand-50 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-stone-500">Items tracked</p>
              <p className="mt-3 text-3xl font-semibold tracking-tight text-stone-900">
                {bootstrap?.user?.insights.inventoryCount ?? bootstrap?.products.length ?? 0}
              </p>
            </article>
            <article className="rounded-3xl bg-sand-50 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-stone-500">Carbon saved</p>
              <p className="mt-3 text-3xl font-semibold tracking-tight text-stone-900">{carbonSavings.toFixed(1)}kg</p>
            </article>
            <article className="rounded-3xl bg-sand-50 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-stone-500">Circular share</p>
              <p className="mt-3 text-3xl font-semibold tracking-tight text-stone-900">
                {sourceItems.length ? formatPercent((circularItems / sourceItems.length) * 100) : "0%"}
              </p>
            </article>
            <article className="rounded-3xl bg-sand-50 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-stone-500">Resale value</p>
              <p className="mt-3 text-3xl font-semibold tracking-tight text-stone-900">
                {formatCurrency(bootstrap?.user?.insights.resaleValue ?? bootstrap?.marketplace.reduce((sum, item) => sum + item.price, 0) ?? 0)}
              </p>
            </article>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-shell border border-stone-200 bg-white p-5 shadow-soft">
              <h2 className="text-xl font-semibold tracking-tight text-stone-900">Circular vs. fast-fashion mix</h2>
              <p className="mt-2 text-sm leading-6 text-stone-600">A live split based on digital passport circularity scores across your wardrobe or the current verified catalog preview.</p>
              <div className="mt-4 h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={donutData} dataKey="value" innerRadius={70} outerRadius={100} paddingAngle={3}>
                      <Cell fill="#2f6840" />
                      <Cell fill="#cfb286" />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="rounded-shell border border-stone-200 bg-white p-5 shadow-soft">
              <h2 className="text-xl font-semibold tracking-tight text-stone-900">Carbon footprint by category</h2>
              <p className="mt-2 text-sm leading-6 text-stone-600">Live passport data aggregated by garment category to spotlight the biggest impact zones in the wardrobe.</p>
              <div className="mt-4 h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="label" tickLine={false} axisLine={false} />
                    <YAxis tickLine={false} axisLine={false} />
                    <Tooltip />
                    <Bar dataKey="carbon" fill="#688469" radius={[12, 12, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
        <div className="rounded-shell border border-stone-200 bg-white p-5 shadow-soft">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-stone-900">Insights rail</h2>
              <p className="mt-2 text-sm leading-6 text-stone-600">Live summary cards, recommendations, and sync actions for the dashboard.</p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => void refreshBootstrap()}
                className="rounded-2xl bg-forest-900 px-4 py-2 text-sm font-medium text-white shadow-sm"
              >
                {loading ? "Refreshing..." : "Refresh live data"}
              </button>
              {token ? (
                <button
                  type="button"
                  onClick={() => void refreshWardrobe()}
                  className="rounded-2xl border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-stone-700"
                >
                  Refresh wardrobe
                </button>
              ) : null}
            </div>
          </div>

          <dl className="mt-6 grid gap-4">
            <div className="rounded-3xl bg-sand-50 p-4">
              <dt className="text-xs uppercase tracking-[0.18em] text-stone-500">Usage rate</dt>
              <dd className="mt-2 text-2xl font-semibold tracking-tight text-stone-900">
                {formatPercent(bootstrap?.user?.insights.usageRate ?? 0)}
              </dd>
            </div>
            <div className="rounded-3xl bg-sand-50 p-4">
              <dt className="text-xs uppercase tracking-[0.18em] text-stone-500">Wardrobe value</dt>
              <dd className="mt-2 text-2xl font-semibold tracking-tight text-stone-900">
                {formatCurrency(bootstrap?.user?.insights.totalWardrobeValue ?? 0)}
              </dd>
            </div>
            <div className="rounded-3xl bg-sand-50 p-4">
              <dt className="text-xs uppercase tracking-[0.18em] text-stone-500">Repair-ready items</dt>
              <dd className="mt-2 text-2xl font-semibold tracking-tight text-stone-900">
                {bootstrap?.user?.insights.repairReadyCount ?? 0}
              </dd>
            </div>
            <div className="rounded-3xl bg-sand-50 p-4">
              <dt className="text-xs uppercase tracking-[0.18em] text-stone-500">Total passport carbon</dt>
              <dd className="mt-2 text-2xl font-semibold tracking-tight text-stone-900">{totalCarbon.toFixed(1)}kg</dd>
            </div>
          </dl>

          <div className="mt-6 rounded-3xl bg-stone-900 p-5 text-stone-50">
            <p className="text-[11px] uppercase tracking-[0.22em] text-emerald-300">Live recommendations</p>
            <ul className="mt-4 grid gap-3 text-sm leading-6 text-stone-200">
              {(bootstrap?.user?.insights.recommendations ?? [
                "Sign in to connect this dashboard to your live wardrobe history.",
                "Verified product passports already power the preview analytics above."
              ]).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </FeaturePage>
  );
}
