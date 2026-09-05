"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import type { User } from "@/shared/types";
import type { SuggestedUser } from "@/shared/types";
import { styled } from "@/src/shared/utils/emotion";
import { useTranslation } from "@/src/shared/i18n";

const SidebarRoot = styled.aside`
  width: 320px;
  min-width: 320px;
  height: 100vh;
  padding: 1.5rem 0;
  display: flex;
  flex-direction: column;
  background-color: rgb(255 255 255);
`;

const UserCard = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0 1rem 1rem;
`;

const UserInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const Username = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: rgb(38 38 38);
`;

const DisplayName = styled.div`
  font-size: 0.75rem;
  color: rgb(142 142 142);
`;

const SwitchLink = styled.button`
  background: none;
  border: none;
  font-size: 0.75rem;
  font-weight: 600;
  color: rgb(0 149 246);
  cursor: pointer;
  flex-shrink: 0;
  &:hover {
    color: rgb(0 119 197);
  }
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 1rem;
`;

const SectionTitle = styled.span`
  font-size: 0.875rem;
  font-weight: 600;
  color: rgb(142 142 142);
`;

const SeeAllLink = styled.button`
  background: none;
  border: none;
  font-size: 0.75rem;
  font-weight: 600;
  color: rgb(38 38 38);
  cursor: pointer;
  &:hover {
    color: rgb(142 142 142);
  }
`;

const SuggestionList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0.5rem 0;
`;

const SuggestionItem = styled.li`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 1rem;
`;

const SuggestionInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const SuggestionUsername = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: rgb(38 38 38);
`;

const SuggestionDesc = styled.div`
  font-size: 0.75rem;
  color: rgb(142 142 142);
`;

const FollowBtn = styled.button`
  background: none;
  border: none;
  font-size: 0.75rem;
  font-weight: 600;
  color: rgb(0 149 246);
  cursor: pointer;
  flex-shrink: 0;
  &:hover {
    color: rgb(0 119 197);
  }
`;

const Footer = styled.footer`
  margin-top: auto;
  padding: 1rem 1rem 0;
`;

const FooterLinks = styled.div`
  font-size: 0.6875rem;
  color: rgb(199 199 199);
  line-height: 1.5;
  margin-bottom: 0.5rem;
`;

const FooterCopyright = styled.div`
  font-size: 0.6875rem;
  color: rgb(199 199 199);
`;

const AvatarButton = styled.button`
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  cursor: pointer;
  display: inline-flex;
  border-radius: 9999px;
`;

interface InstagramRightSidebarProps {
  user: User | null;
  suggestions: SuggestedUser[];
  onFollow?: (userId: string) => void;
  onUserClick?: (userId: string) => void;
}

export function InstagramRightSidebar({
  user,
  suggestions,
  onFollow,
  onUserClick,
}: InstagramRightSidebarProps) {
  const { t } = useTranslation();
  return (
    <SidebarRoot>
      <UserCard>
        <Avatar style={{ width: 56, height: 56 }}>
          <AvatarImage src={user?.avatar} />
          <AvatarFallback>{(user?.name ?? t("common.me"))[0]}</AvatarFallback>
        </Avatar>
        <UserInfo>
          <Username>{user?.username ?? "me"}</Username>
          <DisplayName>{user?.name ?? t("common.me")}</DisplayName>
        </UserInfo>
        <SwitchLink>{t("sidebar.switch")}</SwitchLink>
      </UserCard>

      <SectionHeader>
        <SectionTitle>{t("sidebar.suggestions")}</SectionTitle>
        <SeeAllLink>{t("sidebar.seeAll")}</SeeAllLink>
      </SectionHeader>
      <SuggestionList>
        {suggestions.map((s, i) => (
          <SuggestionItem key={`suggestion-${s.id}-${i}`}>
            <AvatarButton
              type="button"
              aria-label={`Open profile ${s.username}`}
              onClick={() => onUserClick?.(s.id)}
            >
              <Avatar style={{ width: 32, height: 32 }}>
                <AvatarImage src={s.avatar || undefined} />
                <AvatarFallback>{s.username[0]}</AvatarFallback>
              </Avatar>
            </AvatarButton>
            <SuggestionInfo>
              <SuggestionUsername>{s.username}</SuggestionUsername>
              <SuggestionDesc>{s.description}</SuggestionDesc>
            </SuggestionInfo>
            <FollowBtn type="button" onClick={() => onFollow?.(s.id)}>
              {t("sidebar.follow")}
            </FollowBtn>
          </SuggestionItem>
        ))}
      </SuggestionList>

      <Footer>
        <FooterLinks>{t("sidebar.footerLinks")}</FooterLinks>
        <FooterCopyright>{t("sidebar.copyright")}</FooterCopyright>
      </Footer>
    </SidebarRoot>
  );
}
