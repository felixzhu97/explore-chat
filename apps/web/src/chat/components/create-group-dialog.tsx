"use client";

import { useState } from "react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Checkbox } from "@/shared/ui/checkbox";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { Textarea } from "@/shared/ui/textarea";
import { X, Search, Users, Camera, ArrowLeft, ArrowRight } from "lucide-react";
import { styled } from "@/src/shared/utils/emotion";
import type { Contact } from "@/shared/types";

interface CreateGroupDialogProps {
  isOpen: boolean;
  onClose: () => void;
  contacts: Contact[];
  onCreateGroup: (name: string, selectedMembers: Contact[]) => void;
}

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

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
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

const ArrowLeftIcon = styled(ArrowLeft)`
  height: 1.25rem;
  width: 1.25rem;
`;

const Section = styled.div`
  padding: 1rem;
  border-bottom: 1px solid rgb(229 231 235);
`;

const SearchWrap = styled.div`
  position: relative;
`;

const SearchIcon = styled(Search)`
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  height: 1rem;
  width: 1rem;
  color: rgb(156 163 175);
`;

const SearchInput = styled(Input)`
  padding-left: 2.5rem;
`;

const SelectedHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
`;

const UsersIcon = styled(Users)`
  height: 1rem;
  width: 1rem;
  color: rgb(107 114 128);
`;

const SelectedLabel = styled.span`
  font-size: 0.875rem;
  color: rgb(107 114 128);
`;

const Chips = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const ChipBlue = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: rgb(219 234 254);
  color: rgb(30 64 175);
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.875rem;
`;

const ChipGray = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: rgb(229 231 235);
  color: rgb(31 41 55);
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.875rem;
`;

const ChipAvatar = styled(Avatar)`
  height: 1.25rem;
  width: 1.25rem;
`;

const ChipFallback = styled(AvatarFallback)`
  font-size: 0.75rem;
`;

const ChipRemoveBtn = styled(Button)`
  height: 1rem;
  width: 1rem;
  padding: 0;

  &:hover {
    background-color: rgb(191 219 254);
  }
`;

const XSmall = styled(X)`
  height: 0.75rem;
  width: 0.75rem;
`;

const ListArea = styled(ScrollArea)`
  flex: 1;
  max-height: 24rem;
`;

const ListInner = styled.div`
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const ContactRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem;
  border-radius: 0.5rem;
  cursor: pointer;

  &:hover {
    background-color: rgb(249 250 251);
  }
`;

const ContactMain = styled.div`
  flex: 1;
`;

const ContactName = styled.p`
  font-weight: 500;
  color: rgb(17 24 31);
`;

const ContactPhone = styled.p`
  font-size: 0.875rem;
  color: rgb(107 114 128);
`;

const AvatarMedium = styled(Avatar)`
  height: 2.5rem;
  width: 2.5rem;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 2rem 0;
  color: rgb(107 114 128);
`;

const EmptyUsersIcon = styled(Users)`
  height: 3rem;
  width: 3rem;
  margin: 0 auto 0.5rem;
  opacity: 0.5;
`;

const Footer = styled.div`
  padding: 1rem;
  border-top: 1px solid rgb(229 231 235);
`;

const FullWidthBtn = styled(Button)`
  width: 100%;
`;

const ArrowRightIcon = styled(ArrowRight)`
  height: 1rem;
  width: 1rem;
  margin-left: 0.5rem;
`;

const FormArea = styled(ScrollArea)`
  flex: 1;
  max-height: 24rem;
`;

const FormInner = styled.div`
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const AvatarSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
`;

const AvatarWrap = styled.div`
  position: relative;
`;

const AvatarLarge = styled(Avatar)`
  height: 5rem;
  width: 5rem;
`;

const FallbackLarge = styled(AvatarFallback)`
  font-size: 1.5rem;
  background-color: rgb(219 234 254);
  color: rgb(37 99 235);
`;

const CameraBtn = styled(Button)`
  position: absolute;
  bottom: -0.25rem;
  right: -0.25rem;
  height: 2rem;
  width: 2rem;
  border-radius: 9999px;
  background: transparent;
`;

const CameraIcon = styled(Camera)`
  height: 1rem;
  width: 1rem;
`;

const AvatarHint = styled.p`
  font-size: 0.875rem;
  color: rgb(107 114 128);
`;

const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const CharCount = styled.p`
  font-size: 0.75rem;
  color: rgb(107 114 128);
`;

const MembersSummary = styled.div`
  background-color: rgb(249 250 251);
  border-radius: 0.5rem;
  padding: 0.75rem;
`;

const FooterRow = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const OutlineBtn = styled(Button)`
  flex: 1;
  background: transparent;
