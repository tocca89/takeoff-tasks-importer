# TakeOff CRM — Generatore di Incarichi Ricorrenti

Applicazione web client-side (SPA in Vanilla JS, nessun build step) per calcolare, visualizzare e creare in blocco gli **incarichi ricorrenti di manutenzione** dentro **TakeOff CRM**. I contatti vengono letti direttamente dall'API di TakeOff in base al loro tipo di manutenzione — niente Excel.

Interfaccia **bilingue IT / ES** con tema corporate **nero + giallo `#ffd903` + bianco**.

---

## ✨ Funzionalità principali

1. **Autenticazione API** — chiave `x-api-key` validata in tempo reale (`/api/me/infos`), salvata nel `localStorage`. Proxy CORS opzionale per l'uso in locale.
2. **Caricamento rapido contatti dal CRM** — Carica i contatti che hanno un tipo nel gruppo **MANUTENZIONE** (Mensile, Bimestrale, Trimestrale, Quadrimestrale, Semestrale, Annuale, sia in IT che ES). Il recupero delle commesse/progetti è differito alla sola fase di creazione per velocizzare drasticamente il flusso di lavoro iniziale.
3. **Data di inizio dal contatto** — il ciclo di ogni contatto parte dalla custom property **`Data inizio manutenzione`** (o **`Fecha Contrato Mantenimiento`**), letta dal dettaglio contatto. In assenza, si usa la data di fallback impostata a mano.
4. **Selezione granulare** — filtro per tipo di ricorrenza (per rigenerare solo i tipi nuovi) e selezione individuale dei contatti con ricerca e check multiplo.
5. **Assegnazione multipla e ordinata** — ogni incarico può essere assegnato a **un utente, più utenti, un gruppo o qualsiasi combinazione** (campo `assignedEntityIds`, formato `us_<id>` / `gr_<id>`). Nel menu a discesa, i gruppi vengono visualizzati per primi, con layout e scorrimento fluidi per evitare tagli di testo.
6. **Anteprima dello scadenziario** — tabella interattiva filtrabile, con abilita/disabilita per riga e modifica rapida di date e titolo prima dell'invio.
7. **Controllo duplicati opzionale** — prima di creare, verifica via `POST /api/tasks/search` se esiste già un incarico dello stesso tipo nello stesso periodo per quel contatto (a prescindere dall'assegnatario).
8. **Creazione in blocco con throttling** — coda asincrona a concorrenza limitata (2) con ritardo controllato per evitare rate-limiting; recupero automatico dell'eventuale commessa associata in tempo reale, console di log e riepilogo finale.
9. **Layout responsive e tolleranza overflow** — Griglia principale a colonne flessibili che riduce gli spazi vuoti, overflow-wrap per nomi lunghi di clienti o incarichi per evitare tagli laterali, e ottimizzazione CSS completa per dispositivi desktop, tablet e mobili.

---

## 🛠️ Architettura e Tecnologie

| Aspetto | Dettaglio |
|---|---|
| **Stack** | HTML5 + CSS3 + Vanilla JS ES6 (zero build step) |
| **i18n** | Bilingue IT/ES con sistema `data-i18n` completo |
| **Design** | Tema dark corporate (nero + giallo #ffd903 + bianco), glassmorphism, Font: Outfit + Plus Jakarta Sans |
| **Deploy** | Vercel con rewrite proxy API (`vercel.json`); in locale fallback CORS proxy automatico via `corsproxy.io` |
| **Dipendenze CDN** | FontAwesome 6.4 (SheetJS rimosso per ottimizzare le performance) |

---

## 📅 Logica di calcolo delle date

Frequenze: **M**=1 mese, **B**=2, **T**=3, **C**=4 (quadrimestrale), **S**=6, **A**=12.

Per ogni contatto il ciclo parte dalla sua data di contratto. Il **periodo di pianificazione** copre l'intero ciclo: dalla data di attivazione al giorno precedente l'inizio del ciclo successivo.

*Esempio — manutenzione mensile con contratto dal **11/06/2026**:*

| Ciclo | Data di attivazione (`startValidityDate`) | Pianificazione (`plannedStart` – `plannedEnd`) |
|------|------|------|
| 1 | 11/06/2026 | 11/06/2026 – 10/07/2026 |
| 2 | 11/07/2026 | 11/07/2026 – 10/08/2026 |
| … | … | … |

*Trimestrale dal 11/06 → ciclo 1: 11/06 – 10/09, ciclo 2: 11/09 – 10/12, ecc.*

Ogni incarico viene creato con stato di attivazione **"Válido a partir de fecha"** (`taskValidityType: 10`) e `startValidityDate` pari al primo giorno del ciclo. Le date sono inviate in formato locale `YYYY-MM-DDTHH:mm:ss`.

---

## 🛠️ Avvio locale

Pura **HTML5 + CSS3 + JavaScript ES6**, nessuna compilazione.

```bash
# dalla cartella di progetto
npx serve .
```
Apri `http://localhost:3000`. In locale, se compare l'errore "Failed to fetch", attiva il **Proxy CORS** dall'interfaccia. Su Vercel viene usato il rewrite integrato (`/api/takeoff/*`).

---

## 📁 Struttura dei file

```
takeoffes-ipce-tasks/
├── index.html   # Interfaccia, sezioni e modali
├── style.css    # Design system (tema nero/giallo/bianco)
├── app.js       # Traduzioni, client API TakeOff, motore date e creazione
├── logo.png     # Logo TakeOff (header)
├── vercel.json  # Rewrite API per il deploy su Vercel
└── README.md    # Questo file
```

---

## 🔌 Note sull'API TakeOff

- **Lettura incarichi**: usare `POST /api/tasks/search` (il `GET /api/tasks` è sovra-filtrato ed esclude gli incarichi futuri/non completati).
- **Assegnatari**: campo `assignedEntityIds` con prefissi `us_` (utente) e `gr_` (gruppo). Non esiste un endpoint che elenca i gruppi: i gruppi con nome vengono ricavati dagli incarichi esistenti.
- **Custom properties del contatto**: restituite solo dal dettaglio `GET /api/contacts/{id}`, non dalla ricerca contatti.
