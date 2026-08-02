import { Injectable } from "@nestjs/common";

export interface ExperimentAssignment {
  experimentId: string;
  variantId: string;
}

@Injectable()
export class ExperimentService {
  assign(userId: string, surface: string): ExperimentAssignment {
    const hash = this.hash(userId + ":" + surface);
    const bucket = hash % 100;
    if (bucket < 5) {
      return { experimentId: surface + "-model-v2", variantId: "v2" };
    }
    return { experimentId: surface + "-control", variantId: "control" };
  }

  private hash(value: string): number {
    let h = 0;
    for (let i = 0; i < value.length; i++) {
      h = (h * 31 + value.charCodeAt(i)) | 0;
    }
    return Math.abs(h);
  }
}
