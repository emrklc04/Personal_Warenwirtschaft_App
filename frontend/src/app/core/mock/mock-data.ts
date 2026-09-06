import {
  Arbeitszeiteintrag,
  Filiale,
  Korrekturantrag,
  Mitarbeiter,
  Urlaubsantrag,
} from '../models/personal.model';
import {
  Abschreibung,
  Artikel,
  Bestellung,
  Inventur,
  InventurEintrag,
  Lagerbestand,
} from '../models/warenwirtschaft.model';

function vorTagenUm(tageZurueck: number, stunde: number, minute: number): string {
  const d = new Date();
  d.setDate(d.getDate() - tageZurueck);
  d.setHours(stunde, minute, 0, 0);
  return d.toISOString();
}

function datumInTagen(tage: number): string {
  const d = new Date();
  d.setDate(d.getDate() + tage);
  return d.toISOString().slice(0, 10);
}

function datumVorTagen(tage: number): string {
  return datumInTagen(-tage);
}

export const MOCK_FILIALEN: Filiale[] = [
  { id: 1, name: 'Filiale Wien Mitte', ort: 'Wien' },
  { id: 2, name: 'Filiale Graz Hauptplatz', ort: 'Graz' },
  { id: 3, name: 'Zentrale', ort: 'Wien' },
];

export const MOCK_MITARBEITER: Mitarbeiter[] = [
  {
    id: 1,
    benutzername: 'max.mustermann',
    vorname: 'Max',
    nachname: 'Mustermann',
    email: 'max.mustermann@firma.at',
    position: 'Verkäufer',
    rollen: ['MITARBEITER'],
    filialeId: 1,
    eintrittsdatum: '2022-03-01',
    aktiv: true,
    urlaubsanspruchTage: 25,
  },
  {
    id: 2,
    benutzername: 'erika.musterfrau',
    vorname: 'Erika',
    nachname: 'Musterfrau',
    email: 'erika.musterfrau@firma.at',
    position: 'Filialleiterin',
    rollen: ['FILIALLEITER'],
    filialeId: 1,
    eintrittsdatum: '2018-06-15',
    aktiv: true,
    urlaubsanspruchTage: 25,
  },
  {
    id: 3,
    benutzername: 'hannah.huber',
    vorname: 'Hannah',
    nachname: 'Huber',
    email: 'hannah.huber@firma.at',
    position: 'HR-Referentin',
    rollen: ['HR'],
    filialeId: 3,
    eintrittsdatum: '2019-09-01',
    aktiv: true,
    urlaubsanspruchTage: 25,
  },
  {
    id: 4,
    benutzername: 'alex.admin',
    vorname: 'Alex',
    nachname: 'Admin',
    email: 'alex.admin@firma.at',
    position: 'Systemadministrator',
    rollen: ['ADMIN'],
    filialeId: 3,
    eintrittsdatum: '2017-01-10',
    aktiv: true,
    urlaubsanspruchTage: 25,
  },
  {
    id: 5,
    benutzername: 'peter.petrov',
    vorname: 'Peter',
    nachname: 'Petrov',
    email: 'peter.petrov@firma.at',
    position: 'Lagerist',
    rollen: ['MITARBEITER'],
    filialeId: 2,
    eintrittsdatum: '2023-11-20',
    aktiv: true,
    urlaubsanspruchTage: 25,
  },
  {
    id: 6,
    benutzername: 'sonja.sommer',
    vorname: 'Sonja',
    nachname: 'Sommer',
    email: 'sonja.sommer@firma.at',
    position: 'Filialleiterin',
    rollen: ['FILIALLEITER'],
    filialeId: 2,
    eintrittsdatum: '2020-04-05',
    aktiv: true,
    urlaubsanspruchTage: 25,
  },
];

