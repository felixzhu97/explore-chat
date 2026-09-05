import { createReplicateAdapter } from './replicate-adapter';
import type {
  GeneratePayload,
  GenerateResult,
  GetResultResponse,
  ReplicateClientOptions,
  HttpVideoClientOptions,
} from './types';

export type VideoClientOptions = ReplicateClientOptions | HttpVideoClientOptions;

function isReplicateOptions(opts: VideoClientOptions): opts is ReplicateClientOptions {
  return 'replicateApiToken' in opts && typeof opts.replicateApiToken === 'string';
}

export function createClient(options: VideoClientOptions) {
  if (isReplicateOptions(options)) {
    return createReplicateAdapter(options.replicateApiToken);
  }
  const baseUrl = options.videoApiBaseUrl.replace(/\/$/, '');
  return {
    async generate(payload: GeneratePayload): Promise<GenerateResult> {
      const res = await fetch(`${baseUrl}/api/v1/videos:generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: payload.prompt,
          ...(payload.imageUrl != null && { image_url: payload.imageUrl }),
        }),
      });
      if (!res.ok) throw new Error(`Video API error: ${res.status}`);
      const data = (await res.json()) as { job_id: string };
      return { jobId: data.job_id };
    },
    async getResult(jobId: string): Promise<GetResultResponse> {
      const res = await fetch(`${baseUrl}/api/v1/videoJobs/${jobId}`);
      if (!res.ok) throw new Error(`Video API error: ${res.status}`);
      const data = (await res.json()) as {
        status: GetResultResponse['status'];
        video_url?: string;
        error?: string;
      };
      return {
        status: data.status,
        ...(data.video_url != null && { videoUrl: data.video_url }),
        ...(data.error != null && { error: data.error }),
      };
    },
  };
}
