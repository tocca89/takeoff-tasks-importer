# TakeOff CRM API — Knowledge Base

> **Fonte di verità**: `takeoff-openapi.json` (OpenAPI 3.0.1, *TakeOff Integrators Api v1*).
> **Generato il**: 2026-05-06.
> **Audience**: Lorenzo, Giuseppe, future istanze di Claude.
> Tutto ciò che è marcato `[INFERITO — DA VERIFICARE LIVE]` non è esplicito nello spec ed è da confermare con chiamate reali.

---

## 0. Indice

- [1. Identità e auth](#1-identità-e-auth)
- [2. Convenzioni globali](#2-convenzioni-globali)
- [3. Inventario per risorsa](#3-inventario-per-risorsa)
- [4. Risorse core — analisi profonda](#4-risorse-core--analisi-profonda)
  - [4.1 Estimates](#41-estimates)
  - [4.2 Activities](#42-activities)
  - [4.3 Activity Reports](#43-activity-reports)
  - [4.4 Contacts](#44-contacts)
  - [4.5 Jobs](#45-jobs)
  - [4.6 Tasks](#46-tasks)
  - [4.7 Invoices](#47-invoices)
  - [4.8 Contracts (Service Contracts)](#48-contracts-service-contracts)
- [5. Risorse di supporto](#5-risorse-di-supporto)
- [6. Pattern e gotcha](#6-pattern-e-gotcha)
- [7. Delta sync e Power BI](#7-delta-sync-e-power-bi)
- [8. Snippet n8n e Power BI pronti all'uso](#8-snippet-n8n-e-power-bi-pronti-alluso)
- [9. Come usare questo file con Claude](#9-come-usare-questo-file-con-claude)
- [10. Appendice — endpoint completo](#10-appendice--endpoint-completo)
- [11. Verifiche live — app "TakeOff Scheduler" (2026-06-12)](#11-verifiche-live--app-takeoff-scheduler-2026-06-12)

---

## 1. Identità e auth

| Campo | Valore |
|---|---|
| Spec | OpenAPI 3.0.1 |
| Title | TakeOff Integrators Api |
| Version | v1 |
| Base URL | `https://webapi.takeoffcrm.com` *(non dichiarato in `servers[]`, va da configurazione esterna)* |
| Path totali | 181 |
| Operation totali | 235 (107 GET · 60 PUT · 46 POST · 20 DELETE · 2 PATCH) |
| Schemi totali | 437 |

### Schemi di sicurezza

Lo spec dichiara **tre alternative** in `components.securitySchemes` con `security` globale (qualunque schema valido autentica la richiesta):

| Nome | Tipo | Dove | Header/Param |
|---|---|---|---|
| `ApiKey in Header` | apiKey | header | `x-api-key: <key>` |
| `ApiKey in Query String` | apiKey | query | `?apikey=<key>` |
| `Bearer` | http JWT | header | `Authorization: Bearer <jwt>` |

API key di progetto: `inserire-qui-apikey-utentedisistema` (header `x-api-key`).

### Restrizione operativa di progetto

`DELETE` è **vietato** in questo progetto, anche se 20 endpoint DELETE sono presenti nello spec. Vedi `[INFERITO — DA VERIFICARE LIVE]` su quali POST/PUT abbiano effetti di soft-delete reali (es. `setobsolete`).

---

## 2. Convenzioni globali

### 2.1 Wrapper di risposta — due forme

Tutti gli endpoint hanno risposta avvolta in un wrapper. **Esistono due varianti**:

**A. Wrapper "list flat"** — usato dagli endpoint `GET /api/{resource}` di lista:

```json
{
  "result": { /* ActionResult, in pratica vuoto */ },
  "value": [ /* array di ListItem DTO */ ]
}
```

→ **Niente metadata di paginazione** (no `totalRecords`, no `totalPages`). Per sapere se ci sono altre pagine, tocca confrontare la lunghezza dell'array con il `take` richiesto.

**B. Wrapper "search paginato"** — usato dagli endpoint `POST /api/{resource}/search`:

```json
{
  "result": { /* ActionResult */ },
  "value": {
    "data": [ /* array di SearchListItem DTO */ ],
    "skip": 0,
    "take": 50,
    "sort": null,
    "totalRecords": 1234,
    "currentPage": 1,
    "totalPages": 25
    /* + eventuali aggregati specifici della risorsa, es. totalNet_Active */
  }
}
```

→ **Include metadata di paginazione** e aggregati. È sempre la forma preferibile per dashboard.

### 2.2 Paginazione

- `skip` e `take` come **query string** sia su GET sia su POST `/search`.
- `take` di default **non documentato**. `[INFERITO — DA VERIFICARE LIVE]` con valore 50–100 come prudente.
- I body delle search accettano comunque `skip`/`take` come **proprietà del DTO** in molti casi (es. `ContactSearchFilterRequestDto`, `ActivitySearchFilterRequestDto`, `TaskSearchFilterRequestDto`). Non è chiaro se prevalga la query string o il body — `[INFERITO — DA VERIFICARE LIVE]`.

### 2.3 Date e formati

- **256 campi `date-time`** nello spec — formato `string / format: date-time` (ISO 8601, presumibilmente `YYYY-MM-DDTHH:mm:ssZ`).
- I filtri di range usano coppie `*From` / `*To` (es. `estimateCreationDateFrom`, `estimateCreationDateTo`, `invoiceFromDate`, `invoiceToDate`, `createdOnFromDate`, `completedFromDate`, ecc.).
- ID interi `int32` per tutte le entità.

### 2.4 Content-type request body

Tutte le POST/PUT/PATCH accettano **quattro varianti**:
- `application/json` ← canonico
- `application/json-patch+json`
- `text/json`
- `application/*+json`

In pratica si usa sempre `application/json` salvo per il PATCH `/api/jobs/{id}` che vuole un array di operazioni JSON Patch RFC 6902.

### 2.5 Required fields

> ⚠️ **Gotcha critico**: nello spec **nessuna `RequestDto` dichiara `required[]` esplicito**. Tutti i campi sono nominalmente opzionali.
>
> A runtime, alcuni campi sono *de facto* obbligatori (es. `contactId` + `documentTypeId` per creare un estimate). Lo schema non lo dice. **`[INFERITO — DA VERIFICARE LIVE]`** quali siano per ogni Request DTO.

### 2.6 Status code comuni

| Code | Significato | Schema |
|---|---|---|
| 200 | OK | risposta tipata |
| 401 | Unauthorized | `ProblemDetails` |
| 403 | Forbidden | `ProblemDetails` o `ActionResult` |
| 404 | Not Found | `ActionResult` |
| 500 | Internal Server Error | `ActionResult` |

---

## 3. Inventario per risorsa

| Tag | Operazioni | Ha `/search` POST | Ha `/deleted` GET | Note |
|---|---|---|---|---|
| Activities | 31 | ✅ | ✅ | risorsa più ricca, sub-risorse nested |
| Contacts | 28 | ✅ | ❌ | sub-risorse: addresses, referents, customproperties, specialconditions, authorizations |
| Tasks | 23 | ✅ | ✅ | con `refreshdata` POST per stati dinamici |
| Contracts | 19 | ❌ (usa `POST /list`) | ❌ | sub-tipo `simple` con CRUD dedicato |
| Wiki | 15 | ❌ | ❌ | folders + elements + types |
| Estimates | 12 | ✅ | ❌ | rows nested, lock/unlock |
| ActivityReports | 9 | ❌ (sub-endpoint di `/api/activities/search/activityreports`) | ✅ | solo GET + transizioni di stato |
| Me | 9 | — | — | profilo utente, settings, devices |
| Articles | 8 | ❌ | ❌ | catalogo prodotti |
| Jobs | 8 | ❌ | ❌ | commesse |
| PriceLists | 8 | ❌ | ❌ | listini con elementi nested |
| Comments | 7 | ❌ | ❌ | commenti + attachments |
| Expenses | 7 | ❌ | ❌ | note spese |
| Advances | 6 | ❌ | ❌ | acconti |
| Exports | 5 | — | — | esportazioni asincrone |
| Invoices | 5 | ✅ | ❌ | solo lettura + tag management |
| JobArticles | 5 | — | — | articoli su commessa |
| EventTypes | 4 | ❌ | ❌ | |
| Companies | 3 | — | — | sub-info: referent roles, custom properties |
| JobAdvances | 3 | — | — | acconti su commessa |
| WarehouseMovements | 3 | — | — | |
| Documents | 2 | — | — | upload / delete |
| Import | 2 | — | — | check status import |
| JobWorkFlows | 2 | — | — | workflow steps + change |
| WorkFlows | 2 | — | — | template workflow |
| ActivityTypes, AdministrativeProfiles, Boards, DocumentTypes, ExpenseTypes, Funnels, Tags, Users, Vehicles | 1 ognuno | — | — | lookup tables |

---

## 4. Risorse core — analisi profonda

### 4.1 Estimates

#### Endpoint disponibili

| Metodo | Path | Scopo |
|---|---|---|
| GET | `/api/estimates` | lista flat con filtri base e `lastUpdatedFrom` |
| POST | `/api/estimates` | crea preventivo |
| GET | `/api/estimates/basic` | lista *minimal* per autocomplete |
| GET | `/api/estimates/{id}` | dettaglio singolo preventivo |
| PATCH | `/api/estimates/{id}` | update parziale via `UpdateEstimateRequestDto` |
| DELETE | `/api/estimates/{id}` | 🚫 vietato in questo progetto |
| PUT | `/api/estimates/{id}/referencecode` | aggiorna codice riferimento |
| POST | `/api/estimates/search` | ricerca paginata con filtri avanzati |
| PUT | `/api/estimates/{id}/lock` · `/unlock` | blocca/sblocca preventivo |
| POST | `/api/estimates/{id}/rows` | aggiunge riga |
| DELETE | `/api/estimates/{id}/rows/{rowType}/{rowId}` | 🚫 vietato |

#### `POST /api/estimates/search` — body filter (`EstimateSearchFilterRequestDto`)

```jsonc
{
  "name": "string",
  "contactId": 0,
  "jobId": 0,
  "linkedContactId": 0,
  "contactRelationId": 0,
  "documentTypeIds": [0],
  "estimateNumberFrom": 0,
  "estimateNumberTo": 0,
  "includeActive": true,
  "includeReviewed": true,
  "includeConfirmed": true,
  "includeArchived": true,
  "includeRejected": true,
  "estimateConfirmDateFrom":   "2026-01-01T00:00:00Z",
  "estimateConfirmDateTo":     "2026-12-31T23:59:59Z",
  "estimateRejectedDateFrom":  "...", "estimateRejectedDateTo":  "...",
  "estimateCreationDateFrom":  "...", "estimateCreationDateTo":  "...",
  "estimateValididtyDateFrom": "...", "estimateValididtyDateTo": "...",
  "userCreatorId": 0,
  "estimateSuccessPercentageFrom": 0, "estimateSuccessPercentageTo": 100,
  "articleCode": "string",
  "advanceCode": "string",
  "contactTypes":      { /* AdvanceFilter */ },
  "articleCategories": { /* AdvanceFilter */ }
}
```

> ⚠️ **Typo nello spec**: `estimateValididtyDateFrom/To` (validity con doppia `id`). Va inviato così com'è.

Paginazione via query string `?skip=0&take=50`.

#### Schema risposta — due varianti diverse (gotcha critico)

**`GET /api/estimates` →** wrapper flat, item type `EstimateListItemResponseDto`:

| Campo | Tipo | Note |
|---|---|---|
| `id` | int | |
| `estimateName`, `estimateNumber`, `revisionNumber` | | |
| `estimateCreationDate`, `estimateValidity`, `estimateConfirmDate`, `estimateRejectionDate`, `estimateRevisionDate` | date-time | |
| **`estimateLastModifiedDate`** | date-time | ✅ presente — usato per delta sync |
| **`total`** | double | totale **lordo** (con IVA) |
| **`notVatTotal`** | double | totale **netto** (senza IVA) |
| `estimateSuccessPercentage` | double | |
| `archivied` | bool | (sic) |
| `statusName`, `statusColor` | string | |
| `contact`, `job`, `documentType`, `creatorUser`, `typologies` | nested | |
| `referenceCode`, `wikiElementId`, `numberingInfo`, `estimateDocumentUrl` | | |

**`POST /api/estimates/search` →** wrapper paginato `EstimateListResponseDto`:

```jsonc
{
  "data": [ /* EstimateSearchListItemResponseDto */ ],
  "totalNet_Active":   0.00,   // aggregato netto preventivi attivi
  "totalTaxed_Active": 0.00,   // aggregato lordo preventivi attivi
  "skip": 0, "take": 50, "sort": null,
  "totalRecords": 0, "currentPage": 0, "totalPages": 0
}
```

`EstimateSearchListItemResponseDto` ha **`total`** ma **NON `notVatTotal` né `estimateLastModifiedDate`**. In compenso include `acception_LastViewedDateTime`, `confirmUser`, `rejectUser`, `step`, `documentName`, `estimateNumberingYear`.

> 🚨 **Implicazione operativa**: per dashboard che mostrano sia netto sia lordo per riga, **NON usare `/search`** — usare `GET /api/estimates`. La memoria del progetto su "totalWithVat non disponibile via search" è confermata dalla spec.

**`GET /api/estimates/{id}` →** `EstimateResponseDto` completo, include `total`, `notVatTotal`, `rows`, `linked_JobWorkflow`, `customFieldLabel`/`Value`, `wikiElementId`, address ids.

#### `POST /api/estimates` — body create (`CreateEstimateRequestDto`)

```jsonc
{
  "estimateName": "string",
  "contactId": 0,           // [INFERITO] obbligatorio
  "jobId": 0,
  "documentTypeId": 0,      // [INFERITO] obbligatorio
  "estimateNumber": 0,
  "revisionNumber": 0,
  "notes": "string",
  "privateNotes": "string",
  "creationDate": "2026-05-06T00:00:00Z",
  "validity":     "2026-06-06T00:00:00Z",
  "referent": "string",
  "paymentType": "string",
  "estimateSuccessPercentage": 50,
  "billingAddress":  { /* EstimateAddressDto */ },
  "shippingAddress": { /* EstimateAddressDto */ }
}
```

#### Filtri GET `/api/estimates` (query string)

`contactId`, `createdFrom`, `createdUntilTo`, `skip`, `take`, `active`, `confirmed`, `rejected`, `revised`, `archived`, `stepId`, `referenceCode`, `filter` (text full-text), **`lastUpdatedFrom`** ← chiave per delta sync.

---

### 4.2 Activities

Risorsa più popolosa: 31 endpoint (CRUD + sub-risorse `notes`, `articles`, `advances`, `documents`, `images`, `tags`, `wikis` + transizioni di stato).

#### Endpoint principali

| Metodo | Path |
|---|---|
| GET / POST | `/api/activities` |
| GET / PUT / DELETE | `/api/activities/{id}` |
| POST | `/api/activities/search` |
| POST | `/api/activities/search/activityreports` |
| GET | `/api/activities/deleted?start=...` |
| GET / PUT | `/api/activities/{id}/notes` |
| GET / POST · GET / PUT / DELETE | `/api/activities/{id}/articles[/{articleId}]` |
| GET / POST · GET / PUT / DELETE | `/api/activities/{id}/advances[/{advanceId}]` |
| GET | `/api/activities/{id}/images` · `/documents` · `/tags` · `/wikis` |
| PUT | `/api/activities/{id}/setbillingstate` · `/setbilled` · `/setunbilled` · `/setapproved` · `/setcompleted` · `/tags` |
| DELETE | `/api/activities/{id}/documents/{documentid}` |

#### `GET /api/activities` — query parameters

`skip`, `take`, `assignedUserId`, `startDate`, `endDate`, **`lastUpdate`** *(delta sync)*, `orderDesc`, `started`, `completed`, `approved`, `confirmed`, `contactId`, `jobId`, `hasReport`, `types[]`, `billingState` (enum), `isBilled`, `administrativeProfileId`, `parentActivityId`, `activityId`, `sortBy` (`ActivityOrderByEnum`).

`ActivityOrderByEnum`: `0=StartDateDesc`, `1=StartDateAsc`, `2=IdAsc`, `3=IdDesc`, `4=TaskIdAsc`, `5=TaskIdDesc`, `6=JobIdAsc`, `7=JobIdDesc`, `8=ContactIdAsc`, `9=ContactIdDesc`, `10=NotificationIdAsc`, `11=NotificationIdDesc`.

`BillingState` enum: `0=NotBill`, `10=ToBeBilled`, `20=Contract`.

#### `POST /api/activities/search` — body filter (`ActivitySearchFilterRequestDto`)

Filtri ricchi: `fromDate`/`toDate`, array di id (`activityTypeIds`, `activityCategoryIds`, `assignedUserIds`, `boardIds`, `tagIds`, `excludedTagIds`, `wikiElementIds`, `wikiElementTypeIds`, `vehicleIds`, `resourceIds`, `obsoleteResourceIds`, `contactAddressIds`, `contactServiceContractIds`, `contactTypeIds`, `jobTypeIds`, `linkedContactRelationIds`), flag booleani (`approved`, `billed`, `completed`, `confirmed`, `hasReport`, `hasReportSent`, `hasReportSigned`, `hasTask`, `taskCompleted`, `withoutTag`, `includeObsoleteResource`, `activityReportBilled/Completed/NotBillable/ReadyToBill`), range `reportNumberMin/Max`, `textFilter`, `orderBy`, `skip`, `take`.

#### Schema risposta `ActivityResponseDto` — campi chiave

`id`, `activityTypeId`/`activityType`, `assignedUserId`/`assignedUser`, `contactId`/`contact`, `jobId`/`job`, **`activityReportId`**, **`taskId`**, `start`, `end`, `duration`, `totalTime`, `totalTimeSpan`, `cost`, `amount`, `total`, `vat`, **`notes`**, **`privateNotes`**, `billingState`, `completed`, `approved`, `confirmed`, `isActivityBilled`, **`createdOn`**, **`createdById`**/`createdBy`, **`lastModifiedOn`**, **`lastModifiedById`**/`lastModifiedBy`, `referenceCode`, `priorityState`, `tags`/`tagElements`, `articles`, `advances`, `expenses`, `documents`, `images`, `pauses`, `travels`, `report`, `wikiElements`.

> ✅ Pattern di Lorenzo confermato: per fix dei report, sempre leggere `notes` **e** `privateNotes` sull'attività **e**, se `activityReportId != null`, fare `GET /api/activityreports/{activityReportId}` e leggere `publicNotes` **e** `privateNotes` (naming diverso, vedi 4.3).

#### `GET /api/activities/deleted?start=...`

Ritorna lista di `DeletedActivityResponseDto` modificate dopo il timestamp `start`. **Indispensabile** per refresh incrementale veri (Power BI, n8n) — sennò i record cancellati restano fantasma.

---

### 4.3 Activity Reports

| Metodo | Path |
|---|---|
| GET | `/api/activityreports` |
| GET | `/api/activityreports/{id}` |
| PUT | `/api/activityreports/{id}/setapproved` · `/setnotapproved` · `/setcompleted` · `/setnotcompleted` · `/setbilled` · `/setnotbilled` |
| GET | `/api/activityreports/deleted` |

#### `GET /api/activityreports` — query

`skip`, `take`, `completed`, `readyToInvoice`, `isBilled`, **`lastModifiedFrom`** *(delta sync)*.

#### `ActivityReportResponseDto` — campi chiave

`id`, `contactId`/`contact`, `taskId`, `invoiceId`, `documentId`, **`publicNotes`**, **`privateNotes`** *(⚠️ naming diverso da activities)*, `activities`, `activityList`, `relatedJobs`, `activityFromDate`, `activityToDate`, `invoiceDate`, `internalInvoiceNumber`, `externalInvoiceId`, `invoiceRowId`, `notificationId`, `reportSigner`, `reportTemplateId`, `amount`, `additionalAmount`, `totalTime`, `tripAmount_DistanceTime`, `tripAmount_TravelTime`, `duration`, `completed`, `notBillable`, `readyToInvoice`, `isActivityReportBilled`, `isReportEditable`, `isReportSignable`, `lastEditor`, `createdOn`, **`lastModifiedOn`**.

> ⚠️ **Gotcha**: nelle activities `notes` è il pubblico, qui è `publicNotes`. Lo script deve gestire entrambi.

---

### 4.4 Contacts

28 endpoint. CRUD + sub-risorse `addresses`, `referents`, `customproperties`, `specialconditions`, `authorizations`, `wikis`, `lastjob`.

#### Endpoint principali

| Metodo | Path |
|---|---|
| GET / POST | `/api/contacts` |
| POST | `/api/contacts/search` |
| GET / PUT | `/api/contacts/{id}` |
| GET | `/api/contacts/referencecode/{referenceCode}` |
| GET / POST / PUT | `/api/contacts/{id}/addresses[/{contactAddressId}]` |
| PUT | `/api/contacts/{id}/addresses/{contactAddressId}/sethidden` |
| GET / POST · GET / PUT | `/api/contacts/{id}/referents[/{referentId}]` |
| PUT | `/api/contacts/{id}/referents/{referentId}/setnotlisted` |
| GET / PUT | `/api/contacts/{id}/customproperties` |
| GET / POST / PUT · DELETE | `/api/contacts/{id}/specialconditions[/{specialConditionId}]` |
| GET / PUT | `/api/contacts/{id}/authorizations` |
| GET | `/api/contacts/types` |
| PUT | `/api/contacts/{id}/setobsolete` |

#### `GET /api/contacts` — query

`skip`, `take`, `filter` (full-text), `latitude`+`longitude`+`ray` (ricerca geo), `referenceCode`, **`lastModifiedFrom`** *(delta sync)*, `contactTypes[]`, `vat`, `taxNumber`, `companyName`, `companyNameLike`.

#### `POST /api/contacts/search` — body (`ContactSearchFilterRequestDto`)

`assignedUserId`, `billingAddress`/`City`/`Country`/`Province`/`postalCode`, `contactId`, `contactTypes[]`, `createdOnFromDate`/`createdOnToDate`, `customProperties`, `excludeCampaigns`, `filter`, `filterOnAddresses`, `includeCampaigns`, `interests`, `internalReference`, `linkedContactId`, `linkedContactRelationId`, `referenceCode`, `toBeChecked`, `skip`, `take`.

#### `ContactResponseDto` — campi chiave

`id`, `companyName`, `billingCompanyName`, `billingFirstName`/`LastName`, `billingAddress`/`City`/`Province`/`PostalCode`/`Country`, `contactCategory`, `contactTypes`, `assignedUser`, `email`, `pec`, `telephone`, `fax`, `website`, `vat`, `taxNumber`, `iban`, `swift`, `bankName`/`bankNumber`/`bankBranch`/`branchNumber`, `eBillingCode`/`eBillingMode`/`eBillingPEC`, `vatExemptionCode`, `defaultTaxRate`, `defaultPaymentType`, `notes`, `specialNotes`, `normativeReference`, `referenceCode`, **`createdOn`**, **`lastModifiedOn`**, `addresses`, `referents`, `customProperties`, `wikiElements`, `wikiFolders`, `profileImage`, `drivePublicLink`, `color`, `initials`.

`ContactBasicInfoResponseDto` (ridotto, usato come nested in altre risposte): `id`, `companyName`, `email`, `telephone`, `vat`, `billingAddress`/City/Country, `referenceCode`, `profileImage`, `color`, `initials`, `isMainContact`, `expiredPaymentNotes`.

---

### 4.5 Jobs

#### Endpoint

| Metodo | Path |
|---|---|
| GET / POST | `/api/jobs` |
| GET / PUT / PATCH | `/api/jobs/{id}` |
| GET | `/api/jobs/{id}/triggerworkflows` |
| PUT | `/api/jobs/{id}/referencecode` |
| GET | `/api/jobs/divisions` |

#### `GET /api/jobs` — query

`skip`, `take`, `contactId`, `filter`, `referenceCode`, `completed`, **`lastModifiedFrom`** *(delta sync)*, `mainWorkflowStepId`.

#### `JobResponseDto` — campi chiave

`id`, `name`, `mainContactId`/`mainContact`, `mainContactTypeId`, `billingContactId`/`billingContact`, `billingContactTypeId`, `assignedUserId`/`assignedUser`, `technicalUserId`/`technicalUser`, `divisionId`, `administrativeProfileId`, `address`, `city`, `province`, `postalCode`, `country`, `latitude`, `longitude`, `coordinatesStatus`, `referenceCode`, `internalReferenceCode`, **`publicNotes`**, **`privateNotes`**, `priority`, `useAsModel`, `memorandumExcluded`, `exportToApi`, `estimatedCost`, `estimatedPrice`, `paContractCIGCode`, `paContractCUPCode`, `paContractCodiceCommessaConvezione`, `paContractDate`, `paContractDocumentRef`, `customProperties`, `documents`, `jobArticles`, `jobWorkFlows`, `advances`, `contactAddressId`/`contactAddress`, `visibilitySetId`, `ticketJob`, `hasProfileImage`.

> ⚠️ **Gotcha schema asimmetrico**: `JobResponseDto` (single) **non** espone `lastModifiedOn` né `createdOn`, ma `JobListItemResponseDto` (lista) **sì**. La GET `/api/jobs` quindi ti dà `lastModifiedOn` per riga, ma `GET /api/jobs/{id}` no. Per delta sync usa la lista.

PATCH usa **JSON Patch standard RFC 6902** (array di `Operation`):

```jsonc
[
  { "op": "replace", "path": "/publicNotes", "value": "nuovo testo" },
  { "op": "replace", "path": "/priority",    "value": 1 }
]
```

`Content-Type: application/json-patch+json`.

---

### 4.6 Tasks

#### Endpoint principali

| Metodo | Path |
|---|---|
| GET / POST | `/api/tasks` |
| POST | `/api/tasks/search` |
| GET / PUT / DELETE | `/api/tasks/{id}` |
| GET | `/api/tasks/mine` · `/types` · `/deleted` · `/types/{id}/steps` |
| GET | `/api/tasks/ticketnumber/{ticketNumber}` |
| GET | `/api/tasks/{id}/comments` · `/activities` · `/activities/notes/aggregate` · `/startstop` · `/activeboards` |
| PUT | `/api/tasks/{id}/start` · `/accept` · `/status` · `/description` |
| POST | `/api/tasks/refreshdata` |
| GET | `/api/tasks/refreshdata/{id}` |
| DELETE | `/api/tasks/{id}/documents/{documentid}` |

#### Query `GET /api/tasks`

`skip`, `take`, `filter`, `contactId`, `jobId`, `assignedUserId`, `assignedGroupId`, `plannedStart`, `plannedEnd`, `completed`, `hasPlannedActivities`, `referenceCode`, `types[]`, `sortBy`, **`lastUpdate`** *(delta sync)*, `boards[]`.

#### `POST /api/tasks/search` body — `TaskSearchFilterRequestDto`

42 campi tra cui: `assignedToMe`/`assignedToOthers`/`assignedToMyGroups`/`unassigned`, `accepted`, `active`, `completed`, `searchView`, `taskValidityTypes`, range date `created/completed/completeBefore/view` (ognuno con `From`/`To`), `latitude`/`longitude`, `linkedToBoard`, `tagIds`/`excludedTagIds`/`withoutTag`, `taskTypeIds`, `stepIds`, `boardIds`, `assignedUserIds`/`assignedGroupIds`, `contactId`/`jobId`/`contactAddressIds`, `activityCategoryIds`, `textFilter`, `orderBy`, `skip`, `take`.

#### `TaskResponseDto` — campi chiave

`id`, `name`, `description`, `taskType`/`taskTypeId`, `status`/`statusId`, `state`, `priority`, `important`, `color`, `assignee`, `creator`, `acceptor`, `referent`/`referentId`, `contact`/`contactId`/`contactAddress`/`taskContactAddress`, `job`/`jobId`/`jobWorkflow`/`jobWorkflowId`, `parentTask`/`parentTaskId`, `childTasks`, **`plannedStart`**, **`plannedEnd`**, **`completedOn`**, **`acceptBefore`**, **`completeBefore`**, **`createdOn`**, **`lastModifiedOn`**, `lastModifiedById`, `duration`/`durationUnit`, `totalHoursWorked`, `totalTimeSpan`, `referenceCode`, `internalAnnualProgressive`, `ticketNumber`, `isTicket`, `accepted`, `completed`, `verifying`, `readyForCompletion`, `requiresActivities`, `hasActivities`, `hasChildTasks`, `hasCompletedActivities`, `hasPlannedActivities`, `allChildTasksCompleted`, `hiddenOnHomeAlertPanel`, `boardIds`, `tagElements`/`tagIds`, `assignedEntityIds`, `taskTargetSteps`/`taskTargetStepIds`, `possibleStatuses`, `genericTaskTypeStep`, `taskOrigin`, `reportNotes`, `comments`/`taskComments`, `documents`/`jobDocuments`, `images`/`jobImages`, `editableWikiElements`/`wikiElementsIds`, `startStops`, `activities`.

#### `POST /api/tasks/refreshdata`

Endpoint speciale per **ricalcolare campi dipendenti** (es. quando cambia il task type → cambiano gli step disponibili). Body `TaskRefreshDataRequestDto` con `triggerField` (campo che ha scatenato), `mode` (`RefreshMode` enum), `taskId`, `taskModel` (lo stato corrente del task). Ritorna `task` aggiornato + `lists` (opzioni per dropdown) + `fields` (campi da rinfrescare nella UI). Pattern utile per UI custom.

---

### 4.7 Invoices

Solo lettura + tag management. Niente create/update/delete.

| Metodo | Path |
|---|---|
| POST | `/api/invoices/search` |
| GET | `/api/invoices/{id}` |
| PUT | `/api/invoices/{id}/tags` · `/tags/add` · `/tags/remove` |

#### `POST /api/invoices/search` — body (`InvoiceSearchFilterRequestDto`)

`contactId`, `jobId`, `linkedContactId`, `linkedContactRelationId`, `documentTypesIds[]`, `documentNumberFrom`/`To`, `invoiceFromDate`/`ToDate`, `sdiDateFrom`/`To`, `electronicInvoiceStateId`/`Ids[]`, `sendtoSdiStatusIds[]`, `stateId`, `tagIds[]`/`excludedTagIds[]`/`withoutTag` (`includeInvoicesWithoutTag`), `excludeProforma`, `externalReference`, `orderBy`, `skip`, `take`.

#### `InvoiceListItemResponseDto` — campi chiave

`id`, `invoiceNumber`, `invoicePrefix`/`invoiceSuffix`/`internalInvoiceNumber`, `invoiceDate`, `invoiceState`, `invoiceType`, `invoiceSource`, `invoiceReason`, `documentType`, `documentNumber`, `contact`, `administrativeProfileId`/`administrativeProfileName`, `electronicInvoiceStateId`, `electronicInvoices`, `sdiReceivingDateTime`, **`total_Net`** ✅, **`total_Taxed`** ✅, `paymentStatus`, `referenceCode`, `tags`, `documents`.

> ✅ A differenza degli estimates, le invoices espongono **sia netto sia lordo nel list item della search**. Niente call extra.

#### `InvoiceResponseDto` (singolo)

Aggiunge: `invoiceRows`, `jobs`, `estimateId`/`parentInvoiceId`/`estimateBillingContactAddressId`/`estimateDeliveryContactAddressId`, `electronicInvoicePaymentTerm`, `electronicInvoiceProcessingDateTime`, dati trasporto (~25 campi `transportData_*`), `paContract*` (CIG/CUP), `total`/`totalNet`/`totalToPay`, `invoiceDocumentId`/`Url`/`Name`.

---

### 4.8 Contracts (Service Contracts)

19 endpoint, due "dialetti": classici + sub-tipo `simple`.

| Metodo | Path |
|---|---|
| GET | `/api/contracts` |
| GET | `/api/contracts/{id}` |
| GET | `/api/contracts/{id}/jobadvance` · `/events` |
| GET | `/api/contracts/{id}/packages/{packageId}/activities` |
| GET | `/api/contracts/{id}/specialprices/{specialPriceId}/activities` |
| POST | `/api/contracts/list` *(equivalente di `/search`)* |
| GET | `/api/contracts/templates` |
| POST | `/api/contracts/simple` |
| PUT | `/api/contracts/simple/{id}/wikis/add` · `/wikis/remove` · `/dates` · `/update` |
| POST / PUT / DELETE | `/api/contracts/simple/{id}/jobadvances[/{jobAdvanceId}]` |
| POST / PUT / DELETE | `/api/contracts/simple/{id}/packages[/{packageId}]` |

#### `POST /api/contracts/list` body — `ServiceContractListRequestDto`

`filter`, `includePackages`, `skip`, `sort`, `take`. Schema più povero rispetto agli altri search.

#### `ServiceContractResponseDto` — campi chiave

`id`, `name`, `notes`, `referenceCode`, `referentId`/`referent`, `contactId`/`contact`, `contactAddressId`/`contactAddress`/`contactAddresses[]`/`contactAddressIds`, `jobId`/`job`, `administrativeProfileId`/`administrativeProfile`, `referenceInternalUserId`, `referenceDate1`/`Date2`, `subscritionDateTime` *(typo nello spec: "subscrition")*, `activeFrom`/`activeTo`, `cancellationDate`, `daysToCancellation`, `deletedDateTime`, `recurrenceOptionsId`/`recurrenceOptions`, `renewalConditionType`, `renewalType`, `renewedServiceContractId`/`Name`/`renewedContracts`, `starterServiceContractId`/`Name`, `status`, `isTemplate`, `tags`/`tagIds`, `packages`, `specialPrices`, `paymentModels`, `jobAdvances`, `documents`, `events`, `emailAutomations`, `wikiElements`/`wikiElementIds`, `activitiesCount`.

> ⚠️ Niente `lastModifiedOn` esposto nello spec → **delta sync sui contracts non è banale**, va valutato endpoint per endpoint.

---

## 5. Risorse di supporto

### Articles (catalogo)
GET `/api/articles` con `lastModifiedFrom`. POST/PUT/DELETE su `{id}`. Sub-endpoint `asjobarticle`, `supplierprice`, `setobsolete`.
`ArticleResponseDto`: `id`, `code`, `description`, `notes`, `articleCategory`/`articleSeries`/`articleColor`/`articleUnit`, `brand`, `supplier`, `supplierPrice`/`Discount1/2/3`, `cost`, `price`, `vat`, `stock`, `minimumStock`, `obsolete`, `useSerialNumbers`, `installationAmount_*`, `transportAmount_*`, `imageDocumentId`/`imageDocument`, `tags`, `inDittaCompanyId`.

### Expenses (note spese)
GET `/api/expenses?userId&onlyNotRefunded&skip&take`. POST / PUT / DELETE su `{id}`. Sub `notes`.
`ExpenseResponseDto` ha `createdOn`, `lastModifiedOn`, `expenseDate`, `refundDate`.

### Advances (acconti)
GET / POST `/api/advances`. GET / PUT su `{id}`. PUT `/setobsolete`. GET `/asjobadvance`.
`AdvanceResponseDto` con `lastModifiedOn`.

### PriceLists (listini)
GET / POST `/api/pricelists`. GET / PUT / DELETE su `{id}`. POST / PUT / DELETE elements nested. `PriceListResponseDto`, `PriceListElementResponseDto` con `lastModifiedOn`.

### JobArticles, JobAdvances, JobWorkFlows
Sub-entità di Job, accesso da estimate (`getbyestimate*`) o diretto. JobWorkFlows ha `/changestep` per avanzare workflow.

### Wiki (knowledge base interna)
15 endpoint. `folders`, `elements`, `types`, `simple` per element semplificati, `fileupload` per allegati, `refreshdata` per ricalcolo.

### Comments
GET / POST `/api/comments`. PUT/DELETE su `{id}`. Attachments sub-risorsa con upload e cleanup.

### Tasks types & boards & tags & users & vehicles
Lookup table read-only: `/api/tasks/types`, `/api/boards`, `/api/tags`, `/api/users` (ritorna lista `InDittaUserBasicInfoResponseDto` con `id`, `displayName`, `firstName`, `lastName`, `mobile`, `telephone`, `taxNumber`, `timeZone`, `companyRole`, `defaultActivityTypeId`, `defaultDivisionId`, `defaultPurchaseDocumentId`, `mainAdministrativeProfileId`, `vehicleId`, `inDittaCompanyId`, `profileImage`, `hasProfileImage`, `initials`), `/api/vehicles`, `/api/activitytypes`, `/api/eventtypes`, `/api/expensetypes`, `/api/documenttypes`, `/api/administrativeprofiles`, `/api/workflows`, `/api/workflows/{id}/steps`, `/api/companies/{id}/referentroles`, `/api/companies/{id}/customproperties/contacts`, `/api/companies/{id}/customproperties/jobs`.

### Me
`GET /api/me/infos` → `UserProfileResponseDto` (`id`, `firstName`, `lastName`, `displayName`, `initials`, `companyRole`, `mobile`, `telephone`, `taxNumber`, `timeZone`, `inDittaCompanyId`, `profileImage`, `hasProfileImage`, `defaultActivityTypeId`, `defaultDivisionId`, `defaultPurchaseDocumentId`, `mainAdministrativeProfileId`, `vehicleId`).
Altri: `/appsettings`, `/uisettings`, `/companysettings`, `/devices`, `/devices/register`, `/devices/activate`, `/devices/sendemail`, `/calendar/colleagues`.

### Exports (asincroni)
`POST /api/exports/{activities,estimates,contracts}` ricevono `ActivityExportRequestDto` etc., ritornano solo `ActionResult` → l'export gira async, va monitorato. `GET /api/exports/{activities,contracts}/templates` per scegliere il template documento.

### Import
`GET /api/import/checkimportstatus` e `/checklastimportresult` → polling stato import in corso/ultimo eseguito.

### Funnels, Documents, WarehouseMovements
- `POST /api/funnels/clickfunnel` → endpoint inbound da landing/funnel.
- `POST /api/documents/upload`, `DELETE /api/documents/{id}` 🚫.
- WarehouseMovements: `POST` create, `GET` `{id}`, `DELETE` 🚫.

---

## 6. Pattern e gotcha

### 6.1 GET list vs POST search — schemi diversi

Verificato per gli estimates ma è probabile che valga anche su altre risorse `[INFERITO — DA VERIFICARE LIVE]`:

| Endpoint | Item DTO | `lastModifiedOn` | Aggregati netto/lordo | Metadata pagina |
|---|---|---|---|---|
| `GET /api/estimates` | `EstimateListItemResponseDto` | ✅ `estimateLastModifiedDate` | ✅ `total` + `notVatTotal` per riga | ❌ niente |
| `POST /api/estimates/search` | `EstimateSearchListItemResponseDto` | ❌ | solo `total` per riga, ma `totalNet_Active`/`totalTaxed_Active` aggregati | ✅ `totalRecords`, `totalPages`, ecc. |
| `GET /api/estimates/{id}` | `EstimateResponseDto` | ✅ | ✅ + `rows` complete | — |

### 6.2 `notes` vs `publicNotes` — naming asimmetrico

| Risorsa | Pubblico | Privato |
|---|---|---|
| Activity | `notes` | `privateNotes` |
| ActivityReport | **`publicNotes`** | `privateNotes` |
| Job | **`publicNotes`** | `privateNotes` |
| Estimate (create body) | `notes` | `privateNotes` |
| Contact | `notes`, `specialNotes` | — |

Gli script che fanno fix dei report devono normalizzare `notes` ↔ `publicNotes`.

### 6.3 Delta sync — naming e copertura

| Risorsa | Parametro filtro | Campo response | Endpoint `/deleted` |
|---|---|---|---|
| Estimates | `lastUpdatedFrom` (GET) | `estimateLastModifiedDate` (lista, single) | ❌ |
| Activities | `lastUpdate` (GET) | `lastModifiedOn` (lista, single) | ✅ `?start=...` |
| ActivityReports | `lastModifiedFrom` (GET) | `lastModifiedOn` (single) | ✅ |
| Tasks | `lastUpdate` (GET) | `lastModifiedOn` (lista, single) | ✅ |
| Contacts | `lastModifiedFrom` (GET) | `lastModifiedOn` (single) | ❌ |
| Jobs | `lastModifiedFrom` (GET) | `lastModifiedOn` (**solo lista**, non single) | ❌ |
| Articles | `lastModifiedFrom` (GET) | ❌ non esposto nello schema | ❌ |
| Invoices | ❌ non c'è filtro | ❌ non esposto | ❌ |
| Contracts | ❌ | `deletedDateTime` ma non `lastModifiedOn` | ❌ |

> ⚠️ **Per dashboard incrementali** (Power BI, n8n cron): coperture buone su Activities, Tasks, ActivityReports, Estimates, Contacts, Jobs. Coperture **deboli** su Invoices, Contracts, Articles. Per queste serve full-refresh periodico oppure logica custom basata su altri timestamp (es. `invoiceDate`).

### 6.4 Required de facto vs spec

Lo spec non dichiara **nessun** required esplicito sulle Request DTO. **`[INFERITO — DA VERIFICARE LIVE]`**:

- `CreateEstimateRequestDto`: `contactId` + `documentTypeId` quasi certamente obbligatori.
- `ContactRequestDto`: `companyName` o (`billingFirstName`+`billingLastName`) probabilmente obbligatori; `contactTypes` quasi certamente obbligatorio.
- `ActivityRequestDto`: `activityTypeId` + (`assignedUserId` o `contactId`) probabilmente obbligatori.
- `JobRequestDto`: `name` + `mainContactId` probabilmente obbligatori.
- `TaskRequestDto`: `name` + `taskTypeId` probabilmente obbligatori.

### 6.5 Typo nello spec

- `archivied` (al posto di `archived`) — campo boolean su EstimateResponseDto, EstimateListItemResponseDto, EstimateSearchListItemResponseDto.
- `estimateValididtyDateFrom` / `estimateValididtyDateTo` (doppia `id`) nel filtro search.
- `subscritionDateTime` (al posto di `subscriptionDateTime`) su ServiceContractResponseDto.

Vanno passati e letti **così come sono**.

### 6.6 PATCH

Solo due endpoint PATCH:
- `PATCH /api/estimates/{id}` → DTO custom `UpdateEstimateRequestDto`.
- `PATCH /api/jobs/{id}` → JSON Patch standard RFC 6902 con array di `Operation`. Content-Type `application/json-patch+json` consigliato.

### 6.7 Soft-delete via PUT

Diversi endpoint `PUT /{id}/setobsolete` (Articles, Advances, Contacts) marcano come obsoleto senza cancellare → **non sono DELETE veri**, ma fanno soft-delete logico. Per la regola del progetto, **chiedere conferma esplicita** prima di chiamarli.

### 6.8 Body `application/json-patch+json` ≠ JSON Patch

83 endpoint accettano `application/json-patch+json` come content-type alternativo, **ma il body atteso è il DTO normale**, non un array di operazioni JSON Patch (eccezione: `PATCH /api/jobs/{id}`). È solo un alias storico legato al framework .NET.

---

## 7. Delta sync e Power BI

### 7.1 Strategia Power BI con `Web.Contents`

Per ogni risorsa che supporta `lastModifiedFrom` / `lastUpdate` / `lastUpdatedFrom`, usare paginazione `skip`/`take` e cursore temporale.

**Pattern incrementale Power BI**:

1. Stato precedente: max `lastModifiedOn` salvato in tabella di stato.
2. Query: `?lastModifiedFrom=<stato>&skip=0&take=100` → loop fino a `value.length < take`.
3. Merge in tabella esistente (UPSERT per `id`).
4. Per record cancellati: chiamata a `/api/{resource}/deleted?start=<stato>` e DELETE locale.
5. Aggiorna stato con max `lastModifiedOn` + 1ms.

### 7.2 Frequenza consigliata

| Risorsa | Frequenza |
|---|---|
| Activities, Tasks | 5–15 min (dato volume operativo) |
| Estimates, Invoices, Contacts, Jobs | 30–60 min |
| Articles, Contracts | 6–24 h (più stabili) |
| Lookup (types, users, tags, vehicles, ecc.) | 24 h |

### 7.3 Record limite e backpressure

`take` non documentato come max → **`[INFERITO — DA VERIFICARE LIVE]`** prudenza con 50–100. Su Activities con `assignedUserId=6701&take=5` Lorenzo conferma funzionamento stabile. Per backfill iniziale usare batch da 100 con throttle.

---

## 8. Snippet n8n e Power BI pronti all'uso

> Tutti gli snippet sono basati sui path e parametri reali estratti dallo spec. Sostituire `${API_KEY}`/`{{ $env.TAKEOFF_API_KEY }}` con la chiave reale.

### 8.1 n8n — HTTP Request: ricerca preventivi confermati ultimo trimestre

```jsonc
// Nodo: HTTP Request
{
  "method": "POST",
  "url": "https://webapi.takeoffcrm.com/api/estimates/search",
  "queryParameters": [
    { "name": "skip", "value": "0" },
    { "name": "take", "value": "100" }
  ],
  "headerParameters": [
    { "name": "x-api-key", "value": "={{ $env.TAKEOFF_API_KEY }}" },
    { "name": "Content-Type", "value": "application/json" }
  ],
  "bodyParametersJson": {
    "includeConfirmed": true,
    "includeActive": false,
    "includeRejected": false,
    "includeArchived": false,
    "estimateConfirmDateFrom": "={{ $now.minus({ months: 3 }).toISO() }}",
    "estimateConfirmDateTo":   "={{ $now.toISO() }}"
  }
}
// Output: response.value.data[] + response.value.totalRecords / totalPages
```

> ⚠️ Per aggiungere `notVatTotal` per ogni preventivo, **non si può** dalla search. O si fa loop con `GET /api/estimates/{id}` per ogni `data[].id`, oppure si usa direttamente `GET /api/estimates?lastUpdatedFrom=...` (più efficiente per dashboard).

### 8.2 n8n — Delta sync attività dell'utente Lorenzo (id 6701)

```jsonc
{
  "method": "GET",
  "url": "https://webapi.takeoffcrm.com/api/activities",
  "queryParameters": [
    { "name": "assignedUserId", "value": "6701" },
    { "name": "lastUpdate", "value": "={{ $node['State'].json.lastSync }}" },
    { "name": "skip", "value": "0" },
    { "name": "take", "value": "100" },
    { "name": "orderDesc", "value": "true" },
    { "name": "sortBy", "value": "0" }
  ],
  "headerParameters": [
    { "name": "x-api-key", "value": "={{ $env.TAKEOFF_API_KEY }}" }
  ]
}
// Poi loop: per ogni response.value[i] con activityReportId != null
//   → GET /api/activityreports/{activityReportId}
//   → Leggere: notes, privateNotes (sull'attività)
//                publicNotes, privateNotes (sull'activity report)
```

### 8.3 n8n — Cancellazioni attività (per delta vero)

```jsonc
{
  "method": "GET",
  "url": "https://webapi.takeoffcrm.com/api/activities/deleted",
  "queryParameters": [
    { "name": "start", "value": "={{ $node['State'].json.lastSync }}" }
  ],
  "headerParameters": [
    { "name": "x-api-key", "value": "={{ $env.TAKEOFF_API_KEY }}" }
  ]
}
```

### 8.4 Power BI — `Web.Contents` per estimates incrementale

```powerquery
let
    apiKey = "inserire-qui-apikey-utentedisistema",
    baseUrl = "https://webapi.takeoffcrm.com",
    lastSync = DateTime.ToText(
        Date.AddDays(DateTime.LocalNow(), -7),
        [Format="yyyy-MM-ddTHH:mm:ss", Culture="en-US"]
    ),
    fnPage = (skip as number) =>
        let
            res = Json.Document(
                Web.Contents(
                    baseUrl,
                    [
                        RelativePath = "api/estimates",
                        Query = [
                            lastUpdatedFrom = lastSync,
                            skip = Number.ToText(skip),
                            take = "100"
                        ],
                        Headers = [ #"x-api-key" = apiKey ]
                    ]
                )
            ),
            rows = res[value]
        in rows,
    Source = List.Generate(
        () => [skip = 0, batch = fnPage(0)],
        each List.Count([batch]) > 0,
        each [skip = [skip] + 100, batch = fnPage([skip] + 100)],
        each [batch]
    ),
    Flat = List.Combine(Source),
    AsTable = Table.FromList(Flat, Splitter.SplitByNothing()),
    Expanded = Table.ExpandRecordColumn(
        AsTable, "Column1",
        {"id", "estimateName", "estimateCreationDate", "estimateLastModifiedDate",
         "estimateConfirmDate", "estimateValidity",
         "total", "notVatTotal", "estimateNumber", "revisionNumber",
         "statusName", "archivied", "estimateSuccessPercentage",
         "contact", "job", "creatorUser", "documentType"}
    )
in
    Expanded
```

### 8.5 Power BI — invoices con netto/lordo

```powerquery
let
    apiKey = "inserire-qui-apikey-utentedisistema",
    Body = Json.FromValue([
        invoiceFromDate = "2026-01-01T00:00:00Z",
        invoiceToDate   = "2026-12-31T23:59:59Z",
        excludeProforma = true,
        skip = 0, take = 100
    ]),
    Resp = Json.Document(
        Web.Contents(
            "https://webapi.takeoffcrm.com",
            [
                RelativePath = "api/invoices/search",
                Headers = [
                    #"x-api-key" = apiKey,
                    #"Content-Type" = "application/json"
                ],
                Content = Body
            ]
        )
    ),
    Data = Resp[value][data],
    AsTable = Table.FromList(Data, Splitter.SplitByNothing()),
    Out = Table.ExpandRecordColumn(
        AsTable, "Column1",
        {"id", "invoiceNumber", "invoiceDate", "documentType",
         "contact", "total_Net", "total_Taxed", "paymentStatus",
         "invoiceState", "invoiceType"}
    )
in Out
```

### 8.6 cURL — verifica rapida endpoint

```bash
# User profile (sanity check auth)
curl -sS -H "x-api-key: $TAKEOFF_API_KEY" \
  https://webapi.takeoffcrm.com/api/me/infos | jq '.value | {id, displayName, companyRole}'

# Lista users (per scoprire id assegnatari)
curl -sS -H "x-api-key: $TAKEOFF_API_KEY" \
  https://webapi.takeoffcrm.com/api/users | jq '.value[] | {id, displayName}'

# Conteggio estimates attivi
curl -sS -X POST -H "x-api-key: $TAKEOFF_API_KEY" -H "Content-Type: application/json" \
  -d '{"includeActive": true}' \
  "https://webapi.takeoffcrm.com/api/estimates/search?skip=0&take=1" \
  | jq '.value | {totalRecords, totalNet_Active, totalTaxed_Active}'
```

---

## 9. Come usare questo file con Claude

### 9.1 Iniezione come contesto

**Claude.ai (web/desktop)** — caricare il file in **Project Knowledge** del progetto TakeOff. Claude lo legge ad ogni richiesta tramite `project_knowledge_search`. Sostituisce o affianca `takeoff-openapi.json`: questo KB è più navigabile, l'OpenAPI è la fonte autoritativa per dettagli rari.

**Claude Code** — il file vive nella cartella del progetto. Bastano prompt del tipo:

> Leggi `takeoff-api-knowledge-base.md` e poi …

oppure tag espliciti:

> Sezione 4.1 di `takeoff-api-knowledge-base.md` come contesto. Mi serve un workflow n8n che …

**API/SDK** — passare il contenuto come `system` o come messaggio user di setup, prima della richiesta vera. Per stare sotto i limiti di token ridurre alle sezioni 1, 2, 6, 8 + la sezione della risorsa target.

### 9.2 Esempi di domande che il file deve poter rispondere

- "Qual è il body esatto di `POST /api/estimates/search`?" → §4.1.
- "Come faccio refresh incrementale degli activity reports in Power BI?" → §7 + §8.
- "Perché `totalWithVat` non appare nei risultati di `/search` estimates?" → §4.1 + §6.1.
- "Da `notes` vs `privateNotes`, qual è la differenza tra activity e activity report?" → §6.2.
- "Quali endpoint posso usare per sapere cosa è stato cancellato dopo un certo timestamp?" → §6.3.
- "Posso fare PATCH di un job?" → §4.5 + §6.6.
- "Come è fatto il wrapper di paginazione?" → §2.1.
- "Qual è la differenza tra `GET /api/contacts` e `POST /api/contacts/search`?" → §4.4 (filtri search più ricchi: range date `createdOn`, custom properties, interests, campaigns, address-based filtering).

### 9.3 Limitazioni note di questo KB

- I campi marcati `[INFERITO — DA VERIFICARE LIVE]` necessitano di chiamata reale per essere confermati.
- Lo spec **non** contiene esempi di payload. Per i casi limite (es. `customProperties` shape, `AdvanceFilter` shape) servono test live.
- Lo spec **non** documenta rate limit, dimensione massima `take`, dimensione massima file upload, formati accettati per `customProperties`. Tutto da verificare.
- L'integrazione MCP n8n di Lorenzo (memoria progetto) **non è descritta nello spec**: è layer applicativo separato, da non confondere con la API diretta.

---

## 10. Appendice — endpoint completo

Lista compatta di tutti i 235 endpoint estratti. Generata via:

```bash
jq -r '.paths | to_entries[] | .key as $p | .value | to_entries[] |
  select(.key | test("^(get|post|put|patch|delete)$")) |
  "\(.key | ascii_upcase)\t\($p)\t\(.value.tags // [] | join(","))"' takeoff-openapi.json
```

| Metodo | Path | Tag |
|---|---|---|
| GET | `/api/activities` | Activities |
| POST | `/api/activities` | Activities |
| GET | `/api/activities/{id}` | Activities |
| PUT | `/api/activities/{id}` | Activities |
| DELETE 🚫 | `/api/activities/{id}` | Activities |
| GET | `/api/activities/{id}/notes` | Activities |
| PUT | `/api/activities/{id}/notes` | Activities |
| DELETE 🚫 | `/api/activities/{id}/documents/{documentid}` | Activities |
| GET | `/api/activities/{id}/articles` | Activities |
| POST | `/api/activities/{id}/articles` | Activities |
| GET | `/api/activities/{id}/articles/{articleId}` | Activities |
| PUT | `/api/activities/{id}/articles/{articleId}` | Activities |
| DELETE 🚫 | `/api/activities/{id}/articles/{articleId}` | Activities |
| GET | `/api/activities/{id}/advances` | Activities |
| POST | `/api/activities/{id}/advances` | Activities |
| GET | `/api/activities/{id}/advances/{advanceId}` | Activities |
| PUT | `/api/activities/{id}/advances/{advanceId}` | Activities |
| DELETE 🚫 | `/api/activities/{id}/advances/{advanceId}` | Activities |
| GET | `/api/activities/{id}/images` | Activities |
| GET | `/api/activities/{id}/documents` | Activities |
| PUT | `/api/activities/{id}/setbillingstate` | Activities |
| PUT | `/api/activities/{id}/setbilled` | Activities |
| PUT | `/api/activities/{id}/setunbilled` | Activities |
| PUT | `/api/activities/{id}/setapproved` | Activities |
| PUT | `/api/activities/{id}/setcompleted` | Activities |
| GET | `/api/activities/{id}/tags` | Activities |
| PUT | `/api/activities/{id}/tags` | Activities |
| GET | `/api/activities/{id}/wikis` | Activities |
| POST | `/api/activities/search` | Activities |
| POST | `/api/activities/search/activityreports` | Activities |
| GET | `/api/activities/deleted` | Activities |
| GET | `/api/activityreports` | ActivityReports |
| GET | `/api/activityreports/{id}` | ActivityReports |
| PUT | `/api/activityreports/{id}/setapproved` | ActivityReports |
| PUT | `/api/activityreports/{id}/setnotapproved` | ActivityReports |
| PUT | `/api/activityreports/{id}/setcompleted` | ActivityReports |
| PUT | `/api/activityreports/{id}/setnotcompleted` | ActivityReports |
| PUT | `/api/activityreports/{id}/setbilled` | ActivityReports |
| PUT | `/api/activityreports/{id}/setnotbilled` | ActivityReports |
| GET | `/api/activityreports/deleted` | ActivityReports |
| GET | `/api/activitytypes` | ActivityTypes |
| GET | `/api/administrativeprofiles` | AdministrativeProfiles |
| GET | `/api/advances` | Advances |
| POST | `/api/advances` | Advances |
| GET | `/api/advances/{id}` | Advances |
| PUT | `/api/advances/{id}` | Advances |
| GET | `/api/advances/{id}/asjobadvance` | Advances |
| PUT | `/api/advances/{id}/setobsolete` | Advances |
| GET | `/api/articles` | Articles |
| POST | `/api/articles` | Articles |
| GET | `/api/articles/{id}` | Articles |
| DELETE 🚫 | `/api/articles/{id}` | Articles |
| PUT | `/api/articles/{id}` | Articles |
| GET | `/api/articles/{id}/asjobarticle` | Articles |
| PUT | `/api/articles/{id}/supplierprice` | Articles |
| PUT | `/api/articles/{id}/setobsolete` | Articles |
| GET | `/api/boards` | Boards |
| GET | `/api/comments` | Comments |
| POST | `/api/comments` | Comments |
| PUT | `/api/comments/{id}` | Comments |
| DELETE 🚫 | `/api/comments/{id}` | Comments |
| POST | `/api/comments/attachments` | Comments |
| DELETE 🚫 | `/api/comments/attachments/{id}` | Comments |
| DELETE 🚫 | `/api/comments/{id}/attachments/{attachmentId}` | Comments |
| GET | `/api/companies/{id}/referentroles` | Companies |
| GET | `/api/companies/{id}/customproperties/contacts` | Companies |
| GET | `/api/companies/{id}/customproperties/jobs` | Companies |
| GET | `/api/contacts` | Contacts |
| POST | `/api/contacts` | Contacts |
| POST | `/api/contacts/search` | Contacts |
| GET | `/api/contacts/{id}` | Contacts |
| PUT | `/api/contacts/{id}` | Contacts |
| GET | `/api/contacts/referencecode/{referenceCode}` | Contacts |
| GET | `/api/contacts/{id}/addresses` | Contacts |
| POST | `/api/contacts/{id}/addresses` | Contacts |
| GET | `/api/contacts/{id}/addresses/{contactAddressId}` | Contacts |
| PUT | `/api/contacts/{id}/addresses/{contactAddressId}` | Contacts |
| GET | `/api/contacts/{id}/referents` | Contacts |
| POST | `/api/contacts/{id}/referents` | Contacts |
| GET | `/api/contacts/{id}/wikis` | Contacts |
| GET | `/api/contacts/{id}/lastjob` | Contacts |
| PUT | `/api/contacts/{id}/setobsolete` | Contacts |
| PUT | `/api/contacts/{id}/addresses/{contactAddressId}/sethidden` | Contacts |
| GET | `/api/contacts/{id}/referents/{referentId}` | Contacts |
| PUT | `/api/contacts/{id}/referents/{referentId}` | Contacts |
| PUT | `/api/contacts/{id}/referents/{referentId}/setnotlisted` | Contacts |
| GET | `/api/contacts/types` | Contacts |
| GET | `/api/contacts/{id}/customproperties` | Contacts |
| PUT | `/api/contacts/{id}/customproperties` | Contacts |
| GET | `/api/contacts/{id}/specialconditions` | Contacts |
| POST | `/api/contacts/{id}/specialconditions` | Contacts |
| PUT | `/api/contacts/{id}/specialconditions` | Contacts |
| DELETE 🚫 | `/api/contacts/{id}/specialconditions/{specialConditionId}` | Contacts |
| PUT | `/api/contacts/{id}/authorizations` | Contacts |
| GET | `/api/contacts/{id}/authorizations` | Contacts |
| GET | `/api/contracts` | Contracts |
| GET | `/api/contracts/{id}` | Contracts |
| GET | `/api/contracts/{id}/jobadvance` | Contracts |
| GET | `/api/contracts/{id}/packages/{packageId}/activities` | Contracts |
| GET | `/api/contracts/{id}/events` | Contracts |
| GET | `/api/contracts/{id}/specialprices/{specialPriceId}/activities` | Contracts |
| POST | `/api/contracts/list` | Contracts |
| GET | `/api/contracts/templates` | Contracts |
| POST | `/api/contracts/simple` | Contracts |
| PUT | `/api/contracts/simple/{id}/wikis/add` | Contracts |
| PUT | `/api/contracts/simple/{id}/wikis/remove` | Contracts |
| PUT | `/api/contracts/simple/{id}/dates` | Contracts |
| PUT | `/api/contracts/simple/{id}/update` | Contracts |
| POST | `/api/contracts/simple/{id}/jobadvances` | Contracts |
| PUT | `/api/contracts/simple/{id}/jobadvances` | Contracts |
| DELETE 🚫 | `/api/contracts/simple/{id}/jobadvances/{jobAdvanceId}` | Contracts |
| POST | `/api/contracts/simple/{id}/packages` | Contracts |
| PUT | `/api/contracts/simple/{id}/packages` | Contracts |
| DELETE 🚫 | `/api/contracts/simple/{id}/packages/{packageId}` | Contracts |
| POST | `/api/documents/upload` | Documents |
| DELETE 🚫 | `/api/documents/{id}` | Documents |
| GET | `/api/documenttypes` | DocumentTypes |
| GET | `/api/estimates` | Estimates |
| POST | `/api/estimates` | Estimates |
| GET | `/api/estimates/basic` | Estimates |
| GET | `/api/estimates/{id}` | Estimates |
| PATCH | `/api/estimates/{id}` | Estimates |
| DELETE 🚫 | `/api/estimates/{id}` | Estimates |
| PUT | `/api/estimates/{id}/referencecode` | Estimates |
| POST | `/api/estimates/search` | Estimates |
| PUT | `/api/estimates/{id}/lock` | Estimates |
| PUT | `/api/estimates/{id}/unlock` | Estimates |
| POST | `/api/estimates/{id}/rows` | Estimates |
| DELETE 🚫 | `/api/estimates/{id}/rows/{rowType}/{rowId}` | Estimates |
| GET | `/api/eventtypes` | EventTypes |
| POST | `/api/eventtypes` | EventTypes |
| GET | `/api/eventtypes/{id}` | EventTypes |
| PUT | `/api/eventtypes/{id}` | EventTypes |
| GET | `/api/expenses` | Expenses |
| POST | `/api/expenses` | Expenses |
| GET | `/api/expenses/{id}` | Expenses |
| PUT | `/api/expenses/{id}` | Expenses |
| DELETE 🚫 | `/api/expenses/{id}` | Expenses |
| GET | `/api/expenses/{id}/notes` | Expenses |
| PUT | `/api/expenses/{id}/notes` | Expenses |
| GET | `/api/expensetypes` | ExpenseTypes |
| POST | `/api/exports/activities` | Exports |
| POST | `/api/exports/estimates` | Exports |
| POST | `/api/exports/contracts` | Exports |
| GET | `/api/exports/activities/templates` | Exports |
| GET | `/api/exports/contracts/templates` | Exports |
| POST | `/api/funnels/clickfunnel` | Funnels |
| GET | `/api/import/checkimportstatus` | Import |
| GET | `/api/import/checklastimportresult` | Import |
| POST | `/api/invoices/search` | Invoices |
| GET | `/api/invoices/{id}` | Invoices |
| PUT | `/api/invoices/{id}/tags` | Invoices |
| PUT | `/api/invoices/{id}/tags/add` | Invoices |
| PUT | `/api/invoices/{id}/tags/remove` | Invoices |
| GET | `/api/jobadvances/{id}` | JobAdvances |
| PUT | `/api/jobadvances/{id}` | JobAdvances |
| GET | `/api/jobadvances/getbyestimateadvanceid/{id}` | JobAdvances |
| GET | `/api/jobarticles/getbyestimatearticleid/{id}` | JobArticles |
| GET | `/api/jobarticles/{id}` | JobArticles |
| PUT | `/api/jobarticles/{id}` | JobArticles |
| POST | `/api/jobarticles` | JobArticles |
| PUT | `/api/jobarticles/{id}/state` | JobArticles |
| GET | `/api/jobs` | Jobs |
| POST | `/api/jobs` | Jobs |
| GET | `/api/jobs/{id}` | Jobs |
| PUT | `/api/jobs/{id}` | Jobs |
| PATCH | `/api/jobs/{id}` | Jobs |
| GET | `/api/jobs/{id}/triggerworkflows` | Jobs |
| PUT | `/api/jobs/{id}/referencecode` | Jobs |
| GET | `/api/jobs/divisions` | Jobs |
| GET | `/api/jobworkflows/{id}/steps` | JobWorkFlows |
| POST | `/api/jobworkflows/{id}/changestep` | JobWorkFlows |
| GET | `/api/me/infos` | Me |
| GET | `/api/me/appsettings` | Me |
| GET | `/api/me/uisettings` | Me |
| GET | `/api/me/companysettings` | Me |
| GET | `/api/me/devices` | Me |
| POST | `/api/me/devices/register` | Me |
| POST | `/api/me/devices/activate` | Me |
| GET | `/api/me/calendar/colleagues` | Me |
| POST | `/api/me/devices/sendemail` | Me |
| GET | `/api/pricelists` | PriceLists |
| POST | `/api/pricelists` | PriceLists |
| GET | `/api/pricelists/{id}` | PriceLists |
| PUT | `/api/pricelists/{id}` | PriceLists |
| DELETE 🚫 | `/api/pricelists/{id}` | PriceLists |
| POST | `/api/pricelists/{id}/elements` | PriceLists |
| PUT | `/api/pricelists/{id}/elements` | PriceLists |
| DELETE 🚫 | `/api/pricelists/{id}/elements/{elementId}` | PriceLists |
| GET | `/api/tags` | Tags |
| GET | `/api/tasks` | Tasks |
| POST | `/api/tasks` | Tasks |
| POST | `/api/tasks/search` | Tasks |
| GET | `/api/tasks/mine` | Tasks |
| GET | `/api/tasks/types` | Tasks |
| GET | `/api/tasks/deleted` | Tasks |
| GET | `/api/tasks/types/{id}/steps` | Tasks |
| GET | `/api/tasks/{id}/activeboards` | Tasks |
| GET | `/api/tasks/{id}` | Tasks |
| PUT | `/api/tasks/{id}` | Tasks |
| DELETE 🚫 | `/api/tasks/{id}` | Tasks |
| GET | `/api/tasks/ticketnumber/{ticketNumber}` | Tasks |
| GET | `/api/tasks/{id}/comments` | Tasks |
| GET | `/api/tasks/{id}/activities` | Tasks |
| GET | `/api/tasks/{id}/activities/notes/aggregate` | Tasks |
| GET | `/api/tasks/{id}/startstop` | Tasks |
| PUT | `/api/tasks/{id}/start` | Tasks |
| PUT | `/api/tasks/{id}/accept` | Tasks |
| PUT | `/api/tasks/{id}/status` | Tasks |
| POST | `/api/tasks/refreshdata` | Tasks |
| GET | `/api/tasks/refreshdata/{id}` | Tasks |
| DELETE 🚫 | `/api/tasks/{id}/documents/{documentid}` | Tasks |
| PUT | `/api/tasks/{id}/description` | Tasks |
| GET | `/api/users` | Users |
| GET | `/api/vehicles` | Vehicles |
| GET | `/api/warehousemovements/{id}` | WarehouseMovements |
| DELETE 🚫 | `/api/warehousemovements/{id}` | WarehouseMovements |
| POST | `/api/warehousemovements` | WarehouseMovements |
| GET | `/api/wiki/{id}` | Wiki |
| PUT | `/api/wiki/{id}` | Wiki |
| GET | `/api/wiki/foldertypes` | Wiki |
| GET | `/api/wiki/folders` | Wiki |
| POST | `/api/wiki/folders` | Wiki |
| GET | `/api/wiki/folders/{id}/poco` | Wiki |
| GET | `/api/wiki/folders/{id}` | Wiki |
| GET | `/api/wiki/elements` | Wiki |
| GET | `/api/wiki/types` | Wiki |
| GET | `/api/wiki/types/{id}/properties` | Wiki |
| POST | `/api/wiki/refreshdata` | Wiki |
| POST | `/api/wiki` | Wiki |
| POST | `/api/wiki/fileupload` | Wiki |
| POST | `/api/wiki/simple` | Wiki |
| PUT | `/api/wiki/simple/{id}` | Wiki |
| GET | `/api/workflows` | WorkFlows |
| GET | `/api/workflows/{id}/steps` | WorkFlows |

> 🚫 = endpoint DELETE, **vietato in questo progetto** (vedi §1).

---

## 11. Verifiche live — app "TakeOff Scheduler" (2026-06-12)

> Riscontri **confermati con chiamate reali** sul CRM di produzione durante lo sviluppo del generatore di incarichi ricorrenti di manutenzione. Promuovono alcuni `[INFERITO]` a verificati e aggiungono gotcha non presenti nello spec.

### 11.1 Tasks — per leggere in modo affidabile usare `POST /api/tasks/search`, **non** `GET /api/tasks`

- `GET /api/tasks?contactId=X` è **sovra-filtrato**: restituisce solo i task completati/recenti e **omette i task non completati con `plannedStart` futuro** (es. le manutenzioni appena create). I parametri `taskTypeId`, `plannedStart`, `plannedEnd` sulla GET vengono **ignorati** (filtra di fatto solo per `contactId`).
- `POST /api/tasks/search` con body `{ contactId, taskTypeIds:[id], skip, take }` restituisce **tutti** i task (anche futuri/non completati) e filtra per tipo lato server. Riscontro: un contatto con 2 ticket completati + 8 manutenzioni future dava **2** righe via GET e **10** via search.
- Il tipo task nelle risposte di lista è in **`taskType.id`** (non c'è un `taskTypeId` flat).

### 11.2 Assegnatari task — campo `assignedEntityIds`, formato prefissato

- Il campo di assegnazione (sia in `TaskRequestDto` create, sia in `TaskResponseDto`) è **`assignedEntityIds: string[]`** con prefissi: **`us_<userId>`** per gli utenti, **`gr_<groupId>`** per i gruppi. Es. `["us_6502","gr_34064"]`.
- È un **array → supporta multi-assegnazione** (più utenti e/o gruppi sullo stesso incarico).
- Assegnare più utenti fa creare a TakeOff un **gruppo ad-hoc** (`assigneeType` 2) il cui `displayName` è la concatenazione dei nomi (es. `"Alejandro,Javier,Carlos"`).
- In risposta, `assignee` è un singolo oggetto `{ id, displayName, assigneeType }` (il primario), con **`assigneeType`: 1 = utente, 2 = gruppo**.

### 11.3 Nessun endpoint "lista gruppi"

- Non esiste un endpoint che elenchi i gruppi assegnabili: `/api/user-groups`, `/api/groups`, `/api/usergroups`, `/api/teams`… → **404**. Confermato anche sullo swagger live: **nessun path contiene "group"**; lo schema `AssigneeBasicInfoResponseDto` compare solo annidato nei task.
- Workaround adottato: **ricavare i gruppi con nome dai task esistenti** (raccolta degli `assignee` con `assigneeType === 2`), escludendo i gruppi ad-hoc riconoscibili dal nome con virgole. Gli utenti invece da `GET /api/users`.

### 11.4 Attivazione incarico — `taskValidityType` + `startValidityDate`

- **`taskValidityType: 10`** = *"Válido a partir de fecha"* (attivo a partire da una data). `0` = default.
- Va accompagnato da **`startValidityDate`** (data di attivazione).
- ⚠️ **Formato data critico**: deve essere **locale senza timezone** — `YYYY-MM-DDTHH:mm:ss` — esattamente come `plannedStart`/`plannedEnd`. Inviare `Date.toISOString()` (con `Z` e millisecondi, es. `2026-06-11T00:00:00.000Z`) **provoca 400 Bad Request** (riscontrato in un tentativo precedente). Con il formato locale i task vengono creati correttamente (verificato: incarichi reali con `taskValidityType=10` presenti a sistema).

### 11.5 Custom properties del contatto — solo dal dettaglio

- Le `customProperties` del contatto sono restituite **solo da `GET /api/contacts/{id}`** (dettaglio), **non** dalle risposte di `POST /api/contacts/search` (che ritornano un oggetto snello: `id`, `companyName`, `referenceCode`, `email`, `telephone`, `vat`…). Per leggere una custom property serve quindi una GET per-contatto.
- Struttura: `customProperties: [{ id, customPropertyTypeId, name, value }]`. Per i campi data il `value` è una stringa, formato osservato **`dd/mm/yyyy HH:mm:ss`** (es. `23/06/2026 00:00:00`).
- Caso d'uso: data di inizio manutenzione letta dalla property `"Data inizio manutenzione"` / `"Fecha Contrato Mantenimiento"`.

### 11.6 Nota client-side — caching del proxy CORS

- In uso locale via `corsproxy.io` le **GET vengono cachate per URL** dal proxy → letture *stale* (perfino liste vuote servite ripetutamente). Per i read che devono essere freschi: usare un cache-buster (`&_=${Date.now()}`) **oppure** un endpoint **POST** (non cachato). Su Vercel si usa il rewrite integrato (`/api/takeoff/*`), senza proxy.

### 11.7 Swagger live

- Spec navigabile/scaricabile a runtime: **`GET /swagger/v1/swagger.json`** (185 path sul tenant verificato).

---

*Fine Knowledge Base. Per dettagli mancanti consultare `takeoff-openapi.json` o lo Swagger live: <https://webapi.takeoffcrm.com/swagger>.*
