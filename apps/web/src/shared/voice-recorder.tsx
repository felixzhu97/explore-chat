"use client";

import { useState } from "react";
import { Button } from "@/shared/ui/button";
import { Mic, Square, Send, X } from "lucide-react";
import { styled } from "@/src/shared/utils/emotion";
import { useVoiceRecorder } from "@/shared/use-voice-recorder";

interface VoiceRecorderProps {
  onSendVoice: (audioBlob: Blob, duration: number) => void;
  onRecordingChange: (isRecording: boolean) => void;
}

const RecordingBar = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: rgb(254 226 226);
  padding: 0.5rem;
  border-radius: 0.5rem;
`;

const RecordingLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const RecordingDot = styled.div`
  width: 0.5rem;
  height: 0.5rem;
  background-color: rgb(239 68 68);
  border-radius: 9999px;
  animation: pulse 1.5s ease-in-out infinite;

  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
`;

const RecordingText = styled.span`
  font-size: 0.875rem;
  color: rgb(220 38 38);
`;

const BtnGroup = styled.div`
  display: flex;
  gap: 0.25rem;
`;

const SendBtn = styled(Button)`
  background-color: #22c55e;

  &:hover {
    background-color: #16a34a;
  }
`;

const MicBtn = styled(Button)`
  color: rgb(107 114 128);

  &:hover {
    color: rgb(55 65 81);
  }
`;

const MicIcon = styled(Mic)`
  height: 1.25rem;
  width: 1.25rem;
`;

export function VoiceRecorder({
  onSendVoice,
  onRecordingChange,
}: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const { startRecording, stopRecording, duration, audioBlob } =
    useVoiceRecorder();

  const handleStartRecording = async () => {
    try {
      await startRecording();
      setIsRecording(true);
      onRecordingChange(true);
    } catch {
      //
    }
  };

  const handleStopRecording = () => {
    stopRecording();
    setIsRecording(false);
    onRecordingChange(false);
  };

  const handleSendVoice = () => {
    if (audioBlob) {
      onSendVoice(audioBlob, duration);
      setIsRecording(false);
      onRecordingChange(false);
    }
  };

  const handleCancel = () => {
    setIsRecording(false);
    onRecordingChange(false);
  };

  if (isRecording) {
    return (
      <RecordingBar>
        <RecordingLeft>
          <RecordingDot />
          <RecordingText>录音中... {Math.floor(duration)}s</RecordingText>
        </RecordingLeft>
        <BtnGroup>
          <Button size="sm" variant="ghost" onClick={handleCancel}>
            <X size={16} />
          </Button>
          <Button size="sm" variant="ghost" onClick={handleStopRecording}>
            <Square size={16} />
          </Button>
          {audioBlob && (
            <SendBtn size="sm" onClick={handleSendVoice}>
              <Send size={16} />
            </SendBtn>
          )}
        </BtnGroup>
      </RecordingBar>
    );
  }

  return (
    <MicBtn variant="ghost" size="sm" onClick={handleStartRecording}>
      <MicIcon />
    </MicBtn>
  );
}
