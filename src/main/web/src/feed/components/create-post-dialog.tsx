"use client";

import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import {
  ArrowLeft,
  ImageIcon,
  Check,
  Loader2,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Dialog, DialogContent } from "@/shared/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { styled } from "@/src/shared/utils/emotion";
import { useTranslation } from "@/src/shared/i18n";
import { getApiClient } from "@/auth/api-client";
import { VisionApi } from "@/ai/apis/vision.api";

const BORDER = "1px solid rgb(219 219 219)";
const TEXT_PRIMARY = "rgb(38 38 38)";
const TEXT_SECONDARY = "rgb(142 142 142)";
const BLUE = "rgb(0 149 246)";

const ModalBox = styled.div<{ $step: string }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: ${(p: { $step: string }) =>
    p.$step === "select" || p.$step === "sharing" || p.$step === "success"
      ? "center"
      : "stretch"};
  width: ${(p: { $step: string }) =>
    p.$step === "caption" ? "90vw" : "500px"};
  max-width: ${(p: { $step: string }) =>
    p.$step === "caption" ? "936px" : "500px"};
  height: ${(p: { $step: string }) =>
    p.$step === "caption" ? "85vh" : "520px"};
  max-height: ${(p: { $step: string }) =>
    p.$step === "caption" ? "800px" : "520px"};
  background: rgb(255 255 255);
  border-radius: 12px;
  overflow: hidden;
`;

const HeaderBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 14px 16px;
  padding-right: 56px;
  border-bottom: ${BORDER};
  flex-shrink: 0;
`;

const BackBtn = styled.button`
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  color: ${TEXT_PRIMARY};
`;

const HeaderTitle = styled.span`
  font-weight: 600;
  font-size: 16px;
  color: ${TEXT_PRIMARY};
`;

const HeaderAction = styled.button`
  background: none;
  border: none;
  padding: 8px 12px;
  margin: -8px -12px -8px 0;
  font-weight: 600;
  font-size: 14px;
  color: ${BLUE};
  cursor: pointer;
  border-radius: 8px;
  &:hover {
    background: rgb(239 239 239);
  }
  &:disabled {
    opacity: 0.3;
    cursor: default;
  }
`;

const InlineError = styled.p`
  margin: 0;
  padding: 12px 16px;
  font-size: 14px;
  line-height: 1.4;
  color: rgb(237 73 86);
  text-align: center;
  border-bottom: ${BORDER};
  background: rgb(255 255 255);
`;

const SelectContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  padding: 24px;
  width: 100%;
`;

const DragIconWrap = styled.div`
  margin-bottom: 24px;
  color: ${TEXT_SECONDARY};
`;

const DragHint = styled.p`
  font-size: 20px;
  color: ${TEXT_PRIMARY};
  margin: 0 0 24px;
`;

const SelectBtn = styled.label`
  display: inline-block;
  padding: 8px 16px;
  background: ${BLUE};
  color: white;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  input {
    display: none;
  }
`;

const CropContent = styled.div`
  flex: 1;
  width: 100%;
  display: flex;
  align-items: stretch;
  justify-content: center;
  overflow: hidden;
  background: rgb(0 0 0);
`;

const VideoEditRow = styled.div`
  display: flex;
  flex: 1;
  width: 100%;
  min-height: 0;
`;

const VideoEditLeft = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  background: rgb(0 0 0);
`;

const VideoEditRight = styled.div`
  width: 280px;
  min-width: 280px;
  background: rgb(255 255 255);
  display: flex;
  flex-direction: column;
  padding: 16px;
  gap: 12px;
  border-left: ${BORDER};
`;

const CoverSectionLabel = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${TEXT_PRIMARY};
`;

const CoverPreview = styled.img`
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: 4px;
  background: rgb(239 239 239);
`;

const CoverSlider = styled.input`
  width: 100%;
  accent-color: ${BLUE};
`;

const CoverHint = styled.p`
  margin: 0;
  font-size: 12px;
  color: ${TEXT_SECONDARY};
`;

const CropImage = styled.img`
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
`;

const MediaCarousel = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  flex: 1;
  min-height: 0;
  position: relative;
`;

