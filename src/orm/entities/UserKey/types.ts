export enum UserKeyStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  ACTIVE = "active",
  REVOKED = "revoked",
  DELETED = "deleted",
}

export interface UserKeyTgMetadata {
  issuedInChatId: number | null;
  issuedCallbackId: string | null;
}
