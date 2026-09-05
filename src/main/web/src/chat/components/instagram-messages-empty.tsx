"use client";

import { Send } from "lucide-react";
import { useTranslation } from "@/src/shared/i18n";
import { styled } from "@/src/shared/utils/emotion";

const Root = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgb(255 255 255);
`;

const Center = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  max-width: 360px;
`;

const IconWrap = styled.div`
  margin-bottom: 1.5rem;
  color: rgb(38 38 38);
`;

const Title = styled.h2`
  font-size: 1.375rem;
  font-weight: 600;
  color: rgb(38 38 38);
  margin: 0 0 0.5rem;
`;

const Subtitle = styled.p`
  font-size: 0.9375rem;
  color: rgb(142 142 142);
  margin: 0 0 1.5rem;
  line-height: 1.4;
`;

const SendBtn = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 24px;
  border-radius: 8px;
  border: none;
  background: rgb(0 149 246);
  color: rgb(255 255 255);
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  &:hover {
    background: rgb(0 119 197);
  }
`;

export interface InstagramMessagesEmptyProps {
  onSendMessage?: () => void;
}

export function InstagramMessagesEmpty({
  onSendMessage,
}: InstagramMessagesEmptyProps) {
  const { t } = useTranslation();
  return (
    <Root>
      <Center>
        <IconWrap>
          <Send size={96} strokeWidth={1.25} style={{ opacity: 0.6 }} />
        </IconWrap>
        <Title>{t("dm.yourMessages")}</Title>
        <Subtitle>{t("dm.sendMessageHint")}</Subtitle>
        <SendBtn type="button" onClick={onSendMessage}>
          {t("dm.sendMessage")}
        </SendBtn>
      </Center>
    </Root>
  );
}
