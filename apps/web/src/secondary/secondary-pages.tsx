"use client";

import { CallsPage } from "@/calls/components/calls-page";
import { StatusPage } from "@/secondary/pages/status-page";
import { StarredMessagesPage } from "@/secondary/pages/starred-messages-page";
import { SettingsPage } from "@/secondary/pages/settings-page";
import { useNavigation } from "@/layout/use-navigation";
import { CenterColumn } from "@/layout/shell-styles";

export function CallsPageContainer() {
  const { handleBackToChat } = useNavigation();
  return (
    <CenterColumn style={{ overflow: "auto" }}>
      <CallsPage onBack={handleBackToChat} />
    </CenterColumn>
  );
}

export function StatusPageContainer() {
  const { handleBackToChat } = useNavigation();
  return (
    <CenterColumn style={{ overflow: "auto" }}>
      <StatusPage onBack={handleBackToChat} />
    </CenterColumn>
  );
}

export function StarredPageContainer() {
  const { handleBackToChat } = useNavigation();
  return (
    <CenterColumn style={{ overflow: "auto" }}>
      <StarredMessagesPage onBack={handleBackToChat} />
    </CenterColumn>
  );
}

export function SettingsPageContainer() {
  const { handleBackToChat, handleProfileClick } = useNavigation();
  return (
    <CenterColumn style={{ overflow: "auto" }}>
      <SettingsPage
        onBack={handleBackToChat}
        onProfileClick={handleProfileClick}
      />
    </CenterColumn>
  );
}
