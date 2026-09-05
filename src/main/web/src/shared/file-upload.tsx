"use client";

import type React from "react";
import { useRef } from "react";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { ImageIcon, FileText, Camera } from "lucide-react";
import { styled } from "@/src/shared/utils/emotion";

interface FileUploadProps {
  onFileSelect: (file: File, type: "image" | "file") => void;
}

const UploadCard = styled(Card)`
  padding: 0.5rem;
  box-shadow:
    0 10px 15px -3px rgb(0 0 0 / 0.1),
    0 4px 6px -4px rgb(0 0 0 / 0.1);
`;

const UploadGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
  width: 12rem;
`;

const UploadOptionButton = styled(Button)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  height: auto;
  padding: 0.75rem;
`;

const OptionLabel = styled.span`
  font-size: 0.75rem;
`;

const ImageIconStyled = styled(ImageIcon)`
  height: 1.5rem;
  width: 1.5rem;
  color: #3b82f6;
`;

const FileIconStyled = styled(FileText)`
  height: 1.5rem;
  width: 1.5rem;
  color: rgb(107 114 128);
`;

const CameraIconStyled = styled(Camera)`
  height: 1.5rem;
  width: 1.5rem;
  color: rgb(147 51 234);
`;

const HiddenInput = styled.input`
  position: absolute;
  width: 0;
  height: 0;
  opacity: 0;
  pointer-events: none;
`;

export function FileUpload({ onFileSelect }: FileUploadProps) {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageClick = () => {
    imageInputRef.current?.click();
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file, "image");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file, "file");
    }
  };

  return (
    <UploadCard>
      <UploadGrid>
        <UploadOptionButton
          variant="ghost"
          size="sm"
          onClick={handleImageClick}
        >
          <ImageIconStyled />
          <OptionLabel>图片</OptionLabel>
        </UploadOptionButton>

        <UploadOptionButton variant="ghost" size="sm" onClick={handleFileClick}>
          <FileIconStyled />
          <OptionLabel>文件</OptionLabel>
        </UploadOptionButton>

        <UploadOptionButton variant="ghost" size="sm">
          <CameraIconStyled />
          <OptionLabel>相机</OptionLabel>
        </UploadOptionButton>
      </UploadGrid>

      <HiddenInput
        ref={imageInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageChange}
      />
      <HiddenInput ref={fileInputRef} type="file" onChange={handleFileChange} />
    </UploadCard>
  );
}
