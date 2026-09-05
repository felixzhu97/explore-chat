"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import ReactMarkdown from "react-markdown";
import {
  VoiceGenTargetLanguages,
  type VoiceGenTargetLanguage,
} from "@whatschat/shared-types";
import type { IVoiceGenerateService } from "./dialog-services.types";
import { Play, Pause } from "lucide-react";
import { styled } from "@/src/shared/utils/emotion";

const ErrorText = styled.p`
  font-size: 0.875rem;
  color: rgb(185 28 28);
  margin-top: 0.5rem;
`;

const StatusText = styled.p`
  font-size: 0.875rem;
  color: rgb(107 114 128);
  margin-top: 0.5rem;
`;

const FormRow = styled.div`
  margin-top: 0.75rem;
`;

const AudioBarWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  background-color: rgb(245 245 245);
  border: 1px solid rgb(229 231 235);
`;

const PlayBtn = styled.button<{ $playing?: boolean }>`
  flex-shrink: 0;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ $playing }) =>
    $playing ? "#25D366" : "rgb(229 231 235)"};
  color: ${({ $playing }) => ($playing ? "white" : "rgb(75 85 99)")};
  transition: background-color 0.15s ease;
  &:hover:not(:disabled) {
    background-color: ${({ $playing }) =>
      $playing ? "#20BD5A" : "rgb(209 213 219)"};
  }
  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

const ProgressWrap = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ProgressTrack = styled.div`
  flex: 1;
  height: 6px;
  border-radius: 3px;
  background-color: rgb(209 213 219);
  overflow: hidden;
`;

const ProgressFill = styled.div<{ widthPct: number }>`
  width: ${({ widthPct }) => widthPct}%;
  height: 100%;
  border-radius: 3px;
  background-color: #25d366;
  transition: width 0.1s linear;
`;

const TimeText = styled.span`
  font-size: 0.75rem;
  color: rgb(107 114 128);
  flex-shrink: 0;
  min-width: 3.5rem;
  text-align: right;
`;

const GeneratedTextBlock = styled.div`
  margin-top: 0.75rem;
  padding: 0.75rem;
  border-radius: 12px;
  background-color: rgb(249 250 251);
  border: 1px solid rgb(229 231 235);
  font-size: 0.875rem;
  color: rgb(55 65 81);
  line-height: 1.5;
  max-height: 12rem;
  overflow-y: auto;

  & h1,
  & h2,
  & h3 {
    font-weight: 600;
    margin: 0.75em 0 0.25em;
  }
  & h1 {
    font-size: 1.125rem;
  }
  & h2 {
    font-size: 1rem;
  }
  & h3 {
    font-size: 0.9375rem;
  }
  & p {
    margin: 0.5em 0;
  }
  & ul,
  & ol {
    margin: 0.5em 0;
    padding-left: 1.5rem;
  }
  & li {
    margin: 0.25em 0;
  }
  & strong {
    font-weight: 600;
  }
  & code {
    font-size: 0.8125rem;
    background: rgb(229 231 235);
    padding: 0.125rem 0.25rem;
    border-radius: 0.25rem;
  }
`;

const TranslatedBlock = styled.div`
  margin-top: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  background-color: rgb(243 244 246);
  font-size: 0.8125rem;
  color: rgb(75 85 99);
  border-left: 3px solid #25d366;
  max-height: 10rem;
  overflow-y: auto;

  & h1,
  & h2,
  & h3 {
    font-weight: 600;
    margin: 0.5em 0 0.2em;
    font-size: inherit;
  }
  & p {
    margin: 0.4em 0;
  }
  & ul,
  & ol {
    margin: 0.4em 0;
    padding-left: 1.25rem;
  }
  & li {
    margin: 0.2em 0;
  }
  & strong {
    font-weight: 600;
  }
  & code {
    font-size: 0.75rem;
    background: rgb(229 231 235);
    padding: 0.125rem 0.25rem;
    border-radius: 0.25rem;
  }
`;

const PrimaryButton = styled(Button)`
  background-color: #25d366;
  color: white;
  border-radius: 24px;
  padding-left: 1.25rem;
  padding-right: 1.25rem;
  &:hover:not(:disabled) {
    background-color: #20bd5a;
  }
`;

const OutlineButton = styled(Button)`
  border-radius: 24px;
  padding-left: 1rem;
  padding-right: 1rem;
`;

interface VoiceGenerateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (audioUrl: string) => void;
  onTrackGenerateSuccess?: () => void;
  service: IVoiceGenerateService;
}

