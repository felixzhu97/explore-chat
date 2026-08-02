import { styled } from "@/src/shared/utils/emotion";

export const AppShell = styled.div`
  display: flex;
  height: 100vh;
  background-color: rgb(255 255 255);
`;

export const CenterColumn = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: rgb(255 255 255);
`;

export const MessagesRow = styled.div`
  flex: 1;
  display: flex;
  min-height: 0;
`;

export const MainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
`;

export const FloatingMessagesBtn = styled.button`
  position: fixed;
  bottom: 1.5rem;
  right: calc(320px + 1.5rem);
  z-index: 40;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-radius: 24px;
  border: none;
  background-color: rgb(255 255 255);
  box-shadow: 0 2px 12px rgb(0 0 0 / 0.15);
  color: rgb(38 38 38);
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  &:hover {
    background-color: rgb(250 250 250);
  }
`;

export const FullscreenOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 50;
`;

export const ErrorToast = styled.div`
  position: fixed;
  left: 1rem;
  right: 1rem;
  bottom: 1rem;
  z-index: 50;
  border-radius: 0.5rem;
  padding: 0.75rem;
  font-size: 0.875rem;
  background-color: rgb(254 226 226);
  color: rgb(153 27 27);
`;
