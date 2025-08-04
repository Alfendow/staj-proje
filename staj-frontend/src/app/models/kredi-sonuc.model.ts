export interface KrediSonuc {
  taksitDetaylari: TaksitDetayi[];
  toplamOdeme: number;
}

export interface TaksitDetayi {
  ay: number;
  odemeTarihi: string;
  toplamTaksit: number | null;
}