const CarouselNav = styled.button`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255 255 255 / 0.9);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${TEXT_PRIMARY};
  z-index: 1;
  &:hover {
    background: white;
  }
  &:disabled {
    opacity: 0.4;
    cursor: default;
  }
`;

const CarouselNavLeft = styled(CarouselNav)`
  left: 12px;
`;

const CarouselNavRight = styled(CarouselNav)`
  right: 12px;
`;

const MediaDots = styled.div`
  position: absolute;
  bottom: 12px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  gap: 6px;
  z-index: 1;
`;

const MediaDot = styled.span<{ $active?: boolean }>`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: ${(p) => (p.$active ? "white" : "rgba(255 255 255 / 0.5)")};
`;

const RemoveMediaBtn = styled.button`
  position: absolute;
  top: 12px;
  right: 12px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(0 0 0 / 0.6);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  z-index: 1;
  &:hover {
    background: rgba(0 0 0 / 0.8);
  }
`;

const CaptionLayout = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 100%;
`;

const CaptionLeft = styled.div`
  flex: 1;
  min-width: 0;
  background: rgb(0 0 0);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const CaptionImage = styled.img`
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
`;

const CaptionRight = styled.div`
  width: 340px;
  min-width: 340px;
  display: flex;
  flex-direction: column;
  border-left: ${BORDER};
`;

const CaptionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-bottom: ${BORDER};
`;

const CaptionTextareaWrap = styled.div`
  padding: 16px;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
`;

const CaptionTextarea = styled.textarea`
  width: 100%;
  flex: 1;
  min-height: 80px;
  border: none;
  resize: none;
  font-size: 14px;
  color: ${TEXT_PRIMARY};
  outline: none;
  &::placeholder {
    color: ${TEXT_SECONDARY};
  }
`;

const CharCount = styled.span`
  font-size: 12px;
  color: ${TEXT_SECONDARY};
  align-self: flex-end;
  margin-top: 4px;
`;

const AddOption = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 12px 16px;
  background: none;
  border: none;
  font-size: 14px;
  color: ${TEXT_PRIMARY};
  cursor: pointer;
  text-align: left;
`;

const CenterStepContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  gap: 24px;
`;

const StepTitle = styled.h2`
  margin: 0;
  font-size: 22px;
  font-weight: 600;
  color: ${TEXT_PRIMARY};
`;

const SpinnerWrap = styled.div`
  color: ${TEXT_SECONDARY};
  animation: spin 0.8s linear infinite;
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const CheckCircle = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(
    135deg,
    rgb(255 100 80),
    rgb(200 80 180),
    rgb(100 100 255)
  );
  display: flex;
  align-items: center;
  justify-content: center;
`;

const SuccessMessage = styled.p`
  margin: 0;
  font-size: 15px;
  color: ${TEXT_SECONDARY};
  text-align: center;
`;

const StepActions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  max-width: 280px;
`;

const StepBtn = styled.button`
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  background: ${BLUE};
  color: white;
  &:hover {
    opacity: 0.9;
  }
  &:last-of-type {
    background: transparent;
    color: ${TEXT_SECONDARY};
  }
`;

const SuggestedTagsWrap = styled.div`
  margin-top: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
`;

const SuggestedTagChip = styled.button`
  padding: 4px 10px;
  border-radius: 12px;
  border: 1px solid rgb(219 219 219);
  background: rgb(250 250 250);
  font-size: 13px;
  color: ${TEXT_PRIMARY};
  cursor: pointer;
  &:hover {
    background: rgb(239 239 239);
  }
`;

const MAX_CAPTION = 2200;

interface CreatePostDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (
    caption: string,
    mediaFiles?: File[],
    type?: string,
    coverFile?: File,
  ) => void | Promise<void>;
  currentUser?: { avatar?: string; username?: string } | null;
}

const isMediaFile = (f: File) =>
  f.type.startsWith("image/") || f.type.startsWith("video/");

