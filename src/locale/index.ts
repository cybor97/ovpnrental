import { FmtString } from "telegraf/typings/format";
import * as translationData from "./data";

export function getText(opts: {
  locale?: keyof typeof translationData;
  key: keyof (typeof translationData)["en"];
  data?: Record<string, unknown>;
}): string | FmtString {
  const { locale, key, data } = opts;
  const translations =
    translationData[locale as unknown as keyof typeof translationData] ??
    translationData.en;
  return translations[key as unknown as keyof typeof translations](
    data as unknown
  );
}
