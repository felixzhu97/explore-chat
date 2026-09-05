import { Injectable } from "@nestjs/common";

export interface AdUserProfile {
  id: string;
  country?: string | null;
  region?: string | null;
  language?: string | null;
  interests?: string[] | null;
}

@Injectable()
export class AdTargetingService {
  isGroupMatched(
    group: {
      targeting: unknown | null;
    },
    profile: AdUserProfile,
  ): boolean {
    if (!group.targeting) {
      return true;
    }
    const targeting = group.targeting as unknown as {
      countries?: string[];
      regions?: string[];
      languages?: string[];
      interests?: string[];
    };
    if (Array.isArray(targeting.countries) && targeting.countries.length > 0) {
      if (!profile.country || !targeting.countries.includes(profile.country)) {
        return false;
      }
    }
    if (Array.isArray(targeting.regions) && targeting.regions.length > 0) {
      if (!profile.region || !targeting.regions.includes(profile.region)) {
        return false;
      }
    }
    if (Array.isArray(targeting.languages) && targeting.languages.length > 0) {
      if (
        !profile.language ||
        !targeting.languages.includes(profile.language)
      ) {
        return false;
      }
    }
    if (Array.isArray(targeting.interests) && targeting.interests.length > 0) {
      const userInterests = profile.interests ?? [];
      if (!userInterests.some((tag) => targeting.interests?.includes(tag))) {
        return false;
      }
    }
    return true;
  }
}
