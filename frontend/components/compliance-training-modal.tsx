"use client";

import * as React from "react";
import { AlertCircle, CheckCircle2, FileCheck2, Lock, PlayCircle, ShieldCheck } from "lucide-react";
import { usePlatform } from "@/components/platform-state";
import { getTrainingVideoLesson, getTrainingVideoRuntimeLabel, isTrainingVideoLesson, TrainingVideoPlayer, type TrainingVideoLessonId } from "@/components/training-video-player";

type CertificationQuestion = {
  id: string;
  prompt: string;
  options: { id: string; label: string }[];
  correctOptionId: string;
};

const CERTIFICATION_MODULE_ID = "training-certification";

const CERTIFICATION_QUESTIONS: CertificationQuestion[] = [
  {
    id: "policy-logo-space",
    prompt: "What is the safest approved logo treatment when building a marketplace tile?",
    options: [
      { id: "a", label: "Keep one icon-width of clear space around the mark." },
      { id: "b", label: "Stretch the logo to fill empty space in the tile." },
      { id: "c", label: "Layer the logo over pricing or promotional claims." }
    ],
    correctOptionId: "a"
  },
  {
    id: "policy-marketplace-claims",
    prompt: "Which sustainability copy is allowed in a compliant listing?",
    options: [
      { id: "a", label: "Any claim that sounds aligned with the brand voice." },
      { id: "b", label: "Only language backed by verified certifications or approved facts." },
      { id: "c", label: "A competitor claim copied into the product description." }
    ],
    correctOptionId: "b"
  },
  {
    id: "policy-social-review",
    prompt: "What should happen before a branded social post goes live?",
    options: [
      { id: "a", label: "Publish first, then add disclosures if engagement looks strong." },
      { id: "b", label: "Skip metadata checks if the creative already looks on-brand." },
      { id: "c", label: "Run the post through the policy checklist and confirm disclosures are visible." }
    ],
    correctOptionId: "c"
  }
];

