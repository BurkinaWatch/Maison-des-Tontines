export interface LanguageOption {
  code: string;
  label: string;
  nativeLabel?: string;
}

export interface CurrencyOption {
  code: string;
  name: string;
  symbol: string;
}

// African languages are listed first so they are easy to find for the app's core audience.
export const LANGUAGES: LanguageOption[] = [
  { code: "fr", label: "Français" }, { code: "en", label: "English" },
  { code: "ar", label: "العربية", nativeLabel: "Arabic" }, { code: "pt", label: "Português" },
  { code: "sw", label: "Kiswahili", nativeLabel: "Swahili" }, { code: "ha", label: "Hausa" },
  { code: "yo", label: "Yorùbá", nativeLabel: "Yoruba" }, { code: "ig", label: "Igbo" },
  { code: "am", label: "አማርኛ", nativeLabel: "Amharic" }, { code: "so", label: "Soomaali", nativeLabel: "Somali" },
  { code: "zu", label: "isiZulu", nativeLabel: "Zulu" }, { code: "xh", label: "isiXhosa", nativeLabel: "Xhosa" },
  { code: "af", label: "Afrikaans" }, { code: "wo", label: "Wolof" },
  { code: "bm", label: "Bamanankan", nativeLabel: "Bambara" }, { code: "ff", label: "Fulfulde" },
  { code: "ln", label: "Lingála", nativeLabel: "Lingala" }, { code: "rw", label: "Kinyarwanda" },
  { code: "rn", label: "Kirundi" }, { code: "mg", label: "Malagasy" },
  { code: "ti", label: "ትግርኛ", nativeLabel: "Tigrinya" }, { code: "ee", label: "Eʋegbe", nativeLabel: "Ewe" },
  { code: "tw", label: "Twi" }, { code: "gaa", label: "Ga" },
  { code: "fon", label: "Fɔngbè", nativeLabel: "Fon" }, { code: "mos", label: "Mooré" },
  { code: "tn", label: "Setswana" }, { code: "st", label: "Sesotho" },
  { code: "ny", label: "Chichewa" }, { code: "sn", label: "chiShona", nativeLabel: "Shona" },
  { code: "nd", label: "isiNdebele", nativeLabel: "Ndebele" }, { code: "lg", label: "Luganda" },
  { code: "om", label: "Afaan Oromoo", nativeLabel: "Oromo" },
  { code: "es", label: "Español" }, { code: "de", label: "Deutsch" },
  { code: "it", label: "Italiano" }, { code: "nl", label: "Nederlands" },
  { code: "ru", label: "Русский", nativeLabel: "Russian" }, { code: "uk", label: "Українська", nativeLabel: "Ukrainian" },
  { code: "pl", label: "Polski" }, { code: "tr", label: "Türkçe" },
  { code: "fa", label: "فارسی", nativeLabel: "Persian" }, { code: "he", label: "עברית", nativeLabel: "Hebrew" },
  { code: "hi", label: "हिन्दी", nativeLabel: "Hindi" }, { code: "bn", label: "বাংলা", nativeLabel: "Bengali" },
  { code: "ur", label: "اردو", nativeLabel: "Urdu" }, { code: "zh", label: "简体中文", nativeLabel: "Chinese" },
  { code: "ja", label: "日本語", nativeLabel: "Japanese" }, { code: "ko", label: "한국어", nativeLabel: "Korean" },
  { code: "vi", label: "Tiếng Việt" }, { code: "th", label: "ไทย", nativeLabel: "Thai" },
  { code: "id", label: "Bahasa Indonesia" }, { code: "ms", label: "Bahasa Melayu" },
];

