import { Format } from "telegraf";
import {
  KeyData,
  LeaseCreatedPayload,
  ListItemPayload,
  NotificationData,
  StatusData,
} from "../types";

export default {
  start: () => "Start 🚀",
  download: () => "Download 📲 💻",
  lease: () => "Lease 🔑",
  list: () => "List 📋",
  renew: () => "Renew ⏳",
  revoke: () => "Revoke 🗑️",

  download_command: () => "Send a key as a file 📲 💻",
  lease_command: () => "Lease a VPN key for some time 🔑",
  list_command: () => "List my VPN keys 📋",
  renew_command: () => "Renew a key (one more please!) ⏳",
  revoke_command: () => "Revoke a key (pass them upon leaving!) 🗑️",

  status_pending: () => "Pending ⏳",
  status_processing: () => "Processing 🛠️",
  status_active: () => "Active 🟢",
  status_revoked: () => "Revoked 🗑️",
  status_deleted: () => "Deleted ❌",

  start_menu: () => "Here's the menu 📋",

  no_command: () => "Didn't get ya ❌, try to choose one of the commands 📋",

  eternal: () => "♾️",
  key_list_item: (data: unknown) => {
    const { key, status, rentDuration } = data as ListItemPayload;
    return `Key 🔑${key}: ${status}${rentDuration ? ` (${rentDuration})` : ""}`;
  },
  order_created: (data: unknown) => {
    const leaseData = data as LeaseCreatedPayload;
    return Format.fmt`Gotcha 👍\nYou will receive the key 🔑${leaseData.key} shortly`;
  },
  revoke_order_created: (data: unknown) => {
    const leaseData = data as LeaseCreatedPayload;
    return Format.fmt`Gotcha 👍\nKey 🔑${leaseData.key} will be revoked shortly`;
  },
  lease_created: (data: unknown) => {
    const leaseData = data as LeaseCreatedPayload;
    return Format.fmt`Your key 🔑${
      leaseData.key
    } is leased\nAvailable until ⏳${Format.underline(
      leaseData.expiresAt.toDateString()
    )}`;
  },
  already_in_use: (data: unknown) => {
    const leaseData = data as LeaseCreatedPayload;
    return Format.fmt`Your key 🔑${
      leaseData.key
    } is already in use\nLeased until ⏳${Format.underline(
      leaseData.expiresAt.toDateString()
    )}\nSorry, you cannot rent another one`;
  },
  already_in_use_revoked: (data: unknown) => {
    const leaseData = data as LeaseCreatedPayload;
    return Format.fmt`Your already have a key 🔑${leaseData.key}, revoked though`;
  },
  no_keys: () => "No keys found ⚪",
  no_active_keys: () => "No active keys found ⚪",
  fail_to_renew: () => "Failed to renew a key ❌, might be already renewed",
  fail_to_revoke: () => "Failed to revoke a key ❌, might be already revoked",
  fail_to_download: () => "Failed to download a key ❌, try again later",
  key_activated: (data: unknown) => {
    const keyName = (data as KeyData).keyName;
    return `Your key 🔑${keyName} has been activated 🟢🎉!`;
  },
  status_updated: (data: unknown) => {
    const { key, statusAfter } = data as StatusData;
    return `Your key 🔑${key} is now ${statusAfter}`;
  },
  download_key: (data: unknown) => {
    const keyName = (data as KeyData).keyName;
    return `Key 🔑${keyName} will be sent to you shortly`;
  },
  key_revoked_download: () =>
    "Key is revoked 🗑️\nBut you can still renew it ⏳💪",
  key_revoked: () => "Key is now revoked 🗑️",
  choose_a_key: () => "Please specify the key you want to download 📲 💻",
  too_many_requests: () => "Chill for a bit and try later, alright? 😅",
  download_in_dm: () => "Your key is ready, come and download it 📲 💻",
  key_expired: (data: unknown) => {
    const notificationData = data as NotificationData;
    const keyName = notificationData.key;
    const username = notificationData.username;
    return `${
      username ? `@${username} your key` : "Key"
    } 🔑${keyName} has expired 😢`;
  },
  key_almost_expired: (data: unknown) => {
    const notificationData = data as NotificationData;
    const keyName = notificationData.key;
    const username = notificationData.username;
    return `${
      username ? `@${username} your key` : "Key"
    } 🔑${keyName} is almost expired ⏳`;
  },
};
