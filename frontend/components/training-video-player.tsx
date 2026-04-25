"use client";

import * as React from "react";
import { Loader2, Pause, Play, RotateCcw, Sparkles, Volume2, VolumeX } from "lucide-react";

export type TrainingVideoLessonId = "training-logo" | "training-marketplace" | "training-social";

type TrainingVideoScene = {
  eyebrow: string;
  heading: string;
  body: string;
  bullets: string[];
  voiceLine: string;
  minDurationSeconds?: number;
};

type TrainingVideoLessonDefinition = {
  id: TrainingVideoLessonId;
  title: string;
  summary: string;
  scenes: TrainingVideoScene[];
};

type SceneAudioSource = {
  url: string | null;
  durationSeconds: number | null;
};

type ResolvedTrainingVideoScene = TrainingVideoScene & {
  audioDurationSeconds: number | null;
  audioUrl: string | null;
  durationSeconds: number;
  endTimeSeconds: number;
  startTimeSeconds: number;
};

type ResolvedTrainingVideoTiming = {
  availableStudioSceneCount: number;
  narrationMode: "browser" | "hybrid" | "studio";
  scenes: ResolvedTrainingVideoScene[];
  totalDurationSeconds: number;
};

export type TrainingVideoLesson = TrainingVideoLessonDefinition & {
  runtimeLabel: string;
};

const MIN_SCENE_SECONDS = 9;
const NARRATION_WORDS_PER_SECOND = 1.75;
const ON_SCREEN_READING_WORDS_PER_SECOND = 3.25;
const SCENE_TEXT_LEAD_IN_SECONDS = 1.1;
const FALLBACK_SCENE_BUFFER_SECONDS = 0.9;
const STUDIO_SCENE_BUFFER_SECONDS = 0.45;
const LESSON_END_HOLD_SECONDS = 0.8;
const VIDEO_WIDTH = 1280;
const VIDEO_HEIGHT = 720;
const VIDEO_FPS = 24;
const AUDIO_EXTENSIONS = ["mp3", "m4a", "wav", "webm", "ogg"] as const;
const NARRATOR_VOICE_PATTERNS = [
  /Microsoft Aria/i,
  /Microsoft Jenny/i,
  /Microsoft Sonia/i,
  /Microsoft Libby/i,
  /Ava/i,
  /Allison/i,
  /Samantha/i,
  /Victoria/i,
  /Serena/i,
  /Susan/i,
  /Karen/i,
  /Moira/i,
  /Google UK English Female/i,
  /Google US English/i
] as const;

const TRAINING_VIDEO_LESSON_MAP: Record<TrainingVideoLessonId, TrainingVideoLessonDefinition> = {
  "training-logo": {
    id: "training-logo",
    title: "Correct logo usage",
    summary: "Review safe spacing, approved lockups, and export checks before branded access is restored.",
    scenes: [
      {
        eyebrow: "Brand system",
        heading: "Keep a full clear-space halo",
        body: "The logo needs breathing room in every placement so the mark stays premium, readable, and unmistakably official.",
        bullets: ["Hold one icon-width of space", "Do not crowd it with prices or claims"],
        voiceLine:
          "Keep a full clear-space halo around the Circular Finder logo. Hold one icon-width of space, and never crowd the mark with prices or claims.",
        minDurationSeconds: 10
      },
      {
        eyebrow: "Logo lockups",
        heading: "Use approved color pairings only",
        body: "Approved lockups preserve brand recognition across marketplace tiles, social media crops, and promotional surfaces.",
        bullets: ["Never stretch or rotate the logo", "Avoid unapproved gradients behind the mark"],
        voiceLine:
          "Use approved color pairings only. Never stretch or rotate the logo, and avoid unapproved gradients behind the mark.",
        minDurationSeconds: 10
      },
      {
        eyebrow: "Export review",
        heading: "Check the final output before posting",
        body: "A final QA pass prevents off-brand crops, missing metadata, and misaligned artwork before the asset goes live.",
        bullets: ["Preview mobile and desktop crops", "Confirm metadata is synced to the asset"],
        voiceLine:
          "Check the final output before posting. Preview mobile and desktop crops, and confirm the metadata is synced to the asset.",
        minDurationSeconds: 10
      }
    ]
  },
  "training-marketplace": {
    id: "training-marketplace",
    title: "Marketplace compliance",
    summary: "Walk through listing rules, evidence requirements, and claim language that keeps resale inventory in a compliant state.",
    scenes: [
      {
        eyebrow: "Listing controls",
        heading: "Match every offer to a verified record",
        body: "Each listing should inherit the verified product twin so core marketplace details remain synchronized and defensible.",
        bullets: ["Use the verified product match", "Keep size, price, and condition aligned"],
        voiceLine:
          "Match every offer to a verified record. Use the verified product match, and keep size, price, and condition aligned.",
        minDurationSeconds: 10
      },
      {
        eyebrow: "Claims review",
        heading: "Only publish supported sustainability language",
        body: "Sustainability messaging must trace back to verified certificates, product facts, or approved policy language.",
        bullets: ["Reference verified certifications only", "Replace unsupported claims with factual copy"],
        voiceLine:
          "Only publish supported sustainability language. Reference verified certifications only, and replace unsupported claims with factual copy.",
        minDurationSeconds: 10.5
      },
      {
        eyebrow: "Recovery path",
        heading: "Pause, correct, and resubmit",
        body: "When a listing is flagged, the safest path is a documented correction cycle before the product returns to sale.",
        bullets: ["Document the fix in the queue", "Wait for policy clearance before relisting"],
        voiceLine:
          "Pause, correct, and resubmit. Document the fix in the queue, and wait for policy clearance before relisting.",
        minDurationSeconds: 10
      }
    ]
  },
  "training-social": {
    id: "training-social",
    title: "Approved social posting standards",
    summary: "Practice the caption, CTA, and disclosure standards that keep branded publishing inside the approved social policy lane.",
    scenes: [
      {
        eyebrow: "Post setup",
        heading: "Lead with approved campaign framing",
        body: "The opening caption and campaign language should come from the approved template so disclosures stay visible from the start.",
        bullets: ["Start from the approved template", "Keep disclosures above the fold"],
        voiceLine:
          "Lead with approved campaign framing. Start from the approved template, and keep disclosures above the fold.",
        minDurationSeconds: 10.5
      },
      {
        eyebrow: "Content hygiene",
        heading: "Use clean visuals and compliant captions",
        body: "Publishing standards cover visuals, tags, claims, and creator references so every post remains moderation-ready.",
        bullets: ["Keep hashtags and claims policy-safe", "Use the approved creator and product tags"],
        voiceLine:
          "Use clean visuals and compliant captions. Keep hashtags and claims policy-safe, and use the approved creator and product tags.",
        minDurationSeconds: 10.5
      },
      {
        eyebrow: "Final review",
        heading: "Pass the post through the policy gate",
        body: "A final checkpoint verifies metadata, disclosure placement, and approval status before a branded post is released.",
        bullets: ["Confirm moderation-ready metadata", "Publish only after the checklist passes"],
        voiceLine:
          "Pass the post through the policy gate. Confirm moderation-ready metadata, and publish only after the checklist passes.",
        minDurationSeconds: 10.5
      }
    ]
  }
};