// ISO 4217 currencies, including active African, regional and international currencies.
export const CURRENCIES: CurrencyOption[] = [
  ["XOF", "West African CFA franc", "F CFA"], ["XAF", "Central African CFA franc", "FCFA"],
  ["GHS", "Ghanaian cedi", "₵"], ["NGN", "Nigerian naira", "₦"], ["GNF", "Guinean franc", "FG"],
  ["SLL", "Sierra Leonean leone", "Le"], ["LRD", "Liberian dollar", "$"], ["GMD", "Gambian dalasi", "D"],
  ["CVE", "Cape Verdean escudo", "$"], ["MRU", "Mauritanian ouguiya", "UM"], ["MAD", "Moroccan dirham", "د.م."],
  ["DZD", "Algerian dinar", "دج"], ["TND", "Tunisian dinar", "د.ت"], ["EGP", "Egyptian pound", "£"],
  ["SDG", "Sudanese pound", "ج.س"], ["ETB", "Ethiopian birr", "Br"], ["DJF", "Djiboutian franc", "Fdj"],
  ["SOS", "Somali shilling", "Sh"], ["KES", "Kenyan shilling", "KSh"], ["UGX", "Ugandan shilling", "USh"],
  ["TZS", "Tanzanian shilling", "TSh"], ["RWF", "Rwandan franc", "FRw"], ["BIF", "Burundian franc", "FBu"],
  ["CDF", "Congolese franc", "FC"], ["AOA", "Angolan kwanza", "Kz"], ["ZMW", "Zambian kwacha", "ZK"],
  ["MWK", "Malawian kwacha", "MK"], ["MZN", "Mozambican metical", "MT"], ["ZAR", "South African rand", "R"],
  ["NAD", "Namibian dollar", "$"], ["BWP", "Botswanan pula", "P"], ["SZL", "Eswatini lilangeni", "E"],
  ["LSL", "Lesotho loti", "L"], ["MUR", "Mauritian rupee", "₨"], ["SCR", "Seychellois rupee", "₨"],
  ["MGA", "Malagasy ariary", "Ar"], ["KMF", "Comorian franc", "CF"], ["STN", "São Tomé dobra", "Db"],
  ["USD", "United States dollar", "$"], ["EUR", "Euro", "€"], ["GBP", "British pound", "£"],
  ["CHF", "Swiss franc", "CHF"], ["CAD", "Canadian dollar", "$"], ["AUD", "Australian dollar", "$"],
  ["NZD", "New Zealand dollar", "$"], ["JPY", "Japanese yen", "¥"], ["CNY", "Chinese yuan", "¥"],
  ["HKD", "Hong Kong dollar", "$"], ["SGD", "Singapore dollar", "$"], ["INR", "Indian rupee", "₹"],
  ["PKR", "Pakistani rupee", "₨"], ["BDT", "Bangladeshi taka", "৳"], ["LKR", "Sri Lankan rupee", "₨"],
  ["NPR", "Nepalese rupee", "₨"], ["KRW", "South Korean won", "₩"], ["VND", "Vietnamese dong", "₫"],
  ["THB", "Thai baht", "฿"], ["IDR", "Indonesian rupiah", "Rp"], ["MYR", "Malaysian ringgit", "RM"],
  ["PHP", "Philippine peso", "₱"], ["TWD", "New Taiwan dollar", "NT$"], ["MNT", "Mongolian tögrög", "₮"],
  ["RUB", "Russian ruble", "₽"], ["UAH", "Ukrainian hryvnia", "₴"], ["PLN", "Polish złoty", "zł"],
  ["CZK", "Czech koruna", "Kč"], ["HUF", "Hungarian forint", "Ft"], ["RON", "Romanian leu", "lei"],
  ["BGN", "Bulgarian lev", "лв"], ["SEK", "Swedish krona", "kr"], ["NOK", "Norwegian krone", "kr"],
  ["DKK", "Danish krone", "kr"], ["ISK", "Icelandic króna", "kr"], ["TRY", "Turkish lira", "₺"],
  ["ILS", "Israeli new shekel", "₪"], ["AED", "United Arab Emirates dirham", "د.إ"],
  ["SAR", "Saudi riyal", "﷼"], ["QAR", "Qatari riyal", "﷼"], ["KWD", "Kuwaiti dinar", "د.ك"],
  ["BHD", "Bahraini dinar", ".د.ب"], ["OMR", "Omani rial", "﷼"], ["JOD", "Jordanian dinar", "د.ا"],
  ["IRR", "Iranian rial", "﷼"], ["IQD", "Iraqi dinar", "ع.د"], ["YER", "Yemeni rial", "﷼"],
  ["BRL", "Brazilian real", "R$"], ["MXN", "Mexican peso", "$"], ["ARS", "Argentine peso", "$"],
  ["CLP", "Chilean peso", "$"], ["COP", "Colombian peso", "$"], ["PEN", "Peruvian sol", "S/"],
  ["UYU", "Uruguayan peso", "$U"], ["BOB", "Bolivian boliviano", "Bs"], ["PYG", "Paraguayan guaraní", "₲"],
  ["CRC", "Costa Rican colón", "₡"], ["DOP", "Dominican peso", "RD$"], ["JMD", "Jamaican dollar", "J$"],
  ["TTD", "Trinidad and Tobago dollar", "TT$"], ["BSD", "Bahamian dollar", "$"], ["BBD", "Barbadian dollar", "$"],
  ["BMD", "Bermudian dollar", "$"], ["XCD", "East Caribbean dollar", "$"], ["GTQ", "Guatemalan quetzal", "Q"],
  ["HNL", "Honduran lempira", "L"], ["NIO", "Nicaraguan córdoba", "C$"], ["PAB", "Panamanian balboa", "B/."],
  ["FJD", "Fijian dollar", "$"], ["PGK", "Papua New Guinean kina", "K"], ["WST", "Samoan tala", "T"],
  ["TOP", "Tongan paʻanga", "T$"], ["VUV", "Vanuatu vatu", "VT"], ["SBD", "Solomon Islands dollar", "$"],
  ["XPF", "CFP franc", "₣"], ["BAM", "Bosnia and Herzegovina convertible mark", "KM"],
  ["RSD", "Serbian dinar", "дин"], ["MKD", "Macedonian denar", "ден"], ["ALL", "Albanian lek", "L"],
  ["MDL", "Moldovan leu", "L"], ["GEL", "Georgian lari", "₾"], ["AZN", "Azerbaijani manat", "₼"],
  ["KZT", "Kazakhstani tenge", "₸"], ["UZS", "Uzbekistani soʻm", "лв"], ["KGS", "Kyrgyzstani som", "с"],
  ["TJS", "Tajikistani somoni", "SM"], ["TMT", "Turkmenistan manat", "T"], ["BYN", "Belarusian ruble", "Br"],
  ["MMK", "Myanmar kyat", "K"], ["KHR", "Cambodian riel", "៛"], ["LAK", "Lao kip", "₭"],
  ["BND", "Brunei dollar", "$"], ["MVR", "Maldivian rufiyaa", "Rf"], ["BTN", "Bhutanese ngultrum", "Nu."],
  ["MOP", "Macanese pataca", "MOP$"], ["BZD", "Belize dollar", "BZ$"], ["GYD", "Guyanese dollar", "$"],
  ["SRD", "Surinamese dollar", "$"], ["HTG", "Haitian gourde", "G"], ["CUP", "Cuban peso", "$"],
  ["ANG", "Netherlands Antillean guilder", "ƒ"], ["AWG", "Aruban florin", "ƒ"],
  ["FKP", "Falkland Islands pound", "£"], ["GIP", "Gibraltar pound", "£"], ["JEP", "Jersey pound", "£"],
  ["IMP", "Manx pound", "£"], ["SHP", "Saint Helena pound", "£"], ["XAG", "Silver", "oz t"],
  ["XAU", "Gold", "oz t"],
].map(([code, name, symbol]) => ({ code, name, symbol }));