import { styled, keyframes } from "@/src/shared/utils/emotion";

const shimmer = keyframes`
  0% { opacity: 0.6; }
  50% { opacity: 1; }
  100% { opacity: 0.6; }
`;

export const Skeleton = styled.div`
  border-radius: 4px;
  background-color: rgb(239 239 239);
  animation: ${shimmer} 1.2s ease-in-out infinite;
`;