export const MOCK_ARBEITSZEITEINTRAEGE: Arbeitszeiteintrag[] = [
  { id: 1, mitarbeiterId: 1, kommen: vorTagenUm(2, 8, 2), gehen: vorTagenUm(2, 16, 31) },
  { id: 2, mitarbeiterId: 1, kommen: vorTagenUm(1, 7, 58), gehen: vorTagenUm(1, 16, 25) },
  { id: 3, mitarbeiterId: 1, kommen: vorTagenUm(0, 8, 5), gehen: null },
  { id: 4, mitarbeiterId: 2, kommen: vorTagenUm(1, 7, 30), gehen: vorTagenUm(1, 17, 2) },
  { id: 5, mitarbeiterId: 2, kommen: vorTagenUm(0, 7, 28), gehen: null },
  { id: 6, mitarbeiterId: 5, kommen: vorTagenUm(1, 9, 0), gehen: vorTagenUm(1, 17, 30) },
  { id: 7, mitarbeiterId: 6, kommen: vorTagenUm(0, 8, 15), gehen: null },
];

export const MOCK_KORREKTURANTRAEGE: Korrekturantrag[] = [
  {
    id: 1,
    arbeitszeiteintragId: 2,
    mitarbeiterId: 1,
    gewuenschtesKommen: vorTagenUm(1, 7, 58),
    gewuenschtesGehen: vorTagenUm(1, 16, 30),
    grund: 'Vergessen auszustempeln, tatsächliches Ende war 16:30 Uhr.',
    status: 'OFFEN',
    erstelltAm: vorTagenUm(0, 8, 30),
    bearbeitetVon: null,
    bearbeitetAm: null,
  },
  {
    id: 2,
    arbeitszeiteintragId: 1,
    mitarbeiterId: 1,
    gewuenschtesKommen: vorTagenUm(2, 8, 0),
    gewuenschtesGehen: vorTagenUm(2, 16, 31),
    grund: 'Kommen-Zeitpunkt war eigentlich 08:00 statt 08:02.',
    status: 'GENEHMIGT',
    erstelltAm: vorTagenUm(2, 17, 0),
    bearbeitetVon: 2,
    bearbeitetAm: vorTagenUm(1, 9, 0),
  },
];

export const MOCK_URLAUBSANTRAEGE: Urlaubsantrag[] = [
  {
    id: 1,
    mitarbeiterId: 1,
    von: datumInTagen(20),
    bis: datumInTagen(24),
    kommentar: 'Sommerurlaub mit der Familie.',
    status: 'OFFEN',
    erstelltAm: vorTagenUm(2, 9, 0),
    bearbeitetVon: null,
    bearbeitetAm: null,
  },
  {
    id: 2,
    mitarbeiterId: 1,
    von: datumVorTagen(60),
    bis: datumVorTagen(56),
    kommentar: 'Kurztrip.',
    status: 'GENEHMIGT',
    erstelltAm: datumVorTagen(70),
    bearbeitetVon: 2,
    bearbeitetAm: datumVorTagen(69),
  },
  {
    id: 3,
    mitarbeiterId: 5,
    von: datumInTagen(10),
    bis: datumInTagen(12),
    kommentar: 'Verlängertes Wochenende.',
    status: 'OFFEN',
    erstelltAm: vorTagenUm(1, 14, 0),
    bearbeitetVon: null,
    bearbeitetAm: null,
  },
];

