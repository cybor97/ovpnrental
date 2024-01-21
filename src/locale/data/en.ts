import { Format } from "telegraf";
import { LeaseCreatedPayload } from "../types";
import { UserKeyStatus } from "../../orm/entities/UserKey/types";

export default {
  download: () => "Download 📲 💻",
  lease: () => "Lease 🔑",
  list: () => "List 📋",
  renew: () => "Renew ⏳",
  revoke: () => "Revoke 🗑️",
  order_created: (data: unknown) => {
    const leaseData = data as LeaseCreatedPayload;
    return Format.fmt`Gotcha. You will receive the key  🔑${leaseData.key} shortly.`;
  },
  revoke_order_created: (data: unknown) => {
    const leaseData = data as LeaseCreatedPayload;
    return Format.fmt`Gotcha. Key 🔑${leaseData.key} will be revoked shortly.`;
  },
  lease_created: (data: unknown) => {
    const leaseData = data as LeaseCreatedPayload;
    return Format.fmt`Your key 🔑${
      leaseData.key
    } is leased until ⏳${Format.underline(
      leaseData.expiresAt.toDateString()
    )}`;
  },
  already_in_use: (data: unknown) => {
    const leaseData = data as LeaseCreatedPayload;
    return Format.fmt`Your key 🔑${
      leaseData.key
    } is already in use until ⏳${Format.underline(
      leaseData.expiresAt.toDateString()
    )}. Sorry, you cannot rent another one.`;
  },
  no_keys: () => "No keys found",
  no_active_keys: () => "No active keys found",
  fail_to_renew: () => "Failed to renew a key, might be already renewed",
  fail_to_revoke: () => "Failed to revoke a key, might be already revoked",
  fail_to_download: () => "Failed to download a key, try again later",
  key_activated: () => "Your key has been activated!",
  status_updated: (data: unknown) =>
    `User key is now ${(data as { statusAfter: UserKeyStatus }).statusAfter}`,
  download_key: (data: unknown) =>
    `Key 🔑${
      (data as { keyName: string }).keyName
    } will be sent to you shortly`,
  key_revoked_download: () => "Key is revoked.\nBut you can still renew it ;)",
  key_revoked: () => "Key is now revoked",
  choose_a_key: () => "Please specify the key you want to download",
};
