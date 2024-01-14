import {
  InlineKeyboardButton,
  InputFile,
} from "telegraf/typings/core/types/typegram";
import { User } from "../../orm/entities/User";
import { UserKey } from "../../orm/entities/UserKey";

export interface UserKeyPayload {
  user?: User;
  userKey?: UserKey;
}

export interface SendMessagePayload extends UserKeyPayload {
  message: string;
  keyboard?: InlineKeyboardButton[][];
}
export interface SendDocumentPayload extends UserKeyPayload {
  data: string | InputFile;
  caption?: string;
}
