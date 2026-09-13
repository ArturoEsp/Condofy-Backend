export interface ToggleFamilyMemberStatusCommand {
  currentUserId: string;
  familyMemberId: string;
  condominiumId: string;
  isActive: boolean;
}
