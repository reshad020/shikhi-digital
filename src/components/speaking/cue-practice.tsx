"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Mic, Square, RotateCcw, Eye, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { SpeakingCue } from "@/lib/speaking/cue";

type Phase = "ready" | "recording" | "done";

/**
 * Speak, listen back, then compare.
 *
 * There is no grade here yet, and that is a deliberate first step rather than
 * a stub. The single most useful thing a learner can do with a recording is
 * hear it immediately and hold it against a model answer pitched at their own
 * level -- that is a complete exercise on its own, it works with no model
 * call, and it is the half that still works on a day the grader is down.
 *
 * The recording never leaves the browser. It is an object URL on a local blob,
 * dropped when the component unmounts. Nothing is uploaded and nothing is
 * stored, so a child practising out loud carries no privacy cost at all --
 * which for an under-13 product is worth more than the feature it defers.
 */
export function CuePractice({ cue, repeat }: { cue: SpeakingCue; repeat: boolean }) {
  const t = useTranslations("speaking");
  const router = useRouter();

  const [phase, setPhase] = useState<Phase>("ready");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingNext, setLoadingNext] = useState(false);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const urlRef = useRef<string | null>(null);

  // Revoking on unmount rather than on replace: the <audio> element may still
  // be reading the old URL when a re-record starts.
  useEffect(() => {
    return () => {
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
      recorderRef.current?.stream.getTracks().forEach((track) => track.stop());
    };
  }, []);

  useEffect(() => {
    if (phase !== "recording") return;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [phase]);

  async function start() {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType });
        const url = URL.createObjectURL(blob);
        if (urlRef.current) URL.revokeObjectURL(urlRef.current);
        urlRef.current = url;
        setAudioUrl(url);
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
      recorderRef.current = recorder;
      setSeconds(0);
      setPhase("recording");
    } catch {
      // Denied, or no microphone. Both are a normal thing to happen on a
      // shared family device, so they get a sentence rather than a failure.
      setError(t("micDenied"));
    }
  }

  function stop() {
    recorderRef.current?.stop();
    setPhase("done");
  }

  function again() {
    setPhase("ready");
    setAudioUrl(null);
    setSeconds(0);
  }

  const over = seconds > cue.secondsTarget;

  return (
    <div className="flex flex-col gap-5">
      <Card className="rounded-3xl border-2 shadow-pop">
        <CardContent className="p-6 sm:p-7">
          {repeat && (
            <p className="mb-3 inline-block rounded-full bg-sunny/20 px-3 py-1 text-xs font-bold text-foreground">
              {t("seenBefore")}
            </p>
          )}

          <h1 className="font-heading text-2xl font-extrabold sm:text-3xl">{cue.title}</h1>
          <p className="mt-3 text-lg">{cue.prompt}</p>

          <p className="mt-5 text-sm font-bold text-muted-foreground">{t("youCouldMention")}</p>
          <ul className="mt-2 flex flex-col gap-1.5">
            {cue.bullets.map((b) => (
              <li key={b} className="flex gap-2 text-base">
                <span aria-hidden className="text-primary">
                  •
                </span>
                {b}
              </li>
            ))}
          </ul>

          <p className="mt-5 text-sm font-bold text-muted-foreground">{t("wordsToUse")}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {cue.usefulWords.map((w) => (
              <span key={w} className="rounded-full bg-muted px-3 py-1 text-sm font-semibold">
                {w}
              </span>
            ))}
          </div>

          <p className="mt-5 text-sm text-muted-foreground">
            {t("target", { seconds: cue.secondsTarget })}
          </p>
        </CardContent>
      </Card>

      <div className="flex flex-col items-center gap-3">
        {phase === "ready" && (
          <Button onClick={start} className="btn-pop h-14 rounded-2xl px-8 text-base font-bold">
            <Mic className="size-5" />
            {t("start")}
          </Button>
        )}

        {phase === "recording" && (
          <>
            <p
              aria-live="polite"
              className={`font-heading text-4xl font-extrabold tabular-nums ${over ? "text-tangerine" : ""}`}
            >
              {String(Math.floor(seconds / 60)).padStart(2, "0")}:
              {String(seconds % 60).padStart(2, "0")}
            </p>
            <Button
              onClick={stop}
              variant="outline"
              className="h-14 rounded-2xl border-2 px-8 text-base font-bold"
            >
              <Square className="size-5" />
              {t("stop")}
            </Button>
          </>
        )}

        {phase === "done" && audioUrl && (
          <div className="flex w-full flex-col items-center gap-3">
            <p className="text-sm font-semibold text-muted-foreground">
              {t("youSpokeFor", { seconds })}
            </p>
            <audio controls src={audioUrl} className="w-full max-w-sm" />
            <div className="flex flex-wrap justify-center gap-2">
              <Button onClick={again} variant="outline" className="h-12 rounded-2xl border-2 font-bold">
                <RotateCcw className="size-4" />
                {t("again")}
              </Button>
              {!revealed && (
                <Button
                  onClick={() => setRevealed(true)}
                  className="btn-pop h-12 rounded-2xl font-bold"
                >
                  <Eye className="size-4" />
                  {t("showModel")}
                </Button>
              )}
            </div>
          </div>
        )}

        {error && (
          <p role="alert" className="text-sm font-semibold text-destructive">
            {error}
          </p>
        )}
      </div>

      {/* Only after they have spoken. Shown first it is a script to read, and
          then the exercise measures reading instead of speaking. */}
      {revealed && (
        <Card className="rounded-3xl border-2 bg-mint/10">
          <CardContent className="p-6">
            <p className="text-sm font-bold text-muted-foreground">{t("modelAnswer")}</p>
            <p className="mt-2 text-base leading-relaxed">{cue.modelAnswer}</p>
            <p className="mt-4 text-sm text-muted-foreground">{t("modelNote")}</p>
          </CardContent>
        </Card>
      )}

      {phase === "done" && (
        <Button
          onClick={() => {
            setLoadingNext(true);
            router.refresh();
          }}
          disabled={loadingNext}
          variant="outline"
          className="h-12 rounded-2xl border-2 font-bold"
        >
          {loadingNext && <Loader2 className="size-4 animate-spin" />}
          {t("nextCue")}
        </Button>
      )}
    </div>
  );
}
