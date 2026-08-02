import { styled, keyframes } from "@/src/shared/utils/emotion";

const INSTAGRAM_SPINNER_COLOR = "rgb(142 142 142)";

const spin = keyframes`
  to {
    transform: rotate(360deg);
  }
`;

export const InstagramSpinnerRing = styled.div<{ $size?: number }>`
  width: ${(p) => p.$size ?? 24}px;
  height: ${(p) => p.$size ?? 24}px;
  border-radius: 50%;
  border: 2px solid rgb(239 239 239);
  border-top-color: ${INSTAGRAM_SPINNER_COLOR};
  animation: ${spin} 0.8s linear infinite;
`;

export const InstagramSpinnerWrap = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
`;

export const InstagramSpinnerText = styled.span`
  font-size: 14px;
  color: ${INSTAGRAM_SPINNER_COLOR};
`;
