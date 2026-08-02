"use client";

import { Users } from "lucide-react";
import { styled } from "@/src/shared/utils/emotion";

const Root = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgb(249 250 251);
`;

const Center = styled.div`
  text-align: center;
`;

const IconWrap = styled.div`
  width: 16rem;
  height: 16rem;
  margin: 0 auto 2rem;
  background-color: rgb(229 231 235);
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Icon = styled(Users)`
  width: 6rem;
  height: 6rem;
  color: rgb(156 163 175);
`;

const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: rgb(17 24 39);
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  color: rgb(107 114 128);
  margin-bottom: 1rem;
`;

const Hint = styled.p`
  font-size: 0.875rem;
  color: rgb(156 163 175);
`;

export function WelcomeScreen() {
  return (
    <Root>
      <Center>
        <IconWrap>
          <Icon />
        </IconWrap>
        <Title>欢迎使用 Instagram</Title>
        <Subtitle>发送和接收消息，与好友保持联系。</Subtitle>
        <Hint>选择一个聊天开始对话</Hint>
      </Center>
    </Root>
  );
}
