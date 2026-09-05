"use client";

import { useState } from "react";
import { ArrowLeft, Plus, MoreVertical } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Button } from "@/shared/ui/button";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { styled } from "@/src/shared/utils/emotion";
import { useAuth } from "@/auth/use-auth";

interface Status {
  id: string;
  name: string;
  avatar: string;
  timestamp: Date;
  viewed: boolean;
  isOwn?: boolean;
}

interface StatusPageProps {
  onBack: () => void;
}

const PageRoot = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: white;
`;

const Header = styled.div`
  background-color: #16a34a;
  color: white;
  padding: 1rem;
`;

const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const BackBtn = styled(Button)`
  color: white;

  &:hover {
    background-color: #15803d;
  }
`;

const Title = styled.h1`
  font-size: 1.25rem;
  font-weight: 500;
`;

const ArrowIcon = styled(ArrowLeft)`
  height: 1.25rem;
  width: 1.25rem;
`;

const Body = styled(ScrollArea)`
  flex: 1;
`;

const Inner = styled.div`
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const StatusRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 0.5rem;
  cursor: pointer;

  &:hover {
    background-color: rgb(249 250 251);
  }
`;

const StatusRowViewed = styled(StatusRow)`
  opacity: 0.6;
`;

const AvatarWrap = styled.div`
  position: relative;
`;

const AvatarMedium = styled(Avatar)`
  height: 3.5rem;
  width: 3.5rem;
`;

const PlusBtn = styled(Button)`
  position: absolute;
  bottom: -0.25rem;
  right: -0.25rem;
  height: 1.5rem;
  width: 1.5rem;
  border-radius: 9999px;
  background-color: #22c55e;

  &:hover {
    background-color: #16a34a;
  }
`;

const PlusIcon = styled(Plus)`
  height: 0.75rem;
  width: 0.75rem;
`;

const StatusInfo = styled.div`
  flex: 1;
`;

const StatusName = styled.h3`
  font-weight: 500;
  color: rgb(17 24 31);
`;

const StatusTime = styled.p`
  font-size: 0.875rem;
  color: rgb(75 85 99);
`;

const RingGreen = styled.div`
  position: absolute;
  inset: 0;
  border-radius: 9999px;
  border: 2px solid #22c55e;
`;

const RingGray = styled.div`
  position: absolute;
  inset: 0;
  border-radius: 9999px;
  border: 2px solid rgb(209 213 219);
`;

const SectionTitle = styled.h2`
  font-size: 0.875rem;
  font-weight: 500;
  color: rgb(75 85 99);
  margin-bottom: 0.75rem;
  padding-left: 0.75rem;
`;

const SectionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

export function StatusPage({ onBack }: StatusPageProps) {
  const { user } = useAuth();

  const [statuses] = useState<Status[]>([
    {
      id: "own",
      name: "我的状态",
      avatar: user?.avatar || "/placeholder.svg?height=40&width=40&text=我",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      viewed: true,
      isOwn: true,
    },
    {
      id: "1",
      name: "张三",
      avatar: "/placeholder.svg?height=40&width=40&text=张",
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      viewed: false,
    },
    {
      id: "2",
      name: "李四",
      avatar: "/placeholder.svg?height=40&width=40&text=李",
      timestamp: new Date(Date.now() - 1000 * 60 * 60),
      viewed: true,
    },
    {
      id: "3",
      name: "王五",
      avatar: "/placeholder.svg?height=40&width=40&text=王",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3),
      viewed: false,
    },
  ]);

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - timestamp.getTime()) / (1000 * 60 * 60),
    );

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(
        (now.getTime() - timestamp.getTime()) / (1000 * 60),
      );
      return `${diffInMinutes}分钟前`;
    } else if (diffInHours < 24) {
      return `${diffInHours}小时前`;
    } else {
      return timestamp.toLocaleDateString();
    }
  };

  const recentStatuses = statuses.filter((s) => !s.isOwn && !s.viewed);
  const viewedStatuses = statuses.filter((s) => !s.isOwn && s.viewed);
  const myStatus = statuses.find((s) => s.isOwn);

  return (
    <PageRoot>
      <Header>
        <HeaderRow>
          <BackBtn variant="ghost" size="icon" onClick={onBack}>
            <ArrowIcon />
          </BackBtn>
          <Title>状态</Title>
        </HeaderRow>
      </Header>

      <Body>
        <Inner>
          {myStatus && (
            <div>
              <StatusRow>
                <AvatarWrap>
                  <AvatarMedium>
                    <AvatarImage src={myStatus.avatar || "/placeholder.svg"} />
                    <AvatarFallback>{myStatus.name[0]}</AvatarFallback>
                  </AvatarMedium>
                  <PlusBtn size="icon">
                    <PlusIcon />
                  </PlusBtn>
                </AvatarWrap>
                <StatusInfo>
                  <StatusName>{myStatus.name}</StatusName>
                  <StatusTime>{formatTimestamp(myStatus.timestamp)}</StatusTime>
                </StatusInfo>
                <Button variant="ghost" size="icon">
                  <MoreVertical size={16} />
                </Button>
              </StatusRow>
            </div>
          )}

          {recentStatuses.length > 0 && (
            <div>
              <SectionTitle>最近更新</SectionTitle>
              <SectionList>
                {recentStatuses.map((status) => (
                  <StatusRow key={status.id}>
                    <AvatarWrap>
                      <AvatarMedium>
                        <AvatarImage
                          src={status.avatar || "/placeholder.svg"}
                        />
                        <AvatarFallback>{status.name[0]}</AvatarFallback>
                      </AvatarMedium>
                      <RingGreen />
                    </AvatarWrap>
                    <StatusInfo>
                      <StatusName>{status.name}</StatusName>
                      <StatusTime>
                        {formatTimestamp(status.timestamp)}
                      </StatusTime>
                    </StatusInfo>
                  </StatusRow>
                ))}
              </SectionList>
            </div>
          )}

          {viewedStatuses.length > 0 && (
            <div>
              <SectionTitle>已查看</SectionTitle>
              <SectionList>
                {viewedStatuses.map((status) => (
                  <StatusRowViewed key={status.id}>
                    <AvatarWrap>
                      <AvatarMedium>
                        <AvatarImage
                          src={status.avatar || "/placeholder.svg"}
                        />
                        <AvatarFallback>{status.name[0]}</AvatarFallback>
                      </AvatarMedium>
                      <RingGray />
                    </AvatarWrap>
                    <StatusInfo>
                      <StatusName>{status.name}</StatusName>
                      <StatusTime>
                        {formatTimestamp(status.timestamp)}
                      </StatusTime>
                    </StatusInfo>
                  </StatusRowViewed>
                ))}
              </SectionList>
            </div>
          )}
        </Inner>
      </Body>
    </PageRoot>
  );
}
