# TakeOff CRM - Generatore Incarichi Ricorrenti

Web app statica client-side per generare e creare in blocco incarichi ricorrenti di manutenzione in **TakeOff CRM**.

L'app non importa piu clienti da Excel: recupera direttamente da TakeOff i contatti che hanno una tipologia di manutenzione assegnata, genera uno scadenziario modificabile e invia gli incarichi selezionati alle API TakeOff.

## Cosa Fa

1. Autentica l'utente tramite `x-api-key` chiamando `/api/me/infos`.
2. Carica dati di configurazione da TakeOff:
   - tipi incarico da `/api/tasks/types`;
   - stati del tipo incarico selezionato da `/api/tasks/types/{id}/steps`;
   - utenti da `/api/users`;
   - gruppi da `/api/user-groups`, se disponibili.
3. Recupera le tipologie contatto e individua quelle di manutenzione:
   - `mensile` / `mensual`;
   - `bimestrale` / `bimestral`;
   - `trimestrale` / `trimestral`;
   - `quadrimestrale` / `cuadrimestral`;
   - `semestrale` / `semestral`;
   - `annuale` / `anual`.
4. Cerca i contatti associati a ciascuna tipologia tramite `/api/contacts/search`.
5. Recupera la prima commessa/progetto disponibile per ogni contatto tramite `/api/jobs?contactId={id}&take=1`.
6. Genera il calendario degli incarichi per la durata scelta.
7. Permette di filtrare, selezionare/deselezionare e modificare i singoli incarichi prima dell'invio.
8. Crea gli incarichi in TakeOff tramite `/api/tasks`, con coda controllata a 2 worker e pausa di 180 ms tra richieste.

## Funzionalita Principali

- Interfaccia bilingue ES/IT con preferenza salvata in `localStorage`.
- Validazione chiave API e visualizzazione del profilo utente connesso.
- Selezione tipo incarico, stato iniziale, priorita, flag importante e assegnatari predefiniti.
- Selettore multi-assegnatario per utenti e gruppi, inviati al task tramite `assignedEntityIds`.
- Caricamento contatti con manutenzione direttamente da TakeOff.
- Filtro per tipologia di manutenzione e selezione individuale contatti.
- Template modificabili per titolo e descrizione incarico.
- Anteprima tabellare dello scadenziario generato.
- Modifica manuale di titolo, data di attivazione, `plannedStart` e `plannedEnd`.
- Creazione opzionale di un nuovo progetto/commessa per ogni contatto prima della creazione incarichi.
- Controllo duplicati opzionale prima della creazione.
- Console di avanzamento con conteggio successi, errori e incarichi saltati.
- Deploy statico supportato da Vercel con rewrite API.

## Logica Date

Il calendario parte dalla data scelta in UI e genera ricorrenze fino alla durata impostata.

| Codice | Ricorrenza | Frequenza |
| --- | --- | --- |
| `M` | Mensile | 1 mese |
| `B` | Bimestrale | 2 mesi |
| `T` | Trimestrale | 3 mesi |
| `C` | Quadrimestrale | 4 mesi |
| `S` | Semestrale | 6 mesi |
| `A` | Annuale | 12 mesi |

Per ogni ciclo:

- `startValidityDate` e' la data di inizio ciclo.
- `plannedStart` e' il primo giorno dell'ultimo mese del ciclo.
- `plannedEnd` e' l'ultimo giorno dell'ultimo mese del ciclo.
- `completeBefore` viene impostato uguale a `plannedEnd`.

Esempio trimestrale con data inizio programma `2026-06-01`:

- ciclo: dal `2026-06-01` al `2026-08-31`;
- `startValidityDate`: `2026-06-01`;
- `plannedStart`: `2026-08-01`;
- `plannedEnd`: `2026-08-31`.

## Configurazione API e CORS

Di default, in locale l'app chiama direttamente:

```text
https://webapi.takeoffcrm.com
```

Su Vercel, il file `vercel.json` espone un rewrite:

```json
{
  "rewrites": [
    {
      "source": "/api/takeoff/:path*",
      "destination": "https://webapi.takeoffcrm.com/api/:path*"
    }
  ]
}
```