export default function ComplianceTrainingModal() {
  const {
    trainingModalOpen,
    closeTrainingModal,
    completeTrainingModule,
    trainingModules,
    updateTrainingModuleProgress,
    accountFrozen,
    restoreAccess
  } = usePlatform();
  const videoModules = React.useMemo(
    () => trainingModules.filter((module): module is (typeof trainingModules)[number] & { id: TrainingVideoLessonId } => isTrainingVideoLesson(module.id)),
    [trainingModules]
  );
  const certificationModule = React.useMemo(
    () => trainingModules.find((module) => module.id === CERTIFICATION_MODULE_ID) ?? null,
    [trainingModules]
  );
  const [activeModuleId, setActiveModuleId] = React.useState<string>("training-logo");
  const [quizAnswers, setQuizAnswers] = React.useState<Record<string, string>>({});
  const [quizSubmitted, setQuizSubmitted] = React.useState(false);

  React.useEffect(() => {
    if (!trainingModalOpen) {
      return;
    }

    if (!trainingModules.some((module) => module.id === activeModuleId)) {
      setActiveModuleId(videoModules[0]?.id ?? CERTIFICATION_MODULE_ID);
    }
  }, [activeModuleId, trainingModalOpen, trainingModules, videoModules]);

  const activeLesson = getTrainingVideoLesson(activeModuleId);
  const activeModule = trainingModules.find((module) => module.id === activeModuleId) ?? certificationModule;
  const certificationUnlocked = videoModules.every((module) => module.progress === 100);
  const certificationPassed = (certificationModule?.progress ?? 0) === 100;
  const completedVideoCount = videoModules.filter((module) => module.progress === 100).length;
  const answeredCount = CERTIFICATION_QUESTIONS.filter((question) => quizAnswers[question.id]).length;
  const correctAnswerCount = CERTIFICATION_QUESTIONS.filter((question) => quizAnswers[question.id] === question.correctOptionId).length;
  const allQuestionsAnswered = answeredCount === CERTIFICATION_QUESTIONS.length;
  const allTrainingComplete = trainingModules.every((module) => module.progress === 100);

  const handleLessonComplete = React.useCallback(
    (lessonId: TrainingVideoLessonId) => {
      updateTrainingModuleProgress(lessonId, 100);

      const remainingIncompleteVideos = videoModules.filter((module) => module.id !== lessonId && module.progress < 100).length;

      if (remainingIncompleteVideos === 0) {
        setActiveModuleId(CERTIFICATION_MODULE_ID);
      }
    },
    [updateTrainingModuleProgress, videoModules]
  );

  const handleQuizOptionChange = React.useCallback((questionId: string, optionId: string) => {
    setQuizSubmitted(false);
    setQuizAnswers((current) => ({ ...current, [questionId]: optionId }));
  }, []);

  const handleQuizSubmit = React.useCallback(() => {
    setQuizSubmitted(true);

    if (!certificationUnlocked) {
      return;
    }

    const nextCorrectCount = CERTIFICATION_QUESTIONS.filter(
      (question) => quizAnswers[question.id] === question.correctOptionId
    ).length;
    const quizScorePercent = Math.round((nextCorrectCount / CERTIFICATION_QUESTIONS.length) * 100);

    updateTrainingModuleProgress(CERTIFICATION_MODULE_ID, quizScorePercent);
  }, [certificationUnlocked, quizAnswers, updateTrainingModuleProgress]);

  const handleFinalizeRecovery = React.useCallback(() => {
    if (!allTrainingComplete) {
      return;
    }

    completeTrainingModule();

    if (accountFrozen) {
      restoreAccess();
    }
  }, [accountFrozen, allTrainingComplete, completeTrainingModule, restoreAccess]);

  const primaryPanelEyebrow = activeLesson ? "Actual video tutorial" : "Policy certification";
  const primaryPanelTitle = activeLesson ? activeLesson.title : activeModule?.title ?? "Policy certification";
  const primaryPanelSummary = activeLesson
    ? activeLesson.summary
    : "Certification • Governance. Unlocks after the three video lessons and quiz complete with correct answers.";

  if (!trainingModalOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/45 px-4 py-4 backdrop-blur-sm">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-[96rem] items-center justify-center">
        <div className="flex max-h-[calc(100vh-2rem)] w-full flex-col overflow-hidden rounded-shell border border-white/70 bg-white/90 p-6 shadow-shell backdrop-blur-xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.24em] text-forest-700">Brand Guidelines Hub</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-stone-950">Recovery training</h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-600">
                Play the assigned tutorial videos, review the current policy stack, and complete certification to unlock account recovery.
              </p>
            </div>
            <button type="button" onClick={closeTrainingModal} className="rounded-full bg-sand-50 px-3 py-2 text-sm font-semibold text-stone-700">
              Close
            </button>
          </div>

          <div className="mt-6 flex-1 overflow-y-auto pr-1">
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_20rem]">
              <div className="flex min-h-0 flex-col rounded-[1.75rem] border border-stone-200 bg-stone-950 p-5 text-white">
                <div className="grid h-full min-h-0 gap-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
                        {primaryPanelEyebrow}
                      </span>
                      <h3 className="mt-3 text-2xl font-semibold tracking-tight text-white">{primaryPanelTitle}</h3>
                      <p className="mt-2 max-w-2xl text-sm leading-6 text-white/72">{primaryPanelSummary}</p>
                    </div>
                    {activeLesson ? <PlayCircle className="mt-1 h-10 w-10 text-emerald-300" /> : <FileCheck2 className="mt-1 h-10 w-10 text-emerald-300" />}
                  </div>

                  <div className="min-h-0 flex-1">
                    {activeLesson ? (
                      <div className="grid gap-4">
                        <TrainingVideoPlayer lessonId={activeLesson.id} onLessonComplete={handleLessonComplete} />
                        <div className="rounded-[1.25rem] border border-white/10 bg-white/5 px-4 py-3">
                          <p className="text-sm text-white/72">
                            Watch the lesson through the end to mark it complete and move one step closer to certification. {completedVideoCount} of {videoModules.length} video lessons are complete.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="grid gap-4 rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="text-[11px] uppercase tracking-[0.2em] text-white/50">Certification • Governance</p>
                            <h4 className="mt-3 text-2xl font-semibold tracking-tight text-white">Short policy certification quiz</h4>
                            <p className="mt-3 max-w-3xl text-sm leading-7 text-white/72">
                              Unlocks after the three video lessons and quiz complete with correct answers.
                            </p>
                          </div>
                          <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/68">
                            {certificationPassed ? "Passed" : certificationUnlocked ? "Ready" : "Locked"}
                          </span>
                        </div>

                        {!certificationUnlocked ? (
                          <div className="rounded-[1.25rem] border border-amber-300/25 bg-amber-300/10 p-5">
                            <div className="flex items-start gap-3">
                              <Lock className="mt-0.5 h-5 w-5 text-amber-200" />
                              <div>
                                <p className="text-sm font-semibold text-white">Certification is still locked</p>
                                <p className="mt-2 text-sm leading-6 text-white/72">
                                  Complete all three video lessons first. The quiz will unlock automatically after every lesson reaches 100%.
                                </p>
                              </div>
                            </div>
                          </div>
                        ) : certificationPassed ? (
                          <div className="rounded-[1.25rem] border border-emerald-300/25 bg-emerald-300/10 p-5">
                            <div className="flex items-start gap-3">
                              <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-200" />
                              <div>
                                <p className="text-sm font-semibold text-white">Certification passed</p>
                                <p className="mt-2 text-sm leading-6 text-white/72">
                                  All policy questions were answered correctly. You can now finalize recovery and unlock the governance certification.
                                </p>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="grid gap-4">
                              {CERTIFICATION_QUESTIONS.map((question, questionIndex) => {
                                const selectedAnswer = quizAnswers[question.id];
                                const answeredCorrectly = selectedAnswer === question.correctOptionId;

                                return (
                                  <div key={question.id} className="rounded-[1.25rem] border border-white/10 bg-black/20 p-4">
                                    <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">Question {questionIndex + 1}</p>
                                    <p className="mt-2 text-base font-semibold text-white">{question.prompt}</p>
                                    <div className="mt-4 grid gap-2">
                                      {question.options.map((option) => {
                                        const isSelected = selectedAnswer === option.id;
                                        const isCorrectOption = option.id === question.correctOptionId;

                                        return (
                                          <label
                                            key={option.id}
                                            className={[
                                              "flex cursor-pointer items-start gap-3 rounded-[1rem] border px-4 py-3 transition",
                                              isSelected ? "border-emerald-300/70 bg-emerald-300/10" : "border-white/10 bg-white/5 hover:bg-white/10",
                                              quizSubmitted && isCorrectOption ? "border-emerald-300/70" : "",
                                              quizSubmitted && isSelected && !answeredCorrectly ? "border-rose-300/60 bg-rose-300/10" : ""
                                            ].join(" ")}
                                          >
                                            <input
                                              type="radio"
                                              name={question.id}
                                              value={option.id}
                                              checked={isSelected}
                                              onChange={() => handleQuizOptionChange(question.id, option.id)}
                                              className="mt-1 h-4 w-4 accent-emerald-300"
                                            />
                                            <span className="text-sm leading-6 text-white/84">{option.label}</span>
                                          </label>
                                        );
                                      })}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>

                            {quizSubmitted ? (
                              <div
                                className={[
                                  "rounded-[1.25rem] border p-4",
                                  certificationPassed ? "border-emerald-300/30 bg-emerald-300/10" : "border-amber-300/25 bg-amber-300/10"
                                ].join(" ")}
                              >
                                <div className="flex items-start gap-3">
                                  {certificationPassed ? (
                                    <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-200" />
                                  ) : (
                                    <AlertCircle className="mt-0.5 h-5 w-5 text-amber-200" />
                                  )}
                                  <div>
                                    <p className="text-sm font-semibold text-white">
                                      {certificationPassed ? "Quiz passed" : "Quiz needs one more review"}
                                    </p>
                                    <p className="mt-2 text-sm leading-6 text-white/72">
                                      {certificationPassed
                                        ? "All answers are correct. Certification is now complete."
                                        : `You answered ${correctAnswerCount} of ${CERTIFICATION_QUESTIONS.length} correctly. Review the lesson cards and try again.`}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ) : null}

                            <div className="flex flex-wrap items-center justify-between gap-3 rounded-[1.25rem] border border-white/10 bg-white/5 px-4 py-3">
                              <p className="text-sm text-white/72">
                                {answeredCount} of {CERTIFICATION_QUESTIONS.length} questions answered
                              </p>
                              <button
                                type="button"
                                onClick={handleQuizSubmit}
                                disabled={!allQuestionsAnswered}
                                className="rounded-full bg-emerald-300 px-4 py-2 text-sm font-semibold text-stone-950 transition hover:bg-emerald-200 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/40"
                              >
                                Submit quiz
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-[1.25rem] border border-white/10 bg-white/5 px-4 py-3">
                    <p className="text-sm text-white/72">
                      Generated locally and cached for this session, with local studio narration clips used automatically whenever they are present.
                    </p>
                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
                      Runtime {activeLesson ? getTrainingVideoRuntimeLabel(activeLesson.id) ?? activeLesson.runtimeLabel : certificationModule?.duration ?? "Short quiz"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid content-start gap-3 xl:overflow-y-auto xl:pr-1">
                {trainingModules.map((module) => {
                  const lesson = getTrainingVideoLesson(module.id);
                  const isCertification = module.id === CERTIFICATION_MODULE_ID;
                  const isActive = module.id === activeModuleId;
                  const moduleLocked = isCertification && !certificationUnlocked && !certificationPassed;
                  const moduleStatusLabel = isCertification
                    ? certificationPassed
                      ? "Certified"
                      : moduleLocked
                        ? "Locked"
                        : "Take quiz"
                    : module.progress === 100
                      ? "Completed"
                      : "Play video";

                  return (
                    <button
                      key={module.id}
                      type="button"
                      onClick={() => setActiveModuleId(module.id)}
                      className={[
                        "rounded-[1.5rem] border p-4 text-left transition",
                        isActive ? "border-emerald-300 bg-emerald-50 shadow-soft" : "border-stone-200 bg-sand-50 hover:border-emerald-200 hover:bg-white"
                      ].join(" ")}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-stone-950">{module.title}</p>
                          <p className="mt-1 text-sm text-stone-600">
                            {module.format} • {module.category} • {lesson ? getTrainingVideoRuntimeLabel(module.id) ?? module.duration : module.duration}
                          </p>
                          {isCertification ? (
                            <p className="mt-2 text-xs leading-5 text-stone-500">
                              Unlocks after the three video lessons and quiz complete with correct answers.
                            </p>
                          ) : module.progress < 100 ? (
                            <p className="mt-2 text-xs leading-5 text-stone-500">Watch through the end to complete this lesson.</p>
                          ) : null}
                        </div>
                        <span
                          className={[
                            "rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
                            moduleLocked ? "bg-stone-200 text-stone-600" : "bg-white text-forest-800"
                          ].join(" ")}
                        >
                          {moduleStatusLabel}
                        </span>
                      </div>
                      <div className="mt-3 h-2 rounded-full bg-white">
                        <div className="h-2 rounded-full bg-forest-800 transition-all" style={{ width: `${module.progress}%` }} />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-3">
              <div className="rounded-[1.5rem] bg-sand-50 p-4">
                <ShieldCheck className="h-5 w-5 text-forest-700" />
                <p className="mt-3 text-sm font-semibold text-stone-950">Acknowledge the current policy hierarchy</p>
              </div>
              <div className="rounded-[1.5rem] bg-sand-50 p-4">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                <p className="mt-3 text-sm font-semibold text-stone-950">Pass the quiz and unlock certification</p>
              </div>
              <button
                type="button"
                onClick={handleFinalizeRecovery}
                disabled={!allTrainingComplete}
                className="rounded-[1.5rem] bg-forest-900 p-4 text-left text-white shadow-soft transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:bg-stone-400 disabled:hover:translate-y-0"
              >
                <p className="text-sm font-semibold">{accountFrozen ? "Complete certification and restore access" : "Complete module now"}</p>
                <p className="mt-2 text-sm text-white/75">
                  {allTrainingComplete
                    ? "Training, certification, and acknowledgment are complete."
                    : "Available after all three video lessons and the certification quiz are passed."}
                </p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