const BASE_TRAINING_VIDEO_TIMINGS: Record<TrainingVideoLessonId, ResolvedTrainingVideoTiming> = {
  "training-logo": buildLessonTiming(TRAINING_VIDEO_LESSON_MAP["training-logo"], []),
  "training-marketplace": buildLessonTiming(TRAINING_VIDEO_LESSON_MAP["training-marketplace"], []),
  "training-social": buildLessonTiming(TRAINING_VIDEO_LESSON_MAP["training-social"], [])
};

const TRAINING_VIDEO_RUNTIME_LABELS: Record<TrainingVideoLessonId, string> = {
  "training-logo": formatDurationLabel(BASE_TRAINING_VIDEO_TIMINGS["training-logo"].totalDurationSeconds),
  "training-marketplace": formatDurationLabel(BASE_TRAINING_VIDEO_TIMINGS["training-marketplace"].totalDurationSeconds),
  "training-social": formatDurationLabel(BASE_TRAINING_VIDEO_TIMINGS["training-social"].totalDurationSeconds)
};

const videoCache = new Map<TrainingVideoLessonId, { fingerprint: string; timing: ResolvedTrainingVideoTiming; url: string }>();
const sceneAudioCache = new Map<string, Promise<SceneAudioSource>>();

export function isTrainingVideoLesson(id: string): id is TrainingVideoLessonId {
  return Object.hasOwn(TRAINING_VIDEO_LESSON_MAP, id);
}

export function getTrainingVideoLesson(id: string): TrainingVideoLesson | null {
  if (!isTrainingVideoLesson(id)) {
    return null;
  }

  return {
    ...TRAINING_VIDEO_LESSON_MAP[id],
    runtimeLabel: TRAINING_VIDEO_RUNTIME_LABELS[id]
  };
}

export function getTrainingVideoRuntimeLabel(id: string): string | null {
  return isTrainingVideoLesson(id) ? TRAINING_VIDEO_RUNTIME_LABELS[id] : null;
}

