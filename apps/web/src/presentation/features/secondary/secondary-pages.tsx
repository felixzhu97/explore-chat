"use client";

import { CallsPage } from "@/src/presentation/components/pages/calls-page";
import { StatusPage } from "@/src/presentation/components/pages/status-page";
import { StarredMessagesPage } from "@/src/presentation/components/pages/starred-messages-page";
import { SettingsPage } from "@/src/presentation/components/pages/settings-page";
import { useNavigation } from "@/src/presentation/hooks/use-navigation";
import { CenterColumn } from "../shell/shell-styles";

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
