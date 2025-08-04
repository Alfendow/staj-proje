import { KrediIstek } from "./kredi-istek.model";
import { KrediSonuc } from "./kredi-sonuc.model";

export interface KayitliKredi {
  id?: number;
  musteriId: number;
  istekVerisi: string; // Bu aslında JSON formatında bir KrediIstek
  sonucVerisi: string; // Bu aslında JSON formatında bir KrediSonuc
  kayitTarihi: string;
  guncellemeTarihi?: string | null;

  // Frontend'de kolay kullanım için bu alanları ekleyebiliriz
  parsedIstek?: KrediIstek;
  parsedSonuc?: KrediSonuc;
}