import React, { useState } from "react";
import { Modal, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { styled } from "@/shared/emotion";
import { useTheme } from "@/shared/theme";
import { useTranslation } from "@/shared/i18n";

interface ChatInputFieldProps {
  value: string;
  onChangeText: (text: string) => void;
  onSend: (text: string) => void;
  onAttachmentPress?: () => void;
  onCameraPress?: () => void;
}

const Bar = styled.View`
  flex-direction: row;
  align-items: center;
  padding: 6px 10px 10px;
  background-color: transparent;
`;

const AttachmentSheet = styled.View`
  background-color: ${(p) => p.theme.colors.secondaryBackground};
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  padding-top: 20px;
  padding-bottom: 24px;
  padding-horizontal: 16px;
`;

const AttachmentGrid = styled.View`
  flex-direction: row;
  justify-content: space-between;
`;

const AttachmentItem = styled.TouchableOpacity`
  align-items: center;
  min-width: 72px;
`;

const AttachmentIconWrap = styled.View<{ bg?: string }>`
  width: 56px;
  height: 56px;
  border-radius: 28px;
  justify-content: center;
  align-items: center;
  margin-bottom: 8px;
  background-color: ${(p) => p.bg ?? "transparent"};
`;

const ModalContainer = styled.View`
  flex: 1;
  justify-content: flex-end;
`;

const ModalBackdrop = styled(Pressable)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.4);
`;

const ModalSheetWrap = styled.View``;

const AttachmentLabel = styled.Text`
  font-size: 13px;
  color: ${(p) => p.theme.colors.secondaryText};
`;

const Pill = styled.View`
  flex: 1;
  flex-direction: row;
  align-items: center;
  min-height: 40px;
  max-height: 100px;
  border-radius: 24px;
  padding-left: 12px;
  padding-right: 8px;
  padding-vertical: 8px;
  margin-right: 8px;
  background-color: #ffffff;
  shadow-color: #000;
  shadow-offset: 0 1px;
  shadow-opacity: 0.08;
  shadow-radius: 4px;
  elevation: 2;
`;

const Input = styled.TextInput`
  flex: 1;
  font-size: 16px;
  padding: 0;
  padding-horizontal: 8px;
  color: ${(p) => p.theme.colors.primaryText};
`;

const InPillIcon = styled.TouchableOpacity`
  width: 36px;
  height: 36px;
  justify-content: center;
  align-items: center;
`;

const VoiceButton = styled.TouchableOpacity`
  width: 40px;
  height: 40px;
  border-radius: 20px;
  justify-content: center;
  align-items: center;
  background-color: ${(p) => p.theme.colors.primaryGreen};
`;

const ATTACHMENT_OPTIONS = [
  {
    key: "camera",
    icon: "camera" as const,
    labelKey: "chatDetail.camera",
    colorKey: "iosBlue",
  },
  {
    key: "gallery",
    icon: "images" as const,
    labelKey: "chatDetail.gallery",
    colorKey: "iosGreen",
  },
  {
    key: "document",
    icon: "document" as const,
    labelKey: "chatDetail.document",
    colorKey: "iosPurple",
  },
  {
    key: "location",
    icon: "location" as const,
    labelKey: "chatDetail.location",
    colorKey: "iosRed",
  },
];

export const ChatInputField: React.FC<ChatInputFieldProps> = ({
  value,
  onChangeText,
  onSend,
  onCameraPress,
}) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);

  const handleSend = () => {
    const text = value.trim();
    if (text) {
      onSend(text);
      onChangeText("");
    }
  };

  const closeAttachmentMenu = () => setShowAttachmentMenu(false);

  return (
    <>
      <Modal
        visible={showAttachmentMenu}
        transparent
        animationType="slide"
        onRequestClose={closeAttachmentMenu}
      >
        <ModalContainer>
          <ModalBackdrop onPress={closeAttachmentMenu} />
          <ModalSheetWrap>
            <AttachmentSheet>
              <AttachmentGrid>
                {ATTACHMENT_OPTIONS.map((opt) => (
                  <AttachmentItem key={opt.key} onPress={() => {}}>
                    <AttachmentIconWrap
                      bg={
                        (colors as unknown as Record<string, string>)[
                          opt.colorKey
                        ]
                      }
                    >
                      <Ionicons name={opt.icon} size={26} color="#FFFFFF" />
                    </AttachmentIconWrap>
                    <AttachmentLabel>{t(opt.labelKey)}</AttachmentLabel>
                  </AttachmentItem>
                ))}
              </AttachmentGrid>
            </AttachmentSheet>
          </ModalSheetWrap>
        </ModalContainer>
      </Modal>
      <Bar>
        <Pill>
          <InPillIcon onPress={() => {}}>
            <Ionicons
              name="happy-outline"
              size={24}
              color={colors.secondaryText}
            />
          </InPillIcon>
          <Input
            value={value}
            onChangeText={onChangeText}
            placeholder={t("chatDetail.messagePlaceholder")}
            placeholderTextColor="#8E8E93"
            multiline
            maxLength={1000}
            onSubmitEditing={handleSend}
          />
          <InPillIcon
            onPress={() => setShowAttachmentMenu(!showAttachmentMenu)}
          >
            <Ionicons
              name="images-outline"
              size={22}
              color={colors.secondaryText}
            />
          </InPillIcon>
          <InPillIcon onPress={onCameraPress ?? (() => {})}>
            <Ionicons
              name="camera-outline"
              size={22}
              color={colors.secondaryText}
            />
          </InPillIcon>
        </Pill>
        <VoiceButton
          onPress={value.trim() ? handleSend : () => {}}
          disabled={!value.trim()}
        >
          <Ionicons
            name={value.trim() ? "paper-plane" : "mic"}
            size={22}
            color="#FFFFFF"
          />
        </VoiceButton>
      </Bar>
    </>
  );
};
