export type Rolle = 'MITARBEITER' | 'FILIALLEITER' | 'HR' | 'ADMIN';

export interface Filiale {
  id: number;
  name: string;
  ort: string;
}

export interface Mitarbeiter {
  id: number;
  benutzername: string;
  vorname: string;
  nachname: string;
  email: string;
  position: string;
  rollen: Rolle[];
  filialeId: number;
  eintrittsdatum: string;
  aktiv: boolean;
  urlaubsanspruchTage: number;
}

export interface Arbeitszeiteintrag {
  id: number;
  mitarbeiterId: number;
  kommen: string;
  gehen: string | null;
}

export type KorrekturStatus = 'OFFEN' | 'GENEHMIGT' | 'ABGELEHNT';

export interface Korrekturantrag {
  id: number;
  arbeitszeiteintragId: number;
  mitarbeiterId: number;
  gewuenschtesKommen: string;
  gewuenschtesGehen: string | null;
  grund: string;
  status: KorrekturStatus;
  erstelltAm: string;
  bearbeitetVon: number | null;
  bearbeitetAm: string | null;
}

export type UrlaubStatus = 'OFFEN' | 'GENEHMIGT' | 'ABGELEHNT';

export interface Urlaubsantrag {
  id: number;
  mitarbeiterId: number;
  von: string;
  bis: string;
  kommentar: string;
  status: UrlaubStatus;
  erstelltAm: string;
  bearbeitetVon: number | null;
  bearbeitetAm: string | null;
}
