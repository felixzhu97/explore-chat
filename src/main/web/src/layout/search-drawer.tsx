"use client";

import { X } from "lucide-react";
import { Sheet } from "@/shared/ui/sheet";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { GlobalSearchPage } from "@/search/global-search-page";
import { styled } from "@/src/shared/utils/emotion";
import { useTranslation } from "@/src/shared/i18n";

const SheetPortal = SheetPrimitive.Portal;

const SearchSheetContent = styled(SheetPrimitive.Content)`
  position: fixed;
  z-index: 50;
  top: 0;
  bottom: 0;
  left: 0;
  height: 100%;
  width: 75%;
  max-width: 24rem;
  display: flex;
  flex-direction: column;
  padding: 0;
  gap: 0;
  background-color: rgb(255 255 255);
  border-right: 1px solid rgb(239 239 239);
  box-shadow: 4px 0 24px rgb(0 0 0 / 0.08);
`;

const HiddenDescription = styled(SheetPrimitive.Description)`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
`;

const CloseBtn = styled(SheetPrimitive.Close)`
  position: absolute;
  right: 0.75rem;
  top: 0.75rem;
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 0.25rem;
  color: rgb(38 38 38);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const SheetInner = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 0;
  gap: 0;
  background-color: rgb(255 255 255);
`;

const SheetHeader = styled.div`
  padding: 1rem 2.5rem 0.75rem 1rem;
  border-bottom: 1px solid rgb(239 239 239);
  flex-shrink: 0;
`;

const A11yTitle = styled(SheetPrimitive.Title)`
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: rgb(38 38 38);
`;

const Body = styled.div`
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

interface SearchDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPostClick?: (postId: string) => void;
  onUserClick?: (userId: string) => void;
}

export function SearchDrawer({
  open,
  onOpenChange,
  onPostClick,
  onUserClick,
}: SearchDrawerProps) {
  const { t } = useTranslation();
  return (
    <Sheet modal={false} open={open} onOpenChange={onOpenChange}>
      <SheetPortal>
        <SearchSheetContent>
          <HiddenDescription>{t("search.placeholder")}</HiddenDescription>
          <CloseBtn type="button">
            <X size={18} />
            <span className="sr-only">Close</span>
          </CloseBtn>
          <SheetInner>
            <SheetHeader>
              <A11yTitle>{t("nav.search")}</A11yTitle>
            </SheetHeader>
            <Body>
              <GlobalSearchPage
                variant="drawer"
                onBack={() => onOpenChange(false)}
                onPostClick={onPostClick}
                onUserClick={onUserClick}
              />
            </Body>
          </SheetInner>
        </SearchSheetContent>
      </SheetPortal>
    </Sheet>
  );
}
