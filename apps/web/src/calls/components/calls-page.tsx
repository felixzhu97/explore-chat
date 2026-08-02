"use client";

import { useState } from "react";
import {
  ArrowLeft,
  Phone,
  Video,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Button } from "@/shared/ui/button";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { Badge } from "@/shared/ui/badge";
import { styled } from "@/src/shared/utils/emotion";

interface CallRecord {
  id: string;
  name: string;
  avatar: string;
  type: "incoming" | "outgoing" | "missed";
  callType: "voice" | "video";
  timestamp: Date;
  duration?: number;
}

interface CallsPageProps {
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

const ListArea = styled(ScrollArea)`
  flex: 1;
`;

const ListInner = styled.div`
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const RecordRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 0.5rem;

  &:hover {
    background-color: rgb(249 250 251);
  }
`;

const AvatarSized = styled(Avatar)`
  height: 3rem;
  width: 3rem;
`;

const RecordMain = styled.div`
  flex: 1;
  min-width: 0;
`;

const RecordTop = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const RecordName = styled.h3`
  font-weight: 500;
  color: rgb(17 24 31);
`;

const RecordMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: rgb(75 85 99);
`;

const IconMissed = styled(PhoneMissed)`
  height: 1rem;
  width: 1rem;
  color: rgb(239 68 68);
`;

const IconIncoming = styled(PhoneIncoming)`
  height: 1rem;
  width: 1rem;
  color: #22c55e;
`;

const IconOutgoing = styled(PhoneOutgoing)`
  height: 1rem;
  width: 1rem;
  color: #3b82f6;
`;

const ActionBtns = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const GreenIconBtn = styled(Button)`
  color: #16a34a;

  &:hover {
    background-color: rgb(240 253 244);
  }
`;

const PhoneIcon = styled(Phone)`
  height: 1rem;
  width: 1rem;
`;

const VideoIcon = styled(Video)`
  height: 1rem;
  width: 1rem;
`;

const MissedBadge = styled(Badge)`
  font-size: 0.75rem;
`;

export function CallsPage({ onBack }: CallsPageProps) {
  const [callRecords] = useState<CallRecord[]>([
    {
      id: "1",
      name: "张三",
      avatar: "/placeholder.svg?height=40&width=40&text=张",
      type: "outgoing",
      callType: "video",
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      duration: 1200,
    },
    {
      id: "2",
      name: "李四",
      avatar: "/placeholder.svg?height=40&width=40&text=李",
      type: "incoming",
      callType: "voice",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      duration: 300,
    },
    {
      id: "3",
      name: "王五",
      avatar: "/placeholder.svg?height=40&width=40&text=王",
      type: "missed",
      callType: "voice",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
    },
    {
      id: "4",
      name: "赵六",
      avatar: "/placeholder.svg?height=40&width=40&text=赵",
      type: "outgoing",
      callType: "voice",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
      duration: 600,
    },
  ]);

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

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

  const getCallIcon = (record: CallRecord) => {
    if (record.type === "missed") {
      return <IconMissed />;
    } else if (record.type === "incoming") {
      return <IconIncoming />;
    } else {
      return <IconOutgoing />;
    }
  };

  return (
    <PageRoot>
      <Header>
        <HeaderRow>
          <BackBtn variant="ghost" size="icon" onClick={onBack}>
            <ArrowIcon />
          </BackBtn>
          <Title>通话</Title>
        </HeaderRow>
      </Header>

      <ListArea>
        <ListInner>
          {callRecords.map((record) => (
            <RecordRow key={record.id}>
              <AvatarSized>
                <AvatarImage src={record.avatar || "/placeholder.svg"} />
                <AvatarFallback>{record.name[0]}</AvatarFallback>
              </AvatarSized>

              <RecordMain>
                <RecordTop>
                  <RecordName>{record.name}</RecordName>
                  {record.type === "missed" && (
                    <MissedBadge variant="destructive">未接</MissedBadge>
                  )}
                </RecordTop>
                <RecordMeta>
                  {getCallIcon(record)}
                  <span>{formatTimestamp(record.timestamp)}</span>
                  {record.duration && (
                    <>
                      <span>•</span>
                      <span>{formatDuration(record.duration)}</span>
                    </>
                  )}
                </RecordMeta>
              </RecordMain>

              <ActionBtns>
                <GreenIconBtn variant="ghost" size="icon">
                  <PhoneIcon />
                </GreenIconBtn>
                <GreenIconBtn variant="ghost" size="icon">
                  <VideoIcon />
                </GreenIconBtn>
              </ActionBtns>
            </RecordRow>
          ))}
        </ListInner>
      </ListArea>
    </PageRoot>
  );
}