`;

export function CreateGroupDialog({
  isOpen,
  onClose,
  contacts,
  onCreateGroup,
}: CreateGroupDialogProps) {
  const [step, setStep] = useState<"select" | "info">("select");
  const [selectedMembers, setSelectedMembers] = useState<Contact[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [groupAvatar, setGroupAvatar] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredContacts = contacts.filter((contact) =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleMemberToggle = (contact: Contact) => {
    setSelectedMembers((prev) => {
      const isSelected = prev.some((member) => member.id === contact.id);
      if (isSelected) {
        return prev.filter((member) => member.id !== contact.id);
      }
      return [...prev, contact];
    });
  };

  const handleNext = () => {
    if (selectedMembers.length > 0) setStep("info");
  };

  const handleBack = () => setStep("select");

  const handleCreate = () => {
    if (groupName.trim()) {
      onCreateGroup(groupName.trim(), selectedMembers);
      setStep("select");
      setSelectedMembers([]);
      setSearchQuery("");
      setGroupName("");
      setGroupDescription("");
      setGroupAvatar(null);
    }
  };

  const handleClose = () => {
    setStep("select");
    setSelectedMembers([]);
    setSearchQuery("");
    setGroupName("");
    setGroupDescription("");
    setGroupAvatar(null);
    onClose();
  };

  return (
    <Overlay>
      <Panel>
        <Header>
          <HeaderLeft>
            {step === "info" && (
              <Button variant="ghost" size="icon" onClick={handleBack}>
                <ArrowLeftIcon />
              </Button>
            )}
            <Title>{step === "select" ? "选择群成员" : "群组信息"}</Title>
          </HeaderLeft>
          <Button variant="ghost" size="icon" onClick={handleClose}>
            <XIcon />
          </Button>
        </Header>

        {step === "select" ? (
          <>
            <Section>
              <SearchWrap>
                <SearchIcon />
                <SearchInput
                  placeholder="搜索联系人..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </SearchWrap>
            </Section>

            {selectedMembers.length > 0 && (
              <Section>
                <SelectedHeader>
                  <UsersIcon />
                  <SelectedLabel>
                    已选择 {selectedMembers.length} 人
                  </SelectedLabel>
                </SelectedHeader>
                <Chips>
                  {selectedMembers.map((member) => (
                    <ChipBlue key={member.id}>
                      <ChipAvatar>
                        <AvatarImage
                          src={member.avatar || "/placeholder.svg"}
                        />
                        <ChipFallback>{member.name[0]}</ChipFallback>
                      </ChipAvatar>
                      <span>{member.name}</span>
                      <ChipRemoveBtn
                        variant="ghost"
                        size="icon"
                        onClick={() => handleMemberToggle(member)}
                      >
                        <XSmall />
                      </ChipRemoveBtn>
                    </ChipBlue>
                  ))}
                </Chips>
              </Section>
            )}

            <ListArea>
              <ListInner>
                {filteredContacts.map((contact) => (
                  <ContactRow
                    key={contact.id}
                    onClick={() => handleMemberToggle(contact)}
                  >
                    <Checkbox
                      checked={selectedMembers.some((m) => m.id === contact.id)}
                      onChange={() => {}}
                    />
                    <AvatarMedium>
                      <AvatarImage src={contact.avatar || "/placeholder.svg"} />
                      <AvatarFallback>{contact.name[0]}</AvatarFallback>
                    </AvatarMedium>
                    <ContactMain>
                      <ContactName>{contact.name}</ContactName>
                      <ContactPhone>{contact.phone}</ContactPhone>
                    </ContactMain>
                  </ContactRow>
                ))}
                {filteredContacts.length === 0 && (
                  <EmptyState>
                    <EmptyUsersIcon />
                    <p>没有找到联系人</p>
                  </EmptyState>
                )}
              </ListInner>
            </ListArea>

            <Footer>
              <FullWidthBtn
                onClick={handleNext}
                disabled={selectedMembers.length === 0}
              >
                下一步 ({selectedMembers.length})
                <ArrowRightIcon />
              </FullWidthBtn>
            </Footer>
          </>
        ) : (
          <>
            <FormArea>
              <FormInner>
                <AvatarSection>
                  <AvatarWrap>
                    <AvatarLarge>
                      <AvatarImage src={groupAvatar || ""} />
                      <FallbackLarge>
                        <Users size={32} />
                      </FallbackLarge>
                    </AvatarLarge>
                    <CameraBtn variant="outline" size="icon">
                      <CameraIcon />
                    </CameraBtn>
                  </AvatarWrap>
                  <AvatarHint>点击添加群头像</AvatarHint>
                </AvatarSection>

                <FieldGroup>
                  <Label htmlFor="groupName">群组名称 *</Label>
                  <Input
                    id="groupName"
                    placeholder="输入群组名称"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    maxLength={50}
                  />
                  <CharCount>{groupName.length}/50</CharCount>
                </FieldGroup>

                <FieldGroup>
                  <Label htmlFor="groupDescription">群组描述</Label>
                  <Textarea
                    id="groupDescription"
                    placeholder="输入群组描述（可选）"
                    value={groupDescription}
                    onChange={(e) => setGroupDescription(e.target.value)}
                    maxLength={200}
                    rows={3}
                  />
                  <CharCount>{groupDescription.length}/200</CharCount>
                </FieldGroup>

                <FieldGroup>
                  <Label>群成员 ({selectedMembers.length + 1})</Label>
                  <MembersSummary>
                    <Chips>
                      <ChipBlue>
                        <ChipAvatar>
                          <ChipFallback>我</ChipFallback>
                        </ChipAvatar>
                        <span>我（群主）</span>
                      </ChipBlue>
                      {selectedMembers.map((member) => (
                        <ChipGray key={member.id}>
                          <ChipAvatar>
                            <AvatarImage
                              src={member.avatar || "/placeholder.svg"}
                            />
                            <ChipFallback>{member.name[0]}</ChipFallback>
                          </ChipAvatar>
                          <span>{member.name}</span>
                        </ChipGray>
                      ))}
                    </Chips>
                  </MembersSummary>
                </FieldGroup>
              </FormInner>
            </FormArea>

            <Footer>
              <FooterRow>
                <OutlineBtn variant="outline" onClick={handleBack}>
                  返回
                </OutlineBtn>
                <FullWidthBtn
                  onClick={handleCreate}
                  disabled={!groupName.trim()}
                >
                  创建群组
                </FullWidthBtn>
              </FooterRow>
            </Footer>
          </>
        )}
      </Panel>
    </Overlay>
  );
}
