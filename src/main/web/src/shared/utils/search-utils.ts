"use client";

import React from "react";
import orderBy from "lodash/orderBy";
import uniq from "lodash/uniq";

import type { Message, Contact } from "../types";

export interface SearchOptions {
  query: string;
  messageTypes?: string[];
  contacts?: string[];
  dateRange?: { from: Date; to: Date };
  sender?: string;
  hasMedia?: boolean;
  isStarred?: boolean;
  caseSensitive?: boolean;
  wholeWords?: boolean;
}

export interface SearchResult {
  message: Message;
  contact: Contact;
  matchType: "content" | "sender" | "file" | "contact";
  highlightText: string;
  relevanceScore: number;
}

export class MessageSearchEngine {
  private static instance: MessageSearchEngine;
  private searchHistory: string[] = [];

  static getInstance(): MessageSearchEngine {
    if (!MessageSearchEngine.instance) {
      MessageSearchEngine.instance = new MessageSearchEngine();
    }
    return MessageSearchEngine.instance;
  }

  constructor() {
    this.loadSearchHistory();
  }

  private loadSearchHistory() {
    try {
      this.searchHistory = JSON.parse(
        localStorage.getItem("searchHistory") || "[]"
      );
    } catch {
      this.searchHistory = [];
    }
  }

  private saveSearchHistory() {
    localStorage.setItem("searchHistory", JSON.stringify(this.searchHistory));
  }

  addToHistory(query: string) {
    if (!query.trim()) return;
    this.searchHistory = uniq([query, ...this.searchHistory]).slice(0, 20);
    this.saveSearchHistory();
  }

  getSearchHistory(): string[] {
    return this.searchHistory;
  }

  clearSearchHistory() {
    this.searchHistory = [];
    localStorage.removeItem("searchHistory");
  }

  search(
    allMessagesData: { contactId: string; messages: Message[] }[],
    contacts: Contact[],
    options: SearchOptions
  ): SearchResult[] {
    const {
      query,
      messageTypes,
      contacts: contactFilter,
      dateRange,
      sender,
      hasMedia,
      isStarred,
    } = options;

    if (!query.trim()) return [];

    const results: SearchResult[] = [];
    const searchTerms = this.parseSearchQuery(query);

    allMessagesData.forEach(({ contactId, messages }) => {
      const contact = contacts.find((c) => c.id === contactId);
      if (!contact) return;

      // 应用联系人过滤器
      if (
        contactFilter &&
        contactFilter.length > 0 &&
        !contactFilter.includes(contactId)
      ) {
        return;
      }

      messages.forEach((message) => {
        // 应用各种过滤器
        if (
          !this.passesFilters(message, {
            messageTypes,
            dateRange,
            sender,
            hasMedia,
            isStarred,
          })
        ) {
          return;
        }

        // 搜索匹配
        const matches = this.findMatches(
          message,
          contact,
          searchTerms,
          options
        );
        results.push(...matches);
      });
    });

    // 按相关性排序
    return orderBy(results, ["relevanceScore"], ["desc"]);
  }

