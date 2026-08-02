import { ProfilePageContainer } from "@/src/presentation/features/profile/profile-page-container";

export default function ProfileUserRoutePage({
  params,
}: {
  params: { userId: string };
}) {
  return <ProfilePageContainer profileUserId={params.userId} />;
}
