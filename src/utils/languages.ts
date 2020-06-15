// complete list https://github.com/annexare/Countries/blob/master/data/languages.json
// using this reduced list http://stevehardie.com/2009/10/list-of-common-languages/

import { StringMap } from "../types"

const _languagesByKey = {
  en: {
    name: "English",
    native: "English",
  },
  af: {
    name: "Afrikaans",
    native: "Afrikaans",
  },
  sq: {
    name: "Albanian",
    native: "Shqip",
  },
  ar: {
    name: "Arabic",
    native: "العربية",
    rtl: 1,
  },
  hy: {
    name: "Armenian",
    native: "Հայերեն",
  },
  eu: {
    name: "Basque",
    native: "Euskara",
  },
  bg: {
    name: "Bulgarian",
    native: "Български",
  },
  bn: {
    name: "Bengali",
    native: "বাংলা",
  },
  my: {
    name: "Burmese",
    native: "မြန်မာစာ",
  },
  km: {
    name: "Cambodian",
    native: "ភាសាខ្មែរ",
  },
  ca: {
    name: "Catalan",
    native: "Català",
  },
  zh: {
    name: "Chinese",
    native: "中文",
  },
  hr: {
    name: "Croatian",
    native: "Hrvatski",
  },
  cs: {
    name: "Czech",
    native: "Česky",
  },
  da: {
    name: "Danish",
    native: "Dansk",
  },
  nl: {
    name: "Dutch",
    native: "Nederlands",
  },
  eo: {
    name: "Esperanto",
    native: "Esperanto",
  },
  et: {
    name: "Estonian",
    native: "Eesti",
  },
  fi: {
    name: "Finnish",
    native: "Suomi",
  },
  fr: {
    name: "French",
    native: "Français",
  },
  de: {
    name: "German",
    native: "Deutsch",
  },
  ka: {
    name: "Georgian",
    native: "ქართული",
  },
  el: {
    name: "Greek",
    native: "Ελληνικά",
  },
  ga: {
    name: "Irish",
    native: "Gaeilge",
  },
  he: {
    name: "Hebrew",
    native: "עברית",
    rtl: 1,
  },
  hi: {
    name: "Hindi",
    native: "हिन्दी",
  },
  hu: {
    name: "Hungarian",
    native: "Magyar",
  },
  id: {
    name: "Indonesian",
    native: "Bahasa Indonesia",
  },
  is: {
    name: "Icelandic",
    native: "Íslenska",
  },
  it: {
    name: "Italian",
    native: "Italiano",
  },
  ja: {
    name: "Japanese",
    native: "日本語",
  },
  kn: {
    name: "Kannada",
    native: "ಕನ್ನಡ",
  },
  ko: {
    name: "Korean",
    native: "한국어",
  },
  lb: {
    name: "Luxembourgish",
    native: "Lëtzebuergesch",
  },
  lt: {
    name: "Lithuanian",
    native: "Lietuvių",
  },
  lu: {
    name: "Luba-Katanga",
    native: "Tshiluba",
  },
  lv: {
    name: "Latvian",
    native: "Latviešu",
  },
  mi: {
    name: "Maori",
    native: "Māori",
  },
  mk: {
    name: "Macedonian",
    native: "Македонски",
  },
  ml: {
    name: "Malayalam",
    native: "മലയാളം",
  },
  mn: {
    name: "Mongolian",
    native: "Монгол",
  },
  mo: {
    name: "Moldovan",
    native: "Moldovenească",
  },
  mr: {
    name: "Marathi",
    native: "मराठी",
  },
  ms: {
    name: "Malay",
    native: "Bahasa Melayu",
  },
  mt: {
    name: "Maltese",
    native: "bil-Malti",
  },
  ne: {
    name: "Nepali",
    native: "नेपाली",
  },
  no: {
    name: "Norwegian",
    native: "Norsk",
  },
  pa: {
    name: "Panjabi / Punjabi",
    native: "ਪੰਜਾਬੀ / पंजाबी / پنجابي",
  },
  fa: {
    name: "Persian",
    native: "فارسی",
    rtl: 1,
  },
  pl: {
    name: "Polish",
    native: "Polski",
  },
  pt: {
    name: "Portuguese",
    native: "Português",
  },
  ro: {
    name: "Romanian",
    native: "Română",
  },
  ru: {
    name: "Russian",
    native: "Русский",
  },
  rw: {
    name: "Rwandi",
    native: "Kinyarwandi",
  },
  sh: {
    name: "Serbo-Croatian",
    native: "Srpskohrvatski / Српскохрватски",
  },
  sr: {
    name: "Serbian",
    native: "Српски",
  },
  sk: {
    name: "Slovak",
    native: "Slovenčina",
  },
  sl: {
    name: "Slovenian",
    native: "Slovenščina",
  },
  es: {
    name: "Spanish",
    native: "Español",
  },
  sv: {
    name: "Swedish",
    native: "Svenska",
  },
  sw: {
    name: "Swahili",
    native: "Kiswahili",
  },
  ta: {
    name: "Tamil",
    native: "தமிழ்",
  },
  te: {
    name: "Telugu",
    native: "తెలుగు",
  },
  th: {
    name: "Thai",
    native: "ไทย / Phasa Thai",
  },
  bo: {
    name: "Tibetan",
    native: "བོད་ཡིག / Bod skad",
  },
  tl: {
    name: "Tagalog / Filipino",
    native: "Tagalog",
  },
  tr: {
    name: "Turkish",
    native: "Türkçe",
  },
  ug: {
    name: "Uyghur",
    native: "Uyƣurqə / ئۇيغۇرچە",
  },
  uk: {
    name: "Ukrainian",
    native: "Українська",
  },
  ur: {
    name: "Urdu",
    native: "اردو",
    rtl: 1,
  },
  uz: {
    name: "Uzbek",
    native: "Ўзбек",
  },
  vi: {
    name: "Vietnamese",
    native: "Tiếng Việt",
  },
  cy: {
    name: "Welsh",
    native: "Cymraeg",
  },
  xh: {
    name: "Xhosa",
    native: "isiXhosa",
  },
  yi: {
    name: "Yiddish",
    native: "ייִדיש",
    rtl: 1,
  },
  zu: {
    name: "Zulu",
    native: "isiZulu",
  },
}

export interface Language {
  value: string
  label: string
}

export const LANGUAGES_MAP: StringMap<Language> = {}

export const LANGUAGES: Language[] = Object.keys(_languagesByKey).map((value) => {
  const label = _languagesByKey[value].name
  LANGUAGES_MAP[value] = { value, label }
  return { value, label }
})
