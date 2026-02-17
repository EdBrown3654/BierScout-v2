/**
 * Maps brewery names (lowercased) and beer brand names to their website domains.
 * Used to fetch brand logos via Google's favicon service.
 */

// Brewery name → domain
const breweryMap: Record<string, string> = {
  // ─── ÄGYPTEN ───
  "al ahram beverages company": "alahrambeverages.com",

  // ─── ARGENTINIEN ───
  "cervecería y maltería quilmes": "quilmes.com.ar",

  // ─── AUSTRALIEN ───
  "carlton & united breweries": "cub.com.au",
  "coopers brewery": "coopers.com.au",
  "castlemaine perkins": "xxxx.com.au",

  // ─── BELGIEN ───
  "duvel": "duvel.com",
  "brasserie d'achouffe": "chouffe.com",
  "rodenbach": "rodenbach.be",
  "anheuser-busch inbev": "ab-inbev.com",
  "abbaye de leffe": "leffe.com",
  "brouwerij van hoegaarden": "hoegaarden.com",
  "abbaye de scourmont": "chimay.com",
  "abdij der trappisten": "trappistwestmalle.be",
  "brasserie d'orval": "orval.be",
  "piedboeuf brewery": "jupiler.be",
  "brouwerij bosteels": "bestbelgianspecialbeers.be",

  // ─── BRASILIEN ───
  "ambev": "ambev.com.br",
  "grupo petrópolis": "grupopetropolis.com.br",

  // ─── DÄNEMARK ───
  "carlsberg": "carlsberg.com",
  "tuborg brewery": "tuborg.com",
  "mikkeller": "mikkeller.com",
  "royal unibrew": "royalunibrew.com",

  // ─── DEUTSCHLAND ───
  "weiherer bier": "weiherer-bier.de",
  "ratsherrn brauerei": "ratsherrn.de",
  "keesmann bräu": "keesmann.de",
  "brinkhoffs": "brinkhoffs.de",
  "brauerei hummel": "brauerei-hummel.de",
  "erdinger weißbräu": "erdinger.de",
  "spaten-franziskaner-bräu": "franziskaner-weissbier.de",
  "paulaner brauerei": "paulaner.de",
  "staatliches hofbräuhaus münchen": "hofbraeu-muenchen.de",
  "löwenbräu": "loewenbraeu.de",
  "bitburger brauerei": "bitburger.de",
  "warsteiner brauerei": "warsteiner.de",
  "krombacher brauerei": "krombacher.de",
  "brauerei c. & a. veltins": "veltins.de",
  "brauerei beck": "becks.de",
  "friesisches brauhaus zu jever": "jever.de",
  "hasseröder brauerei": "hasseroeder.de",
  "radeberger exportbierbrauerei": "radeberger.de",
  "augustiner-bräu-münchen": "augustiner-braeu.de",
  "tegernseer": "brauhaus-tegernsee.de",
  "schorschbräu": "schorschbraeu.de",
  "klosterbrauerei andechs": "andechs.de",
  "weltenburger kloster": "weltenburger.de",
  "störtebeker": "stoertebeker.com",
  "riedenburger brauhaus": "riedenburger.de",
  "riedenburger": "riedenburger.de",
  "orca brau": "orcabrau.de",
  "biermanufaktur engel": "biermanufaktur-engel.de",
  "engel biermanufaktur": "biermanufaktur-engel.de",
  "brauerei kanone": "brauerei-kanone.de",
  "hopfenheld": "hopfenheld.de",
  "octobräu": "octobraeu.de",
  "lindenbräu": "lindenbraeu.de",

  // ─── FRANKREICH ───
  "brasseries kronenbourg": "kronenbourg.com",
  "brasserie meteor": "meteor.fr",
  "brasserie castelain": "castelain.com",
  "brasserie pelforth": "pelforth.fr",

  // ─── GRIECHENLAND ───
  "mythos brewery": "mythosbrewery.gr",

  // ─── INDIEN ───
  "united breweries": "theubgroup.com",
  "cobra beer": "cobrabeer.com",

  // ─── INDONESIEN ───
  "multi bintang indonesia": "multibintang.co.id",

  // ─── IRLAND ───
  "guinness brewery": "guinness.com",
  "diageo": "diageo.com",
  "heineken": "heineken.com",

  // ─── ISLAND ───
  "ölgerðin egill skallagrímsson": "egils.is",

  // ─── ITALIEN ───
  "birra peroni": "peroni.com",
  "birra moretti": "birramoretti.com",
  "birra menabrea": "birra-menabrea.it",

  // ─── JAMAIKA ───
  "desnoes & geddes": "redstripebeer.com",

  // ─── JAPAN ───
  "asahi breweries": "asahibeer.com",
  "kirin brewery company": "kirin.co.jp",
  "sapporo breweries": "sapporobeer.com",
  "orion breweries": "orionbeer.co.jp",

  // ─── KANADA ───
  "molson coors": "molsoncoors.com",
  "labatt brewing company": "labatt.com",

  // ─── MEXIKO ───
  "grupo modelo": "gfrupa-modelo.com",
  "cuauhtémoc moctezuma": "heineken.com",

  // ─── NIEDERLANDE ───
  "koninklijke grolsch": "grolsch.com",
  "uiltje": "uiltjecraftbeer.com",
  "vandestreek": "vandestreekbier.nl",
  "la trappe": "latrappetrappist.com",
  "la trappe trappist": "latrappetrappist.com",
  "bavaria": "bavaria.com",
  "arcen": "hertogjan.nl",

  // ─── NORWEGEN ───
  "ringnes": "ringnes.no",
  "aass bryggeri": "aass.no",

  // ─── ÖSTERREICH ───
  "stieglbrauerei": "stiegl.at",
  "brauerei göss": "goesser.at",
  "brauerei zipf": "zipfer.at",
  "ottakringer brauerei": "ottakringer.at",

  // ─── PHILIPPINEN ───
  "san miguel brewery": "sanmiguelbrewery.com",

  // ─── POLEN ───
  "grupa żywiec": "grupazywiec.pl",
  "kompania piwowarska": "kp.pl",
  "carlsberg polska": "carlsberg.pl",

  // ─── PORTUGAL ───
  "unicer": "superbock.pt",
  "sociedade central de cervejas": "centralcervejas.pt",

  // ─── RUMÄNIEN ───
  "ursus breweries": "ursus.ro",

  // ─── RUSSLAND ───
  "baltika breweries": "baltika.ru",

  // ─── SCHWEDEN ───
  "carlsberg sverige": "carlsberg.se",
  "spendrups": "spendrups.se",

  // ─── SCHWEIZ ───
  "feldschlösschen": "feldschloesschen.swiss",
  "eichhof": "eichhof.ch",

  // ─── SERBIEN ───
  "apatin brewery": "apatinskapivara.rs",

  // ─── SINGAPUR ───
  "asia pacific breweries": "apb.com.sg",

  // ─── SLOWENIEN ───
  "pivovarna laško": "lasko.eu",
  "pivovarna union": "pivo-union.si",

  // ─── SPANIEN ───
  "s.a. damm": "damm.com",
  "mahou-san miguel": "mahou.com",
  "hijos de rivera": "estrellagalicia.es",
  "cervezas alhambra": "cervezasalhambra.es",
  "heineken españa": "cruzcampo.es",

  // ─── SÜDAFRIKA ───
  "south african breweries": "sab.co.za",
  "sabmiller": "sabmiller.com",

  // ─── SÜDKOREA ───
  "hite brewery": "hitejinro.com",
  "ob beer company": "ob.co.kr",
  "lotte chilsung beverage": "lottechilsung.co.kr",

  // ─── THAILAND ───
  "boon rawd brewery": "boonrawd.co.th",
  "thai beverage": "thaibev.com",

  // ─── TSCHECHIEN ───
  "plzeňský prazdroj": "pilsnerurquell.com",
  "pivovary staropramen": "staropramen.com",
  "budějovický budvar": "budvar.cz",
  "rodinný pivovar bernard": "bernard.cz",
  "heineken česká republika": "krusovice.cz",

  // ─── TÜRKEI ───
  "anadolu efes": "anadoluefes.com",
  "efes brewery": "anadoluefes.com",

  // ─── UK ───
  "brewdog": "brewdog.com",
  "fuller's brewery": "fullers.co.uk",
  "vault city": "vaultcity.co.uk",
  "greene king": "greeneking.co.uk",
  "newcastle breweries": "newcastlebeer.co.uk",
  "shepherd neame": "shepherdneame.co.uk",
  "marston's": "marstons.co.uk",
  "molson coors uk": "molsoncoors.com",
  "heineken uk": "heineken.co.uk",

  // ─── SCHOTTLAND ───
  "tennent caledonian": "tennents.com",
  "belhaven brewery": "belhaven.co.uk",
  "innis & gunn brewing company": "innisandgunn.com",

  // ─── USA ───
  "anheuser-busch": "anheuser-busch.com",
  "boston beer company": "samueladams.com",
  "sierra nevada brewing co.": "sierranevada.com",
  "brooklyn brewery": "brooklynbrewery.com",
  "stone brewing": "stonebrewing.com",
  "lagunitas brewing company": "lagunitas.com",
  "goose island beer co.": "gooseisland.com",
  "pabst brewing company": "pabstblueribbon.com",
  "anchor brewing company": "anchorbrewing.com",
  "d.g. yuengling & son": "yuengling.com",
  "fat head's brewery": "fatheads.com",

  // ─── KENIA ───
  "east african breweries": "eabl.com",

  // ─── KOLUMBIEN ───
  "bavaria brewery": "bavaria.co",

  // ─── NAMIBIA ───
  "namibia breweries": "nambrew.com",

  // ─── VIETNAM ───
  "sabeco": "sabeco.com.vn",
  "habeco": "habeco.com.vn",

  // ─── NIGERIA ───
  "nigerian breweries": "nbplc.com",

  // ─── TRINIDAD UND TOBAGO ───
  "carib brewery": "caribbrewery.com",
};