function formatTime(s: number): string {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export function VoiceGenerateDialog({
  isOpen,
  onClose,
  onSuccess,
  onTrackGenerateSuccess,
  service,
}: VoiceGenerateDialogProps) {
  const [prompt, setPrompt] = useState("");
  const [targetLang, setTargetLang] = useState<VoiceGenTargetLanguage>(
    VoiceGenTargetLanguages.Auto,
  );
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [generatedText, setGeneratedText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    const onTimeUpdate = () => setCurrentTime(el.currentTime);
    const onDurationChange = () => setDuration(el.duration);
    const onEnded = () => setIsPlaying(false);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    el.addEventListener("timeupdate", onTimeUpdate);
    el.addEventListener("durationchange", onDurationChange);
    el.addEventListener("ended", onEnded);
    el.addEventListener("play", onPlay);
    el.addEventListener("pause", onPause);
    return () => {
      el.removeEventListener("timeupdate", onTimeUpdate);
      el.removeEventListener("durationchange", onDurationChange);
      el.removeEventListener("ended", onEnded);
      el.removeEventListener("play", onPlay);
      el.removeEventListener("pause", onPause);
    };
  }, [audioUrl]);

  const handleSubmit = async () => {
    if (!prompt.trim() || isSubmitting) return;
    setError("");
    setAudioUrl(null);
    setGeneratedText("");
    setTranslatedText("");
    setStatus("生成中...");
    setIsSubmitting(true);
    try {
      const res = await service.generate(
        prompt.trim(),
        targetLang === "auto" ? undefined : targetLang,
      );
      setStatus("");
      setIsSubmitting(false);
      if (!res?.audioUrl) {
        setError("生成失败");
        return;
      }
      setAudioUrl(res.audioUrl);
      if (res.text) setGeneratedText(res.text);
      onTrackGenerateSuccess?.();
    } catch (e) {
      setStatus("");
      setIsSubmitting(false);
      setError(e instanceof Error ? e.message : "请求失败");
    }
  };

  const handleTranslate = async (lang: "zh" | "en") => {
    if (!generatedText.trim() || isTranslating) return;
    setIsTranslating(true);
    setTranslatedText("");
    try {
      const res = await service.translate(generatedText.trim(), lang);
      const raw = res?.translatedText;
      const value =
        typeof raw === "string"
          ? raw
          : raw && typeof raw === "object" && "translatedText" in raw
            ? String((raw as { translatedText: unknown }).translatedText ?? "")
            : "";
      setTranslatedText(value);
    } finally {
      setIsTranslating(false);
    }
  };

  const togglePlay = () => {
    const el = audioRef.current;
    if (!el) return;
    if (el.paused) el.play();
    else el.pause();
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = audioRef.current;
    if (!el || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    el.currentTime = pct * duration;
    setCurrentTime(el.currentTime);
  };

  const handleSendToChat = () => {
    if (audioUrl) {
      onSuccess(audioUrl);
      handleClose();
    }
  };

  const handleRegenerate = () => {
    setAudioUrl(null);
    setError("");
    setTranslatedText("");
    void handleSubmit();
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setPrompt("");
      setStatus("");
      setError("");
      setAudioUrl(null);
      setGeneratedText("");
      setTranslatedText("");
      setTargetLang(VoiceGenTargetLanguages.Auto);
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsPlaying(false);
      onClose();
    }
  };

  const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open: boolean) => !open && handleClose()}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>生成语音</DialogTitle>
        </DialogHeader>
        <div>
          <Label htmlFor="voice-prompt">描述</Label>
          <Input
            id="voice-prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="输入内容，将先由大模型生成文本再转为语音"
            disabled={isSubmitting}
            style={{ marginTop: "0.5rem", borderRadius: 12 }}
          />
          <FormRow>
            <Label>播报语言</Label>
            <Select
              value={targetLang}
              onValueChange={(v: string) =>
                setTargetLang(v as VoiceGenTargetLanguage)
              }
              disabled={isSubmitting}
            >
              <SelectTrigger style={{ marginTop: "0.5rem", borderRadius: 12 }}>
                <SelectValue placeholder="自动" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">自动</SelectItem>
                <SelectItem value="zh">中文</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </FormRow>
          {audioUrl ? (
            <>
              <audio
                ref={audioRef}
                src={audioUrl}
                style={{ display: "none" }}
              />
              <AudioBarWrap>
                <PlayBtn
                  type="button"
                  $playing={isPlaying}
                  onClick={togglePlay}
                  aria-label={isPlaying ? "暂停" : "播放"}
                >
                  {isPlaying ? (
                    <Pause size={18} />
                  ) : (
                    <Play size={18} style={{ marginLeft: 2 }} />
                  )}
                </PlayBtn>
                <ProgressWrap>
                  <ProgressTrack onClick={handleSeek}>
                    <ProgressFill widthPct={progressPct} />
                  </ProgressTrack>
                  <TimeText>
                    {formatTime(currentTime)} / {formatTime(duration || 0)}
                  </TimeText>
                </ProgressWrap>
              </AudioBarWrap>
            </>
          ) : null}
          {generatedText ? (
            <>
              <GeneratedTextBlock>
                <ReactMarkdown>{generatedText}</ReactMarkdown>
              </GeneratedTextBlock>
              <div
                style={{ marginTop: "0.5rem", display: "flex", gap: "0.5rem" }}
              >
                <OutlineButton
                  variant="outline"
                  size="sm"
                  onClick={() => handleTranslate("en")}
                  disabled={isTranslating}
                >
                  译成英文
                </OutlineButton>
                <OutlineButton
                  variant="outline"
                  size="sm"
                  onClick={() => handleTranslate("zh")}
                  disabled={isTranslating}
                >
                  译成中文
                </OutlineButton>
              </div>
              {translatedText ? (
                <TranslatedBlock>
                  <ReactMarkdown>
                    {typeof translatedText === "string"
                      ? translatedText
                      : String(
                          (translatedText as { translatedText?: string })
                            ?.translatedText ?? "",
                        )}
                  </ReactMarkdown>
                </TranslatedBlock>
              ) : null}
            </>
          ) : null}
          {error ? <ErrorText>{error}</ErrorText> : null}
          {status ? <StatusText>{status}</StatusText> : null}
        </div>
        <DialogFooter>
          <OutlineButton
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            取消
          </OutlineButton>
          {audioUrl ? (
            <>
              <OutlineButton
                variant="outline"
                onClick={handleRegenerate}
                disabled={!prompt.trim()}
              >
                重新生成
              </OutlineButton>
              <PrimaryButton onClick={handleSendToChat}>
                发送到聊天
              </PrimaryButton>
            </>
          ) : (
            <PrimaryButton
              onClick={handleSubmit}
              disabled={!prompt.trim() || isSubmitting}
            >
              生成
            </PrimaryButton>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