export function CreatePostDialog({
  open,
  onClose,
  onSubmit,
  currentUser,
}: CreatePostDialogProps) {
  const { t } = useTranslation();
  const [step, setStep] = useState<
    "select" | "crop" | "caption" | "sharing" | "success"
  >("select");
  const [files, setFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [caption, setCaption] = useState("");
  const [cropIndex, setCropIndex] = useState(0);
  const [videoCoverUrls, setVideoCoverUrls] = useState<string[]>([]);
  const [videoDuration, setVideoDuration] = useState(0);
  const [videoCurrentTime, setVideoCurrentTime] = useState(0);
  const [suggestedLabels, setSuggestedLabels] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [violationError, setViolationError] = useState<string | null>(null);
  const [sharing, setSharing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const visionApi = useMemo(() => new VisionApi(getApiClient()), []);

  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  useEffect(() => {
    setViolationError(null);
  }, [files, caption]);

  useEffect(() => {
    if (step !== "caption" || files.length === 0) return;
    const imageFile = files.find((f) => f.type.startsWith("image/"));
    if (!imageFile) return;
    setLoadingSuggestions(true);
    setSuggestedLabels([]);
    visionApi
      .suggestTags(imageFile)
      .then((r) => setSuggestedLabels(r.labels || []))
      .catch(() => setSuggestedLabels([]))
      .finally(() => setLoadingSuggestions(false));
  }, [step, files, visionApi]);

  const reset = useCallback(() => {
    setStep("select");
    setPreviewUrls((prev) => {
      prev.forEach((url) => URL.revokeObjectURL(url));
      return [];
    });
    setFiles([]);
    setCaption("");
    setCropIndex(0);
    setVideoCoverUrls([]);
    setVideoDuration(0);
    setVideoCurrentTime(0);
    setSuggestedLabels([]);
  }, []);

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [onClose, reset]);

  const addFiles = useCallback((newFiles: File[]) => {
    const valid = newFiles.filter(isMediaFile);
    if (valid.length === 0) return;
    setFiles((prev) => [...prev, ...valid]);
    setPreviewUrls((prev) => [
      ...prev,
      ...valid.map((f) => URL.createObjectURL(f)),
    ]);
    setStep("crop");
    setCropIndex((prev) => prev);
  }, []);

  const handleFileSelect = useCallback(
    (list: FileList | null) => {
      if (!list?.length) return;
      addFiles(Array.from(list));
    },
    [addFiles],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const list = e.dataTransfer.files;
      if (list?.length) handleFileSelect(list);
    },
    [handleFileSelect],
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => e.preventDefault(),
    [],
  );

  const handleSelectClick = () => fileInputRef.current?.click();

  const dataUrlToFile = useCallback(
    async (dataUrl: string, fileName: string) => {
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      return new File([blob], fileName, { type: blob.type || "image/jpeg" });
    },
    [],
  );

  const captureVideoFrame = useCallback(
    (time: number) => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || !video.videoWidth) return;
      const w = video.videoWidth;
      const h = video.videoHeight;
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(video, 0, 0, w, h);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.88);
      setVideoCoverUrls((prev) => {
        const next = [...prev];
        while (next.length <= cropIndex) next.push("");
        next[cropIndex] = dataUrl;
        return next;
      });
    },
    [cropIndex],
  );

  const onVideoLoadedMetadata = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    setVideoDuration(video.duration || 0);
    const t = Math.min(0.1, (video.duration || 1) * 0.01);
    setVideoCurrentTime(t);
    video.currentTime = t;
  }, []);

  const onVideoSeeked = useCallback(() => {
    captureVideoFrame(videoRef.current?.currentTime ?? 0);
  }, [captureVideoFrame]);

  const onCoverSliderChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const video = videoRef.current;
      if (!video || !videoDuration) return;
      const t = parseFloat(e.target.value);
      setVideoCurrentTime(t);
      video.currentTime = t;
    },
    [videoDuration],
  );

  const removeFileAt = useCallback((index: number) => {
    setFiles((prev) => {
      const next = prev.filter((_, i) => i !== index);
      if (next.length === 0) setStep("select");
      return next;
    });
    setPreviewUrls((prev) => {
      const url = prev[index];
      if (url) URL.revokeObjectURL(url);
      return prev.filter((_, i) => i !== index);
    });
    setCropIndex((i) =>
      i > index ? i - 1 : i === index ? Math.max(0, index - 1) : i,
    );
    setVideoCoverUrls((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const currentFile = files[cropIndex] ?? null;
  const currentPreview = previewUrls[cropIndex] ?? null;
  const hasVideo = files.some((f) => f.type.startsWith("video/"));

  const handleCropNext = () => setStep("caption");

  const handleShare = useCallback(async () => {
    const trimmed = caption.trim();
    setViolationError(null);
    setSharing(true);
    setStep("sharing");
    try {
      if (files.length > 0) {
        const postType = hasVideo ? "VIDEO" : "IMAGE";
        const coverDataUrl =
          hasVideo && videoCoverUrls.length > 0
            ? videoCoverUrls.find((u) => u && u.length > 0)
            : undefined;
        const coverFile =
          coverDataUrl != null
            ? await dataUrlToFile(coverDataUrl, `cover-${Date.now()}.jpg`)
            : undefined;
        await Promise.resolve(
          onSubmit(trimmed || "", files, postType, coverFile),
        );
      } else {
        await Promise.resolve(onSubmit(trimmed || "", [], "TEXT"));
      }
      setStep("success");
    } catch (err) {
      setStep("caption");
      const message = err instanceof Error ? err.message : "";
      setViolationError(message || t("createPost.errorGeneric"));
    } finally {
      setSharing(false);
    }
  }, [caption, files, hasVideo, videoCoverUrls, onSubmit, t, dataUrlToFile]);

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={(o: boolean) => !o && handleClose()}>
      <DialogContent
        hideClose
        accessibleTitle={t("createPost.title")}
        style={{
          maxWidth: "none",
          width: "auto",
          padding: 0,
          gap: 0,
          border: "none",
          borderRadius: "12px",
        }}
      >
        <ModalBox
          $step={step}
          style={
            step === "crop" && currentFile?.type.startsWith("video/")
              ? { width: "min(90vw, 720px)", maxWidth: "720px" }
              : undefined
          }
        >
          {step === "select" && (
            <>
              <HeaderBar>
                <span style={{ width: 40 }} />
                <HeaderTitle>{t("createPost.title")}</HeaderTitle>
                <span style={{ width: 40 }} />
              </HeaderBar>
              <SelectContent
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                style={{ cursor: "default" }}
              >
                <DragIconWrap>
                  <ImageIcon size={96} strokeWidth={0.5} />
                </DragIconWrap>
                <DragHint>{t("createPost.dragHint")}</DragHint>
                <SelectBtn>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    onChange={(e) => {
                      handleFileSelect(e.target.files);
                      e.target.value = "";
                    }}
                  />
                  {t("createPost.selectFromComputer")}
                </SelectBtn>
              </SelectContent>
            </>
          )}

          {step === "crop" && files.length > 0 && (
            <>
              <HeaderBar>
                <BackBtn
                  type="button"
                  onClick={() => {
                    previewUrls.forEach((url) => URL.revokeObjectURL(url));
                    setPreviewUrls([]);
                    setFiles([]);
                    setCropIndex(0);
                    setStep("select");
                  }}
                >
                  <ArrowLeft size={24} />
                </BackBtn>
                <HeaderTitle>{t("createPost.crop")}</HeaderTitle>
                <HeaderAction type="button" onClick={handleCropNext}>
                  {t("createPost.next")}
                </HeaderAction>
              </HeaderBar>
              <CropContent>
                {currentFile?.type.startsWith("video/") && currentPreview ? (
                  <VideoEditRow>
                    <canvas
                      ref={canvasRef}
                      style={{ display: "none" }}
                      aria-hidden
                    />
                    <VideoEditLeft>
                      <RemoveMediaBtn
                        type="button"
                        onClick={() => removeFileAt(cropIndex)}
                        aria-label="Remove"
                      >
                        <X size={16} />
                      </RemoveMediaBtn>
                      {files.length > 1 && (
                        <>
                          <CarouselNavLeft
                            type="button"
                            style={{ left: 12 }}
                            disabled={cropIndex <= 0}
                            onClick={() =>
                              setCropIndex((i) => Math.max(0, i - 1))
                            }
                            aria-label="Previous"
                          >
                            <ChevronLeft size={24} />
                          </CarouselNavLeft>
                          <CarouselNavRight
                            type="button"
                            style={{ right: 12 }}
                            disabled={cropIndex >= files.length - 1}
                            onClick={() =>
                              setCropIndex((i) =>
                                Math.min(files.length - 1, i + 1),
                              )
                            }
                            aria-label="Next"
                          >
                            <ChevronRight size={24} />
                          </CarouselNavRight>
                        </>
                      )}
                      <video
                        ref={videoRef}
                        key={cropIndex}
                        src={currentPreview}
                        muted
                        playsInline
                        preload="metadata"
                        onLoadedMetadata={onVideoLoadedMetadata}
                        onSeeked={onVideoSeeked}
                        style={{
                          maxWidth: "100%",
                          maxHeight: "100%",
                          objectFit: "contain",
                        }}
                      />
                    </VideoEditLeft>
                    <VideoEditRight>
                      <CoverSectionLabel>
                        {t("createPost.coverPhoto")}
                      </CoverSectionLabel>
                      {videoCoverUrls[cropIndex] ? (
                        <CoverPreview src={videoCoverUrls[cropIndex]} alt="" />
                      ) : (
                        <div
                          style={{
                            width: "100%",
                            aspectRatio: "1",
                            background: "rgb(239 239 239)",
                            borderRadius: 4,
                          }}
                        />
                      )}
                      <CoverHint>{t("createPost.selectFrameHint")}</CoverHint>
                      <CoverSlider
                        type="range"
                        min={0}
                        max={videoDuration || 1}
                        step={0.05}
                        value={videoCurrentTime}
                        onChange={onCoverSliderChange}
                        disabled={!videoDuration}
                        aria-label={t("createPost.selectFrameHint")}
                      />
                    </VideoEditRight>
                  </VideoEditRow>
                ) : (
                  <MediaCarousel>
                    <CarouselNavLeft
                      type="button"
                      disabled={files.length <= 1}
                      onClick={() => setCropIndex((i) => (i <= 0 ? i : i - 1))}
                      aria-label="Previous"
                    >
                      <ChevronLeft size={24} />
                    </CarouselNavLeft>
                    {currentPreview && (
                      <>
                        <RemoveMediaBtn
                          type="button"
                          onClick={() => removeFileAt(cropIndex)}
                          aria-label="Remove"
                        >
                          <X size={16} />
                        </RemoveMediaBtn>
                        <CropImage src={currentPreview} alt="" />
                      </>
                    )}
                    <CarouselNavRight
                      type="button"
                      disabled={files.length <= 1}
                      onClick={() =>
                        setCropIndex((i) => (i >= files.length - 1 ? i : i + 1))
                      }
                      aria-label="Next"
                    >
                      <ChevronRight size={24} />
                    </CarouselNavRight>
                    {files.length > 1 && (
                      <MediaDots>
                        {previewUrls.map((_, i) => (
                          <MediaDot key={i} $active={i === cropIndex} />
                        ))}
                      </MediaDots>
                    )}
                  </MediaCarousel>
                )}
              </CropContent>
            </>
          )}

          {step === "caption" && files.length > 0 && (
            <>
              <HeaderBar>
                <BackBtn type="button" onClick={() => setStep("crop")}>
                  <ArrowLeft size={24} />
                </BackBtn>
                <HeaderTitle>{t("createPost.title")}</HeaderTitle>
                <HeaderAction
                  type="button"
                  onClick={handleShare}
                  disabled={sharing || violationError !== null}
                >
                  {sharing ? t("createPost.sharing") : t("createPost.share")}
                </HeaderAction>
              </HeaderBar>
              {violationError && (
                <InlineError role="alert">
                  {t("createPost.violationMessage")}
                </InlineError>
              )}
              <CaptionLayout style={{ flex: 1, minHeight: 0 }}>
                <CaptionLeft style={{ position: "relative" }}>
                  {files.length > 1 && (
                    <>
                      <CarouselNavLeft
                        type="button"
                        style={{ position: "absolute", left: 8 }}
                        disabled={cropIndex <= 0}
                        onClick={() => setCropIndex((i) => Math.max(0, i - 1))}
                        aria-label="Previous"
                      >
                        <ChevronLeft size={24} />
                      </CarouselNavLeft>
                      <CarouselNavRight
                        type="button"
                        style={{ position: "absolute", right: 8 }}
                        disabled={cropIndex >= files.length - 1}
                        onClick={() =>
                          setCropIndex((i) => Math.min(files.length - 1, i + 1))
                        }
                        aria-label="Next"
                      >
                        <ChevronRight size={24} />
                      </CarouselNavRight>
                      <MediaDots style={{ position: "absolute", bottom: 16 }}>
                        {previewUrls.map((_, i) => (
                          <MediaDot key={i} $active={i === cropIndex} />
                        ))}
                      </MediaDots>
                    </>
                  )}
                  {currentPreview &&
                    (currentFile?.type.startsWith("video/") ? (
                      videoCoverUrls[cropIndex] ? (
                        <CaptionImage
                          src={videoCoverUrls[cropIndex]}
                          alt=""
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "contain",
                          }}
                        />
                      ) : (
                        <video
                          key={cropIndex}
                          src={currentPreview}
                          muted
                          loop
                          playsInline
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "contain",
                            background: "#000",
                          }}
                        />
                      )
                    ) : (
                      <CaptionImage src={currentPreview} alt="" />
                    ))}
                </CaptionLeft>
                <CaptionRight>
                  <CaptionHeader>
                    {currentUser && (
                      <Avatar style={{ width: 32, height: 32 }}>
                        <AvatarImage src={currentUser.avatar} />
                        <AvatarFallback>
                          {(currentUser.username || "?")[0]}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <span style={{ fontWeight: 600, fontSize: 14 }}>
                      {currentUser?.username ?? ""}
                    </span>
                  </CaptionHeader>
                  <CaptionTextareaWrap>
                    <CaptionTextarea
                      placeholder={t("createPost.captionPlaceholder")}
                      value={caption}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                        setCaption(e.target.value.slice(0, MAX_CAPTION))
                      }
                      maxLength={MAX_CAPTION}
                    />
                    <CharCount>
                      {t("createPost.charCount", {
                        current: String(caption.length),
                      } as Record<string, string>)}
                    </CharCount>
                    {(loadingSuggestions || suggestedLabels.length > 0) && (
                      <SuggestedTagsWrap>
                        <span
                          style={{
                            fontSize: 13,
                            color: TEXT_SECONDARY,
                            marginRight: 4,
                          }}
                        >
                          {t("createPost.recommendedTags")}:
                        </span>
                        {loadingSuggestions ? (
                          <Loader2
                            size={16}
                            style={{ animation: "spin 0.8s linear infinite" }}
                          />
                        ) : (
                          suggestedLabels.slice(0, 10).map((label) => (
                            <SuggestedTagChip
                              key={label}
                              type="button"
                              onClick={() =>
                                setCaption((prev) => {
                                  const tag = `#${label.replace(/\s+/g, "_")}`;
                                  return prev.trimEnd()
                                    ? `${prev.trimEnd()} ${tag}`
                                    : tag;
                                })
                              }
                            >
                              #{label.replace(/\s+/g, "_")}
                            </SuggestedTagChip>
                          ))
                        )}
                      </SuggestedTagsWrap>
                    )}
                  </CaptionTextareaWrap>
                  <AddOption type="button">
                    {t("createPost.addLocation")}
                  </AddOption>
                  <AddOption type="button">
                    {t("createPost.addCollaborators")}
                  </AddOption>
                </CaptionRight>
              </CaptionLayout>
            </>
          )}

          {step === "sharing" && (
            <CenterStepContent>
              <StepTitle>{t("createPost.sharing")}</StepTitle>
              <SpinnerWrap>
                <Loader2 size={48} strokeWidth={2} />
              </SpinnerWrap>
            </CenterStepContent>
          )}

          {step === "success" && (
            <CenterStepContent>
              <StepTitle>{t("createPost.postShared")}</StepTitle>
              <CheckCircle>
                <Check size={40} color="white" strokeWidth={3} />
              </CheckCircle>
              <SuccessMessage>
                {t("createPost.postSharedMessage")}
              </SuccessMessage>
              <StepActions>
                <StepBtn type="button" onClick={handleClose}>
                  {t("createPost.viewPost")}
                </StepBtn>
                <StepBtn type="button" onClick={reset}>
                  {t("createPost.createAnother")}
                </StepBtn>
                <StepBtn type="button" onClick={handleClose}>
                  {t("createPost.done")}
                </StepBtn>
              </StepActions>
            </CenterStepContent>
          )}
        </ModalBox>
      </DialogContent>
    </Dialog>
  );
}