export const MOCK_ARTIKEL: Artikel[] = [
  { id: 1, barcode: '4001724819185', bezeichnung: 'Vollmilch 1L', preis: 1.19, einheit: 'Stk', mindestbestand: 20 },
  { id: 2, barcode: '4009900427116', bezeichnung: 'Butter 250g', preis: 2.49, einheit: 'Stk', mindestbestand: 15 },
  { id: 3, barcode: '4088600123456', bezeichnung: 'Toastbrot 500g', preis: 1.79, einheit: 'Stk', mindestbestand: 20 },
  { id: 4, barcode: '4311501247891', bezeichnung: 'Bio-Eier 10er', preis: 3.29, einheit: 'Stk', mindestbestand: 15 },
  { id: 5, barcode: '4104420033445', bezeichnung: 'Bananen', preis: 1.99, einheit: 'kg', mindestbestand: 25 },
  { id: 6, barcode: '4000521234567', bezeichnung: 'Kaffee gemahlen 500g', preis: 5.99, einheit: 'Stk', mindestbestand: 10 },
  { id: 7, barcode: '4306180101010', bezeichnung: 'Küchenrolle 3er', preis: 2.29, einheit: 'Stk', mindestbestand: 16 },
  { id: 8, barcode: '4003994155486', bezeichnung: 'Nudeln Penne 500g', preis: 0.89, einheit: 'Stk', mindestbestand: 20 },
];

export const MOCK_LAGERBESTAND: Lagerbestand[] = [
  { artikelId: 1, filialeId: 1, menge: 42 },
  { artikelId: 2, filialeId: 1, menge: 25 },
  { artikelId: 3, filialeId: 1, menge: 30 },
  { artikelId: 4, filialeId: 1, menge: 18 },
  { artikelId: 5, filialeId: 1, menge: 60 },
  { artikelId: 6, filialeId: 1, menge: 22 },
  { artikelId: 7, filialeId: 1, menge: 15 },
  { artikelId: 8, filialeId: 1, menge: 50 },
  { artikelId: 1, filialeId: 2, menge: 35 },
  { artikelId: 2, filialeId: 2, menge: 20 },
  { artikelId: 3, filialeId: 2, menge: 28 },
  { artikelId: 4, filialeId: 2, menge: 12 },
  { artikelId: 5, filialeId: 2, menge: 45 },
  { artikelId: 6, filialeId: 2, menge: 19 },
  { artikelId: 7, filialeId: 2, menge: 10 },
  { artikelId: 8, filialeId: 2, menge: 33 },
];

export const MOCK_INVENTUREN: Inventur[] = [
  { id: 1, filialeId: 1, stichtag: vorTagenUm(30, 18, 0), status: 'ABGESCHLOSSEN', erstelltVon: 2 },
];

export const MOCK_INVENTUREINTRAEGE: InventurEintrag[] = [
  { id: 1, inventurId: 1, artikelId: 1, sollMenge: 40, istMenge: 39 },
  { id: 2, inventurId: 1, artikelId: 2, sollMenge: 24, istMenge: 24 },
  { id: 3, inventurId: 1, artikelId: 3, sollMenge: 28, istMenge: 26 },
];

export const MOCK_ABSCHREIBUNGEN: Abschreibung[] = [
  {
    id: 1,
    filialeId: 1,
    artikelId: 5,
    menge: 2,
    grund: 'VERDERB',
    bemerkung: 'Bananen überreif, nicht mehr verkaufsfähig.',
    erstelltVon: 2,
    erstelltAm: vorTagenUm(5, 10, 0),
  },
  {
    id: 2,
    filialeId: 1,
    artikelId: 3,
    menge: 1,
    grund: 'BRUCH',
    bemerkung: 'Verpackung beim Einräumen beschädigt.',
    erstelltVon: 2,
    erstelltAm: vorTagenUm(3, 14, 30),
  },
];

export const MOCK_BESTELLUNGEN: Bestellung[] = [
  {
    id: 1,
    filialeId: 1,
    artikelId: 7,
    menge: 40,
    status: 'OFFEN',
    bestelltVon: 2,
    bestelltAm: vorTagenUm(1, 11, 0),
    eingetroffenAm: null,
  },
  {
    id: 2,
    filialeId: 2,
    artikelId: 4,
    menge: 30,
    status: 'EINGETROFFEN',
    bestelltVon: 6,
    bestelltAm: vorTagenUm(6, 9, 0),
    eingetroffenAm: vorTagenUm(4, 10, 0),
  },
];
