"use client";

import { Heart, MessageCircle, QrCode, Share2, Star } from "lucide-react";
import { FeaturePage } from "@/components/feature-page";
import { usePlatform } from "@/components/platform-state";

export default function SocialFeed() {
  const {
    feedSections,
    activeFeedSection,
    setActiveFeedSection,
    feedPosts,
    likedPosts,
    savedPosts,
    toggleLikePost,
    toggleSavePost
  } = usePlatform();
  const refreshedAt = new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

  return (
    <FeaturePage
      eyebrow="Social Feed"
      title="Social discovery powered by roles, trust, and marketplace momentum"
      description="Follow creators, brands, and vendors through a feed tuned by mutuals, growth velocity, engagement, and verified account signals."
      highlights={["Following", "Trending", "Suggested"]}
      steps={[
        "Pick one feed tab first.",
        "Open one post and use one action at a time.",
        "Save or follow content you want to revisit later."
      ]}
      actions={[
        { href: "/profiles", label: "Open Profiles" },
        { href: "/marketplace", label: "Open Shop" }
      ]}
    >
      <div className="grid gap-4">
        <div className="flex flex-wrap gap-2">
          {feedSections.map((section) => (
            <button
              key={section}
              type="button"
              onClick={() => setActiveFeedSection(section)}
              className={[
                "rounded-full px-4 py-2 text-sm font-medium transition",
                section === activeFeedSection ? "bg-forest-900 text-white shadow-soft" : "border border-white/70 bg-white/80 text-stone-700 backdrop-blur hover:bg-white"
              ].join(" ")}
            >
              {section}
            </button>
          ))}
        </div>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_18rem]">
          <section className="grid gap-4">
            {feedPosts.map((post) => (
              <article key={post.id} className="overflow-hidden rounded-shell border border-white/70 bg-white/80 shadow-soft backdrop-blur-xl">
                <div className="grid gap-4 p-6 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)]">
                  <div className={`flex min-h-[18rem] flex-col justify-between rounded-[1.75rem] bg-gradient-to-br ${post.tone} p-6 text-white shadow-soft`}>
                    <div className="flex items-center justify-between gap-3">
                      <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/85">
                        {post.authorRole}
                      </span>
                      {post.verified ? <Star className="h-4 w-4 text-yellow-200" /> : null}
                    </div>
                    <div>
                      <p className="text-3xl font-semibold tracking-tight">{post.visualTitle}</p>
                      <p className="mt-3 text-sm leading-7 text-white/85">{post.visualSubtitle}</p>
                    </div>
                    <div className="rounded-[1.5rem] bg-black/15 p-4">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-white/70">Auto caption</p>
                      <p className="mt-2 text-sm leading-6 text-white/85">{post.autoCaption}</p>
                    </div>
                  </div>

                  <div className="grid gap-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${post.tone} text-sm font-semibold text-white`}>
                          {post.initials}
                        </div>
                        <div>
                          <p className="text-base font-semibold tracking-tight text-stone-950">{post.author}</p>
                          <p className="text-sm text-stone-500">{post.authorRole}</p>
                        </div>
                      </div>
                      <button type="button" className="rounded-full bg-sand-50 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-forest-800">
                        Follow
                      </button>
                    </div>

                    <p className="text-sm leading-7 text-stone-700">{post.caption}</p>

                    <div className="grid gap-3 rounded-[1.5rem] border border-stone-200 bg-sand-50 p-4 sm:grid-cols-3">
                      <InlineStat label="Likes" value={post.likes.toLocaleString()} />
                      <InlineStat label="Comments" value={post.comments.toLocaleString()} />
                      <InlineStat label="Shares" value={post.shares.toLocaleString()} />
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => toggleLikePost(post.id)}
                        className={[
                          "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium",
                          likedPosts.includes(post.id) ? "bg-rose-50 text-rose-700" : "bg-white text-stone-700 shadow-sm"
                        ].join(" ")}
                      >
                        <Heart className="h-4 w-4" />
                        Like
                      </button>
                      <button type="button" className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-stone-700 shadow-sm">
                        <MessageCircle className="h-4 w-4" />
                        Comment
                      </button>
                      <button type="button" className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-stone-700 shadow-sm">
                        <Share2 className="h-4 w-4" />
                        Share
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleSavePost(post.id)}
                        className={[
                          "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium",
                          savedPosts.includes(post.id) ? "bg-amber-50 text-amber-700" : "bg-white text-stone-700 shadow-sm"
                        ].join(" ")}
                      >
                        <QrCode className="h-4 w-4" />
                        Save
                      </button>
                    </div>

                    <div className="rounded-[1.5rem] border border-stone-200 bg-white p-4">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-stone-500">CTA + Circular ID</p>
                      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-stone-950">{post.cta}</p>
                          <p className="mt-1 text-xs uppercase tracking-[0.18em] text-stone-500">Circular ID badge {post.qrCode}</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button type="button" className="rounded-full bg-forest-900 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white">
                            Buy now
                          </button>
                          <span className="rounded-full bg-sand-50 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-stone-700">
                            Demo ready
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </section>

          <aside className="grid gap-4">
            <div className="rounded-shell border border-white/70 bg-white/80 p-5 shadow-soft backdrop-blur-xl">
              <p className="text-[11px] uppercase tracking-[0.24em] text-forest-700">Discovery engine</p>
              <h2 className="mt-3 text-xl font-semibold tracking-tight text-stone-950">How ranking works</h2>
              <p className="mt-2 text-sm leading-6 text-stone-600">Refreshed at {refreshedAt} with mutuals, verified trust, marketplace momentum, and creator growth signals.</p>
              <div className="mt-4 grid gap-3">
                {["Mutual follows", "Similar interests", "Verified accounts", "Marketplace trust", "Trending signals"].map((signal) => (
                  <div key={signal} className="rounded-2xl bg-sand-50 px-4 py-3 text-sm text-stone-700">
                    {signal}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-shell border border-white/70 bg-white/80 p-5 shadow-soft backdrop-blur-xl">
              <p className="text-[11px] uppercase tracking-[0.24em] text-forest-700">Smart templates</p>
              <h2 className="mt-3 text-xl font-semibold tracking-tight text-stone-950">Share-ready assets</h2>
              <div className="mt-4 grid gap-3">
                {["Circular ID QR card", "Auto captions", "Brand styling", "CTA buttons"].map((item) => (
                  <div key={item} className="rounded-2xl bg-sand-50 px-4 py-3 text-sm text-stone-700">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </FeaturePage>
  );
}

function InlineStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white px-3 py-3 shadow-sm">
      <p className="text-[11px] uppercase tracking-[0.18em] text-stone-500">{label}</p>
      <p className="mt-2 text-lg font-semibold tracking-tight text-stone-950">{value}</p>
    </div>
  );
}
