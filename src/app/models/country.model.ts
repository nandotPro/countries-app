export interface Country {
  name: {
    common: string;
    official: string;
    nativeName?: { [key: string]: { official: string; common: string } };
  };
  flags: {
    png: string;
    svg: string;
    alt?: string;
  };
  capital?: string[];
  population: number;
  region: string;
  subregion?: string;
  area: number;
  languages?: { [key: string]: string };
  currencies?: { [key: string]: { name: string; symbol: string } };
  borders?: string[];
  cca3: string;
}
