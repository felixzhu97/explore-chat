import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { GlassView } from "./GlassView";
import { useTheme } from "@/shared/theme";
import { styled } from "@/shared/emotion";

export const TAB_PAGE_HEADER_HEIGHT = 56;

const HeaderGlassWrap = styled.View`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
`;

const HeaderBar = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding-vertical: 14px;
  padding-horizontal: 16px;
`;

const HeaderTitle = styled.Text`
  font-size: 22px;
  font-weight: 700;
  color: ${(p) =>
    (p.theme as { colors?: { primaryText?: string } })?.colors?.primaryText ??
    "#000"};
`;

const HeaderIcons = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 16px;
`;

const HeaderButton = styled.TouchableOpacity`
  padding: 6px;
`;

interface TabPageHeaderProps {
  title: string;
}

export function TabPageHeader({ title }: TabPageHeaderProps) {
  const { colors } = useTheme();

  return (
    <HeaderGlassWrap>
      <GlassView liquid noRadius>
        <HeaderBar>
          <HeaderTitle>{title}</HeaderTitle>
          <HeaderIcons>
            <HeaderButton onPress={() => {}}>
              <Ionicons
                name="camera-outline"
                size={24}
                color={colors.primaryText}
              />
            </HeaderButton>
            <HeaderButton onPress={() => {}}>
              <Ionicons
                name="search-outline"
                size={24}
                color={colors.primaryText}
              />
            </HeaderButton>
            <HeaderButton onPress={() => {}}>
              <Ionicons
                name="menu-outline"
                size={24}
                color={colors.primaryText}
              />
            </HeaderButton>
          </HeaderIcons>
        </HeaderBar>
      </GlassView>
    </HeaderGlassWrap>
  );
}
