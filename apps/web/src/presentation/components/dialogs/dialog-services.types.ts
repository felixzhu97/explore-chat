export interface ITextGenerateService {
  postChatStream(
    messages: Array<{ role: string; content: string }>,
    onChunk: (text: string) => void,
    model?: string
  ): Promise<void>;
}

export interface IImageGenerateService {
  generate(prompt: string, negativePrompt?: string): Promise<{ success: boolean; data?: { jobId: string } }>;
  getResult(jobId: string): Promise<{
    success: boolean;
    data?: { status: string; imageUrl?: string; error?: string };
  }>;
}

export interface IVideoGenerateService {
  generate(prompt: string, imageUrl?: string): Promise<{ success: boolean; data?: { jobId: string } }>;
  getResult(jobId: string): Promise<{
    success: boolean;
    data?: { status: string; videoUrl?: string; error?: string };
  }>;
}

export interface IVoiceGenerateService {
  generate(prompt: string, targetLang?: string): Promise<{
    success: boolean;
    data?: { audioUrl: string; text?: string };
  }>;
  translate(text: string, targetLang: "zh" | "en"): Promise<{
    success: boolean;
    data?: { translatedText: string };
  }>;
}

export interface FollowListItem {
  id: string;
  username: string;
  avatar: string | null;
  isFollowing?: boolean;
}

export interface IFollowListService {
  getFollowers(userId: string, limit: number, pageState?: string): Promise<{ list: FollowListItem[]; pageState?: string }>;
  getFollowing(userId: string, limit: number, pageState?: string): Promise<{ list: FollowListItem[]; pageState?: string }>;
}
