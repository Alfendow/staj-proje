export interface KrediIstek {
  krediTuru: string;
  tutar: number;
  vade: number;
  aylikOran: number;
  odemeSikligi: string;
  aylikVeriler: AylikVeri[];
}

export interface AylikVeri {
  ay: number;
  atlandiMi: boolean;
  sabitTaksit: number | null;
  araOdeme: number | null;
  artis: number | null;
  artisTipi: string;
}