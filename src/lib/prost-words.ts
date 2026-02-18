/**
 * International "Cheers" / "Prost" words from all languages
 * Extracted from Prost_alle_Sprachen.xlsx
 */
export const prostWords = [
  "Prost",
  "Santé",
  "Salud",
  "Saúde",
  "Salute",
  "Cheers",
  "Sláinte",
  "Proost",
  "Skål",
  "Kippis",
  "Skál",
  "Na zdrowie",
  "Na zdraví",
  "Na zdravie",
  "Egészségre",
  "Noroc",
  "Nazdrave",
  "Yamas",
  "Şerefe",
  "Za zdorovye",
  "Budmo",
  "Į sveikatą",
  "Priekā",
  "Terviseks",
  "Gānbēi",
  "Kanpai",
  "Geonbae",
  "Chok dee",
  "Chúc sức khỏe",
  "Bersulang",
  "Sorak",
  "Tagay",
  "Choul mouy",
  "Chon",
  "Aung myin par say",
  "Salomat bo'ling",
  "Sag bol",
  "Den sooluk",
  "Ba sihat",
  "Be salamatí",
  "Seha",
  "L'chaim",
  "Maisha",
  "Le tenachin",
  "Bula",
  "Manuia",
  "Māló",
  "Gaumarjos",
  "Genats",
  "Nuş olsun",
  "Gëzuar",
  "Živeli",
  "Živjeli",
  "Na zdravje",
  "Nazdravje",
];

/**
 * Get all prost words for the marquee
 * Returns all prost words in a shuffled order
 */
export function getRandomProstWords(count?: number): string[] {
  // If no count specified, return all words shuffled
  if (count === undefined) {
    return [...prostWords].sort(() => Math.random() - 0.5);
  }
  // Otherwise return the requested count
  const shuffled = [...prostWords].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, prostWords.length));
}
