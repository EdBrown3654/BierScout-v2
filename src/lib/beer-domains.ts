/**
 * Maps brewery names (lowercased) and beer brand names to their website domains.
 * Used to fetch brand logos via Google's favicon service.
 */

// Brewery name → domain
const breweryMap: Record<string, string> = {
  // ─── ÄGYPTEN ───
  "al ahram beverages company": "alahrambeverages.com",

  // ─── ALBANIEN ───
  "birra korça": "birrakorca.al",
  "birra tirana": "birratirana.com",

  // ─── ANGOLA ───
  "empresa de cervejas de angola": "cuca.co.ao",

  // ─── ARGENTINIEN ───
  "cervecería y maltería quilmes": "quilmes.com.ar",
  "ccu argentina": "ccu.cl",

  // ─── ÄTHIOPIEN ───
  "meta abo brewery": "metaabo.com",

  // ─── AUSTRALIEN ───
  "carlton & united breweries": "cub.com.au",
  "coopers brewery": "coopers.com.au",
  "castlemaine perkins": "xxxx.com.au",
  "lion nathan": "lionco.com",

  // ─── BAHAMAS ───
  "commonwealth brewery": "commonwealthbrewery.com",

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
  "abbaye notre-dame de saint-rémy": "trappistes-rochefort.com",

  // ─── BOLIVIEN ───
  "cervecería boliviana nacional": "cbn.bo",

  // ─── BARBADOS ───
  "banks barbados breweries": "banksbeer.com",

  // ─── BOSNIEN UND HERZEGOWINA ───
  "sarajevska pivara": "sarajevskopivo.ba",

  // ─── BRASILIEN ───
  "ambev": "ambev.com.br",
  "grupo petrópolis": "grupopetropolis.com.br",

  // ─── BULGARIEN ───
  "zagorka brewery": "zagorka.bg",
  "kamenitza brewery": "kamenitza.bg",

  // ─── CHILE ───
  "compañía cervecerías unidas": "ccu.cl",
  "cervecería austral": "cervezaaustral.cl",
  "cervecería kunstmann": "cerveceriakunstmann.cl",
  "cervecería becker": "ccu.cl",

  // ─── CHINA ───
  "tsingtao brewery": "tsingtao.com.cn",
  "china resources snow breweries": "snowbeer.com.cn",
  "beijing yanjing brewery": "yanjing.com.cn",
  "pabst brewing": "pabstblueribbon.com",

  // ─── COSTA RICA ───
  "florida ice & farm": "fifco.com",

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
  "weisse taube": "weisse-taube.de",
  "weiherer x oldskool": "weiherer-bier.de",
  "eschenbacher": "eschenbacher.de",

  // ─── DOMINIKANISCHE REPUBLIK ───
  "cervecería nacional dominicana": "cnd.com.do",

  // ─── EL SALVADOR ───
  "industrias la constancia": "laconstancia.com",

  // ─── ESTLAND ───
  "saku brewery": "sfrgroup.ee",
  "a. le coq": "alecoq.ee",

  // ─── FINNLAND ───
  "hartwall": "hartwall.fi",
  "olvi": "olvi.fi",
  "sinebrychoff": "sinebrychoff.fi",

  // ─── FRANKREICH ───
  "brasseries kronenbourg": "kronenbourg.com",
  "brasserie meteor": "meteor.fr",
  "brasserie castelain": "castelain.com",
  "brasserie pelforth": "pelforth.fr",

  // ─── GHANA ───
  "accra brewery": "accrabrewery.com",
  "guinness ghana breweries": "guinness-ghana.com",

  // ─── GRIECHENLAND ───
  "mythos brewery": "mythosbrewery.gr",
  "olympic brewery": "olympicbrewery.gr",
  "athenian brewery": "athenianbrewery.gr",
  "macedonian thrace brewery": "verginabeer.com",

  // ─── GUATEMALA ───
  "cervecería centroamericana": "cerveceriacentroamericana.com",

  // ─── HONDURAS ───
  "cervecería hondureña": "cerveceriahondurena.com",

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
  "ölvisholt brugghús": "olvisholt.is",

  // ─── ISRAEL ───
  "tempo beer industries": "tempobeer.co.il",

  // ─── ITALIEN ───
  "birra peroni": "peroni.com",
  "birra moretti": "birramoretti.com",
  "birra menabrea": "birra-menabrea.it",
  "birra messina": "birramessina.it",
  "heineken italia": "heinekenitalia.it",

  // ─── JAMAIKA ───
  "desnoes & geddes": "redstripebeer.com",

  // ─── JAPAN ───
  "asahi breweries": "asahibeer.com",
  "kirin brewery company": "kirin.co.jp",
  "sapporo breweries": "sapporobeer.com",
  "orion breweries": "orionbeer.co.jp",

  // ─── KAMBODSCHA ───
  "cambrew": "cambrew.com",
  "cambodia brewery": "cambodiabrewery.com",

  // ─── KAMERUN ───
  "société anonyme des brasseries du cameroun": "sabc-sa.com",

  // ─── KANADA ───
  "molson coors": "molsoncoors.com",
  "labatt brewing company": "labatt.com",

  // ─── KASACHSTAN ───
  "efes kazakhstan": "efes.kz",

  // ─── KONGO (DR) ───
  "bralima": "bralimagroup.com",

  // ─── KROATIEN ───
  "carlsberg croatia": "carlsberg.hr",
  "zagrebačka pivovara": "ozujsko.com",

  // ─── KUBA ───
  "cervecería bucanero": "bucanero.cu",
  "bucanero": "bucanero.cu",

  // ─── LETTLAND ───
  "carlsberg latvia": "carlsberg.lv",
  "užavas alus darītava": "uzavasalus.lv",

  // ─── LIBANON ───
  "almaza s.a.l.": "almaza.com.lb",
  "961 beer s.a.l.": "961beer.com",

  // ─── LITAUEN ───
  "carlsberg lithuania": "carlsberg.lt",

  // ─── LUXEMBURG ───
  "brasserie nationale": "brasserie.lu",

  // ─── MALAYSIA ───
  "guinness anchor berhad": "gab.com.my",
  "carlsberg malaysia": "carlsberg.com.my",

  // ─── MALTA ───
  "simonds farsons cisk": "farsons.com",

  // ─── MAROKKO ───
  "société des boissons du maroc": "groupesbm.com",
  "sbm": "groupesbm.com",

  // ─── MEXIKO ───
  "grupo modelo": "grupomodelo.com",
  "cuauhtémoc moctezuma": "heineken.com",

  // ─── MONGOLEI ───
  "apu company": "apu.mn",

  // ─── MONTENEGRO ───
  "trebjesa brewery": "trebjesa.co.me",

  // ─── MOSAMBIK ───
  "cervejas de moçambique": "cdm.co.mz",

  // ─── MYANMAR ───
  "myanmar brewery": "myanmarbrewery.com",

  // ─── NEPAL ───
  "gorkha brewery": "gorkhabrewery.com",

  // ─── NEUSEELAND ───
  "db breweries": "db.co.nz",

  // ─── NICARAGUA ───
  "compañía cervecera de nicaragua": "ccn.com.ni",

  // ─── NIEDERLANDE ───
  "koninklijke grolsch": "grolsch.com",
  "koninklijke brand": "brand.nl",
  "uiltje": "uiltjecraftbeer.com",
  "vandestreek": "vandestreekbier.nl",
  "la trappe": "latrappetrappist.com",
  "la trappe trappist": "latrappetrappist.com",
  "bavaria": "bavaria.com",
  "arcen": "hertogjan.nl",

  // ─── NORDMAZEDONIEN ───
  "skopska pivara": "skopskopivo.mk",

  // ─── NORWEGEN ───
  "ringnes": "ringnes.no",
  "aass bryggeri": "aass.no",
  "mack brewery": "mack.no",

  // ─── ÖSTERREICH ───
  "stieglbrauerei": "stiegl.at",
  "brauerei göss": "goesser.at",
  "brauerei zipf": "zipfer.at",
  "ottakringer brauerei": "ottakringer.at",
  "brau union österreich": "brauunion.at",

  // ─── PAKISTAN ───
  "murree brewery": "murreebrewery.com",

  // ─── PAPUA-NEUGUINEA ───
  "heineken png": "heineken.com",

  // ─── PANAMA ───
  "cervecería nacional": "cerveceríanacional.com",

  // ─── PERU ───
  "unión de cervecerías peruanas backus y johnston": "backus.pe",
  "backus": "backus.pe",

  // ─── PHILIPPINEN ───
  "san miguel brewery": "sanmiguelbrewery.com",

  // ─── POLEN ───
  "grupa żywiec": "grupazywiec.pl",
  "kompania piwowarska": "kp.pl",
  "carlsberg polska": "carlsberg.pl",

  // ─── PORTUGAL ───
  "unicer": "superbock.pt",
  "sociedade central de cervejas": "centralcervejas.pt",

  // ─── PUERTO RICO ───
  "compañía cervecera de puerto rico": "medallalight.com",

  // ─── RUMÄNIEN ───
  "ursus breweries": "ursus.ro",
  "heineken romania": "heineken.ro",

  // ─── RUANDA ───
  "bralirwa": "bralirwa.co.rw",

  // ─── RUSSLAND ───
  "baltika breweries": "baltika.ru",
  "ochakovo brewery": "ochakovo.ru",
  "heineken russia": "heineken.ru",

  // ─── SAMBIA ───
  "zambian breweries": "zambian-breweries.com",

  // ─── SCHWEDEN ───
  "carlsberg sverige": "carlsberg.se",
  "spendrups": "spendrups.se",

  // ─── SCHWEIZ ───
  "feldschlösschen": "feldschloesschen.swiss",
  "eichhof": "eichhof.ch",
  "carlsberg schweiz": "feldschloesschen.swiss",

  // ─── SERBIEN ───
  "apatin brewery": "apatinskapivara.rs",
  "carlsberg serbia": "carlsberg.rs",
  "zaječarsko brewery": "zajecarskopivo.rs",

  // ─── SIMBABWE ───
  "delta corporation": "delta.co.zw",

  // ─── SINGAPUR ───
  "asia pacific breweries": "apb.com.sg",

  // ─── SLOWAKEI ───
  "heineken slovensko": "heineken.sk",

  // ─── SLOWENIEN ───
  "pivovarna laško": "lasko.eu",
  "pivovarna union": "pivo-union.si",

  // ─── SPANIEN ───
  "san miguel fábricas de cerveza y malta": "sanmiguel.com",
  "s.a. damm": "damm.com",
  "mahou-san miguel": "mahou.com",
  "hijos de rivera": "estrellagalicia.es",
  "cervezas alhambra": "cervezasalhambra.es",
  "heineken españa": "cruzcampo.es",

  // ─── SRI LANKA ───
  "lion brewery": "lionbeer.com",

  // ─── SÜDAFRIKA ───
  "south african breweries": "sab.co.za",
  "sabmiller": "sabmiller.com",

  // ─── SÜDKOREA ───
  "hite brewery": "hitejinro.com",
  "ob beer company": "ob.co.kr",
  "lotte chilsung beverage": "lottechilsung.co.kr",

  // ─── TAIWAN ───
  "taiwan tobacco & liquor": "ttl.com.tw",

  // ─── TANSANIA ───
  "tanzania breweries": "tanzaniabreweries.co.tz",

  // ─── THAILAND ───
  "boon rawd brewery": "boonrawd.co.th",
  "thai beverage": "thaibev.com",
  "thaibev": "thaibev.com",

  // ─── TSCHECHIEN ───
  "plzeňský prazdroj": "pilsnerurquell.com",
  "pivovary staropramen": "staropramen.com",
  "budějovický budvar": "budvar.cz",
  "rodinný pivovar bernard": "bernard.cz",
  "heineken česká republika": "krusovice.cz",

  // ─── TUNESIEN ───
  "société frigorifique et brasserie de tunis": "sfbt.com.tn",

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

  // ─── UGANDA ───
  "nile breweries": "nilebreweries.co.ug",
  "uganda breweries": "ugandabreweries.com",

  // ─── UNGARN ───
  "heineken hungária": "heineken.hu",
  "borsodi sörgyár": "borsodi.hu",

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

  // ─── URUGUAY ───
  "fnc": "fnc.com.uy",

  // ─── VENEZUELA ───
  "cervecería polar": "empresaspolar.com",
  "cervecería regional": "cerveceríaregional.com",

  // ─── KENIA ───
  "east african breweries": "eabl.com",

  // ─── KOLUMBIEN ───
  "bavaria brewery": "bavaria.co",

  // ─── NAMIBIA ───
  "namibia breweries": "nambrew.com",

  // ─── VIETNAM ───
  "sabeco": "sabeco.com.vn",
  "habeco": "habeco.com.vn",
  "vietnam brewery": "heineken.com.vn",

  // ─── ZYPERN ───
  "keo brewery": "keo.com.cy",
  "photos photiades breweries": "carlsberg.com.cy",

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
  "n'ice chouffe": "chouffe.com",
  "chimay rouge": "chimay.com",
  "chimay bleue": "chimay.com",
  "westmalle dubbel": "trappistwestmalle.be",
  "westmalle tripel": "trappistwestmalle.be",
  "orval": "orval.be",
  "jupiler": "jupiler.be",
  "kwak": "bestbelgianspecialbeers.be",
  "tripel karmeliet": "bestbelgianspecialbeers.be",
  "rochefort 10": "trappistes-rochefort.com",

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

  // China
  "tsingtao": "tsingtao.com.cn",
  "qingdao": "tsingtao.com.cn",
  "snow beer": "snowbeer.com.cn",
  "yanjing beer": "yanjing.com.cn",

  // Croatia
  "ožujsko": "ozujsko.com",
  "karlovačko": "karlovacko.hr",

  // Greece
  "mythos": "mythosbrewery.gr",
  "fix hellas": "fixbeer.gr",

  // India
  "kingfisher premium lager": "kingfisherworld.com",
  "cobra premium lager": "cobrabeer.com",

  // Indonesia
  "bintang": "multibintang.co.id",

  // Hungary
  "dreher classic": "dreher.hu",
  "soproni": "soproni.hu",

  // Ireland
  "guinness draught": "guinness.com",
  "guinness extra stout": "guinness.com",
  "murphy's irish stout": "murphys.com",
  "smithwick's irish ale": "smithwicks.com",
  "kilkenny irish cream ale": "kilkennyale.com",
  "beamish stout": "heineken.com",

  // Israel
  "goldstar": "tempobeer.co.il",
  "maccabee": "tempobeer.co.il",

  // Italy
  "peroni nastro azzurro": "peroni.com",
  "moretti la rossa": "birramoretti.com",
  "ichnusa": "ichnusa.it",

  // Jamaica
  "red stripe": "redstripebeer.com",

  // Japan
  "asahi super dry": "asahibeer.com",
  "asahi black": "asahibeer.com",
  "kirin ichiban": "kirin.co.jp",
  "sapporo premium": "sapporobeer.com",

  // Luxembourg
  "bofferding pils": "bofferding.lu",
  "diekirch premium": "diekirch.lu",

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
  "puntigamer": "puntigamer.at",

  // Philippines
  "san miguel pale pilsen": "sanmiguelbrewery.com",

  // Poland
  "żywiec": "grupazywiec.pl",
  "tyskie gronie": "tyskie.pl",
  "lech premium": "lech.pl",
  "okocim": "okocim.pl",

  // Portugal
  "sagres": "sagres.pt",
  "super bock": "superbock.pt",

  // Czech
  "pilsner urquell": "pilsnerurquell.com",
  "staropramen premium": "staropramen.com",
  "budweiser budvar": "budvar.cz",
  "kozel premium": "kozel.cz",
  "bernard": "bernard.cz",
  "gambrinus": "gambrinus.cz",
  "krušovice": "krusovice.cz",

  // Slovakia
  "zlatý bažant": "zlatybazant.sk",

  // Spain
  "estrella damm": "estrelladamm.com",
  "estrella galicia": "estrellagalicia.es",
  "mahou cinco estrellas": "mahou.com",
  "alhambra reserva 1925": "cervezasalhambra.es",
  "san miguel españa": "sanmiguel.com",
  "cruzcampo": "cruzcampo.es",

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

  // Taiwan
  "taiwan beer": "ttl.com.tw",

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
  "tooheys new": "tooheys.com.au",
  "xxxx gold": "xxxx.com.au",

  // Canada
  "molson canadian": "molsoncanadian.ca",
  "labatt blue": "labatt.com",

  // New Zealand
  "steinlager pure": "steinlager.co.nz",

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

  // Albania
  "korça": "birrakorca.al",

  // Bolivia
  "paceña": "cbn.bo",

  // Bulgaria
  "zagorka": "zagorka.bg",

  // Cuba
  "bucanero fuerte": "bucanero.cu",

  // Dominican Republic
  "presidente": "cnd.com.do",

  // Estonia
  "saku originaal": "sfrgroup.ee",
  "a. le coq premium": "alecoq.ee",

  // Finland
  "lapin kulta": "hartwall.fi",
  "karhu": "hartwall.fi",
  "koff": "sinebrychoff.fi",

  // Malta
  "cisk lager": "farsons.com",

  // Montenegro
  "nikšićko pivo": "trebjesa.co.me",

  // Romania
  "ciuc": "heineken.ro",

  // Slovenia
  "laško zlatorog": "lasko.eu",

  // Switzerland
  "calanda bräu": "feldschloesschen.swiss",

  // Venezuela
  "polar ice": "empresaspolar.com",
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
 * Uses the faviconV2 endpoint and requests a 128px favicon.
 */
const countryCompoundSecondLevels = new Set([
  "app",
  "biz",
  "co",
  "com",
  "edu",
  "fm",
  "gov",
  "info",
  "io",
  "me",
  "mil",
  "net",
  "org",
  "tv",
]);

// Known valid public-suffix-like combinations that should not be collapsed.
const knownCompoundCountrySuffixes = new Set([
  "co.ao",
  "co.id",
  "co.il",
  "co.jp",
  "co.ke",
  "co.kr",
  "co.me",
  "co.mz",
  "co.nz",
  "co.rw",
  "co.th",
  "co.tz",
  "co.ug",
  "co.uk",
  "co.za",
  "co.zw",
  "com.ar",
  "com.au",
  "com.br",
  "com.cn",
  "com.co",
  "com.cy",
  "com.do",
  "com.lb",
  "com.my",
  "com.ni",
  "com.sg",
  "com.tn",
  "com.tw",
  "com.uy",
  "com.vn",
]);

function normalizeDomain(domain: string): string {
  return domain
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/.*$/, "");
}

