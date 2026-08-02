"use client";

import type React from "react";

import { useState, useRef } from "react";
import { useFeatureIsOn } from "@growthbook/growthbook-react";
import { Button } from "@/src/presentation/components/ui/button";
import { Textarea } from "@/src/presentation/components/ui/textarea";
import { Smile, Send, X, Sparkles, Camera, ImageIcon } from "lucide-react";
import { AiActionMenu } from "../common/ai-action-menu";
import { EmojiPicker } from "../common/emoji-picker";
import { FileUpload } from "../common/file-upload";
import { VoiceRecorder } from "../common/voice-recorder";
import type { Message } from "@/shared/types";
import { useTranslation } from "@/src/shared/i18n";
import { styled } from "@/src/shared/utils/emotion";

interface MessageInputProps {
  messageText: string;
  showEmojiPicker: boolean;
  replyingTo: Message | null;
  editingMessage: Message | null;
  isRecordingVoice: boolean;
  onMessageChange: (text: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onSendMessage: () => void;
  onEmojiSelect: (emoji: string) => void;
  onToggleEmojiPicker: () => void;
  onFileSelect: (file: File) => void;
  onSendVoice: (audioBlob: Blob, duration: number) => void;
  onCancelReply: () => void;
  onCancelEdit: () => void;
  onRecordingChange: (isRecording: boolean) => void;
  onSmartReplyClick?: () => void;
  onGenerateVideoClick?: () => void;
  onGenerateTextClick?: () => void;
  onGenerateImageClick?: () => void;
  onGenerateVoiceClick?: () => void;
}

const InputShell = styled.div`
  border-top: 1px solid rgb(219 219 219);
  background-color: rgb(255 255 255);
  padding: 0.75rem 1rem 1rem;
`;

const RoundedBar = styled.div`
  display: flex;
  align-items: flex-end;
  column-gap: 0.5rem;
  padding: 8px 12px;
  border-radius: 24px;
  background-color: rgb(239 239 239);
  min-height: 44px;
`;

const DisabledBanner = styled.div`
  border-radius: 0.75rem;
  border: 1px solid hsl(var(--border));
  background-color: rgb(249 250 251);
  padding: 1.5rem;
  font-size: 0.875rem;
  color: rgb(107 114 128);
  text-align: center;
`;

const ReplyBox = styled.div`
  margin-bottom: 0.75rem;
  padding: 0.75rem;
  border-radius: 0.75rem;
  border-left: 4px solid #22c55e;
  background-color: rgb(249 250 251);
`;

const ReplyHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const ReplyTitle = styled.p`
  font-size: 0.875rem;
  font-weight: 500;
  color: rgb(55 65 81);
`;

const ReplyExcerpt = styled.p`
  font-size: 0.875rem;
  color: rgb(75 85 99);
  margin-top: 0.25rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ToolbarRow = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
`;

const IconButtonWrapper = styled.div`
  position: relative;
`;

const PopoverContainer = styled.div`
  position: absolute;
  left: 0;
  bottom: 3rem;
  z-index: 50;
  overflow: visible;
  width: max-content;
  max-width: min(19rem, calc(100vw - 1.5rem));
`;

const PopoverContainerRight = styled.div`
  position: absolute;
  right: 0;
  bottom: 3rem;
  z-index: 50;
  overflow: visible;
  width: max-content;
  max-width: min(19rem, calc(100vw - 1.5rem));
`;

const MessageTextarea = styled(Textarea)`
  min-height: 28px;
  max-height: 8rem;
  resize: none;
  border: none;
  background: transparent;
  padding: 8px 0;
  font-size: 0.9375rem;
  box-shadow: none;
  &:focus {
    box-shadow: none;
  }
`;

const PrimarySendButton = styled(Button)`
  background-color: rgb(0 149 246);
  color: white;
  flex-shrink: 0;
  &:hover:not(:disabled) {
    background-color: rgb(0 119 197);
  }
`;

const BarIconBtn = styled(Button)`
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  padding: 0;
  background: none;
  color: rgb(38 38 38);
  &:hover {
    background: rgb(219 219 219);
    color: rgb(38 38 38);
  }
`;

const TextareaWrapper = styled.div`
  flex: 1;
`;

export function MessageInput({
  messageText,
  showEmojiPicker,
  replyingTo,
  editingMessage,
  isRecordingVoice,
  onMessageChange,
  onKeyDown,
  onSendMessage,
  onEmojiSelect,
  onToggleEmojiPicker,
  onFileSelect,
  onSendVoice,
  onCancelReply,
  onCancelEdit,
  onRecordingChange,
  onSmartReplyClick,
  onGenerateVideoClick,
  onGenerateTextClick,
  onGenerateImageClick,
  onGenerateVoiceClick,
}: MessageInputProps) {
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [showAiMenu, setShowAiMenu] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const hasAiActions =
    onGenerateTextClick != null ||
    onGenerateImageClick != null ||
    onGenerateVideoClick != null ||
    onGenerateVoiceClick != null;
  const { t } = useTranslation();
  const sendMessageEnabled = useFeatureIsOn("send_message");
  const placeholder = t("dm.messagePlaceholder");

  const handleSend = () => {
    if (messageText.trim()) {
      onSendMessage();
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
      return;
    }
    onKeyDown(e);
  };

  const handleFileUpload = (file: File, type: "image" | "file") => {
    onFileSelect(file);
    setShowFileUpload(false);
  };

  if (!sendMessageEnabled) {
    return (
      <InputShell>
        <DisabledBanner>Send message is currently disabled</DisabledBanner>
      </InputShell>
    );
  }

  return (
    <InputShell>
      {(replyingTo || editingMessage) && (
        <ReplyBox>
          <ReplyHeader>
            <div>
              <ReplyTitle>
                {editingMessage ? "编辑消息" : `回复 ${replyingTo?.senderName}`}
              </ReplyTitle>
              <ReplyExcerpt>
                {editingMessage ? editingMessage.content : replyingTo?.content}
              </ReplyExcerpt>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={editingMessage ? onCancelEdit : onCancelReply}
            >
              <X size={16} />
            </Button>
          </ReplyHeader>
        </ReplyBox>
      )}

      <ToolbarRow>
        <RoundedBar style={{ flex: 1 }}>
          <IconButtonWrapper>
            <BarIconBtn
              variant="ghost"
              size="icon"
              onClick={onToggleEmojiPicker}
            >
              <Smile size={22} />
            </BarIconBtn>
            {showEmojiPicker && (
              <PopoverContainer>
                <EmojiPicker
                  isOpen={showEmojiPicker}
                  onClose={onToggleEmojiPicker}
                  onEmojiSelect={onEmojiSelect}
                />
              </PopoverContainer>
            )}
          </IconButtonWrapper>

          <TextareaWrapper style={{ flex: 1, minWidth: 0 }}>
            <MessageTextarea
              ref={textareaRef}
              value={messageText}
              onChange={(e) => onMessageChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              rows={1}
            />
          </TextareaWrapper>

          {messageText.trim() ? (
            <PrimarySendButton onClick={handleSend} size="sm">
              <Send size={18} />
            </PrimarySendButton>
          ) : (
            <IconButtonWrapper>
              <VoiceRecorder
                onSendVoice={onSendVoice}
                onRecordingChange={onRecordingChange}
              />
            </IconButtonWrapper>
          )}

          <IconButtonWrapper>
            <BarIconBtn
              variant="ghost"
              size="icon"
              onClick={() => {
                setShowFileUpload(!showFileUpload);
                setShowAiMenu(false);
              }}
              aria-label="Camera"
            >
              <Camera size={22} />
            </BarIconBtn>
          </IconButtonWrapper>

          <IconButtonWrapper>
            <BarIconBtn
              variant="ghost"
              size="icon"
              onClick={() => {
                setShowFileUpload(!showFileUpload);
                setShowAiMenu(false);
              }}
              aria-label="Gallery"
            >
              <ImageIcon size={22} />
            </BarIconBtn>
            {showFileUpload && (
              <PopoverContainerRight>
                <FileUpload onFileSelect={handleFileUpload} />
              </PopoverContainerRight>
            )}
          </IconButtonWrapper>
        </RoundedBar>

        {(hasAiActions || onSmartReplyClick != null) && (
          <IconButtonWrapper style={{ marginLeft: "0.5rem" }}>
            <BarIconBtn
              variant="ghost"
              size="icon"
              onClick={() => {
                setShowAiMenu(!showAiMenu);
                setShowFileUpload(false);
              }}
            >
              <Sparkles size={20} />
            </BarIconBtn>
            {showAiMenu && (
              <PopoverContainerRight>
                <AiActionMenu
                  onSmartReply={
                    onSmartReplyClick
                      ? () => {
                          setShowAiMenu(false);
                          onSmartReplyClick();
                        }
                      : undefined
                  }
                  onGenerateText={
                    onGenerateTextClick
                      ? () => {
                          setShowAiMenu(false);
                          onGenerateTextClick();
                        }
                      : undefined
                  }
                  onGenerateImage={
                    onGenerateImageClick
                      ? () => {
                          setShowAiMenu(false);
                          onGenerateImageClick();
                        }
                      : undefined
                  }
                  onGenerateVideo={
                    onGenerateVideoClick
                      ? () => {
                          setShowAiMenu(false);
                          onGenerateVideoClick();
                        }
                      : undefined
                  }
                  onGenerateVoice={
                    onGenerateVoiceClick
                      ? () => {
                          setShowAiMenu(false);
                          onGenerateVoiceClick();
                        }
                      : undefined
                  }
                />
              </PopoverContainerRight>
            )}
          </IconButtonWrapper>
        )}
      </ToolbarRow>
    </InputShell>
  );
}
