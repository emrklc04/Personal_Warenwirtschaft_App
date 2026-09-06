export interface Artikel {
  id: number;
  barcode: string;
  bezeichnung: string;
  preis: number;
  einheit: string;
  mindestbestand: number;
}

export interface Lagerbestand {
  artikelId: number;
  filialeId: number;
  menge: number;
}

export type InventurStatus = 'LAUFEND' | 'ABGESCHLOSSEN';

export interface Inventur {
  id: number;
  filialeId: number;
  stichtag: string;
  status: InventurStatus;
  erstelltVon: number;
}

export interface InventurEintrag {
  id: number;
  inventurId: number;
  artikelId: number;
  sollMenge: number;
  istMenge: number | null;
}

export type AbschreibungGrund = 'VERDERB' | 'BRUCH' | 'DIEBSTAHL' | 'SONSTIGES';

export interface Abschreibung {
  id: number;
  filialeId: number;
  artikelId: number;
  menge: number;
  grund: AbschreibungGrund;
  bemerkung: string;
  erstelltVon: number;
  erstelltAm: string;
}

export type BestellungStatus = 'OFFEN' | 'EINGETROFFEN';

export interface Bestellung {
  id: number;
  filialeId: number;
  artikelId: number;
  menge: number;
  status: BestellungStatus;
  bestelltVon: number;
  bestelltAm: string;
  eingetroffenAm: string | null;
}
