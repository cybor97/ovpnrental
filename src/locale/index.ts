import { FmtString } from "telegraf/typings/format";
import * as translationData from "./data";

type Locales = keyof typeof translationData;
type SupportedKeys = keyof (typeof translationData)["en"];
type TranslationData = Record<string, unknown>;

function getText(opts: {
  locale?: Locales;
  key: SupportedKeys;
  data?: TranslationData;
}): string | FmtString {
  const { locale, key, data } = opts;
  const translations = translationData[locale as Locales] ?? translationData.en;
  return translations[key](data);
}

export { getText, SupportedKeys, Locales, TranslationData };