  private parseSearchQuery(query: string): string[] {
    // 解析搜索查询，支持引号、AND/OR操作符等
    const terms: string[] = [];
    const regex = /"([^"]+)"|(\S+)/g;
    let match;

    while ((match = regex.exec(query)) !== null) {
      terms.push(match[1] || match[2]);
    }

    return terms.filter((term) => term.length > 0);
  }

  private passesFilters(
    message: Message,
    filters: {
      messageTypes?: string[];
      dateRange?: { from: Date; to: Date };
      sender?: string;
      hasMedia?: boolean;
      isStarred?: boolean;
    }
  ): boolean {
    const { messageTypes, dateRange, sender, hasMedia, isStarred } = filters;

    // 消息类型过滤
    if (
      messageTypes &&
      messageTypes.length > 0 &&
      !messageTypes.includes(message.type)
    ) {
      return false;
    }

    // 日期范围过滤
    if (dateRange) {
      if (message.timestamp == null) {
        return false;
      }
      const messageDate = new Date(message.timestamp);
      if (messageDate < dateRange.from || messageDate > dateRange.to) {
        return false;
      }
    }

    // 发送者过滤
    if (
      sender &&
      message.senderName &&
      !message.senderName.toLowerCase().includes(sender.toLowerCase())
    ) {
      return false;
    }

    // 媒体文件过滤
    if (hasMedia && !["image", "file", "voice"].includes(message.type)) {
      return false;
    }

    // 星标消息过滤
    if (isStarred && !message.isStarred) {
      return false;
    }

    return true;
  }

  private findMatches(
    message: Message,
    contact: Contact,
    searchTerms: string[],
    options: SearchOptions
  ): SearchResult[] {
    const matches: SearchResult[] = [];
    const { caseSensitive = false, wholeWords = false } = options;

    searchTerms.forEach((term) => {
      const searchTerm = caseSensitive ? term : term.toLowerCase();

      // 搜索消息内容
      if (message.content) {
        const text = caseSensitive
          ? message.content
          : message.content.toLowerCase();
        if (this.textMatches(text, searchTerm, wholeWords)) {
          matches.push({
            message,
            contact,
            matchType: "content",
            highlightText: message.content,
            relevanceScore: this.calculateRelevanceScore(
              message.content,
              term,
              "content"
            ),
          });
        }
      }

      // 搜索文件名
      if (message.fileName) {
        const fileName = caseSensitive
          ? message.fileName
          : message.fileName.toLowerCase();
        if (this.textMatches(fileName, searchTerm, wholeWords)) {
          matches.push({
            message,
            contact,
            matchType: "file",
            highlightText: message.fileName,
            relevanceScore: this.calculateRelevanceScore(
              message.fileName,
              term,
              "file"
            ),
          });
        }
      }

      // 搜索发送者
      if (message.senderName) {
        const senderName = caseSensitive
          ? message.senderName
          : message.senderName.toLowerCase();
        if (this.textMatches(senderName, searchTerm, wholeWords)) {
          matches.push({
            message,
            contact,
            matchType: "sender",
            highlightText: message.senderName,
            relevanceScore: this.calculateRelevanceScore(
              message.senderName,
              term,
              "sender"
            ),
          });
        }
      }

      // 搜索联系人名称
      const contactName = caseSensitive
        ? contact.name
        : contact.name.toLowerCase();
      if (this.textMatches(contactName, searchTerm, wholeWords)) {
        matches.push({
          message,
          contact,
          matchType: "contact",
          highlightText: contact.name,
          relevanceScore: this.calculateRelevanceScore(
            contact.name,
            term,
            "contact"
          ),
        });
      }
    });

    return matches;
  }

  private textMatches(
    text: string,
    searchTerm: string,
    wholeWords: boolean
  ): boolean {
    if (wholeWords) {
      const regex = new RegExp(
        `\\b${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
        "i"
      );
      return regex.test(text);
    } else {
      return text.includes(searchTerm);
    }
  }

  private calculateRelevanceScore(
    text: string,
    searchTerm: string,
    matchType: string
  ): number {
    let score = 0;

    // 基础分数
    const baseScores = {
      content: 10,
      file: 8,
      sender: 6,
      contact: 4,
    };

    score += baseScores[matchType as keyof typeof baseScores] || 1;

    // 完全匹配加分
    if (text.toLowerCase() === searchTerm.toLowerCase()) {
      score += 20;
    }

    // 开头匹配加分
    if (text.toLowerCase().startsWith(searchTerm.toLowerCase())) {
      score += 10;
    }

    // 词频加分
    const occurrences = (
      text.toLowerCase().match(new RegExp(searchTerm.toLowerCase(), "g")) || []
    ).length;
    score += occurrences * 2;

    // 文本长度影响（短文本中的匹配更相关）
    const lengthFactor = Math.max(1, 100 / text.length);
    score *= lengthFactor;

    return score;
  }

  // 搜索建议
  generateSuggestions(
    query: string,
    contacts: Contact[]
  ): Array<{
    type: "contact" | "command" | "recent";
    text: string;
    description?: string;
    contact?: Contact;
  }> {
    const suggestions: Array<{
      type: "contact" | "command" | "recent";
      text: string;
      description?: string;
      contact?: Contact;
    }> = [];

    if (!query.trim()) {
      // 显示最近搜索
      this.searchHistory.slice(0, 5).forEach((search) => {
        suggestions.push({
          type: "recent",
          text: search,
        });
      });

      // 显示搜索命令
      const commands = [
        { text: "from:", description: "搜索特定联系人的消息" },
        { text: "type:image", description: "搜索图片消息" },
        { text: "type:file", description: "搜索文件消息" },
        { text: "type:voice", description: "搜索语音消息" },
        { text: "date:today", description: "搜索今天的消息" },
        { text: "date:yesterday", description: "搜索昨天的消息" },
        { text: "starred:", description: "搜索星标消息" },
      ];

      commands.forEach((cmd) => {
        suggestions.push({
          type: "command",
          text: cmd.text,
          description: cmd.description,
        });
      });
    } else {
      // 搜索匹配的联系人
      const matchingContacts = contacts
        .filter((contact) =>
          contact.name.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 5);

      matchingContacts.forEach((contact) => {
        suggestions.push({
          type: "contact",
          text: contact.name,
          description: contact.isGroup
            ? `群组 • ${contact.members?.length ?? 0} 位成员`
            : "联系人",
          contact,
        });
      });
    }

    return suggestions;
  }

  // 高亮搜索文本
  highlightText(text: string, searchTerms: string[]): React.ReactNode[] {
    if (!searchTerms.length) return [text];

    const regex = new RegExp(
      `(${searchTerms.map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`,
      "gi"
    );
    const parts = text.split(regex);

    return parts.map((part, index) => {
      const isMatch = searchTerms.some(
        (term) => part.toLowerCase() === term.toLowerCase()
      );
      return isMatch
        ? React.createElement(
            "mark",
            {
              key: index,
              className: "bg-yellow-200 text-yellow-900 rounded px-1",
            },
            part
          )
        : part;
    });
  }
}

// 导出单例实例
export const searchEngine = MessageSearchEngine.getInstance();
