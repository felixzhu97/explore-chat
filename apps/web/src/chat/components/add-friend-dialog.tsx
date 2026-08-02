"use client";

import { useState } from "react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { Textarea } from "@/shared/ui/textarea";
import {
  X,
  Search,
  UserPlus,
  QrCode,
  MapPin,
  Clock,
  Phone,
} from "lucide-react";
import { styled } from "@/src/shared/utils/emotion";

interface AddFriendDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddFriend: (friendId: string) => void;
}

const mockSearchResults = [
  {
    id: "user1",
    name: "王小明",
    avatar: "/placeholder.svg?height=40&width=40&text=王",
    phone: "+86 138 0001 0001",
    mutualFriends: 3,
  },
  {
    id: "user2",
    name: "李小红",
    avatar: "/placeholder.svg?height=40&width=40&text=李",
    phone: "+86 139 0002 0002",
    mutualFriends: 1,
  },
];

const mockNearbyUsers = [
  {
    id: "nearby1",
    name: "张三",
    avatar: "/placeholder.svg?height=40&width=40&text=张",
    distance: "50米",
  },
  {
    id: "nearby2",
    name: "李四",
    avatar: "/placeholder.svg?height=40&width=40&text=李",
    distance: "120米",
  },
];

const mockRecentContacts = [
  {
    id: "recent1",
    name: "赵五",
    avatar: "/placeholder.svg?height=40&width=40&text=赵",
    lastContact: "2天前",
  },
  {
    id: "recent2",
    name: "钱六",
    avatar: "/placeholder.svg?height=40&width=40&text=钱",
    lastContact: "1周前",
  },
];

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background-color: rgb(0 0 0 / 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
`;

const Panel = styled.div`
  background: white;
  border-radius: 1rem;
  width: 100%;
  max-width: 28rem;
  margin: 0 1rem;
  max-height: 80vh;
  overflow: hidden;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border-bottom: 1px solid rgb(229 231 235);
`;

const Title = styled.h2`
  font-size: 1.125rem;
  font-weight: 600;
  color: rgb(17 24 31);
`;

const XIcon = styled(X)`
  height: 1.25rem;
  width: 1.25rem;
`;

const Content = styled.div`
  flex: 1;
`;

const TabsListStyled = styled(TabsList)`
  display: grid;
  width: 100%;
  grid-template-columns: repeat(4, 1fr);
  margin: 0 1rem 0;
  padding-top: 0;
  padding-bottom: 0;
  height: auto;
  min-height: 3.5rem;
  background-color: transparent;
  border-bottom: 1px solid rgb(229 231 235);
  border-radius: 0;
`;

const TabsTriggerStyled = styled(TabsTrigger)`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.75rem 0.5rem;
  background-color: transparent;
  color: rgb(107 114 128);
  border-radius: 0;
  border: none;
  box-shadow: none;
  margin-bottom: -1px;

  &[data-state="active"] {
    background-color: transparent;
    color: rgb(17 24 39);
    font-weight: 600;
    box-shadow: none;
    border-bottom: 2px solid rgb(37 99 235);
  }

  &:hover:not([data-state="active"]) {
    color: rgb(55 65 81);
  }
`;

const TabLabel = styled.span`
  font-size: 0.75rem;
`;

const TabsContentStyled = styled(TabsContent)`
  margin-top: 1rem;
  padding: 0 1rem;
`;

const SearchSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const SearchRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const SearchInputRow = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ScrollSearch = styled(ScrollArea)`
  height: 16rem;
`;

const UserList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const UserRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 0.5rem;
  border: 1px solid rgb(229 231 235);
`;

const UserMain = styled.div`
  flex: 1;
`;

const UserName = styled.p`
  font-weight: 500;
  color: rgb(17 24 31);
`;

const UserMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: rgb(107 114 128);
`;

const MutualText = styled.p`
  font-size: 0.75rem;
  color: rgb(37 99 235);
`;

const AvatarMedium = styled(Avatar)`
  height: 3rem;
  width: 3rem;
`;

const AddBtn = styled(Button)`
  & svg {
    margin-right: 0.25rem;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 2rem 0;
  color: rgb(107 114 128);
`;

const EmptyIcon = styled(Search)`
  height: 3rem;
  width: 3rem;
  margin: 0 auto 0.5rem;
  opacity: 0.5;
`;

const MessageSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const CharCount = styled.p`
  font-size: 0.75rem;
  color: rgb(107 114 128);
`;

const NearbyHeader = styled.div`
  text-align: center;
  padding: 1rem 0;
`;

const MapPinIcon = styled(MapPin)`
  height: 2rem;
  width: 2rem;
  margin: 0 auto 0.5rem;
  color: rgb(59 130 246);
`;

const NearbyText = styled.p`
  font-size: 0.875rem;
  color: rgb(75 85 99);
`;

const ScrollNearby = styled(ScrollArea)`
  height: 20rem;
`;

const QrSection = styled.div`
  text-align: center;
  padding: 2rem 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const QrPlaceholder = styled.div`
  width: 12rem;
  height: 12rem;
  margin: 0 auto;
  background-color: rgb(243 244 246);
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const QrIcon = styled(QrCode)`
  height: 4rem;
  width: 4rem;
  color: rgb(156 163 175);
`;

const QrTitle = styled.p`
  font-weight: 500;
  color: rgb(17 24 31);
  margin-bottom: 0.5rem;
`;

const QrDesc = styled.p`
  font-size: 0.875rem;
  color: rgb(107 114 128);
`;

const ScanBtn = styled(Button)`
  width: 100%;
  background: transparent;
`;

const PhoneIcon = styled(Phone)`
  height: 0.75rem;
  width: 0.75rem;
`;

const UserPlusIcon = styled(UserPlus)`
  height: 1rem;
  width: 1rem;
`;

export function AddFriendDialog({
  isOpen,
  onClose,
  onAddFriend,
}: AddFriendDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<typeof mockSearchResults>(
    [],
  );
  const [isSearching, setIsSearching] = useState(false);
  const [addMessage, setAddMessage] = useState("你好，我想加你为好友");

  if (!isOpen) return null;

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setTimeout(() => {
      setSearchResults(
        mockSearchResults.filter(
          (user) =>
            user.name.includes(searchQuery) || user.phone.includes(searchQuery),
        ),
      );
      setIsSearching(false);
    }, 1000);
  };

  const handleAddFriendClick = (userId: string) => {
    onAddFriend(userId);
  };

  return (
    <Overlay>
      <Panel>
        <Header>
          <Title>添加好友</Title>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <XIcon />
          </Button>
        </Header>

        <Content>
          <Tabs defaultValue="search" style={{ width: "100%" }}>
            <TabsListStyled>
              <TabsTriggerStyled value="search">
                <Search size={16} />
                <TabLabel>搜索</TabLabel>
              </TabsTriggerStyled>
              <TabsTriggerStyled value="nearby">
                <MapPin size={16} />
                <TabLabel>附近</TabLabel>
              </TabsTriggerStyled>
              <TabsTriggerStyled value="recent">
                <Clock size={16} />
                <TabLabel>最近</TabLabel>
              </TabsTriggerStyled>
              <TabsTriggerStyled value="qr">
                <QrCode size={16} />
                <TabLabel>扫码</TabLabel>
              </TabsTriggerStyled>
            </TabsListStyled>

            <TabsContentStyled value="search">
              <SearchSection>
                <SearchRow>
                  <Label htmlFor="search">搜索用户</Label>
                  <SearchInputRow>
                    <Input
                      id="search"
                      placeholder="输入手机号或用户名"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    />
                    <Button
                      variant="secondary"
                      onClick={handleSearch}
                      disabled={isSearching}
                    >
                      {isSearching ? "搜索中..." : "搜索"}
                    </Button>
                  </SearchInputRow>
                </SearchRow>

                <ScrollSearch>
                  {searchResults.length > 0 ? (
                    <UserList>
                      {searchResults.map((user) => (
                        <UserRow key={user.id}>
                          <AvatarMedium>
                            <AvatarImage
                              src={user.avatar || "/placeholder.svg"}
                            />
                            <AvatarFallback>{user.name[0]}</AvatarFallback>
                          </AvatarMedium>
                          <UserMain>
                            <UserName>{user.name}</UserName>
                            <UserMeta>
                              <PhoneIcon />
                              <span>{user.phone}</span>
                            </UserMeta>
                            {user.mutualFriends > 0 && (
                              <MutualText>
                                {user.mutualFriends} 个共同好友
                              </MutualText>
                            )}
                          </UserMain>
                          <AddBtn
                            size="sm"
                            onClick={() => handleAddFriendClick(user.id)}
                          >
                            <UserPlusIcon />
                            添加
                          </AddBtn>
                        </UserRow>
                      ))}
                    </UserList>
                  ) : searchQuery && !isSearching ? (
                    <EmptyState>
                      <EmptyIcon />
                      <p>没有找到相关用户</p>
                    </EmptyState>
                  ) : (
                    <EmptyState>
                      <EmptyIcon />
                      <p>输入手机号或用户名搜索好友</p>
                    </EmptyState>
                  )}
                </ScrollSearch>

                <MessageSection>
                  <Label htmlFor="message">添加好友消息</Label>
                  <Textarea
                    id="message"
                    placeholder="输入验证消息"
                    value={addMessage}
                    onChange={(e) => setAddMessage(e.target.value)}
                    rows={2}
                    maxLength={100}
                  />
                  <CharCount>{addMessage.length}/100</CharCount>
                </MessageSection>
              </SearchSection>
            </TabsContentStyled>

            <TabsContentStyled value="nearby">
              <ScrollNearby>
                <NearbyHeader>
                  <MapPinIcon />
                  <NearbyText>正在搜索附近的人...</NearbyText>
                </NearbyHeader>
                <UserList>
                  {mockNearbyUsers.map((user) => (
                    <UserRow key={user.id}>
                      <AvatarMedium>
                        <AvatarImage src={user.avatar || "/placeholder.svg"} />
                        <AvatarFallback>{user.name[0]}</AvatarFallback>
                      </AvatarMedium>
                      <UserMain>
                        <UserName>{user.name}</UserName>
                        <UserMeta>
                          <MapPin size={12} />
                          <span>距离 {user.distance}</span>
                        </UserMeta>
                      </UserMain>
                      <AddBtn
                        size="sm"
                        onClick={() => handleAddFriendClick(user.id)}
                      >
                        <UserPlusIcon />
                        添加
                      </AddBtn>
                    </UserRow>
                  ))}
                </UserList>
              </ScrollNearby>
            </TabsContentStyled>

            <TabsContentStyled value="recent">
              <ScrollNearby>
                <UserList>
                  {mockRecentContacts.map((user) => (
                    <UserRow key={user.id}>
                      <AvatarMedium>
                        <AvatarImage src={user.avatar || "/placeholder.svg"} />
                        <AvatarFallback>{user.name[0]}</AvatarFallback>
                      </AvatarMedium>
                      <UserMain>
                        <UserName>{user.name}</UserName>
                        <UserMeta>
                          <Clock size={12} />
                          <span>最后联系：{user.lastContact}</span>
                        </UserMeta>
                      </UserMain>
                      <AddBtn
                        size="sm"
                        onClick={() => handleAddFriendClick(user.id)}
                      >
                        <UserPlusIcon />
                        添加
                      </AddBtn>
                    </UserRow>
                  ))}
                </UserList>
              </ScrollNearby>
            </TabsContentStyled>

            <TabsContentStyled value="qr">
              <QrSection>
                <QrPlaceholder>
                  <QrIcon />
                </QrPlaceholder>
                <div>
                  <QrTitle>我的二维码</QrTitle>
                  <QrDesc>扫描上方二维码，加我为好友</QrDesc>
                </div>
                <ScanBtn variant="outline">
                  <QrCode size={16} style={{ marginRight: "0.5rem" }} />
                  扫描二维码
                </ScanBtn>
              </QrSection>
            </TabsContentStyled>
          </Tabs>
        </Content>
      </Panel>
    </Overlay>
  );
}
