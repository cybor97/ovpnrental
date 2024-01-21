import { SupportedKeys, getText } from "../locale";
import { UserKey } from "../orm/entities/UserKey";

export function sanitizeKeyName(keyName: string) {
  if (!keyName) {
    return null;
  }
  return keyName.split(" ").slice(1).join("_").trim();
}

export function serializeKeysForMessage(keys: UserKey[]) {
  return keys
    .map((key) =>
      getText({
        key: "key_list_item",
        data: {
          key: key.key,
          status: getText({
            key: ("status_" + key.status) as SupportedKeys,
          }),
          rentDuration: key.eternal
            ? getText({ key: "eternal" })
            : key.userRents
                .map((rent) => rent.expiresAt)
                .reduce(
                  (acc, next) => (next && next > acc ? next : acc),
                  new Date()
                )
                .toISOString()
                .split("T")
                .shift(),
        },
      })
    )
    .join("\n");
}