export function TrainingVideoPlayer({
  lessonId,
  onLessonComplete
}: {
  lessonId: TrainingVideoLessonId;
  onLessonComplete?: (lessonId: TrainingVideoLessonId) => void;
}) {
  const lesson = TRAINING_VIDEO_LESSON_MAP[lessonId];
  const [timing, setTiming] = React.useState<ResolvedTrainingVideoTiming>(BASE_TRAINING_VIDEO_TIMINGS[lessonId]);
  const [videoUrl, setVideoUrl] = React.useState<string | null>(null);
  const [status, setStatus] = React.useState<"error" | "loading-audio" | "loading-video" | "ready">("loading-audio");
  const [statusMessage, setStatusMessage] = React.useState("Checking for studio narration clips");
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [currentTime, setCurrentTime] = React.useState(0);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [voiceEnabled, setVoiceEnabled] = React.useState(true);
  const [selectedVoiceName, setSelectedVoiceName] = React.useState<string | null>(null);
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const narrationAudioRef = React.useRef<HTMLAudioElement | null>(null);
  const activeSceneIndexRef = React.useRef(-1);

  const currentSceneIndex = React.useMemo(() => getSceneIndexForTime(currentTime, timing), [currentTime, timing]);
  const currentScene = timing.scenes[currentSceneIndex] ?? timing.scenes[0];
  const runtimeLabel = React.useMemo(() => formatDurationLabel(timing.totalDurationSeconds), [timing.totalDurationSeconds]);

  const stopNarration = React.useCallback(() => {
    const activeAudio = narrationAudioRef.current;

    if (activeAudio) {
      activeAudio.pause();
      activeAudio.src = "";
      narrationAudioRef.current = null;
    }

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }, []);

  const playNarrationAtTime = React.useCallback(
    (timeSeconds: number) => {
      stopNarration();

      if (!voiceEnabled) {
        return;
      }

      const sceneIndex = getSceneIndexForTime(timeSeconds, timing);
      const scene = timing.scenes[sceneIndex];

      if (!scene) {
        return;
      }

      const sceneOffsetSeconds = Math.max(0, timeSeconds - scene.startTimeSeconds);

      if (scene.audioUrl && typeof scene.audioDurationSeconds === "number") {
        const audioDurationSeconds = scene.audioDurationSeconds;

        if (sceneOffsetSeconds >= audioDurationSeconds) {
          return;
        }

        const audio = new Audio(scene.audioUrl);
        narrationAudioRef.current = audio;
        audio.preload = "auto";
        audio.volume = 1;

        const beginPlayback = async () => {
          const maxSeekTime = Math.max(audioDurationSeconds - 0.05, 0);
          const safeOffsetSeconds = clamp(sceneOffsetSeconds, 0, maxSeekTime);

          if (safeOffsetSeconds > 0) {
            try {
              audio.currentTime = safeOffsetSeconds;
            } catch {
              audio.currentTime = 0;
            }
          }

          try {
            await audio.play();
          } catch {
            return;
          }
        };

        if (audio.readyState >= 1) {
          void beginPlayback();
        } else {
          audio.addEventListener(
            "loadedmetadata",
            () => {
              void beginPlayback();
            },
            { once: true }
          );
          audio.load();
        }

        setSelectedVoiceName("Studio narration clip");
        return;
      }

      if (typeof window === "undefined" || !("speechSynthesis" in window)) {
        setSelectedVoiceName(null);
        return;
      }

      const narrationText = getSceneNarrationText(scene);
      const estimatedNarrationDurationSeconds = estimateVoiceDurationSeconds(narrationText);

      if (sceneOffsetSeconds >= estimatedNarrationDurationSeconds) {
        setSelectedVoiceName(null);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(narrationText);
      const speechSynthesis = window.speechSynthesis;
      const selectedVoice = selectPreferredVoice(speechSynthesis.getVoices());

      utterance.rate = 0.9;
      utterance.pitch = 1.06;
      utterance.volume = 1;

      if (selectedVoice) {
        utterance.voice = selectedVoice;
        setSelectedVoiceName(selectedVoice.name);
      } else {
        setSelectedVoiceName("System narrator");
      }

      speechSynthesis.cancel();
      speechSynthesis.speak(utterance);
    },
    [stopNarration, timing, voiceEnabled]
  );

  React.useEffect(() => {
    let cancelled = false;

    const video = videoRef.current;
    video?.pause();
    stopNarration();
    activeSceneIndexRef.current = -1;
    setCurrentTime(0);
    setIsPlaying(false);
    setErrorMessage(null);
    setSelectedVoiceName(null);
    setVideoUrl(null);
    setTiming(BASE_TRAINING_VIDEO_TIMINGS[lessonId]);
    setStatus("loading-audio");
    setStatusMessage("Checking for studio narration clips");

    const loadLesson = async () => {
      const audioSources = await Promise.all(lesson.scenes.map((_, sceneIndex) => resolveSceneAudio(lesson.id, sceneIndex)));

      if (cancelled) {
        return;
      }

      const resolvedTiming = buildLessonTiming(lesson, audioSources);
      const fingerprint = getTimingFingerprint(resolvedTiming);
      const cachedVideo = videoCache.get(lessonId);

      setTiming(resolvedTiming);

      if (cachedVideo && cachedVideo.fingerprint === fingerprint) {
        setVideoUrl(cachedVideo.url);
        setStatus("ready");
        setStatusMessage("Lesson ready");
        return;
      }

      setStatus("loading-video");
      setStatusMessage(getPreparationMessage(resolvedTiming.narrationMode));

      try {
        const generatedVideoUrl = await generateLessonVideo(lesson, resolvedTiming);

        if (cancelled) {
          URL.revokeObjectURL(generatedVideoUrl);
          return;
        }

        videoCache.set(lessonId, { fingerprint, timing: resolvedTiming, url: generatedVideoUrl });
        setVideoUrl(generatedVideoUrl);
        setStatus("ready");
        setStatusMessage("Lesson ready");
      } catch (error) {
        if (cancelled) {
          return;
        }

        setStatus("error");
        setErrorMessage(error instanceof Error ? error.message : "Unable to prepare the training video.");
      }
    };

    void loadLesson();

    return () => {
      cancelled = true;
      stopNarration();
      video?.pause();
    };
  }, [lesson, lessonId, stopNarration]);

  React.useEffect(() => {
    if (!isPlaying || !voiceEnabled || status !== "ready") {
      return;
    }

    if (currentSceneIndex === activeSceneIndexRef.current) {
      return;
    }

    activeSceneIndexRef.current = currentSceneIndex;
    playNarrationAtTime(currentTime);
  }, [currentSceneIndex, currentTime, isPlaying, playNarrationAtTime, status, voiceEnabled]);

  React.useEffect(() => {
    return () => {
      stopNarration();
    };
  }, [stopNarration]);

  const handlePlayPause = React.useCallback(async () => {
    const video = videoRef.current;

    if (!video || !videoUrl || status !== "ready") {
      return;
    }

    if (video.paused) {
      try {
        await video.play();
      } catch {
        return;
      }

      setIsPlaying(true);
      activeSceneIndexRef.current = currentSceneIndex;
      playNarrationAtTime(video.currentTime);
      return;
    }

    video.pause();
    setIsPlaying(false);
    stopNarration();
  }, [currentSceneIndex, playNarrationAtTime, status, stopNarration, videoUrl]);

  const handleReplay = React.useCallback(async () => {
    const video = videoRef.current;

    if (!video || !videoUrl || status !== "ready") {
      return;
    }

    video.currentTime = 0;
    setCurrentTime(0);
    activeSceneIndexRef.current = -1;

    try {
      await video.play();
    } catch {
      return;
    }

    setIsPlaying(true);
    activeSceneIndexRef.current = 0;
    playNarrationAtTime(0);
  }, [playNarrationAtTime, status, videoUrl]);

  const handleSeek = React.useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const video = videoRef.current;

      if (!video || status !== "ready") {
        return;
      }

      const nextTimeSeconds = Number(event.target.value);
      video.currentTime = nextTimeSeconds;
      setCurrentTime(nextTimeSeconds);
      activeSceneIndexRef.current = getSceneIndexForTime(nextTimeSeconds, timing);

      if (!video.paused) {
        playNarrationAtTime(nextTimeSeconds);
        return;
      }

      stopNarration();
    },
    [playNarrationAtTime, status, stopNarration, timing]
  );

  const handleVoiceToggle = React.useCallback(() => {
    setVoiceEnabled((currentValue) => {
      const nextValue = !currentValue;

      if (!nextValue) {
        stopNarration();
        return nextValue;
      }

      const video = videoRef.current;

      if (video && !video.paused && status === "ready") {
        activeSceneIndexRef.current = getSceneIndexForTime(video.currentTime, timing);
        playNarrationAtTime(video.currentTime);
      }

      return nextValue;
    });
  }, [playNarrationAtTime, status, stopNarration, timing]);

  const narrationModeLabel =
    timing.narrationMode === "studio"
      ? "Studio narration ready"
      : timing.narrationMode === "hybrid"
        ? "Hybrid narration"
        : "Browser voice fallback";

  const narratorLabel =
    voiceEnabled && selectedVoiceName
      ? selectedVoiceName
      : timing.narrationMode === "studio"
        ? "Studio narration armed"
        : "Warm narrator profile";

  return (
    <div className="grid h-full gap-4">
      <div className="overflow-hidden rounded-[1.5rem] border border-white/12 bg-stone-950 shadow-[0_30px_80px_rgba(0,0,0,0.3)]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-white/6 px-4 py-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-white/50">{lesson.title}</p>
            <p className="mt-1 text-sm text-white/72">{lesson.summary}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-emerald-400/16 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-200">
              {narrationModeLabel}
            </span>
            <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/68">
              Runtime {runtimeLabel}
            </span>
          </div>
        </div>

        <div className="relative">
          {status === "ready" && videoUrl ? (
            <video
              ref={videoRef}
              aria-label={lesson.title}
              className="aspect-video w-full bg-black"
              controls={false}
              controlsList="nodownload noplaybackrate nofullscreen"
              disablePictureInPicture
              disableRemotePlayback
              muted
              playsInline
              preload="auto"
              src={videoUrl}
              onContextMenu={(event) => event.preventDefault()}
              onEnded={() => {
                setIsPlaying(false);
                setCurrentTime(timing.totalDurationSeconds);
                activeSceneIndexRef.current = -1;
                stopNarration();
                onLessonComplete?.(lessonId);
              }}
              onLoadedMetadata={(event) => {
                setCurrentTime(event.currentTarget.currentTime);
              }}
              onPause={() => {
                setIsPlaying(false);
                stopNarration();
              }}
              onPlay={() => {
                setIsPlaying(true);
                activeSceneIndexRef.current = getSceneIndexForTime(videoRef.current?.currentTime ?? 0, timing);
                playNarrationAtTime(videoRef.current?.currentTime ?? 0);
              }}
              onTimeUpdate={(event) => {
                setCurrentTime(event.currentTarget.currentTime);
              }}
            />
          ) : (
            <div className="aspect-video w-full bg-[radial-gradient(circle_at_top,_rgba(52,211,153,0.22),_transparent_45%),linear-gradient(135deg,_#07140f,_#101817_40%,_#050706)] px-6 py-8 text-white">
              <div className="flex h-full flex-col justify-between rounded-[1.4rem] border border-white/10 bg-white/6 p-6 backdrop-blur">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.22em] text-emerald-200/80">{currentScene?.eyebrow ?? "Recovery lesson"}</p>
                    <h4 className="mt-3 max-w-xl text-3xl font-semibold tracking-tight text-white">
                      {currentScene?.heading ?? "Preparing narrated training video"}
                    </h4>
                    <p className="mt-3 max-w-2xl text-sm leading-7 text-white/72">
                      {status === "error"
                        ? errorMessage ?? "We were not able to prepare this lesson."
                        : statusMessage}
                    </p>
                  </div>
                  <Sparkles className="h-10 w-10 text-emerald-300" />
                </div>

                <div className="rounded-[1.25rem] border border-white/10 bg-black/20 p-4">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-white/50">Narration line</p>
                  <p className="mt-2 text-base leading-7 text-white/90">
                    {currentScene ? getSceneNarrationText(currentScene) :
                      "Local studio narration clips will be used automatically when they are added to the training audio directory."}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {status === "error" ? null : <Loader2 className="h-5 w-5 animate-spin text-emerald-300" />}
                  <p className="text-sm text-white/70">
                    {status === "loading-audio"
                      ? "Checking for local narration files"
                      : status === "loading-video"
                        ? "Generating the lesson video for this session"
                        : "Lesson ready"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid gap-4 border-t border-white/10 bg-white/5 px-4 py-4 xl:grid-cols-[minmax(0,1fr)_18rem]">
          <div className="grid min-w-0 gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => void handlePlayPause()}
                disabled={status !== "ready" || !videoUrl}
                className="inline-flex items-center gap-2 rounded-full bg-emerald-300 px-4 py-2 text-sm font-semibold text-stone-950 transition hover:bg-emerald-200 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/45"
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {isPlaying ? "Pause" : "Play"}
              </button>
              <button
                type="button"
                onClick={() => void handleReplay()}
                disabled={status !== "ready" || !videoUrl}
                className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/6 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:text-white/35"
              >
                <RotateCcw className="h-4 w-4" />
                Replay
              </button>
              <button
                type="button"
                onClick={handleVoiceToggle}
                className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/6 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                {voiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                {voiceEnabled ? "Voice on" : "Voice off"}
              </button>
            </div>

            <div className="grid gap-2">
              <div className="flex items-center justify-between gap-3 text-xs uppercase tracking-[0.18em] text-white/50">
                <span>Lesson progress</span>
                <span>
                  {formatPlaybackTime(currentTime)} / {runtimeLabel}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={Math.max(timing.totalDurationSeconds, 0.01)}
                step={0.01}
                value={Math.min(currentTime, timing.totalDurationSeconds)}
                onChange={(event) => void handleSeek(event)}
                className="h-2 w-full cursor-pointer accent-emerald-300"
              />
            </div>

            <div className="rounded-[1.25rem] border border-white/10 bg-black/20 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-white/50">Active narration</p>
                  <p className="mt-2 text-base font-semibold text-white">{currentScene?.heading ?? lesson.title}</p>
                </div>
                <span className="rounded-full bg-white/8 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/65">
                  {narratorLabel}
                </span>
              </div>
              <p className="mt-3 text-sm leading-7 text-white/80">
                {currentScene ? getSceneNarrationText(currentScene) :
                  "Add a narration file for this scene to replace the fallback browser voice with a recorded studio line."}
              </p>
            </div>
          </div>

          <div className="grid content-start gap-3">
            {timing.scenes.map((scene, sceneIndex) => {
              const isActive = sceneIndex === currentSceneIndex;
              const isComplete = currentTime >= scene.endTimeSeconds;
              const sceneRuntimeLabel = formatDurationLabel(scene.durationSeconds);

              return (
                <div
                  key={`${lesson.id}-${sceneIndex}`}
                  className={[
                    "rounded-[1.2rem] border px-4 py-3 transition",
                    isActive
                      ? "border-emerald-300/70 bg-emerald-300/10"
                      : "border-white/10 bg-white/5",
                    isComplete && !isActive ? "opacity-70" : "opacity-100"
                  ].join(" ")}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">{scene.eyebrow}</p>
                      <p className="mt-1 text-sm font-semibold text-white">{scene.heading}</p>
                    </div>
                    <span className="rounded-full bg-white/8 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/65">
                      {scene.audioUrl ? "Studio" : "Fallback"} • {sceneRuntimeLabel}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-white/68">{scene.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function buildLessonTiming(lesson: TrainingVideoLessonDefinition, audioSources: SceneAudioSource[]): ResolvedTrainingVideoTiming {
  let currentStartSeconds = 0;
  let availableStudioSceneCount = 0;

  const scenes = lesson.scenes.map((scene, sceneIndex) => {
    const audioSource = audioSources[sceneIndex];
    const audioDurationSeconds =
      typeof audioSource?.durationSeconds === "number" && Number.isFinite(audioSource.durationSeconds) ? audioSource.durationSeconds : null;
    const durationSeconds = resolveSceneDuration(scene, audioDurationSeconds);

    if (audioSource?.url && audioDurationSeconds) {
      availableStudioSceneCount += 1;
    }

    const resolvedScene: ResolvedTrainingVideoScene = {
      ...scene,
      audioDurationSeconds,
      audioUrl: audioSource?.url ?? null,
      durationSeconds,
      endTimeSeconds: currentStartSeconds + durationSeconds,
      startTimeSeconds: currentStartSeconds
    };

    currentStartSeconds += durationSeconds;

    return resolvedScene;
  });

  const totalDurationSeconds = currentStartSeconds + LESSON_END_HOLD_SECONDS;
  const narrationMode =
    availableStudioSceneCount === lesson.scenes.length ? "studio" : availableStudioSceneCount > 0 ? "hybrid" : "browser";

  return {
    availableStudioSceneCount,
    narrationMode,
    scenes,
    totalDurationSeconds
  };
}

function resolveSceneDuration(scene: TrainingVideoScene, audioDurationSeconds: number | null) {
  const narrationText = getSceneNarrationText(scene);
  const narrationDurationSeconds = audioDurationSeconds ?? estimateVoiceDurationSeconds(narrationText);
  const readingDurationSeconds = estimateSceneReadingDuration(scene);
  const sceneBufferSeconds = audioDurationSeconds ? STUDIO_SCENE_BUFFER_SECONDS : FALLBACK_SCENE_BUFFER_SECONDS;

  return Math.max(scene.minDurationSeconds ?? MIN_SCENE_SECONDS, readingDurationSeconds, narrationDurationSeconds + sceneBufferSeconds);
}

function estimateVoiceDurationSeconds(voiceLine: string) {
  const wordCount = voiceLine.trim().split(/\s+/).filter(Boolean).length;
  return wordCount / NARRATION_WORDS_PER_SECOND;
}

function estimateSceneReadingDuration(scene: TrainingVideoScene) {
  const textWordCount = [scene.heading, scene.body, ...scene.bullets].join(" ").trim().split(/\s+/).filter(Boolean).length;
  return SCENE_TEXT_LEAD_IN_SECONDS + textWordCount / ON_SCREEN_READING_WORDS_PER_SECOND;
}

function getSceneNarrationText(scene: TrainingVideoScene) {
  return `${scene.body} ${scene.voiceLine}`.replace(/\s+/g, " ").trim();
}

function formatDurationLabel(totalSeconds: number) {
  const roundedSeconds = Math.max(1, Math.round(totalSeconds));
  const minutes = Math.floor(roundedSeconds / 60);
  const seconds = roundedSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function formatPlaybackTime(totalSeconds: number) {
  return formatDurationLabel(totalSeconds);
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), maximum);
}

function getSceneIndexForTime(timeSeconds: number, timing: ResolvedTrainingVideoTiming) {
  const clampedTimeSeconds = clamp(timeSeconds, 0, timing.totalDurationSeconds);
  const activeSceneIndex = timing.scenes.findIndex(
    (scene) => clampedTimeSeconds >= scene.startTimeSeconds && clampedTimeSeconds < scene.endTimeSeconds
  );

  if (activeSceneIndex >= 0) {
    return activeSceneIndex;
  }

  return Math.max(timing.scenes.length - 1, 0);
}

function getTimingFingerprint(timing: ResolvedTrainingVideoTiming) {
  const fingerprintParts = timing.scenes.map((scene) => `${scene.durationSeconds.toFixed(2)}:${scene.audioDurationSeconds?.toFixed(2) ?? "fallback"}`);
  return `${timing.narrationMode}:${fingerprintParts.join("|")}`;
}

function getPreparationMessage(narrationMode: ResolvedTrainingVideoTiming["narrationMode"]) {
  if (narrationMode === "studio") {
    return "Preparing the lesson video using local studio narration timing";
  }

  if (narrationMode === "hybrid") {
    return "Preparing the lesson video with available studio narration clips and fallback voice coverage";
  }

  return "Preparing the lesson video with the warm fallback narrator profile";
}

async function resolveSceneAudio(lessonId: TrainingVideoLessonId, sceneIndex: number): Promise<SceneAudioSource> {
  const cacheKey = `${lessonId}:${sceneIndex}`;
  const cachedAudio = sceneAudioCache.get(cacheKey);

  if (cachedAudio) {
    return cachedAudio;
  }

  const audioPromise = (async () => {
    for (const extension of AUDIO_EXTENSIONS) {
      const url = `/audio/training/${lessonId}/scene-${sceneIndex + 1}.${extension}`;
      const metadata = await probeAudioMetadata(url);

      if (metadata) {
        return metadata;
      }
    }

    return { durationSeconds: null, url: null };
  })();

  sceneAudioCache.set(cacheKey, audioPromise);
  return audioPromise;
}

function probeAudioMetadata(url: string): Promise<SceneAudioSource | null> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(null);
      return;
    }

    const audio = new Audio();
    let settled = false;

    const finish = (value: SceneAudioSource | null) => {
      if (settled) {
        return;
      }

      settled = true;
      window.clearTimeout(timeoutId);
      audio.removeAttribute("src");
      audio.load();
      resolve(value);
    };

    const timeoutId = window.setTimeout(() => finish(null), 4000);

    audio.preload = "metadata";
    audio.addEventListener(
      "error",
      () => {
        finish(null);
      },
      { once: true }
    );
    audio.addEventListener(
      "loadedmetadata",
      () => {
        const durationSeconds = Number.isFinite(audio.duration) ? audio.duration : null;

        if (!durationSeconds || durationSeconds <= 0) {
          finish(null);
          return;
        }

        finish({ durationSeconds, url });
      },
      { once: true }
    );
    audio.src = url;
  });
}

function selectPreferredVoice(voices: SpeechSynthesisVoice[]) {
  if (voices.length === 0) {
    return null;
  }

  const sortedVoices = [...voices].sort((leftVoice, rightVoice) => scoreVoice(rightVoice) - scoreVoice(leftVoice));
  return sortedVoices[0] ?? null;
}

function scoreVoice(voice: SpeechSynthesisVoice) {
  let score = 0;
  const voiceDescriptor = `${voice.name} ${voice.lang}`;

  if (/en(-|_)?/i.test(voice.lang)) {
    score += 6;
  }

  for (const pattern of NARRATOR_VOICE_PATTERNS) {
    if (pattern.test(voiceDescriptor)) {
      score += 12;
      break;
    }
  }

  if (/female|woman|girl/i.test(voiceDescriptor)) {
    score += 4;
  }

  if (/natural|neural|enhanced|premium/i.test(voiceDescriptor)) {
    score += 3;
  }

  if (voice.default) {
    score += 1;
  }

  return score;
}

async function generateLessonVideo(lesson: TrainingVideoLessonDefinition, timing: ResolvedTrainingVideoTiming) {
  if (typeof window === "undefined" || typeof MediaRecorder === "undefined") {
    throw new Error("This browser cannot prepare the local training video.");
  }

  const canvas = document.createElement("canvas");
  canvas.width = VIDEO_WIDTH;
  canvas.height = VIDEO_HEIGHT;

  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Canvas rendering is not available.");
  }

  const stream = canvas.captureStream(VIDEO_FPS);
  const mimeType = getSupportedVideoMimeType();
  const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
  const chunks: Blob[] = [];

  const blobPromise = new Promise<Blob>((resolve, reject) => {
    recorder.addEventListener("dataavailable", (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data);
      }
    });
    recorder.addEventListener("error", () => {
      reject(new Error("The browser could not record the generated lesson video."));
    });
    recorder.addEventListener("stop", () => {
      const blobType = mimeType || "video/webm";
      resolve(new Blob(chunks, { type: blobType }));
    });
  });

  drawLessonFrame(context, lesson, timing, 0);
  recorder.start();

  await new Promise<void>((resolve) => {
    const startedAt = performance.now();

    const render = (frameTimestamp: number) => {
      const elapsedSeconds = clamp((frameTimestamp - startedAt) / 1000, 0, timing.totalDurationSeconds);
      drawLessonFrame(context, lesson, timing, elapsedSeconds);

      if (elapsedSeconds < timing.totalDurationSeconds) {
        window.requestAnimationFrame(render);
        return;
      }

      window.setTimeout(() => {
        recorder.stop();
        resolve();
      }, 180);
    };

    window.requestAnimationFrame(render);
  });

  const blob = await blobPromise;
  stream.getTracks().forEach((track) => track.stop());
  return URL.createObjectURL(blob);
}

