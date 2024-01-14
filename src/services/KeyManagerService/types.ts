import { UserKeyStatus } from "../../orm/entities/UserKey/types";

export interface UpdateKeyPayload {
  keyName: string;
  status: UserKeyStatus;
  expiresAt: Date | null;
}
