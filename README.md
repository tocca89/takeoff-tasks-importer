# TakeOff CRM — Recurring Task Generator

Un'applicazione web premium, interattiva e completamente client-side (SPA) progettata per calcolare, visualizzare ed eseguire la creazione massiva di task ricorrenti di manutenzione all'interno di **TakeOff CRM** partendo da un file Excel di clienti.

---

## ✨ Funzionalità principali

1. **Autenticazione Sicura**: Inserimento della chiave API (`x-api-key`) con validazione in tempo reale tramite chiamata all'endpoint `/api/me/infos`. La chiave viene salvata in modo sicuro nel `localStorage` del browser.
2. **Parser Excel Integrato (SheetJS)**: Caricamento tramite Drag & Drop di file Excel con conversione in-browser (nessun dato sensibile viene trasmesso a server esterni). Mappatura automatica ed interattiva delle colonne per associare `Codice Cliente`, `Nome Cliente` e `Frequenza Manutenzione`.
3. **Download Template di Esempio**: Generazione al volo e download di un file Excel di esempio (`.xlsx`) per agevolare la preparazione dei dati.
4. **Motore di Ricorrenza Temporale**: Calcolo automatico e cronologico dei cicli di manutenzione. L'applicazione determina con precisione la **Data di Attivazione** e calcola il periodo di **Pianificazione** (Inizio e Fine) per farlo ricadere nell'**ultimo mese** di ciascun intervallo specifico.
5. **Anteprima dello Scadenziario**: Tabella interattiva e filtrabile per abilitare/disabilitare i singoli task e tasto di modifica rapida per correggere le date o i titoli a livello di singola scadenza prima dell'invio.
6. **Creazione in Blocco a Coda Controllata (Throttling)**: Processo asincrono di creazione tramite coda che limita le chiamate contemporanee (concurrency = 2) ed inserisce un ritardo controllato (180ms) per prevenire fenomeni di rate-limiting e garantire il 100% di successo nell'elaborazione API. Console dei log in tempo reale per monitorare i dettagli di ogni richiesta.

---

## 📅 Logica di Calcolo delle Date

Il motore calcola le date per ciascun cliente in base alla legenda delle manutenzioni:
* **M** (Mensile): Frequenza 1 mese.
* **B** (Bimestrale): Frequenza 2 mesi.
* **T** (Trimestrale): Frequenza 3 mesi.
* **S** (Semestrale): Frequenza 6 mesi.
* **A** (Annuale): Frequenza 12 mesi.

*Esempio per ciclo Trimestrale con data d'inizio 1 Giugno 2026:*
- **Ciclo completo**: dal 01/06/2026 al 31/08/2026 (3 mesi).
- **Activation Date (`startValidityDate`)**: `01/06/2026 00:00` (Stato attivazione: *"Válido a partir de fecha"* / `10`).
- **Inizio Pianificazione (`plannedStart`)**: `01/08/2026` (Primo giorno dell'ultimo mese del trimestre).
- **Fine Pianificazione (`plannedEnd`)**: `31/08/2026` (Ultimo giorno dell'ultimo mese del trimestre).

---

## 🛠️ Requisiti e Avvio Locale

L'applicazione è sviluppata in puro **HTML5, Vanilla CSS3 e Modern JavaScript (ES6)**. Non necessita di compilazione, build step o configurazioni di Node.js.

### Avvio Rapido (Doppio Clic)
1. Scarica la cartella del progetto.
2. Fai doppio clic su `index.html` per eseguirla all'istante all'interno di qualsiasi browser moderno.

### Avvio Consigliato (Server Web Locale)
Per evitare possibili restrizioni CORS del browser sui file locali durante le richieste API esterne, puoi servire la cartella usando una utility web leggera:
```bash
# Esegui dalla cartella di progetto
npx serve .
```
Apri poi l'indirizzo `http://localhost:3000` nel tuo browser.

---

## 📁 Struttura dei File

```
takeoffes-ipce-tasks/
├── index.html       # Interfaccia grafica, sezioni e modali
├── style.css        # Stili e design system glassmorfico scuro
├── app.js           # Motore di calcolo, parser Excel e integrazione API TakeOff
└── README.md        # Documentazione tecnica e manuale d'uso (questo file)
```