// Well-known beer BRAND names → domain (for when the brand name is more recognizable than the brewery)
const brandMap: Record<string, string> = {
  // Belgium
  "stella artois": "stellaartois.com",
  "leffe blonde": "leffe.com",
  "leffe brune": "leffe.com",
  "hoegaarden": "hoegaarden.com",
  "duvel belgisch speciaalbier": "duvel.com",
  "la chouffe blonde": "chouffe.com",
  "chimay rouge": "chimay.com",
  "chimay bleue": "chimay.com",
  "westmalle dubbel": "trappistwestmalle.be",
  "westmalle tripel": "trappistwestmalle.be",
  "orval": "orval.be",
  "jupiler": "jupiler.be",
  "kwak": "bestbelgianspecialbeers.be",
  "tripel karmeliet": "bestbelgianspecialbeers.be",

  // Denmark
  "carlsberg pilsner": "carlsberg.com",
  "tuborg green": "tuborg.com",

  // Germany - Big brands
  "erdinger weißbier": "erdinger.de",
  "erdinger dunkel": "erdinger.de",
  "erdinger alkoholfrei": "erdinger.de",
  "franziskaner weißbier": "franziskaner-weissbier.de",
  "paulaner hefe-weißbier": "paulaner.de",
  "paulaner salvator": "paulaner.de",
  "hofbräu original": "hofbraeu-muenchen.de",
  "hofbräu dunkel": "hofbraeu-muenchen.de",
  "löwenbräu original": "loewenbraeu.de",
  "spaten münchen": "spatenbeer.com",
  "bitburger premium pils": "bitburger.de",
  "warsteiner premium verum": "warsteiner.de",
  "krombacher pils": "krombacher.de",
  "veltins pilsener": "veltins.de",
  "beck's pils": "becks.de",
  "jever pilsener": "jever.de",
  "hasseröder premium pils": "hasseroeder.de",
  "radeberger pilsner": "radeberger.de",
  "augustiner edelstoff exportbier": "augustiner-braeu.de",
  "tegernseer dunkel export": "brauhaus-tegernsee.de",
  "kloster andechs doppelbock dunkel": "andechs.de",
  "störtebeker baltik-lager": "stoertebeker.com",
  "schorschbock 13": "schorschbraeu.de",
  "schorschweizen 15%": "schorschbraeu.de",

  // France
  "kronenbourg 1664": "kronenbourg.com",
  "1664 blanc": "kronenbourg.com",

  // Greece
  "mythos": "mythosbrewery.gr",

  // India
  "kingfisher premium lager": "kingfisherworld.com",
  "cobra premium lager": "cobrabeer.com",

  // Indonesia
  "bintang": "multibintang.co.id",

  // Ireland
  "guinness draught": "guinness.com",
  "guinness extra stout": "guinness.com",
  "murphy's irish stout": "murphys.com",
  "smithwick's irish ale": "smithwicks.com",
  "kilkenny irish cream ale": "kilkennyale.com",

  // Italy
  "peroni nastro azzurro": "peroni.com",
  "moretti la rossa": "birramoretti.com",

  // Jamaica
  "red stripe": "redstripebeer.com",

  // Japan
  "asahi super dry": "asahibeer.com",
  "asahi black": "asahibeer.com",
  "kirin ichiban": "kirin.co.jp",
  "sapporo premium": "sapporobeer.com",

  // Mexico
  "corona extra": "corona.com",
  "modelo especial": "modelousa.com",
  "negra modelo": "modelousa.com",
  "dos equis lager": "dosequis.com",
  "tecate original": "tecate.com",
  "pacifico clara": "discoverpacifico.com",
  "sol": "solbeer.com",

  // Netherlands
  "heineken lager": "heineken.com",
  "grolsch premium lager": "grolsch.com",
  "amstel lager": "amstel.com",
  "hertog jan": "hertogjan.nl",
  "brand pilsener": "brand.nl",

  // Austria
  "stiegl goldbräu": "stiegl.at",
  "gösser märzen": "goesser.at",
  "zipfer urtyp": "zipfer.at",
  "ottakringer helles": "ottakringer.at",

  // Philippines
  "san miguel pale pilsen": "sanmiguelbrewery.com",

  // Poland
  "żywiec": "grupazywiec.pl",
  "tyskie gronie": "tyskie.pl",

  // Portugal
  "sagres": "sagres.pt",
  "super bock": "superbock.pt",

  // Czech
  "pilsner urquell": "pilsnerurquell.com",
  "staropramen premium": "staropramen.com",
  "budweiser budvar": "budvar.cz",
  "kozel premium": "kozel.cz",
  "bernard": "bernard.cz",

  // Spain
  "estrella damm": "estrelladamm.com",
  "estrella galicia": "estrellagalicia.es",
  "mahou cinco estrellas": "mahou.com",
  "alhambra reserva 1925": "cervezasalhambra.es",
  "san miguel españa": "sanmiguel.com",

  // Thailand
  "singha": "singha.com",
  "chang beer": "changbeer.com",
  "leo beer": "singha.com",

  // Turkey
  "efes pilsener": "anadoluefes.com",

  // UK
  "brewdog punk ipa": "brewdog.com",
  "brewdog elvis juice": "brewdog.com",
  "fuller's london pride": "fullers.co.uk",
  "newcastle brown ale": "newcastlebeer.co.uk",
  "carling": "carling.com",
  "foster's": "fosters.com",
  "innis & gunn original": "innisandgunn.com",
  "tennent's lager": "tennents.com",

  // USA
  "budweiser": "budweiser.com",
  "coors light": "coorslight.com",
  "miller genuine draft": "millerlite.com",
  "samuel adams boston lager": "samueladams.com",
  "sierra nevada pale ale": "sierranevada.com",
  "brooklyn lager": "brooklynbrewery.com",
  "blue moon belgian white": "bluemoonbrewingcompany.com",
  "stone ipa": "stonebrewing.com",
  "lagunitas ipa": "lagunitas.com",
  "goose island ipa": "gooseisland.com",
  "pabst blue ribbon": "pabstblueribbon.com",
  "anchor steam beer": "anchorbrewing.com",
  "yuengling traditional lager": "yuengling.com",

  // Australia
  "victoria bitter": "vb.com.au",
  "coopers pale ale": "coopers.com.au",
  "coopers sparkling ale": "coopers.com.au",
  "foster's lager": "fosters.com.au",
  "carlton draught": "cub.com.au",

  // Canada
  "molson canadian": "molsoncanadian.ca",
  "labatt blue": "labatt.com",

  // South Africa
  "castle lager": "castlelager.co.za",

  // Namibia
  "windhoek lager": "windhoekbeer.com",
  "windhoek draught": "windhoekbeer.com",

  // Kenya
  "tusker lager": "tusker.co.ke",

  // Singapore
  "tiger beer": "tigerbeer.com",

  // Colombia
  "club colombia": "clubcolombia.com.co",

  // Russia
  "baltika no. 3 classic": "baltika.ru",
  "baltika no. 9 strong": "baltika.ru",

  // Switzerland
  "feldschlösschen original": "feldschloesschen.swiss",

  // Laos
  "beerlao": "beerlao.la",
  "beerlao dark": "beerlao.la",
};

/**
 * Look up a domain for a beer by trying brand name first, then brewery name.
 */
export function getBeerDomain(
  beerName: string,
  breweryName: string
): string | null {
  const normalizedBeer = beerName.toLowerCase().trim();
  const normalizedBrewery = breweryName.toLowerCase().trim();

  // Try exact brand name match first
  if (brandMap[normalizedBeer]) return brandMap[normalizedBeer];

  // Try brewery name
  if (normalizedBrewery !== "-" && breweryMap[normalizedBrewery]) {
    return breweryMap[normalizedBrewery];
  }

  return null;
}

/**
 * Get the Google Favicon URL for a domain.
 * Returns a 128px favicon from Google's service.
 */
export function getFaviconUrl(domain: string): string {
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
}
