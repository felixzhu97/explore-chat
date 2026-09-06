import type {
  VoiceGenTargetLanguage,
  VoiceTranslateTargetLanguage,
} from "@chat/shared-types";

export interface ITextGenerateService {
  postChatStream(
    messages: Array<{ role: string; content: string }>,
    onChunk: (text: string) => void,
    model?: string,
  ): Promise<void>;
  postChatStream(
    messages: Array<{ role: string; content: string }>,
    onChunk: (text: string) => void,
    opts?: { model?: string; provider?: string; sessionId?: string },
  ): Promise<void>;
}

export interface IImageGenerateService {
  generate(prompt: string, negativePrompt?: string): Promise<{ jobId: string }>;
  getResult(jobId: string): Promise<{
    status: string;
    imageUrl?: string;
    error?: string;
  }>;
}

export interface IVideoGenerateService {
  generate(prompt: string, imageUrl?: string): Promise<{ jobId: string }>;
  getResult(jobId: string): Promise<{
    status: string;
    videoUrl?: string;
    error?: string;
  }>;
}

export interface IVoiceGenerateService {
  generate(
    prompt: string,
    targetLang?: VoiceGenTargetLanguage,
  ): Promise<{ audioUrl: string; text?: string }>;
  translate(
    text: string,
    targetLang: VoiceTranslateTargetLanguage,
  ): Promise<{ translatedText: string }>;
}

export interface FollowListItem {
  id: string;
  username: string;
  avatar: string | null;
  isFollowing?: boolean;
}

export interface IFollowListService {
  getFollowers(
    userId: string,
    limit: number,
    pageToken?: string,
  ): Promise<{ list: FollowListItem[]; nextPageToken?: string }>;
  getFollowing(
    userId: string,
    limit: number,
    pageToken?: string,
  ): Promise<{ list: FollowListItem[]; nextPageToken?: string }>;
}
