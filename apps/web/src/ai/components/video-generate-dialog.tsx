"use client";

import { useState, useEffect } from "react";
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
import type { IVideoGenerateService } from "./dialog-services.types";
import { styled } from "@/src/shared/utils/emotion";

const PollInterval = 2000;

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

const VideoPreview = styled.video`
  max-width: 100%;
  max-height: 16rem;
  border-radius: 0.5rem;
  margin-top: 0.5rem;
  border: 1px solid rgb(229 231 235);
`;

const PrimaryButton = styled(Button)`
  background-color: #22c55e;
  color: white;

  &:hover:not(:disabled) {
    background-color: #16a34a;
  }
`;

interface VideoGenerateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (videoUrl: string) => void;
  onTrackGenerateSuccess?: () => void;
  service: IVideoGenerateService;
}

export function VideoGenerateDialog({
  isOpen,
  onClose,
  onSuccess,
  onTrackGenerateSuccess,
  service,
}: VideoGenerateDialogProps) {
  const [prompt, setPrompt] = useState("");
  const [status, setStatus] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!jobId) return;
    const timer = setInterval(async () => {
      try {
        const res = await service.getResult(jobId);
        if (!res) return;
        const data = res;
        if (data.status === "succeeded" && data.videoUrl) {
          setJobId(null);
          setStatus("");
          setIsSubmitting(false);
          setVideoUrl(data.videoUrl);
          onTrackGenerateSuccess?.();
        } else if (data.status === "failed") {
          setJobId(null);
          setStatus("");
          setError(data.error ?? "生成失败");
          setIsSubmitting(false);
        } else {
          setStatus("生成中...");
        }
      } catch {
        setJobId(null);
        setStatus("");
        setError("查询结果失败");
        setIsSubmitting(false);
      }
    }, PollInterval);
    return () => clearInterval(timer);
  }, [jobId, service]);

  const handleSubmit = async () => {
    if (!prompt.trim() || isSubmitting) return;
    setError("");
    setVideoUrl(null);
    setStatus("提交中...");
    setIsSubmitting(true);
    try {
      const res = await service.generate(prompt.trim());
      if (!res?.jobId) {
        setStatus("");
        setError("提交失败");
        setIsSubmitting(false);
        return;
      }
      setStatus("生成中...");
      setJobId(res.jobId);
    } catch (e) {
      setStatus("");
      setError(e instanceof Error ? e.message : "请求失败");
      setIsSubmitting(false);
    }
  };

  const handleSendToChat = () => {
    if (videoUrl) {
      onSuccess(videoUrl);
      handleClose();
    }
  };

  const handleRegenerate = () => {
    setVideoUrl(null);
    setError("");
    void handleSubmit();
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setPrompt("");
      setStatus("");
      setError("");
      setJobId(null);
      setVideoUrl(null);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>生成视频</DialogTitle>
        </DialogHeader>
        <div>
          <Label htmlFor="video-prompt">描述</Label>
          <Input
            id="video-prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="输入视频描述"
            disabled={isSubmitting}
            style={{ marginTop: "0.5rem" }}
          />
          {videoUrl ? <VideoPreview src={videoUrl} controls /> : null}
          {error ? <ErrorText>{error}</ErrorText> : null}
          {status ? <StatusText>{status}</StatusText> : null}
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            取消
          </Button>
          {videoUrl ? (
            <>
              <Button
                variant="outline"
                onClick={handleRegenerate}
                disabled={!prompt.trim()}
              >
                重新生成
              </Button>
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