L'interfaccia include anche un toggle per usare `https://corsproxy.io` in caso di errori CORS locali.

Nota di sicurezza: usando un proxy CORS esterno, le richieste includono la chiave `x-api-key`. Per uso stabile o produzione e' preferibile un proxy controllato dal progetto, non un servizio pubblico generico.

## Avvio Locale

L'app e' composta da file statici e non richiede build.

Avvio rapido:

```bash
cd /Users/lorenzo/Documents/TakeOff/takeoffes-ipce-tasks
python3 -m http.server 4173
```

Poi aprire:

```text
http://localhost:4173
```

In alternativa si puo usare un server statico come `npx serve .`.

## Struttura

```text
takeoffes-ipce-tasks/
├── index.html    # Layout, pannelli, modali e inclusione asset
├── style.css     # Tema visuale e responsive layout
├── app.js        # Stato app, API client, generatore date e creazione bulk
├── logo.png      # Logo usato nell'header
├── vercel.json   # Rewrite API per deploy Vercel
└── README.md     # Documentazione progetto
```

## Assegnazione Incarichi

TakeOff espone l'assegnazione degli incarichi tramite `assignedEntityIds` nel `TaskRequestDto`.

L'app serializza gli assegnatari cosi:

- utenti: `1_{userId}`;
- gruppi: `2_{groupId}`.

Il picker supporta:

- nessun assegnatario;
- un singolo utente;
- piu utenti;
- un gruppo;
- combinazioni di utenti e gruppi.

I gruppi vengono caricati da `/api/user-groups` quando disponibile; se l'endpoint non risponde, vengono derivati dai gruppi presenti nei dati ritornati da `/api/users`.

## Stato Attuale

La pagina iniziale e' stata verificata localmente su `http://localhost:4173`: la UI carica correttamente e non mostra errori console nello stato disconnesso.

Le chiamate reali verso TakeOff richiedono una chiave API valida e non sono simulate nel progetto.

## Piano di Miglioramento

### Priorita 1 - Sicurezza e Robustezza

- Sostituire gli inserimenti `innerHTML` con rendering DOM sicuro o funzioni di escaping per tutti i dati provenienti da API e input utente.
- Rimuovere o rendere non predefinito il proxy CORS pubblico; introdurre un proxy controllato server-side per ambienti condivisi o di produzione.
- Rivedere la persistenza della chiave API: oggi e' salvata in `localStorage`; valutare salvataggio solo in sessione o gestione tramite backend/proxy.
- Rendere esplicito il comportamento del controllo duplicati: se la verifica fallisce, oggi la creazione prosegue.

### Priorita 2 - Qualita Funzionale

- Aggiungere test automatici per:
  - calcolo delle ricorrenze;
  - mapping delle tipologie manutenzione;
  - generazione payload `/api/tasks`;
  - deduplica opzionale;
  - selezione/deselezione contatti e incarichi.
- Separare `app.js` in moduli piu piccoli:
  - client API;
  - stato applicazione;
  - date/ricorrenze;
  - rendering UI;
  - creazione bulk.
- Aggiungere una modal di conferma prima della creazione massiva con riepilogo contatti, incarichi, periodo e assegnatari.
- Migliorare la gestione degli errori API mostrando messaggi piu leggibili e suggerimenti operativi.

### Priorita 3 - Esperienza Operativa

- Aggiungere esportazione CSV/XLSX dello scadenziario generato prima dell'invio.
- Aggiungere una modal/report finale scaricabile con elenco successi, errori e incarichi saltati.
- Permettere il salvataggio di preset di configurazione: tipo incarico, stato, assegnatari, template e durata.
- Aggiungere ricerca e filtri avanzati nell'anteprima: ricorrenza, mese, cliente, stato selezione.
- Aggiungere un indicatore per contatti senza commessa/progetto associato prima dell'invio.

### Priorita 4 - Deploy e Manutenibilita

- Introdurre linting e formattazione automatica.
- Aggiungere una piccola suite Playwright per smoke test UI.
- Documentare un flusso di deploy Vercel con variabili/config consigliate.
- Valutare una migrazione leggera a moduli ES o a un bundler solo se la crescita del codice lo rende utile.
