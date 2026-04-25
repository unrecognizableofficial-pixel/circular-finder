"use client";

import { useMemo, useState } from "react";
import { MessageSquare, QrCode, Send, UserPlus, X } from "lucide-react";
import { FeaturePage } from "@/components/feature-page";
import { usePlatform } from "@/components/platform-state";

export default function TailoredProfiles() {
  const { discoveryProfiles, followedProfileIds, toggleFollowProfile } = usePlatform();
  const [selectedProfileId, setSelectedProfileId] = useState(discoveryProfiles[0]?.id ?? "");
  const [openProfileId, setOpenProfileId] = useState("");
  const [messageProfileId, setMessageProfileId] = useState("");
  const [messageDraft, setMessageDraft] = useState("");
  const [messageStatus, setMessageStatus] = useState("");

  const selectedProfile = useMemo(() => discoveryProfiles.find((profile) => profile.id === selectedProfileId) ?? discoveryProfiles[0], [discoveryProfiles, selectedProfileId]);
  const openProfile = useMemo(() => discoveryProfiles.find((profile) => profile.id === openProfileId) ?? null, [discoveryProfiles, openProfileId]);
  const messageProfile = useMemo(() => discoveryProfiles.find((profile) => profile.id === messageProfileId) ?? null, [discoveryProfiles, messageProfileId]);

  const previewProfile = (profileId: string) => {
    setSelectedProfileId(profileId);
    setMessageStatus("");
  };

  const handleOpenProfile = (profileId: string) => {
    previewProfile(profileId);
    setOpenProfileId(profileId);
  };

  const handleMessage = (profileId: string) => {
    const profile = discoveryProfiles.find((entry) => entry.id === profileId);
    if (!profile) {
      return;
    }

    previewProfile(profileId);
    setMessageDraft(`Hi ${profile.name.split(" ")[0]}, I would love to connect on Circular Finder about ${profile.tags[0]?.toLowerCase() ?? "your work"}.`);
    setMessageProfileId(profileId);
  };

  const sendMessage = () => {
    if (!messageProfile) {
      return;
    }

    setMessageStatus(`Draft message ready for ${messageProfile.name}. Use this as your outreach handoff in the demo.`);
    setMessageProfileId("");
  };

  return (
    <FeaturePage
      eyebrow="Tailored Profiles"
      title="Personalized people, brands, and vendors matched to your role"
      description="Discover suggested creators, verified sub-brands, nearby vendors, and growth-minded professionals based on reputation, proximity, and mutual connections."
      highlights={["Suggested creators", "Nearby vendors", "Verified sub-brands"]}
      steps={[
        "Pick one profile card first.",
        "Use Follow, Message, or Open profile one at a time.",
        "Check the spotlight panel to understand why that profile is a match."
      ]}
      actions={[
        { href: "/feed", label: "Open Community" },
        { href: "/marketplace", label: "Open Shop" }
      ]}
    >
      {messageStatus ? (
        <div className="mb-4 rounded-[1.5rem] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-900">
          {messageStatus}
        </div>
      ) : null}
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_18rem]">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {discoveryProfiles.map((profile) => {
                const followed = followedProfileIds.includes(profile.id);
                return (
              <article
                key={profile.id}
                className="rounded-shell border border-white/70 bg-white/80 p-5 shadow-soft backdrop-blur-xl"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className={`flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-gradient-to-br ${profile.tone} text-lg font-semibold text-white`}>
                    {profile.initials}
                  </div>
                  <span className="rounded-full bg-sand-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-stone-700">
                    {profile.group}
                  </span>
                </div>

                <div className="mt-5">
                  <h2 className="text-xl font-semibold tracking-tight text-stone-950">{profile.name}</h2>
                  <p className="mt-1 text-sm text-stone-500">
                    {profile.roleLabel} • {profile.location}
                  </p>
                </div>

                <p className="mt-4 text-sm leading-6 text-stone-600">{profile.summary}</p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {profile.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-sand-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-forest-800">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="mt-5 grid gap-3 rounded-[1.5rem] border border-stone-200 bg-sand-50 p-4">
                  <ProfileStat label="Mutuals" value={profile.mutualConnections.toString()} />
                  <ProfileStat label="Reputation" value={`${profile.reputationScore}/100`} />
                  <ProfileStat label="Followers" value={profile.followers.toLocaleString()} />
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => toggleFollowProfile(profile.id)}
                    className={[
                      "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium",
                      followed ? "bg-forest-900 text-white" : "bg-white text-stone-700 shadow-sm"
                    ].join(" ")}
                  >
                    <UserPlus className="h-4 w-4" />
                    {followed ? "Following" : "Follow"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMessage(profile.id)}
                    className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-stone-700 shadow-sm"
                  >
                    <MessageSquare className="h-4 w-4" />
                    Message
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenProfile(profile.id)}
                    className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-stone-700 shadow-sm"
                  >
                    <QrCode className="h-4 w-4" />
                    Open profile
                  </button>
                </div>
              </article>
            );
          })}
        </section>

        <aside className="grid gap-4">
          {selectedProfile ? (
            <div className="rounded-shell border border-white/70 bg-white/80 p-5 shadow-soft backdrop-blur-xl">
              <p className="text-[11px] uppercase tracking-[0.24em] text-forest-700">Profile spotlight</p>
              <div className="mt-4 flex items-center gap-4">
                <div className={`flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-gradient-to-br ${selectedProfile.tone} text-lg font-semibold text-white`}>
                  {selectedProfile.initials}
                </div>
                <div>
                  <h2 className="text-xl font-semibold tracking-tight text-stone-950">{selectedProfile.name}</h2>
                  <p className="mt-1 text-sm text-stone-500">
                    {selectedProfile.handle} • {selectedProfile.location}
                  </p>
                </div>
              </div>
              <p className="mt-4 text-sm leading-6 text-stone-600">{selectedProfile.summary}</p>
              <div className="mt-4 grid gap-3">
                <div className="rounded-2xl bg-sand-50 px-4 py-3 text-sm text-stone-700">
                  Reputation {selectedProfile.reputationScore}/100 • {selectedProfile.followers.toLocaleString()} followers
                </div>
                <div className="rounded-2xl bg-sand-50 px-4 py-3 text-sm text-stone-700">
                  Mutual connections {selectedProfile.mutualConnections} • Nearby {selectedProfile.nearby ? "Yes" : "No"}
                </div>
              </div>
            </div>
          ) : null}

          <div className="rounded-shell border border-white/70 bg-white/80 p-5 shadow-soft backdrop-blur-xl">
            <p className="text-[11px] uppercase tracking-[0.24em] text-forest-700">Discovery signals</p>
            <h2 className="mt-3 text-xl font-semibold tracking-tight text-stone-950">Why these profiles appear</h2>
            <div className="mt-4 grid gap-3">
              {["Mutual connections", "Reputation score", "Role similarity", "Nearby marketplace activity", "Verified trust signals"].map((item) => (
                <div key={item} className="rounded-2xl bg-sand-50 px-4 py-3 text-sm text-stone-700">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-shell border border-white/70 bg-white/80 p-5 shadow-soft backdrop-blur-xl">
            <p className="text-[11px] uppercase tracking-[0.24em] text-forest-700">Quick actions</p>
            <h2 className="mt-3 text-xl font-semibold tracking-tight text-stone-950">Network growth tools</h2>
            <div className="mt-4 grid gap-3">
              {["Priority follow prompts", "Quick message actions", "QR handoff for networking"].map((item) => (
                <div key={item} className="rounded-2xl bg-sand-50 px-4 py-3 text-sm text-stone-700">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {openProfile ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-stone-950/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-[2rem] border border-white/70 bg-white/95 p-6 shadow-[0_40px_120px_rgba(17,24,39,0.18)] backdrop-blur-xl">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className={`flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-gradient-to-br ${openProfile.tone} text-lg font-semibold text-white`}>
                  {openProfile.initials}
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-[0.24em] text-forest-700">{openProfile.group}</p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight text-stone-950">{openProfile.name}</h2>
                  <p className="mt-1 text-sm text-stone-500">
                    {openProfile.handle} • {openProfile.roleLabel}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpenProfileId("")}
                className="rounded-full bg-stone-100 p-2 text-stone-600 transition hover:bg-stone-200"
                aria-label="Close profile"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="mt-5 text-sm leading-6 text-stone-600">{openProfile.summary}</p>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <ProfileStat label="Mutuals" value={openProfile.mutualConnections.toString()} />
              <ProfileStat label="Reputation" value={`${openProfile.reputationScore}/100`} />
              <ProfileStat label="Followers" value={openProfile.followers.toLocaleString()} />
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-[1.5rem] bg-sand-50 p-4 text-sm leading-6 text-stone-700">
                <p className="text-[11px] uppercase tracking-[0.18em] text-forest-700">Location</p>
                <p className="mt-2">{openProfile.location}</p>
                <p className="mt-1">{openProfile.nearby ? "Nearby marketplace activity is active." : "Remote connection with strong trust signals."}</p>
              </div>
              <div className="rounded-[1.5rem] bg-sand-50 p-4 text-sm leading-6 text-stone-700">
                <p className="text-[11px] uppercase tracking-[0.18em] text-forest-700">Tags</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {openProfile.tags.map((tag) => (
                    <span key={`${openProfile.id}-${tag}`} className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-stone-700">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setOpenProfileId("");
                  handleMessage(openProfile.id);
                }}
                className="inline-flex items-center gap-2 rounded-full bg-forest-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm"
              >
                <MessageSquare className="h-4 w-4" />
                Message
              </button>
              <button
                type="button"
                onClick={() => {
                  toggleFollowProfile(openProfile.id);
                }}
                className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-medium text-stone-700 shadow-sm"
              >
                <UserPlus className="h-4 w-4" />
                {followedProfileIds.includes(openProfile.id) ? "Following" : "Follow"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {messageProfile ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-[2rem] border border-white/70 bg-white/95 p-6 shadow-[0_40px_120px_rgba(17,24,39,0.18)] backdrop-blur-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.24em] text-forest-700">Quick message</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-stone-950">Message {messageProfile.name}</h2>
                <p className="mt-2 text-sm leading-6 text-stone-600">Draft an intro note to keep the Tailored Profiles networking flow visible in the demo.</p>
              </div>
              <button
                type="button"
                onClick={() => setMessageProfileId("")}
                className="rounded-full bg-stone-100 p-2 text-stone-600 transition hover:bg-stone-200"
                aria-label="Close message"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <textarea
              value={messageDraft}
              onChange={(event) => setMessageDraft(event.target.value)}
              rows={6}
              className="mt-5 w-full rounded-[1.5rem] border border-stone-200 bg-sand-50 px-4 py-4 text-sm leading-6 text-stone-800"
            />

            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={sendMessage}
                className="inline-flex items-center gap-2 rounded-full bg-forest-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm"
              >
                <Send className="h-4 w-4" />
                Save draft
              </button>
              <button
                type="button"
                onClick={() => setMessageProfileId("")}
                className="rounded-full bg-white px-4 py-2.5 text-sm font-medium text-stone-700 shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </FeaturePage>
  );
}

function ProfileStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white px-3 py-3 shadow-sm">
      <p className="text-[11px] uppercase tracking-[0.18em] text-stone-500">{label}</p>
      <p className="mt-2 text-base font-semibold tracking-tight text-stone-950">{value}</p>
    </div>
  );
}
