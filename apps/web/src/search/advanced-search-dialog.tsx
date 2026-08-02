"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { Calendar } from "@/shared/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import { CalendarIcon, Search, X } from "lucide-react";
import { format } from "date-fns";
import { styled } from "@/src/shared/utils/emotion";
import type { Contact } from "@/shared/types";

interface AdvancedSearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
  contacts: Contact[];
  onSearch: (filters: SearchFilters) => void;
}

interface SearchFilters {
  query: string;
  contact: string;
  messageType: string;
  dateFrom: Date | undefined;
  dateTo: Date | undefined;
  hasMedia: boolean;
}

const Content = styled(DialogContent)`
  @media (min-width: 640px) {
    max-width: 500px;
  }
`;

const TitleRow = styled(DialogTitle)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const SearchIcon = styled(Search)`
  height: 1.25rem;
  width: 1.25rem;
`;

const FormBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const DateGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
`;

const DateTriggerButton = styled(Button)<{ $empty?: boolean }>`
  width: 100%;
  justify-content: flex-start;
  text-align: left;
  font-weight: normal;
  ${(p) => p.$empty && "color: hsl(var(--muted-foreground));"}
`;

const CalendarIconStyled = styled(CalendarIcon)`
  margin-right: 0.5rem;
  height: 1rem;
  width: 1rem;
`;

const PopoverContentStyled = styled(PopoverContent)`
  width: auto;
  padding: 0;
`;

const ActionsRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding-top: 1rem;
`;

const ActionsRight = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const XIcon = styled(X)`
  margin-right: 0.5rem;
  height: 1rem;
  width: 1rem;
`;

const SearchBtnIcon = styled(Search)`
  margin-right: 0.5rem;
  height: 1rem;
  width: 1rem;
`;

export function AdvancedSearchDialog({
  isOpen,
  onClose,
  contacts = [],
  onSearch,
}: AdvancedSearchDialogProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    query: "",
    contact: "all",
    messageType: "all",
    dateFrom: undefined,
    dateTo: undefined,
    hasMedia: false,
  });

  const safeContacts = Array.isArray(contacts) ? contacts : [];

  const handleSearch = () => {
    onSearch(filters);
    onClose();
  };

  const handleReset = () => {
    setFilters({
      query: "",
      contact: "all",
      messageType: "all",
      dateFrom: undefined,
      dateTo: undefined,
      hasMedia: false,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <Content>
        <DialogHeader>
          <TitleRow>
            <SearchIcon />
            高级搜索
          </TitleRow>
        </DialogHeader>

        <FormBody>
          <FieldGroup>
            <Label htmlFor="query">搜索内容</Label>
            <Input
              id="query"
              placeholder="输入要搜索的内容..."
              value={filters.query}
              onChange={(e) =>
                setFilters({ ...filters, query: e.target.value })
              }
            />
          </FieldGroup>

          <FieldGroup>
            <Label>联系人</Label>
            <Select
              value={filters.contact}
              onValueChange={(value) =>
                setFilters({ ...filters, contact: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="选择联系人" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有联系人</SelectItem>
                {safeContacts.map((contact) => (
                  <SelectItem key={contact.id} value={contact.id}>
                    {contact.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldGroup>

          <FieldGroup>
            <Label>消息类型</Label>
            <Select
              value={filters.messageType}
              onValueChange={(value) =>
                setFilters({ ...filters, messageType: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="选择消息类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有类型</SelectItem>
                <SelectItem value="text">文本消息</SelectItem>
                <SelectItem value="image">图片</SelectItem>
                <SelectItem value="video">视频</SelectItem>
                <SelectItem value="audio">语音</SelectItem>
                <SelectItem value="file">文件</SelectItem>
              </SelectContent>
            </Select>
          </FieldGroup>

          <DateGrid>
            <FieldGroup>
              <Label>开始日期</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <DateTriggerButton
                    variant="outline"
                    $empty={!filters.dateFrom}
                  >
                    <CalendarIconStyled />
                    {filters.dateFrom
                      ? format(filters.dateFrom, "PPP")
                      : "选择日期"}
                  </DateTriggerButton>
                </PopoverTrigger>
                <PopoverContentStyled align="start">
                  <Calendar
                    mode="single"
                    selected={filters.dateFrom}
                    onSelect={(date) =>
                      setFilters({ ...filters, dateFrom: date })
                    }
                    initialFocus
                  />
                </PopoverContentStyled>
              </Popover>
            </FieldGroup>

            <FieldGroup>
              <Label>结束日期</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <DateTriggerButton variant="outline" $empty={!filters.dateTo}>
                    <CalendarIconStyled />
                    {filters.dateTo
                      ? format(filters.dateTo, "PPP")
                      : "选择日期"}
                  </DateTriggerButton>
                </PopoverTrigger>
                <PopoverContentStyled align="start">
                  <Calendar
                    mode="single"
                    selected={filters.dateTo}
                    onSelect={(date) =>
                      setFilters({ ...filters, dateTo: date })
                    }
                    initialFocus
                  />
                </PopoverContentStyled>
              </Popover>
            </FieldGroup>
          </DateGrid>

          <ActionsRow>
            <Button variant="outline" onClick={handleReset}>
              <XIcon />
              重置
            </Button>
            <ActionsRight>
              <Button variant="outline" onClick={onClose}>
                取消
              </Button>
              <Button onClick={handleSearch}>
                <SearchBtnIcon />
                搜索
              </Button>
            </ActionsRight>
          </ActionsRow>
        </FormBody>
      </Content>
    </Dialog>
  );
}
