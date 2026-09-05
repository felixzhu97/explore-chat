import { createReplicateAdapter } from './replicate-adapter';
import type {
  GeneratePayload,
  GenerateResult,
  GetResultResponse,
  ReplicateClientOptions,
  HttpImageClientOptions,
} from './types';

export type ImageClientOptions = ReplicateClientOptions | HttpImageClientOptions;

function isReplicateOptions(opts: ImageClientOptions): opts is ReplicateClientOptions {
  return 'replicateApiToken' in opts && typeof opts.replicateApiToken === 'string';
}

export function createClient(options: ImageClientOptions) {
  if (isReplicateOptions(options)) {
    return createReplicateAdapter(options.replicateApiToken);
  }
  const baseUrl = options.imageApiBaseUrl.replace(/\/$/, '');
  return {
    async generate(payload: GeneratePayload): Promise<GenerateResult> {
      const res = await fetch(`${baseUrl}/api/v1/images:generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: payload.prompt,
          ...(payload.negativePrompt != null && {
            negative_prompt: payload.negativePrompt,
          }),
        }),
      });
      if (!res.ok) throw new Error(`Image API error: ${res.status}`);
      const data = (await res.json()) as { job_id: string };
      return { jobId: data.job_id };
    },
    async getResult(jobId: string): Promise<GetResultResponse> {
      const res = await fetch(`${baseUrl}/api/v1/imageJobs/${jobId}`);
      if (!res.ok) throw new Error(`Image API error: ${res.status}`);
      const data = (await res.json()) as {
        status: GetResultResponse['status'];
        image_url?: string;
        error?: string;
      };
      return {
        status: data.status,
        ...(data.image_url != null && { imageUrl: data.image_url }),
        ...(data.error != null && { error: data.error }),
      };
    },
  };
}
