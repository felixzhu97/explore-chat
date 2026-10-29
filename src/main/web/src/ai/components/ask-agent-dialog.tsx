"use client";

import { useEffect, useState } from "react";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/ui/dialog";
import { Label } from "@/shared/ui/label";
import type { AiApi, ExploreAgentSummary } from "@/ai/apis/ai.api";
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
  white-space: pre-wrap;
`;

const Field = styled.div`
  margin-top: 0.75rem;
`;

const Select = styled.select`
  margin-top: 0.5rem;
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid rgb(229 231 235);
  border-radius: 0.375rem;
  font-size: 0.875rem;
  background: white;
`;

const TextArea = styled.textarea`
  margin-top: 0.5rem;
  width: 100%;
  min-height: 5rem;
  padding: 0.5rem 0.75rem;
  border: 1px solid rgb(229 231 235);
  border-radius: 0.375rem;
  font-size: 0.875rem;
  resize: vertical;
`;

const PrimaryButton = styled(Button)`
  background-color: #22c55e;
  color: white;

  &:hover:not(:disabled) {
    background-color: #16a34a;
  }
`;

interface AskAgentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (content: string) => void;
  service: AiApi;
}

export function AskAgentDialog({
  isOpen,
  onClose,
  onSuccess,
  service,
}: AskAgentDialogProps) {
  const [agents, setAgents] = useState<ExploreAgentSummary[]>([]);
  const [agentType, setAgentType] = useState("support");
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setError(null);
    setReply("");
    service
      .listExploreAgents()
      .then((list) => {
        setAgents(list);
        if (list.some((a) => a.type === "support")) {
          setAgentType("support");
        } else if (list[0]?.type) {
          setAgentType(list[0].type);
        }
      })
      .catch(() => {
        setError("无法加载 Agent 目录，请确认 Chat 已配置 Explore AI BFF");
      });
  }, [isOpen, service]);

  const handleAsk = async () => {
    const prompt = message.trim();
    if (!prompt || loading) return;
    setLoading(true);
    setError(null);
    setReply("");
    try {
      const result = await service.invokeExploreAgent(agentType, prompt);
      setReply(result.reply);
    } catch {
      setError("提问失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ask Agent</DialogTitle>
        </DialogHeader>
        <p style={{ fontSize: "0.875rem", color: "rgb(107 114 128)" }}>
          经 Chat BFF 调用 Explore AI Gallery（Service Agent 形态）
        </p>
        <Field>
          <Label>Agent</Label>
          <Select
            value={agentType}
            disabled={loading || agents.length === 0}
            onChange={(e) => setAgentType(e.target.value)}
          >
            {agents.map((agent) => (
              <option key={agent.type} value={agent.type}>
                {agent.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field>
          <Label>问题</Label>
          <TextArea
            value={message}
            disabled={loading}
            placeholder="例如：这张订单怎么退货？"
            onChange={(e) => setMessage(e.target.value)}
          />
        </Field>
        {loading && <StatusText>思考中…</StatusText>}
        {error != null && <ErrorText>{error}</ErrorText>}
        {reply !== "" && <OutputBox>{reply}</OutputBox>}
        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            关闭
          </Button>
          {reply !== "" && (
            <PrimaryButton
              onClick={() => onSuccess(reply)}
              disabled={loading}
            >
              发送到会话
            </PrimaryButton>
          )}
          <PrimaryButton
            onClick={handleAsk}
            disabled={loading || message.trim() === "" || agents.length === 0}
          >
            {loading ? "提问中…" : "提问"}
          </PrimaryButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
