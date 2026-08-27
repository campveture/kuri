// All photography is sourced from Wikimedia Commons under free licenses that
// require attribution. These are real photos of Sreemangal's tea gardens and
// tea culture -- not photos of Kuri Valley Estate specifically, since no
// photoshoot of the actual estate exists yet. Replace with real Kuri
// photography when it's shot, and update/remove this page at that point.

export type PhotoCredit = {
  file: string; // public/images/<file>
  title: string;
  photographer: string;
  license: "CC BY 4.0" | "CC BY-SA 4.0";
  sourceUrl: string;
  licenseUrl: string;
};

export const photoCredits: PhotoCredit[] = [
  {
    file: "hero-1.jpg",
    title: "Tea Gardens of Sreemangal 01",
    photographer: "Radman Siddiki",
    license: "CC BY 4.0",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Tea_Gardens_of_Sreemangal_01.jpg",
    licenseUrl: "https://creativecommons.org/licenses/by/4.0",
  },
  {
    file: "hero-2.jpg",
    title: "Tea gardens in Sreemangal 05",
    photographer: "Kritzolina",
    license: "CC BY-SA 4.0",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Tea_gardens_in_Sreemangal_05.jpg",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  {
    file: "teaser-1.jpg",
    title: "Tea gardens in Sreemangal 08",
    photographer: "Kritzolina",
    license: "CC BY-SA 4.0",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Tea_gardens_in_Sreemangal_08.jpg",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  {
    file: "harvest.jpg",
    title: "Life in Srimangal's Tea Gardens",
    photographer: "MohammedSuman22",
    license: "CC BY-SA 4.0",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Life_in_Srimangal%E2%80%99s_Tea_Gardens.jpg",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  {
    file: "tea-cup.jpg",
    title: "A cup of black tea from Srimangal Bangladesh",
    photographer: "Sm faysal",
    license: "CC BY-SA 4.0",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:A_cup_of_black_tea_from_Srimangal_Bangladesh.jpg",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  {
    file: "portrait.jpg",
    title: "Tea gardens in Sreemangal 02",
    photographer: "Kritzolina",
    license: "CC BY-SA 4.0",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Tea_gardens_in_Sreemangal_02.jpg",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  {
    file: "shop-banner.jpg",
    title: "Tea gardens in Sreemangal 11",
    photographer: "Kritzolina",
    license: "CC BY-SA 4.0",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Tea_gardens_in_Sreemangal_11.jpg",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
];
