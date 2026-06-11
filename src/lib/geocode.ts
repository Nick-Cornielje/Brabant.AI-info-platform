const CITY_COORDS: Record<string, [number, number]> = {
  "eindhoven": [51.4416, 5.4697],
  "tilburg": [51.5555, 5.0913],
  "'s-hertogenbosch": [51.6978, 5.3037],
  "den bosch": [51.6978, 5.3037],
  "s-hertogenbosch": [51.6978, 5.3037],
  "hertogenbosch": [51.6978, 5.3037],
  "breda": [51.5719, 4.7683],
  "helmond": [51.4820, 5.6630],
  "oss": [51.7639, 5.5185],
  "bergen op zoom": [51.4936, 4.2885],
  "roosendaal": [51.5305, 4.4636],
  "waalwijk": [51.6832, 5.0674],
  "veghel": [51.6150, 5.5522],
  "boxtel": [51.5944, 5.3345],
  "vught": [51.6561, 5.2993],
  "nuenen": [51.4686, 5.5483],
  "geldrop": [51.4189, 5.5682],
  "veldhoven": [51.4159, 5.4067],
  "son en breugel": [51.5133, 5.5006],
  "son": [51.5133, 5.5006],
  "valkenswaard": [51.3550, 5.4597],
  "eersel": [51.3595, 5.3161],
  "deurne": [51.4589, 5.8040],
  "gemert": [51.5592, 5.6886],
  "schijndel": [51.6250, 5.4347],
  "meierijstad": [51.6250, 5.5250],
  "sint-michielsgestel": [51.6399, 5.3548],
  "oisterwijk": [51.5769, 5.1983],
  "dongen": [51.6261, 4.9330],
  "kaatsheuvel": [51.6530, 5.0414],
  "woensdrecht": [51.4333, 4.3833],
  "steenbergen": [51.5883, 4.3089],
  "rucphen": [51.5317, 4.5706],
  "zundert": [51.3658, 4.6575],
  "heusden": [51.7297, 5.1432],
  "woudrichem": [51.8178, 5.0027],
  "geertruidenberg": [51.7031, 4.8556],
  "moerdijk": [51.6997, 4.6381],
  "halderberge": [51.5669, 4.5778],
  "brainport": [51.4416, 5.4697],
  "amsterdam": [52.3676, 4.9041],
  "rotterdam": [51.9244, 4.4777],
  "utrecht": [52.0907, 5.1214],
  "den haag": [52.0705, 4.3007],
  "the hague": [52.0705, 4.3007],
  "arnhem": [51.9851, 5.8987],
  "nijmegen": [51.8426, 5.8546],
  "maastricht": [50.8514, 5.6910],
  "venlo": [51.3703, 6.1724],
  "groningen": [53.2194, 6.5665],
  "leeuwarden": [53.2012, 5.7999],
  "zwolle": [52.5168, 6.0830],
  "deventer": [52.2550, 6.1552],
  "amersfoort": [52.1561, 5.3878],
  "apeldoorn": [52.2112, 5.9699],
  "enschede": [52.2215, 6.8937],
  "hengelo": [52.2660, 6.7936],
  "almelo": [52.3567, 6.6624],
  "delft": [52.0116, 4.3571],
  "leiden": [52.1601, 4.4970],
  "haarlem": [52.3874, 4.6462],
  "dordrecht": [51.8133, 4.6901],
  "zoetermeer": [52.0574, 4.4940],
  "brainport eindhoven": [51.4416, 5.4697],
};

export interface CityMarker {
  lat: number;
  lng: number;
  city: string;
  stakeholders: { name: string; slug: string }[];
}

export function buildCityMarkers(
  stakeholders: { name: string; slug: string; vestigingsplaats: string }[]
): CityMarker[] {
  const byCity = new Map<string, CityMarker>();

  for (const s of stakeholders) {
    if (!s.vestigingsplaats) continue;
    const key = s.vestigingsplaats.toLowerCase().trim();
    const coords = CITY_COORDS[key];
    if (!coords) continue;

    if (!byCity.has(key)) {
      byCity.set(key, {
        lat: coords[0],
        lng: coords[1],
        city: s.vestigingsplaats,
        stakeholders: [],
      });
    }
    byCity.get(key)!.stakeholders.push({ name: s.name, slug: s.slug });
  }

  return Array.from(byCity.values());
}