function normalizeDoubleTldDomain(domain: string): string {
  const parts = domain.split(".").filter(Boolean);
  if (parts.length < 3) return domain;

  const secondLevel = parts[parts.length - 2];
  const countryCode = parts[parts.length - 1];
  const compoundSuffix = `${secondLevel}.${countryCode}`;

  const hasCompoundCountrySuffix =
    /^[a-z]{2}$/.test(countryCode) &&
    countryCompoundSecondLevels.has(secondLevel);

  if (!hasCompoundCountrySuffix) return domain;
  if (knownCompoundCountrySuffixes.has(compoundSuffix)) return domain;

  // Collapse suspicious "*.com.xx" / "*.org.xx" style hostnames to "*.com" / "*.org".
  parts.pop();
  return parts.join(".");
}

function normalizeLogoDomain(domain: string): string {
  return normalizeDoubleTldDomain(normalizeDomain(domain));
}

export function normalizeLogoName(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9 ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function getLocalLogoUrl(domain: string): string {
  const normalizedDomain = normalizeLogoDomain(domain).replace(
    /[^a-z0-9.-]/g,
    "-"
  );
  return `/logos/${normalizedDomain}.png`;
}

export function getLogoDevUrl(domain: string, token: string): string {
  const normalizedDomain = normalizeLogoDomain(domain);
  const params = new URLSearchParams({
    token,
    format: "png",
    size: "128",
  });
  return `https://img.logo.dev/${encodeURIComponent(
    normalizedDomain
  )}?${params.toString()}`;
}

export function getLogoDevNameUrl(name: string, token: string): string {
  const normalizedName = normalizeLogoName(name);
  const params = new URLSearchParams({
    token,
    format: "png",
    size: "128",
  });
  return `https://img.logo.dev/name/${encodeURIComponent(
    normalizedName
  )}?${params.toString()}`;
}

export function getFaviconUrl(domain: string): string {
  const normalizedDomain = normalizeLogoDomain(domain);

  const params = new URLSearchParams({
    client: "SOCIAL",
    type: "FAVICON",
    fallback_opts: "TYPE,SIZE,URL",
    url: `https://${normalizedDomain}`,
    size: "128",
  });

  return `https://t2.gstatic.com/faviconV2?${params.toString()}`;
}