function getSupportedVideoMimeType() {
  const mimeTypes = ["video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm"];
  return mimeTypes.find((mimeType) => MediaRecorder.isTypeSupported(mimeType)) ?? "";
}

function drawLessonFrame(
  context: CanvasRenderingContext2D,
  lesson: TrainingVideoLessonDefinition,
  timing: ResolvedTrainingVideoTiming,
  elapsedSeconds: number
) {
  const sceneIndex = getSceneIndexForTime(elapsedSeconds, timing);
  const scene = timing.scenes[sceneIndex] ?? timing.scenes[0];

  if (!scene) {
    return;
  }

  const localProgress = clamp((elapsedSeconds - scene.startTimeSeconds) / Math.max(scene.durationSeconds, 0.001), 0, 1);
  const introProgress = clamp(localProgress / 0.14, 0, 1);
  const cardOffsetY = (1 - introProgress) * 24;

  const backgroundGradient = context.createLinearGradient(0, 0, VIDEO_WIDTH, VIDEO_HEIGHT);
  backgroundGradient.addColorStop(0, "#04120c");
  backgroundGradient.addColorStop(0.48, "#0d1714");
  backgroundGradient.addColorStop(1, "#050706");

  context.fillStyle = backgroundGradient;
  context.fillRect(0, 0, VIDEO_WIDTH, VIDEO_HEIGHT);

  const glowGradient = context.createRadialGradient(250, 110, 20, 250, 110, 420);
  glowGradient.addColorStop(0, "rgba(52, 211, 153, 0.32)");
  glowGradient.addColorStop(1, "rgba(52, 211, 153, 0)");
  context.fillStyle = glowGradient;
  context.fillRect(0, 0, VIDEO_WIDTH, VIDEO_HEIGHT);

  const accentGradient = context.createRadialGradient(1080, 620, 30, 1080, 620, 340);
  accentGradient.addColorStop(0, "rgba(250, 204, 21, 0.12)");
  accentGradient.addColorStop(1, "rgba(250, 204, 21, 0)");
  context.fillStyle = accentGradient;
  context.fillRect(0, 0, VIDEO_WIDTH, VIDEO_HEIGHT);

  drawRoundedRect(context, 54, 42, 1172, 74, 28);
  context.fillStyle = "rgba(255,255,255,0.05)";
  context.fill();

  context.fillStyle = "rgba(167, 243, 208, 0.92)";
  context.font = "600 22px ui-sans-serif, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
  context.fillText("Recovery training", 86, 88);

  context.fillStyle = "rgba(255,255,255,0.95)";
  context.font = "600 30px ui-sans-serif, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
  context.fillText(lesson.title, 334, 88);

  drawRoundedRect(context, 998, 56, 188, 42, 21);
  context.fillStyle = timing.narrationMode === "studio" ? "rgba(16, 185, 129, 0.18)" : "rgba(255,255,255,0.09)";
  context.fill();
  context.fillStyle = timing.narrationMode === "studio" ? "rgba(209, 250, 229, 0.92)" : "rgba(255,255,255,0.78)";
  context.font = "600 16px ui-sans-serif, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
  context.fillText(
    timing.narrationMode === "studio" ? "Studio narration synced" : timing.narrationMode === "hybrid" ? "Hybrid narration synced" : "Fallback narration mode",
    1028,
    82
  );

  drawRoundedRect(context, 62, 150 + cardOffsetY, 828, 448, 38);
  context.fillStyle = "rgba(248, 250, 252, 0.94)";
  context.fill();

  drawRoundedRect(context, 910, 150, 254, 448, 34);
  context.fillStyle = "rgba(255,255,255,0.07)";
  context.fill();

  drawRoundedRect(context, 62, 620, 1102, 56, 28);
  context.fillStyle = "rgba(255,255,255,0.06)";
  context.fill();

  context.fillStyle = "#10704b";
  context.font = "700 16px ui-sans-serif, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
  context.fillText(scene.eyebrow.toUpperCase(), 108, 206 + cardOffsetY);

  context.fillStyle = "#111827";
  context.font = "700 50px ui-sans-serif, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
  drawWrappedText(context, scene.heading, 108, 256 + cardOffsetY, 680, 58, 3);

  context.fillStyle = "rgba(17,24,39,0.82)";
  context.font = "500 25px ui-sans-serif, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
  drawWrappedText(context, scene.body, 108, 356 + cardOffsetY, 680, 38, 4);

  context.fillStyle = "#0f5132";
  context.font = "700 16px ui-sans-serif, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
  context.fillText("Key checks", 108, 470 + cardOffsetY);

  context.fillStyle = "#111827";
  context.font = "600 23px ui-sans-serif, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

  scene.bullets.forEach((bullet, bulletIndex) => {
    const bulletY = 520 + cardOffsetY + bulletIndex * 52;
    context.beginPath();
    context.fillStyle = "#10b981";
    context.arc(122, bulletY - 8, 7, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = "#111827";
    context.fillText(bullet, 144, bulletY);
  });

  context.fillStyle = "rgba(255,255,255,0.55)";
  context.font = "600 15px ui-sans-serif, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
  context.fillText("Lesson stages", 946, 188);

  timing.scenes.forEach((entry, entryIndex) => {
    const segmentY = 222 + entryIndex * 118;
    const isActive = entryIndex === sceneIndex;
    const isComplete = elapsedSeconds >= entry.endTimeSeconds;

    drawRoundedRect(context, 934, segmentY, 206, 92, 26);
    context.fillStyle = isActive ? "rgba(16, 185, 129, 0.18)" : "rgba(255,255,255,0.05)";
    context.fill();

    context.fillStyle = isComplete ? "rgba(110, 231, 183, 0.96)" : "rgba(255,255,255,0.42)";
    context.font = "700 14px ui-sans-serif, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
    context.fillText(`SCENE ${entryIndex + 1}`, 960, segmentY + 28);

    context.fillStyle = "rgba(255,255,255,0.95)";
    context.font = "600 22px ui-sans-serif, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
    drawWrappedText(context, entry.heading, 960, segmentY + 56, 156, 28, 2);

    context.fillStyle = "rgba(255,255,255,0.6)";
    context.font = "600 13px ui-sans-serif, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
    context.fillText(entry.audioUrl ? "Studio narration clip" : "Fallback narrator line", 960, segmentY + 78);
  });

  context.fillStyle = "rgba(255,255,255,0.58)";
  context.font = "600 14px ui-sans-serif, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
  context.fillText("Narration", 94, 650);

  context.fillStyle = "rgba(255,255,255,0.96)";
  context.font = "600 19px ui-sans-serif, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
  drawWrappedText(context, scene.voiceLine, 192, 650, 900, 25, 2);

  const progressWidth = 1044;
  drawRoundedRect(context, 62, 694, progressWidth, 8, 4);
  context.fillStyle = "rgba(255,255,255,0.12)";
  context.fill();

  drawRoundedRect(context, 62, 694, progressWidth * clamp(elapsedSeconds / timing.totalDurationSeconds, 0, 1), 8, 4);
  const progressGradient = context.createLinearGradient(62, 0, 62 + progressWidth, 0);
  progressGradient.addColorStop(0, "#34d399");
  progressGradient.addColorStop(1, "#facc15");
  context.fillStyle = progressGradient;
  context.fill();
}

function drawRoundedRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  const safeRadius = Math.min(radius, width / 2, height / 2);

  context.beginPath();
  context.moveTo(x + safeRadius, y);
  context.lineTo(x + width - safeRadius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + safeRadius);
  context.lineTo(x + width, y + height - safeRadius);
  context.quadraticCurveTo(x + width, y + height, x + width - safeRadius, y + height);
  context.lineTo(x + safeRadius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - safeRadius);
  context.lineTo(x, y + safeRadius);
  context.quadraticCurveTo(x, y, x + safeRadius, y);
  context.closePath();
}

function drawWrappedText(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number
) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let currentLine = "";

  words.forEach((word) => {
    const nextLine = currentLine ? `${currentLine} ${word}` : word;

    if (context.measureText(nextLine).width <= maxWidth || currentLine.length === 0) {
      currentLine = nextLine;
      return;
    }

    lines.push(currentLine);
    currentLine = word;
  });

  if (currentLine) {
    lines.push(currentLine);
  }

  lines.slice(0, maxLines).forEach((line, lineIndex) => {
    const isLastVisibleLine = lineIndex === maxLines - 1;
    const visibleText = isLastVisibleLine && lines.length > maxLines ? `${line.replace(/[.,;:!?-]*$/, "")}...` : line;
    context.fillText(visibleText, x, y + lineIndex * lineHeight);
  });
}
