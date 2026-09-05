"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/ui/dialog";
import { Label } from "@/shared/ui/label";
import type { ITextGenerateService } from "./dialog-services.types";
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

const OutputBox = styled.div`
  font-size: 0.875rem;
  line-height: 1.5;
  max-height: 12rem;
  overflow-y: auto;
  padding: 0.75rem;
  border: 1px solid rgb(229 231 235);
  border-radius: 0.375rem;
  margin-top: 0.5rem;
  background: rgb(249 250 251);

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

const PrimaryButton = styled(Button)`
  background-color: #22c55e;
  color: white;

  &:hover:not(:disabled) {
    background-color: #16a34a;
  }
`;

const BackendSelect = styled.select`
  margin-top: 0.5rem;
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid rgb(229 231 235);
  border-radius: 0.375rem;
  font-size: 0.875rem;
  background: white;
  color: rgb(17 24 39);
  cursor: pointer;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

type TextBackend = "local" | "explore";

interface TextGenerateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (content: string) => void;
  onTrackGenerateSuccess?: () => void;
  service: ITextGenerateService;
}

export function TextGenerateDialog({
  isOpen,
  onClose,
  onSuccess,
  onTrackGenerateSuccess,
  service,
}: TextGenerateDialogProps) {
  const [prompt, setPrompt] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [backend, setBackend] = useState<TextBackend>("local");

  const handleSubmit = async () => {
    if (!prompt.trim() || isSubmitting) return;
    setError("");
    setStatus("生成中...");
    setOutput("");
    setIsSubmitting(true);
    const messages = [{ role: "user", content: prompt.trim() }];
    const onChunk = (chunk: string) => setOutput((prev) => prev + chunk);
    try {
      if (backend === "explore" && service.postChatStream) {
        await service.postChatStream(messages, onChunk);
      } else {
        await service.postChatStream(messages, onChunk);
      }
      setStatus("");
      onTrackGenerateSuccess?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "请求失败");
      setStatus("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopy = () => {
    if (output) {
      void navigator.clipboard.writeText(output);
    }
  };

  const handleSendToChat = () => {
    if (output) {
      onSuccess(output);
      handleClose();
    }
  };

  const handleRegenerate = () => {
    setOutput("");
    setError("");
    void handleSubmit();
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setPrompt("");
      setOutput("");
      setError("");
      setStatus("");
      setBackend("local");
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>文本生成</DialogTitle>
        </DialogHeader>
        <div>
          <Label htmlFor="text-backend">后端</Label>
          <BackendSelect
            id="text-backend"
            value={backend}
            onChange={(e) => setBackend(e.target.value as TextBackend)}
            disabled={isSubmitting}
          >
            <option value="local">本地</option>
            <option value="explore">Explore AI</option>
          </BackendSelect>
          <Label
            htmlFor="text-prompt"
            style={{ display: "block", marginTop: "0.75rem" }}
          >
            描述
          </Label>
          <textarea
            id="text-prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="输入提示词"
            disabled={isSubmitting}
            rows={3}
            style={{
              marginTop: "0.5rem",
              width: "100%",
              padding: "0.5rem 0.75rem",
              border: "1px solid rgb(229 231 235)",
              borderRadius: "0.375rem",
              fontSize: "0.875rem",
            }}
          />
          {output ? (
            <OutputBox role="log" aria-live="polite">
              <ReactMarkdown>{output}</ReactMarkdown>
            </OutputBox>
          ) : null}
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
          {output && !isSubmitting ? (
            <>
              <Button
                variant="outline"
                onClick={handleRegenerate}
                disabled={!prompt.trim()}
              >
                重新生成
              </Button>
              <Button variant="outline" onClick={handleCopy}>
                复制
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
