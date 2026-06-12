/* ==========================================================================
   TakeOff CRM Recurring Task Generator — Core Javascript Engine
   ========================================================================== */

/**
 * 0. Translations (IT / ES)
 */
const TRANSLATIONS = {
    es: {
        // Page
        'page.title': 'TakeOff CRM — Generador de Tareas Recurrentes',
        'app.subtitle': 'Generador Recurrente de Tareas de Mantenimiento',
        // Connection badge
        'status.connected': 'Conectado',
        'status.disconnected': 'Desconectado',
        // Auth panel
        'auth.title': 'Autenticación API',
        'auth.api_key_label': 'Clave API TakeOff CRM',
        'auth.api_key_placeholder': 'Introduce tu x-api-key...',
        'auth.api_key_hint': 'La clave API se guardará localmente en el navegador para accesos posteriores.',
        'auth.cors_label': 'Activar Proxy CORS',
        'auth.cors_hint': "Resuelve el error 'Failed to fetch' en local enrutando las llamadas a través del proxy.",
        'auth.connect_btn': 'Conectar a TakeOff',
        'auth.user_role_default': 'Colaborador TakeOff',
        // Defaults / config panel
        'config.title': 'Configuración de Tarea',
        'config.task_type_label': 'Tipo de Tarea',
        'config.task_type_placeholder': 'Selecciona un tipo de tarea...',
        'config.status_label': 'Estado Inicial',
        'config.status_placeholder': 'Selecciona un estado...',
        'config.assignee_label': 'Asignatario(s) por Defecto',
        'config.assignee_none': 'Ninguno (Sin asignar)',
        'config.assignee_search': 'Buscar usuario o grupo...',
        'config.assignee_users_section': 'Usuarios',
        'config.assignee_groups_section': 'Grupos',
        'config.assignee_no_results': 'Sin resultados',
        'config.priority_label': 'Prioridad',
        'config.priority_low': 'Baja',
        'config.priority_medium': 'Media',
        'config.priority_high': 'Alta',
        'config.priority_urgent': 'Urgente',
        'config.important_label': 'Importante',
        'config.important_mark': 'Marcar',
        'config.templates_trigger': 'Plantillas de Texto (Título y Descripción)',
        'config.template_title_label': 'Plantilla Título Tarea',
        'config.template_title_vars': 'Variables disponibles:',
        'config.template_desc_label': 'Plantilla Descripción Tarea',
        'config.default_title': 'Mantenimiento periódico - {cliente}',
        'config.default_desc': 'Realizar el mantenimiento programado periódico del cliente {cliente}.\n\nRecurrencia programada: {recurrencia}\nFecha inicio ciclo de mantenimiento: {fecha_activacion}',
        // Contacts panel
        'contacts.title': 'Clientes con Mantenimiento',
        'contacts.hint': 'Carga los contactos TakeOff que tienen un tipo en el grupo <strong>MANTENIMIENTO</strong> (Mensual, Bimestral, Trimestral, Cuadrimestral, Semestral, Anual).',
        'contacts.load_btn': 'Cargar Contactos desde TakeOff',
        'contacts.breakdown_title': 'Distribución de Recurrencias',
        'contacts.count_text': '{n} clientes con mantenimiento',
        'contacts.clients': 'clientes',
        'contacts.type_hint': 'Desmarca los tipos ya procesados en ejecuciones anteriores para generar solo los nuevos.',
        'contacts.individual_title': 'Selección Individual de Contactos',
        'contacts.search_placeholder': 'Buscar por nombre o ID...',
        'contacts.select_visible': 'Sel. visibles',
        'contacts.deselect_visible': 'Desel. visibles',
        'contacts.selected_count': '{n} de {total} seleccionados',
        'contacts.list_empty': 'Ningún contacto coincide con la búsqueda.',
        // Generator panel
        'generator.title': 'Calendario de Mantenimientos',
        'generator.start_date': 'Fecha de Inicio (fallback)',
        'generator.start_date_hint': 'Solo se usa para contactos sin la propiedad "Fecha Contrato Mantenimiento". Cada contacto arranca su ciclo en su propia fecha de contrato.',
        'generator.duration': 'Duración de la Generación',
        'generator.duration_unit': 'Meses',
        'generator.offset_days': 'Días de antelación (Activación)',
        'generator.offset_unit': 'Días',
        'generator.offset_hint': 'Si se deja vacío o en 0, se activa al inicio del periodo.',
        'generator.generate_btn': 'Generar Calendario',
        'generator.search_placeholder': 'Filtrar por cliente o código...',
        'generator.total_tasks': 'Tareas Generadas',
        'generator.selected_tasks': 'Seleccionadas',
        'generator.col_client': 'Código y Cliente',
        'generator.col_freq': 'Frec.',
        'generator.col_activation': 'Fecha de Activación',
        'generator.col_range': 'Planificación (Fin de Ciclo)',
        'generator.col_title': 'Título de la Tarea',
        'generator.col_actions': 'Acciones',
        'generator.no_results': 'Ningún vencimiento coincide con la búsqueda.',
        'generator.project_name_label': 'Nombre del Proyecto (opcional)',
        'generator.project_name_placeholder': 'Ej: Mantenimiento 2026 — se creará un Proyecto en cada contacto',
        'generator.create_btn': 'Crear en Bloque en TakeOff CRM',
        'generator.edit_title': 'Editar tarea',
        'generator.check_existing_label': 'Verificar tareas existentes antes de crear',
        'generator.check_existing_hint': 'Más lento pero evita duplicados si algunos contactos ya fueron procesados.',
        // Progress modal
        'progress.title': 'Creación de Tareas en Curso...',
        'progress.success_label': 'Creadas con Éxito',
        'progress.failure_label': 'Errores / Fallidas',
        'progress.skipped_label': 'Saltadas / Ya existentes',
        'progress.percent_label': 'Porcentaje',
        'progress.log_title': 'Registro de operaciones API',
        'progress.copy_btn': 'Copiar',
        'progress.copy_title': 'Copiar registro',
        'progress.stop_btn': 'Interrumpir',
        'progress.close_btn': 'Cerrar',
        // Edit modal
        'edit.title': 'Editar Vencimiento Individual',
        'edit.task_title_label': 'Título de la Tarea',
        'edit.activation_label': 'Fecha de Activación',
        'edit.planned_start_label': 'Inicio Planificación (plannedStart)',
        'edit.planned_end_label': 'Fin Planificación (plannedEnd)',
        'edit.cancel': 'Cancelar',
        'edit.save': 'Guardar Cambios',
        // Recurrence labels
        'rec.M': 'Mensual',
        'rec.B': 'Bimestral',
        'rec.T': 'Trimestral',
        'rec.C': 'Cuadrimestral',
        'rec.S': 'Semestral',
        'rec.A': 'Anual',
        // Alerts
        'alert.no_api_key': 'Introduce una clave API para conectarte.',
        'alert.api_error': 'Error de conexión: {msg}',
        'alert.select_type_status': 'Selecciona el Tipo de Tarea y el Estado Inicial antes de continuar.',
        'alert.no_contacts': 'Primero carga los contactos desde TakeOff.',
        'alert.no_start_date': 'Establece una fecha de inicio del programa.',
        'alert.invalid_duration': 'Establece una duración de generación válida.',
        'alert.edit_invalid': 'Completa todos los campos con valores válidos.',
        'alert.bulk_complete': '¡Creación en bloque completada!\nÉxitos: {success}\nSaltadas: {skipped}\nErrores: {failure}',
        'alert.copied': '¡Registro copiado al portapapeles!',
        'alert.contacts_error': 'Error al cargar los contactos:\n{msg}',
        'alert.schedule_error': 'Error al generar el calendario: {msg}',
        // Log messages
        'log.cors_activated': 'Conexión directa fallida. Activando Proxy CORS automáticamente...',
        'log.cors_toggle': 'Proxy CORS {state} manualmente.',
        'log.cors_on': 'activado',
        'log.cors_off': 'desactivado',
        'log.lookups_loaded': 'Datos de configuración cargados correctamente.',
        'log.lookups_error': 'Error al cargar los datos de configuración: {msg}',
        'log.status_error': 'Error al cargar los estados: {msg}',
        'log.connected': 'Conexión exitosa. ¡Bienvenido {name}!',
        'log.types_found': 'Encontrados {n} tipos MANTENIMIENTO: {names}.',
        'log.type_contacts': '{name}: {n} contactos encontrados.',
        'log.loading_contract_dates': 'Cargando datos de contrato para {n} contactos...',
        'log.contract_dates_progress': 'Contratos {i}/{n}...',
        'log.bulk_loading_jobs': 'Cargando proyectos para {n} contactos seleccionados...',
        'log.bulk_jobs_progress': 'Proyecto cargado para {client} (jobId {id})',
        'log.load_complete': 'Carga completada: {n} clientes en total.',
        'log.schedule_done': 'Calendario generado: {n} tareas para {c} clientes.',
        'log.contract_dates_summary': 'Fechas de contrato: {withDate} contactos con fecha, {fallback} sin fecha (usarán la fecha fallback).',
        'log.contract_diag': 'Diagnóstico: no se encontró "Fecha Contrato Mantenimiento". Campos del contacto: {keys}. customProperties: {cp}',
        'log.schedule_fallback': 'AVISO: {n} tareas generadas con la fecha fallback (contactos sin fecha de contrato).',
        'preview.fallback_badge_title': 'Sin fecha de contrato — usando la fecha de inicio fallback',
        'log.check_existing_active': 'Verificación de duplicados activa — cada tarea se comprobará antes de crearse.',
        'log.bulk_start': 'Iniciando creación masiva de {n} tareas...',
        'log.project_creating': 'Creando proyecto "{name}" para {n} contactos...',
        'log.project_created': 'Proyecto creado para {client} (jobId {id})',
        'log.project_warn': 'AVISO: No se pudo crear proyecto para {client}: {msg}',
        'log.task_ok': 'OK [{id} - {client}] "{title}"',
        'log.task_skip': 'SKIP [{id} - {client}] ya existe en el período',
        'log.task_err': 'ERR [{id} - {client}] {msg}',
        'log.interrupted': 'Proceso interrumpido. Creadas: {success}, Saltadas: {skipped}, Errores: {failure}.',
        'log.complete': '¡Completado! Creadas: {success}, Saltadas: {skipped}, Errores: {failure}.',
        'log.stop_cmd': 'Comando de interrupción enviado...',
        'log.task_edited': 'Tarea #{n} ({client}) modificada manualmente.',
        // Error messages (thrown by TakeOffClient wrappers)
        'error.no_maint_types': 'No se encontraron tipos de contacto MANTENIMIENTO. Verifica que los tipos estén configurados en TakeOff (Mensual, Bimestral, Trimestral, Cuadrimestral, Semestral, Anual).',
        'error.no_contacts_assigned': 'Tipos encontrados ({names}), pero ningún contacto tiene aún uno de estos tipos asignado. Asigna los tipos MANTENIMIENTO a los contactos en TakeOff CRM e inténtalo de nuevo.',
        // Loading state button labels
        'loading.connecting': 'Conectando...',
        'loading.loading': 'Cargando...',
        'loading.generating': 'Generando...',
        'loading.type': 'Cargando {name}...',
        'loading.details_btn': 'Contratos {i}/{n}...',
    },
    it: {
        // Page
        'page.title': 'TakeOff CRM — Generatore di Incarichi Ricorrenti',
        'app.subtitle': 'Generatore Ricorrente di Incarichi di Manutenzione',
        // Connection badge
        'status.connected': 'Connesso',
        'status.disconnected': 'Disconnesso',
        // Auth panel
        'auth.title': 'Autenticazione API',
        'auth.api_key_label': 'Chiave API TakeOff CRM',
        'auth.api_key_placeholder': 'Inserisci la tua x-api-key...',
        'auth.api_key_hint': 'La chiave API verrà salvata localmente nel browser per gli accessi successivi.',
        'auth.cors_label': 'Attiva Proxy CORS',
        'auth.cors_hint': "Risolve l'errore 'Failed to fetch' in locale instradando le chiamate tramite il proxy.",
        'auth.connect_btn': 'Connetti a TakeOff',
        'auth.user_role_default': 'Collaboratore TakeOff',
        // Defaults / config panel
        'config.title': 'Configurazione Incarico',
        'config.task_type_label': 'Tipo di Incarico',
        'config.task_type_placeholder': 'Seleziona un tipo di incarico...',
        'config.status_label': 'Stato Iniziale',
        'config.status_placeholder': 'Seleziona uno stato...',
        'config.assignee_label': 'Assegnatario/i Predefinito',
        'config.assignee_none': 'Nessuno (Non assegnato)',
        'config.assignee_search': 'Cerca utente o gruppo...',
        'config.assignee_users_section': 'Utenti',
        'config.assignee_groups_section': 'Gruppi',
        'config.assignee_no_results': 'Nessun risultato',
        'config.priority_label': 'Priorità',
        'config.priority_low': 'Bassa',
        'config.priority_medium': 'Media',
        'config.priority_high': 'Alta',
        'config.priority_urgent': 'Urgente',
        'config.important_label': 'Importante',
        'config.important_mark': 'Contrassegna',
        'config.templates_trigger': 'Modelli di Testo (Titolo e Descrizione)',
        'config.template_title_label': 'Modello Titolo Incarico',
        'config.template_title_vars': 'Variabili disponibili:',
        'config.template_desc_label': 'Modello Descrizione Incarico',
        'config.default_title': 'Manutenzione periodica - {cliente}',
        'config.default_desc': 'Eseguire la manutenzione programmata periodica del cliente {cliente}.\n\nRicorrenza programmata: {recurrencia}\nData inizio ciclo di manutenzione: {fecha_activacion}',
        // Contacts panel
        'contacts.title': 'Clienti con Manutenzione',
        'contacts.hint': 'Carica i contatti TakeOff che hanno un tipo nel gruppo <strong>MANUTENZIONE</strong> (Mensile, Bimestrale, Trimestrale, Quadrimestrale, Semestrale, Annuale).',
        'contacts.load_btn': 'Carica Contatti da TakeOff',
        'contacts.breakdown_title': 'Distribuzione Ricorrenze',
        'contacts.count_text': '{n} clienti con manutenzione',
        'contacts.clients': 'clienti',
        'contacts.type_hint': 'Deseleziona i tipi già elaborati in esecuzioni precedenti per generare solo quelli nuovi.',
        'contacts.individual_title': 'Selezione Individuale Contatti',
        'contacts.search_placeholder': 'Cerca per nome o ID...',
        'contacts.select_visible': 'Sel. visibili',
        'contacts.deselect_visible': 'Desel. visibili',
        'contacts.selected_count': '{n} di {total} selezionati',
        'contacts.list_empty': 'Nessun contatto corrisponde alla ricerca.',
        // Generator panel
        'generator.title': 'Calendario Manutenzioni',
        'generator.start_date': 'Data di Inizio (fallback)',
        'generator.start_date_hint': 'Usata solo per i contatti privi della proprietà "Data inizio manutenzione" (o "Fecha Contrato Mantenimiento"). Ogni contatto avvia il suo ciclo dalla propria data di contratto.',
        'generator.duration': 'Durata della Generazione',
        'generator.duration_unit': 'Mesi',
        'generator.offset_days': 'Giorni di anticipo (Attivazione)',
        'generator.offset_unit': 'Giorni',
        'generator.offset_hint': 'Se lasciato vuoto o a 0, si attiva all\'inizio del periodo.',
        'generator.generate_btn': 'Genera Calendario',
        'generator.search_placeholder': 'Filtra per cliente o codice...',
        'generator.total_tasks': 'Incarichi Generati',
        'generator.selected_tasks': 'Selezionati',
        'generator.col_client': 'Codice e Cliente',
        'generator.col_freq': 'Freq.',
        'generator.col_activation': 'Data di Attivazione',
        'generator.col_range': 'Pianificazione (Fine Ciclo)',
        'generator.col_title': 'Titolo Incarico',
        'generator.col_actions': 'Azioni',
        'generator.no_results': 'Nessuna scadenza corrisponde alla ricerca.',
        'generator.project_name_label': 'Nome del Progetto (opzionale)',
        'generator.project_name_placeholder': 'Es: Manutenzione 2026 — verrà creato un Progetto per ogni contatto',
        'generator.create_btn': 'Crea in Blocco su TakeOff CRM',
        'generator.edit_title': 'Modifica incarico',
        'generator.check_existing_label': 'Verifica incarichi esistenti prima di creare',
        'generator.check_existing_hint': 'Più lento ma evita duplicati se alcuni contatti sono già stati elaborati.',
        // Progress modal
        'progress.title': 'Creazione Incarichi in Corso...',
        'progress.success_label': 'Creati con Successo',
        'progress.failure_label': 'Errori / Falliti',
        'progress.skipped_label': 'Saltati / Già esistenti',
        'progress.percent_label': 'Percentuale',
        'progress.log_title': 'Registro operazioni API',
        'progress.copy_btn': 'Copia',
        'progress.copy_title': 'Copia registro',
        'progress.stop_btn': 'Interrompi',
        'progress.close_btn': 'Chiudi',
        // Edit modal
        'edit.title': 'Modifica Scadenza Individuale',
        'edit.task_title_label': 'Titolo Incarico',
        'edit.activation_label': 'Data di Attivazione',
        'edit.planned_start_label': 'Inizio Pianificazione (plannedStart)',
        'edit.planned_end_label': 'Fine Pianificazione (plannedEnd)',
        'edit.cancel': 'Annulla',
        'edit.save': 'Salva Modifiche',
        // Recurrence labels
        'rec.M': 'Mensile',
        'rec.B': 'Bimestrale',
        'rec.T': 'Trimestrale',
        'rec.C': 'Quadrimestrale',
        'rec.S': 'Semestrale',
        'rec.A': 'Annuale',
        // Alerts
        'alert.no_api_key': 'Inserisci una chiave API per connetterti.',
        'alert.api_error': 'Errore di connessione: {msg}',
        'alert.select_type_status': 'Seleziona il Tipo di Attività e lo Stato Iniziale prima di continuare.',
        'alert.no_contacts': 'Prima carica i contatti da TakeOff.',
        'alert.no_start_date': 'Imposta una data di inizio del programma.',
        'alert.invalid_duration': 'Imposta una durata di generazione valida.',
        'alert.edit_invalid': 'Compila tutti i campi con valori validi.',
        'alert.bulk_complete': 'Creazione in blocco completata!\nCreati: {success}\nSaltati: {skipped}\nErrori: {failure}',
        'alert.copied': 'Registro copiato negli appunti!',
        'alert.contacts_error': 'Errore nel caricamento contatti:\n{msg}',
        'alert.schedule_error': 'Errore nella generazione calendario: {msg}',
        // Log messages
        'log.cors_activated': 'Connessione diretta fallita. Attivazione Proxy CORS automatica...',
        'log.cors_toggle': 'Proxy CORS {state} manualmente.',
        'log.cors_on': 'attivato',
        'log.cors_off': 'disattivato',
        'log.lookups_loaded': 'Dati di configurazione caricati correttamente.',
        'log.lookups_error': 'Errore nel caricamento dati di configurazione: {msg}',
        'log.status_error': 'Errore nel caricamento stati: {msg}',
        'log.connected': 'Connessione riuscita. Benvenuto {name}!',
        'log.types_found': 'Trovati {n} tipi MANUTENZIONE: {names}.',
        'log.type_contacts': '{name}: {n} contatti trovati.',
        'log.loading_contract_dates': 'Caricamento dati contratto per {n} contatti...',
        'log.contract_dates_progress': 'Contratti {i}/{n}...',
        'log.bulk_loading_jobs': 'Caricamento commesse per {n} contatti selezionati...',
        'log.bulk_jobs_progress': 'Commessa caricata per {client} (jobId {id})',
        'log.load_complete': 'Caricamento completato: {n} clienti in totale.',
        'log.schedule_done': 'Calendario generato: {n} incarichi per {c} clienti.',
        'log.contract_dates_summary': 'Date contratto: {withDate} contatti con data, {fallback} senza data (useranno la data fallback).',
        'log.contract_diag': 'Diagnostica: data inizio manutenzione non trovata. Campi del contatto: {keys}. customProperties: {cp}',
        'log.schedule_fallback': 'AVVISO: {n} incarichi generati con la data fallback (contatti senza data di contratto).',
        'preview.fallback_badge_title': 'Nessuna data di contratto — usata la data di inizio fallback',
        'log.check_existing_active': 'Verifica duplicati attiva — ogni incarico verrà controllato prima della creazione.',
        'log.bulk_start': 'Avvio creazione massiva di {n} incarichi...',
        'log.project_creating': 'Creazione progetto "{name}" per {n} contatti...',
        'log.project_created': 'Progetto creato per {client} (jobId {id})',
        'log.project_warn': 'AVVISO: Impossibile creare progetto per {client}: {msg}',
        'log.task_ok': 'OK [{id} - {client}] "{title}"',
        'log.task_skip': 'SKIP [{id} - {client}] già esistente nel periodo',
        'log.task_err': 'ERR [{id} - {client}] {msg}',
        'log.interrupted': 'Processo interrotto. Creati: {success}, Saltati: {skipped}, Errori: {failure}.',
        'log.complete': 'Completato! Creati: {success}, Saltati: {skipped}, Errori: {failure}.',
        'log.stop_cmd': 'Comando di interruzione inviato...',
        'log.task_edited': 'Incarico #{n} ({client}) modificato manualmente.',
        // Error messages
        'error.no_maint_types': 'Nessun tipo di contatto MANUTENZIONE trovato. Verifica che i tipi siano configurati su TakeOff (Mensile, Bimestrale, Trimestrale, Quadrimestrale, Semestrale, Annuale).',
        'error.no_contacts_assigned': 'Tipi trovati ({names}), ma nessun contatto ha ancora uno di questi tipi assegnato. Assegna i tipi MANUTENZIONE ai contatti in TakeOff CRM e riprova.',
        // Loading state button labels
        'loading.connecting': 'Connessione...',
        'loading.loading': 'Caricamento...',
        'loading.generating': 'Generazione...',
        'loading.type': 'Caricamento {name}...',
        'loading.details_btn': 'Contratti {i}/{n}...',
    }
};

/**
 * 0b. Resilient storage — localStorage that degrades to an in-memory store
 * instead of throwing when it's unavailable (Safari private mode, quota,
 * disabled cookies). Used for the API key, language and CORS-proxy flag.
 */
const safeStorage = (function () {
    const mem = {};
    let backing = null;
    try { backing = window.localStorage; } catch (e) { backing = null; }
    return {
        getItem(k) {
            try { return backing ? backing.getItem(k) : (k in mem ? mem[k] : null); }
            catch (e) { return (k in mem ? mem[k] : null); }
        },
        setItem(k, v) {
            try { if (backing) backing.setItem(k, v); else mem[k] = String(v); }
            catch (e) { mem[k] = String(v); }
        },
        removeItem(k) {
            try { if (backing) backing.removeItem(k); else delete mem[k]; }
            catch (e) { delete mem[k]; }
        }
    };
})();

/**
 * 1. TakeOff REST API Service Client
 */
class TakeOffClient {
    constructor() {
        this.baseUrl = 'https://webapi.takeoffcrm.com';
        this.useCorsProxy = false;

        if (window.location.hostname.endsWith('.vercel.app')) {
            this.baseUrl = '/api/takeoff';
        }
    }

    setApiKey(apiKey) {
        this.apiKey = apiKey.trim();
    }

    getHeaders() {
        if (!this.apiKey) throw new Error("API key not set.");
        return {
            'x-api-key': this.apiKey,
            'Content-Type': 'application/json'
        };
    }

    getUrl(endpoint) {
        if (this.useCorsProxy) {
            return `https://corsproxy.io/?${encodeURIComponent('https://webapi.takeoffcrm.com' + endpoint)}`;
        }
        if (window.location.hostname.endsWith('.vercel.app')) {
            const path = endpoint.startsWith('/api/') ? endpoint.substring(5) : endpoint;
            return `${this.baseUrl}/${path}`;
        }
        return `${this.baseUrl}${endpoint}`;
    }

    async request(endpoint, options = {}) {
        const url = this.getUrl(endpoint);
        try {
            const response = await fetch(url, options);
            return response;
        } catch (error) {
            const errorMsg = error && error.message ? String(error.message) : '';
            const errorName = error && error.name ? String(error.name) : '';
            const isNetworkError = errorName === 'TypeError' ||
                                   errorMsg.includes('fetch') ||
                                   errorMsg.includes('NetworkError');

            if (isNetworkError && !this.useCorsProxy) {
                console.warn("Direct request failed. Enabling CORS proxy...", error);
                this.useCorsProxy = true;
                const checkbox = document.getElementById('input-cors-proxy');
                if (checkbox) checkbox.checked = true;
                safeStorage.setItem('takeoff_cors_proxy', 'true');
                if (typeof App !== 'undefined' && App.log) {
                    App.log(App.t('log.cors_activated'), "warning");
                }
                const retryUrl = this.getUrl(endpoint);
                return await fetch(retryUrl, options);
            }
            throw error;
        }
    }

    async getMeInfo() {
        const response = await this.request('/api/me/infos', {
            method: 'GET',
            headers: this.getHeaders()
        });
        if (!response.ok) {
            if (response.status === 401) throw new Error("401 Unauthorized — invalid API key.");
            throw new Error(`HTTP ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        return data.value !== undefined ? data.value : data;
    }

    async getTaskTypes() {
        const response = await this.request('/api/tasks/types', {
            method: 'GET',
            headers: this.getHeaders()
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        return data.value !== undefined ? data.value : data;
    }

    async getTaskStatuses(taskTypeId) {
        const response = await this.request(`/api/tasks/types/${taskTypeId}/steps`, {
            method: 'GET',
            headers: this.getHeaders()
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        return data.value !== undefined ? data.value : data;
    }

    async getUsers() {
        const response = await this.request('/api/users', {
            method: 'GET',
            headers: this.getHeaders()
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        return data.value !== undefined ? data.value : data;
    }

    async getGroups() {
        // TakeOff exposes NO groups-list endpoint (verified against its OpenAPI).
        // Named user groups are harvested from existing tasks' assignee objects
        // (assigneeType === 2). Ad-hoc groups that TakeOff auto-creates from
        // multi-user assignments have comma-joined names and are excluded here —
        // the user can still build those by multi-selecting individual users.
        try {
            const groups = new Map();
            for (let skip = 0; skip < 600; skip += 200) {
                const r = await this.request(`/api/tasks?skip=${skip}&take=200`, {
                    method: 'GET',
                    headers: this.getHeaders()
                });
                if (!r.ok) break;
                const d = await r.json();
                const v = d.value !== undefined ? d.value : d;
                const arr = v.data !== undefined ? v.data : (Array.isArray(v) ? v : []);
                arr.forEach(t => {
                    const a = t.assignee;
                    if (a && a.assigneeType === 2 && a.displayName &&
                        !a.displayName.includes(',') && !groups.has(a.id)) {
                        groups.set(a.id, { id: a.id, name: a.displayName });
                    }
                });
                if (arr.length < 200) break;
            }
            return [...groups.values()];
        } catch (e) {
            return []; // groups are optional — fail silently
        }
    }

    async getContactTypes() {
        const response = await this.request('/api/contacts/types', {
            method: 'GET',
            headers: this.getHeaders()
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        return data.value !== undefined ? data.value : data;
    }

    async createJob(name, contactId) {
        const response = await this.request('/api/jobs', {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({ name, mainContactId: contactId })
        });
        if (!response.ok) {
            const errText = await response.text().catch(() => '');
            throw new Error(`${response.status} ${errText}`);
        }
        const data = await response.json();
        return (data.value !== undefined ? data.value : data).id;
    }

    async getFirstJobForContact(contactId) {
        const response = await this.request(`/api/jobs?contactId=${contactId}&take=1`, {
            method: 'GET',
            headers: this.getHeaders()
        });
        if (!response.ok) return null;
        const data = await response.json();
        const val = data.value !== undefined ? data.value : data;
        const jobs = val.data !== undefined ? val.data : (Array.isArray(val) ? val : []);
        return jobs.length > 0 ? jobs[0].id : null;
    }

    async getContactById(contactId) {
        // Full contact detail — used to read customProperties when the
        // search endpoint returns a slim object without them.
        try {
            const response = await this.request(`/api/contacts/${contactId}`, {
                method: 'GET',
                headers: this.getHeaders()
            });
            if (!response.ok) return null;
            const data = await response.json();
            return data.value !== undefined ? data.value : data;
        } catch (e) {
            return null;
        }
    }

    async getContactsByTypeId(typeId, typeName, skip = 0, take = 100) {
        const response = await this.request('/api/contacts/search', {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({
                contactTypes: {
                    filterType: 1,
                    notSet: false,
                    groups: [{
                        not: false,
                        filterType: 1,
                        id: typeId,
                        name: typeName,
                        elements: [{ id: typeId, name: typeName, selected: true }]
                    }]
                },
                skip,
                take
            })
        });
        if (!response.ok) {
            const errText = await response.text().catch(() => '');
            throw new Error(`${response.status} ${errText}`);
        }
        const data = await response.json();
        const value = data.value !== undefined ? data.value : data;
        return {
            contacts: value.data !== undefined ? value.data : value,
            totalRecords: value.totalRecords || 0
        };
    }

    async taskExistsInPeriod(contactId, taskTypeId, plannedStartIso, plannedEndIso) {
        // Returns true if a task of the given type already exists for this
        // contact starting within the same maintenance cycle.
        // On any API error we return false so creation is never blocked.
        try {
            const periodStart = new Date(plannedStartIso.substring(0, 10) + 'T00:00:00');
            const periodEnd   = new Date(plannedEndIso.substring(0, 10) + 'T23:59:59');

            // MUST use POST /api/tasks/search, NOT GET /api/tasks:
            //  - GET /api/tasks is over-filtered (it omits non-completed/future
            //    tasks, so it never returned the maintenance tasks we create);
            //  - the CORS proxy caches GET responses and served stale data.
            // POST search returns ALL matching tasks and filters by type server-side.
            const response = await this.request('/api/tasks/search', {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({
                    contactId:   parseInt(contactId),
                    taskTypeIds: [parseInt(taskTypeId)],
                    skip: 0,
                    take: 200
                })
            });
            if (!response.ok) return false;
            const data  = await response.json();
            const val   = data.value !== undefined ? data.value : data;
            const tasks = val.data !== undefined ? val.data : (Array.isArray(val) ? val : []);

            // Server already filtered by type; match the cycle by plannedStart.
            return tasks.some(t => {
                if (!t.plannedStart) return false;
                const ps = new Date(t.plannedStart);
                return ps >= periodStart && ps <= periodEnd;
            });
        } catch (e) {
            return false; // fail-safe: never block creation on a failed check
        }
    }

    async createTask(taskDto) {
        const response = await this.request('/api/tasks', {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(taskDto)
        });
        const rawText = await response.text().catch(() => '');
        let data = {};
        try { data = JSON.parse(rawText); } catch(e) {}
        if (!response.ok) {
            const fieldErrors = data.errors ? ' | ' + JSON.stringify(data.errors) : '';
            const detail = data.detail ? ' — ' + data.detail : '';
            const errorMsg = data.result?.errors?.join(', ') || data.title || `HTTP ${response.status}`;
            throw new Error(`[${response.status}] ${errorMsg}${detail}${fieldErrors}`);
        }
        if (data.result && !data.result.isSuccess) {
            const errorMsg = data.result.errors?.join(', ') || "Server error";
            throw new Error(errorMsg);
        }
        return data.value !== undefined ? data.value : data;
    }
}

/**
 * 2. Core Application State
 */
const App = {
    client: new TakeOffClient(),

    // Language
    lang: 'es',

    // Auth & Lookup State
    apiKey: '',
    connectedUser: null,
    taskTypes: [],
    users: [],
    groups: [],
    selectedAssignees: [], // [{id, type:'user'|'group', name}]
    currentStatuses: [],

    // Contacts State (loaded from TakeOff API)
    contactsData: [],

    // Names of the contact custom property that holds the maintenance start
    // date. Matched case-insensitively; the first one found on the contact
    // wins. Add aliases here if the field is named differently in TakeOff.
    contractDatePropNames: ['Fecha Contrato Mantenimiento', 'Data inizio manutenzione'],

    // Generator & Preview State
    programStartDate: '',
    durationMonths: 12,
    generatedTasks: [],
    filteredTasks: [],

    // Execution Queue Control
    isExecuting: false,
    cancelExecution: false,
    activeWorkersCount: 0,
    stats: { success: 0, failure: 0, skipped: 0, total: 0, processed: 0 },

    /**
     * 3. Internationalisation helpers
     */
    t(key, vars = {}) {
        const dict = TRANSLATIONS[this.lang] || TRANSLATIONS['es'];
        const fallback = TRANSLATIONS['es'];
        let str = (dict && dict[key] !== undefined) ? dict[key]
                : (fallback && fallback[key] !== undefined) ? fallback[key]
                : key;
        if (Object.keys(vars).length === 0) return str;
        return Object.entries(vars).reduce(
            (s, [k, v]) => s.split(`{${k}}`).join(String(v)),
            str
        );
    },

    // Escapes CRM/user-supplied strings before they are interpolated into
    // innerHTML, preventing stored-XSS via contact names, group names, titles…
    escapeHtml(value) {
        if (value == null) return '';
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    },

    setLang(lang) {
        if (lang !== 'es' && lang !== 'it') return;
        this.lang = lang;
        safeStorage.setItem('takeoff_lang', lang);
        this.applyTranslations();
    },

    applyTranslations() {
        // HTML lang attribute
        document.documentElement.lang = this.lang;

        // Page title
        document.title = this.t('page.title');

        // data-i18n → textContent
        document.querySelectorAll('[data-i18n]').forEach(el => {
            el.textContent = this.t(el.dataset.i18n);
        });

        // data-i18n-html → innerHTML
        document.querySelectorAll('[data-i18n-html]').forEach(el => {
            el.innerHTML = this.t(el.dataset.i18nHtml);
        });

        // data-i18n-placeholder → placeholder
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            el.placeholder = this.t(el.dataset.i18nPlaceholder);
        });

        // data-i18n-title → title attribute
        document.querySelectorAll('[data-i18n-title]').forEach(el => {
            el.title = this.t(el.dataset.i18nTitle);
        });

        // Language toggle button active state
        document.querySelectorAll('.btn-lang').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.lang === this.lang);
        });

        // Reset default template values to the current language defaults
        const titleInput = document.getElementById('template-title');
        const descInput  = document.getElementById('template-description');
        if (titleInput) titleInput.value = this.t('config.default_title');
        if (descInput)  descInput.value  = this.t('config.default_desc');

        // Update dynamically-set select placeholders (if already populated)
        const selType = document.getElementById('select-task-type');
        if (selType && selType.options[0] && selType.options[0].value === '') {
            selType.options[0].text = this.t('config.task_type_placeholder');
        }
        const selStatus = document.getElementById('select-task-status');
        if (selStatus && selStatus.options[0] && selStatus.options[0].value === '') {
            selStatus.options[0].text = this.t('config.status_placeholder');
        }
        // Update assignee picker placeholder text and search hint
        const assigneePlaceholder = document.getElementById('assignee-placeholder');
        if (assigneePlaceholder && this.selectedAssignees.length === 0) {
            assigneePlaceholder.textContent = this.t('config.assignee_none');
        }
        const assigneeSearch = document.getElementById('assignee-search');
        if (assigneeSearch) assigneeSearch.placeholder = this.t('config.assignee_search');

        // Update connection badge text (preserves connected/disconnected state)
        const badge = document.getElementById('connection-badge');
        if (badge) {
            const isConnected = badge.classList.contains('badge-connected');
            const statusSpan = badge.querySelector('.status-text');
            if (statusSpan) statusSpan.textContent = this.t(isConnected ? 'status.connected' : 'status.disconnected');
        }
    },

    /**
     * 4. Initialization
     */
    init() {
        // Load saved language preference
        const savedLang = safeStorage.getItem('takeoff_lang');
        if (savedLang === 'es' || savedLang === 'it') this.lang = savedLang;

        this.programStartDate = this.formatDateIso(new Date());
        document.getElementById('input-start-date').value = this.programStartDate;

        const savedKey = safeStorage.getItem('takeoff_api_key');
        if (savedKey) document.getElementById('api-key-input').value = savedKey;

        const savedCorsProxy = safeStorage.getItem('takeoff_cors_proxy');
        const corsProxyInput = document.getElementById('input-cors-proxy');
        if (corsProxyInput) {
            corsProxyInput.checked = savedCorsProxy === 'true';
            this.client.useCorsProxy = savedCorsProxy === 'true';
        }

        if (window.location.hostname.endsWith('.vercel.app')) {
            const hint = document.getElementById('cors-proxy-hint');
            if (hint) hint.dataset.i18n = ''; // skip auto-update; set it directly:
            if (hint) hint.textContent = this.lang === 'it'
                ? "Eseguito su Vercel: usa il rewrite integrato, ma in caso di errore puoi attivare il Proxy CORS."
                : "Ejecutándose en Vercel: usa el rewrite integrado, pero en caso de error puedes activar el Proxy CORS.";
        }

        this.applyTranslations();
        this.bindEvents();
    },

    bindEvents() {
        // Language toggle
        document.querySelectorAll('.btn-lang').forEach(btn => {
            btn.addEventListener('click', () => this.setLang(btn.dataset.lang));
        });

        // Auth — clear connected state the moment the API key input changes
        document.getElementById('api-key-input').addEventListener('input', () => {
            if (!this.connectedUser) return; // already disconnected
            this.client.setApiKey('');
            this.connectedUser = null;
            this.apiKey = '';
            safeStorage.removeItem('takeoff_api_key');
            const badge = document.getElementById('connection-badge');
            badge.className = 'badge badge-disconnected';
            badge.querySelector('.status-text').textContent = this.t('status.disconnected');
            document.getElementById('user-profile-card').classList.add('hidden');
            document.getElementById('defaults-panel').classList.add('disabled');
            document.getElementById('generator-panel').classList.add('disabled');
            document.getElementById('btn-load-contacts').disabled = true;
        });

        document.getElementById('btn-connect').addEventListener('click', () => this.connectApi());
        document.getElementById('btn-toggle-api-key').addEventListener('click', () => this.toggleApiKeyVisibility());

        const corsProxyInput = document.getElementById('input-cors-proxy');
        if (corsProxyInput) {
            corsProxyInput.addEventListener('change', (e) => {
                this.client.useCorsProxy = e.target.checked;
                safeStorage.setItem('takeoff_cors_proxy', e.target.checked ? 'true' : 'false');
                const state = e.target.checked ? this.t('log.cors_on') : this.t('log.cors_off');
                this.log(this.t('log.cors_toggle', { state }), 'info');
            });
        }

        // Template expandable
        document.getElementById('templates-trigger').addEventListener('click', () => {
            document.getElementById('templates-trigger').classList.toggle('open');
            document.getElementById('templates-content').classList.toggle('hidden');
        });

        // Assignee pill-picker
        document.getElementById('assignee-picker').addEventListener('click', (e) => {
            if (document.getElementById('assignee-picker').classList.contains('disabled')) return;
            this.openAssigneeDropdown();
        });
        document.getElementById('assignee-search').addEventListener('input', (e) => {
            this.renderAssigneeDropdownList(e.target.value);
        });
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            const picker   = document.getElementById('assignee-picker');
            const dropdown = document.getElementById('assignee-dropdown');
            if (picker && dropdown && !picker.contains(e.target) && !dropdown.contains(e.target)) {
                dropdown.classList.add('hidden');
            }
        });

        // Task type change
        document.getElementById('select-task-type').addEventListener('change', (e) => this.handleTaskTypeChange(e.target.value));

        // Contacts loader
        document.getElementById('btn-load-contacts').addEventListener('click', () => this.loadMaintenanceContacts());
        document.getElementById('btn-reset-contacts').addEventListener('click', () => this.resetContacts());

        // Contact search & selection (bound once — NOT inside loadMaintenanceContacts)
        document.getElementById('contact-search-input').addEventListener('input', (e) => {
            this.renderContactList(e.target.value);
        });
        document.getElementById('btn-contacts-select-visible').addEventListener('click', () => {
            this.toggleVisibleContacts(true);
        });
        document.getElementById('btn-contacts-deselect-visible').addEventListener('click', () => {
            this.toggleVisibleContacts(false);
        });

        // Generator
        document.getElementById('btn-generate-schedule').addEventListener('click', () => this.generateSchedule());
        document.getElementById('preview-search').addEventListener('input', (e) => this.filterPreview(e.target.value));
        document.getElementById('select-all-tasks').addEventListener('change', (e) => this.toggleSelectAll(e.target.checked));

        // Edit modal
        document.getElementById('btn-close-edit-modal').addEventListener('click', () => this.closeEditModal());
        document.getElementById('btn-cancel-edit').addEventListener('click', () => this.closeEditModal());
        document.getElementById('btn-save-edit').addEventListener('click', () => this.saveIndividualTaskEdit());

        // Bulk execution
        document.getElementById('btn-bulk-create').addEventListener('click', () => this.startBulkCreation());
        document.getElementById('btn-stop-execution').addEventListener('click', () => this.stopBulkExecution());
        document.getElementById('btn-close-progress').addEventListener('click', () => {
            document.getElementById('progress-modal').classList.add('hidden');
        });
        document.getElementById('btn-copy-logs').addEventListener('click', () => this.copyConsoleLogs());
    },

    /**
     * 5. UI Helpers
     */
    toggleApiKeyVisibility() {
        const input = document.getElementById('api-key-input');
        const icon = document.querySelector('#btn-toggle-api-key i');
        if (input.type === 'password') {
            input.type = 'text';
            icon.className = 'fa-solid fa-eye-slash';
        } else {
            input.type = 'password';
            icon.className = 'fa-solid fa-eye';
        }
    },

    log(message, type = 'info') {
        const consoleLogs = document.getElementById('console-logs');
        if (!consoleLogs) return;
        const row = document.createElement('div');
        row.className = `log-row ${type}`;
        row.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
        consoleLogs.appendChild(row);
        consoleLogs.scrollTop = consoleLogs.scrollHeight;
    },

    clearConsole() {
        const consoleLogs = document.getElementById('console-logs');
        if (consoleLogs) consoleLogs.innerHTML = '';
    },

    copyConsoleLogs() {
        const consoleLogs = document.getElementById('console-logs');
        if (!consoleLogs) return;
        navigator.clipboard.writeText(consoleLogs.innerText).then(() => {
            alert(this.t('alert.copied'));
        }).catch(err => console.error("Could not copy logs: ", err));
    },

    /**
     * 6. API Authentication & Lookups
     */
    async connectApi() {
        const keyInput = document.getElementById('api-key-input').value.trim();
        if (!keyInput) { alert(this.t('alert.no_api_key')); return; }

        const btn = document.getElementById('btn-connect');
        const originalHtml = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i> ${this.t('loading.connecting')}`;

        try {
            this.client.setApiKey(keyInput);
            const userProfile = await this.client.getMeInfo();

            safeStorage.setItem('takeoff_api_key', keyInput);
            this.apiKey = keyInput;
            this.connectedUser = userProfile;

            const badge = document.getElementById('connection-badge');
            badge.className = 'badge badge-connected';
            badge.querySelector('.status-text').textContent = this.t('status.connected');

            const userCard = document.getElementById('user-profile-card');
            userCard.classList.remove('hidden');
            document.getElementById('user-display-name').textContent = userProfile.displayName || `${userProfile.firstName} ${userProfile.lastName}`;
            document.getElementById('user-role').textContent = userProfile.companyRole || this.t('auth.user_role_default');
            document.getElementById('user-company').textContent = `ID: ${userProfile.inDittaCompanyId}`;

            if (userProfile.profileImage) {
                document.getElementById('user-avatar').innerHTML = `<img src="${this.escapeHtml(userProfile.profileImage)}" alt="avatar">`;
            } else {
                document.getElementById('user-avatar').innerHTML = `<span style="font-weight:bold">${this.escapeHtml(userProfile.initials || 'U')}</span>`;
            }

            await this.loadLookups();

            document.getElementById('defaults-panel').classList.remove('disabled');
            document.getElementById('btn-load-contacts').disabled = false;

            this.log(this.t('log.connected', { name: userProfile.displayName || userProfile.firstName }), 'success');
        } catch (error) {
            console.error(error);
            alert(this.t('alert.api_error', { msg: error.message }));
            this.client.setApiKey('');
            safeStorage.removeItem('takeoff_api_key');

            const badge = document.getElementById('connection-badge');
            badge.className = 'badge badge-disconnected';
            badge.querySelector('.status-text').textContent = this.t('status.disconnected');
            document.getElementById('user-profile-card').classList.add('hidden');

            document.getElementById('defaults-panel').classList.add('disabled');
            document.getElementById('generator-panel').classList.add('disabled');
            document.getElementById('btn-load-contacts').disabled = true;
        } finally {
            btn.disabled = false;
            btn.innerHTML = originalHtml;
        }
    },

    async loadLookups() {
        try {
            const types = await this.client.getTaskTypes();
            this.taskTypes = types;
            const selectType = document.getElementById('select-task-type');
            selectType.innerHTML = `<option value="">${this.t('config.task_type_placeholder')}</option>`;
            types.forEach(t => {
                const opt = document.createElement('option');
                opt.value = t.id;
                opt.textContent = t.name;
                selectType.appendChild(opt);
            });
            selectType.disabled = false;

            const [usersList, groupsList] = await Promise.all([
                this.client.getUsers(),
                this.client.getGroups()
            ]);
            this.users  = usersList;
            this.groups = groupsList;

            // Pre-select the connected user
            this.selectedAssignees = [];
            const me = usersList.find(u => u.id === this.connectedUser.id);
            if (me) {
                this.selectedAssignees.push({
                    id:   me.id,
                    type: 'user',
                    name: me.displayName || `${me.firstName} ${me.lastName}`
                });
            }
            this.renderAssigneePicker();
            document.getElementById('assignee-picker').classList.remove('disabled');

            this.log(this.t('log.lookups_loaded'), "info");
        } catch (error) {
            this.log(this.t('log.lookups_error', { msg: error.message }), 'error');
        }
    },

    async handleTaskTypeChange(typeId) {
        const selectStatus = document.getElementById('select-task-status');
        selectStatus.innerHTML = `<option value="">${this.t('config.status_placeholder')}</option>`;
        selectStatus.disabled = true;
        if (!typeId) return;

        try {
            const steps = await this.client.getTaskStatuses(typeId);
            this.currentStatuses = steps;
            steps.forEach(s => {
                const opt = document.createElement('option');
                opt.value = s.id;
                opt.textContent = s.name;
                selectStatus.appendChild(opt);
            });
            selectStatus.disabled = false;
            if (steps.length > 0) selectStatus.value = steps[0].id;
        } catch (error) {
            this.log(this.t('log.status_error', { msg: error.message }), 'error');
        }
    },

    /**
     * 7. Contacts Loader — MANTENIMIENTO / MANUTENZIONE group from TakeOff
     */
    async loadMaintenanceContacts() {
        const btn = document.getElementById('btn-load-contacts');
        const originalHtml = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i> <span>${this.t('loading.loading')}</span>`;

        // Reset previous results
        document.getElementById('contacts-success-info').classList.add('hidden');
        document.getElementById('contacts-breakdown').classList.add('hidden');
        document.getElementById('generator-panel').classList.add('disabled');
        document.getElementById('schedule-preview-area').classList.add('hidden');
        this.generatedTasks = [];
        this.filteredTasks = [];
        this.contactsData = [];

        try {
            // Step 1: Load all contact types, identify MANUTENZIONE/MANTENIMIENTO ones
            const allTypes = await this.client.getContactTypes();

            // Italian keys first (longer/exact) → no accidental partial matches
            const recurrenceMap = {
                'mensile':        { code: 'M' },
                'bimestrale':     { code: 'B' },
                'trimestrale':    { code: 'T' },
                'quadrimestrale': { code: 'C' },
                'semestrale':     { code: 'S' },
                'annuale':        { code: 'A' },
                // Spanish
                'mensual':        { code: 'M' },
                'bimestral':      { code: 'B' },
                'trimestral':     { code: 'T' },
                'cuadrimestral':  { code: 'C' },
                'semestral':      { code: 'S' },
                'anual':          { code: 'A' }
            };

            const typeIdToRec = {};
            const matchedTypes = [];

            allTypes.forEach(ct => {
                if (ct.obsolete) return;
                const nameLower = (ct.typologyName || '').toLowerCase().trim();

                // Exact match first (prevents 'bimestral' from matching 'bimestrale')
                let rec = recurrenceMap[nameLower];
                if (!rec) {
                    for (const [key, r] of Object.entries(recurrenceMap)) {
                        if (nameLower.includes(key)) { rec = r; break; }
                    }
                }
                if (rec) {
                    typeIdToRec[ct.id] = rec;
                    matchedTypes.push(ct);
                }
            });

            if (matchedTypes.length === 0) {
                throw new Error(this.t('error.no_maint_types'));
            }

            this.log(this.t('log.types_found', { n: matchedTypes.length, names: matchedTypes.map(t => t.typologyName).join(', ') }), 'info');

            // Step 2: For each maintenance type fetch all contacts (paginated)
            const contactsMap = new Map();

            for (const type of matchedTypes) {
                const rec = typeIdToRec[type.id];
                const btnSpan = btn.querySelector('span');
                if (btnSpan) btnSpan.textContent = this.t('loading.type', { name: type.typologyName });

                let skip = 0;
                const take = 100;
                let totalForType = 0;

                while (true) {
                    const { contacts, totalRecords } = await this.client.getContactsByTypeId(type.id, type.typologyName, skip, take);
                    contacts.forEach(c => {
                        if (!contactsMap.has(c.id)) {
                            contactsMap.set(c.id, {
                                contactId: c.id,
                                clientName: c.companyName || c.billingCompanyName || `Cliente ${c.id}`,
                                recurrenceCode: rec.code,
                                recurrenceLabel: type.typologyName,  // use the actual TakeOff label
                                enabled: true,
                                // Try the search payload first; may be null if the
                                // endpoint returns a slim object (detail fetched later).
                                contractDateRaw: this.extractCustomProperty(c, this.contractDatePropNames)
                            });
                        }
                    });
                    totalForType += contacts.length;
                    if (contacts.length < take || totalForType >= totalRecords) break;
                    skip += take;
                    await this.delay(50);
                }

                this.log(this.t('log.type_contacts', { name: type.typologyName, n: totalForType }), 'info');
            }

            // Step 3: Resolve maintenance contract date for each contact
            // (Job/commessa loading is deferred to bulk creation for speed.)
            const contactsArr = [...contactsMap.values()];
            this.log(this.t('log.loading_contract_dates', { n: contactsArr.length }), 'info');
            const btnSpan2 = btn.querySelector('span');
            let diagDone = false;
            for (let i = 0; i < contactsArr.length; i++) {
                const c = contactsArr[i];
                if (btnSpan2) btnSpan2.textContent = this.t('loading.details_btn', { i: i + 1, n: contactsArr.length });

                // Resolve the maintenance contract date. If the search payload
                // didn't carry it, fetch the full contact detail and read it there.
                if (c.contractDateRaw == null) {
                    const detail = await this.client.getContactById(c.contactId);
                    if (detail) {
                        c.contractDateRaw = this.extractCustomProperty(detail, this.contractDatePropNames);
                        // One-time diagnostic: if even the detail lacks the field,
                        // surface the available keys so the shape can be verified.
                        if (!diagDone && c.contractDateRaw == null) {
                            diagDone = true;
                            const cp = detail.customProperties || detail.customFields || detail.properties;
                            this.log(this.t('log.contract_diag', {
                                keys: Object.keys(detail).join(', '),
                                cp: cp ? JSON.stringify(cp).slice(0, 400) : 'none'
                            }), 'warning');
                        }
                    }
                }
                c.contractStartDate = this.parseContractDate(c.contractDateRaw);
                await this.delay(50);
            }
            this.contactsData = contactsArr;

            // Summarise how many contacts carry a usable contract date.
            const withDate     = this.contactsData.filter(c => c.contractStartDate).length;
            const withoutDate  = this.contactsData.length - withDate;
            this.log(this.t('log.contract_dates_summary', { withDate, fallback: withoutDate }),
                     withoutDate > 0 ? 'warning' : 'success');

            if (this.contactsData.length === 0) {
                const typeNames = matchedTypes.map(t => t.typologyName).join(', ');
                throw new Error(this.t('error.no_contacts_assigned', { names: typeNames }));
            }

            // Step 4: Build breakdown and update UI
            const breakdown = {};
            this.contactsData.forEach(c => {
                breakdown[c.recurrenceLabel] = (breakdown[c.recurrenceLabel] || 0) + 1;
            });

            document.getElementById('contacts-count-text').textContent =
                this.t('contacts.count_text', { n: this.contactsData.length });
            document.getElementById('contacts-types-text').textContent =
                Object.entries(breakdown).map(([l, c]) => `${l}: ${c}`).join(' · ');

            document.getElementById('contacts-breakdown-content').innerHTML =
                Object.entries(breakdown)
                    .sort((a, b) => b[1] - a[1])
                    .map(([label, count]) => `
                        <div class="mapping-row type-filter-row">
                            <label class="type-filter-label">
                                <input type="checkbox" class="type-filter-cb" data-label="${this.escapeHtml(label)}" checked>
                                <span class="field-label">${this.escapeHtml(label)}</span>
                            </label>
                            <span class="stat-badge"><strong>${count}</strong> ${this.t('contacts.clients')}</span>
                        </div>
                    `).join('') +
                `<p class="field-hint type-filter-hint" style="margin-top:10px;">
                    <i class="fa-solid fa-circle-info" style="margin-right:5px;opacity:0.6;"></i>${this.t('contacts.type_hint')}
                 </p>`;

            // Bind type checkboxes — toggling a type enables/disables all its contacts
            document.querySelectorAll('.type-filter-cb[data-label]').forEach(cb => {
                cb.addEventListener('change', (e) => {
                    const label = e.target.dataset.label;
                    const isEnabled = e.target.checked;
                    this.contactsData.forEach(c => {
                        if (c.recurrenceLabel === label) c.enabled = isEnabled;
                    });
                    // Sync individual contact checkboxes
                    this.renderContactList(document.getElementById('contact-search-input')?.value || '');
                    this._resetScheduleIfGenerated();
                });
            });

            // Render individual contact list
            document.getElementById('contacts-list-section').classList.remove('hidden');
            this.renderContactList('');



            document.getElementById('contacts-success-info').classList.remove('hidden');
            document.getElementById('contacts-breakdown').classList.remove('hidden');
            document.getElementById('generator-panel').classList.remove('disabled');

            this.log(this.t('log.load_complete', { n: this.contactsData.length }), 'success');
        } catch (error) {
            console.error(error);
            this.log(`Error: ${error.message}`, 'error');
            alert(this.t('alert.contacts_error', { msg: error.message }));
        } finally {
            btn.disabled = false;
            btn.innerHTML = originalHtml;
        }
    },

    /**
     * Contact-level selection list with search
     */
    renderContactList(filter = '') {
        const q = filter.toLowerCase().trim();
        const visible = q
            ? this.contactsData.filter(c =>
                c.clientName.toLowerCase().includes(q) || String(c.contactId).includes(q))
            : this.contactsData;

        const container = document.getElementById('contacts-list-items');
        if (!container) return;

        if (visible.length === 0) {
            container.innerHTML = `<p style="text-align:center;padding:12px;color:var(--text-muted);font-size:0.82rem;">${this.t('contacts.list_empty')}</p>`;
        } else {
            container.innerHTML = visible.map(c => `
                <div class="contact-list-row">
                    <label class="type-filter-label contact-list-label">
                        <input type="checkbox" class="type-filter-cb contact-filter-cb"
                            data-contact-id="${c.contactId}"
                            ${c.enabled !== false ? 'checked' : ''}>
                        <span class="contact-list-name">${this.escapeHtml(c.clientName)}</span>
                        <span style="font-size:0.7rem;color:var(--text-muted);margin-left:4px;">ID: ${this.escapeHtml(c.contactId)}</span>
                    </label>
                    <span class="freq-badge freq-${c.recurrenceCode}" style="font-size:0.68rem;padding:2px 7px;flex-shrink:0;">${c.recurrenceCode}</span>
                </div>
            `).join('');

            container.querySelectorAll('.contact-filter-cb').forEach(cb => {
                cb.addEventListener('change', (e) => {
                    const id = parseInt(e.target.dataset.contactId);
                    const contact = this.contactsData.find(c => c.contactId === id);
                    if (contact) contact.enabled = e.target.checked;
                    this.updateContactSelectionCount();
                    this._resetScheduleIfGenerated();
                });
            });
        }

        this.updateContactSelectionCount();
    },

    updateContactSelectionCount() {
        const total    = this.contactsData.length;
        const selected = this.contactsData.filter(c => c.enabled !== false).length;
        const el = document.getElementById('contacts-selection-count');
        if (el) el.textContent = this.t('contacts.selected_count', { n: selected, total });
    },

    toggleVisibleContacts(enable) {
        const q = (document.getElementById('contact-search-input')?.value || '').toLowerCase().trim();
        const visible = q
            ? this.contactsData.filter(c =>
                c.clientName.toLowerCase().includes(q) || String(c.contactId).includes(q))
            : this.contactsData;
        visible.forEach(c => c.enabled = enable);
        this.renderContactList(document.getElementById('contact-search-input')?.value || '');
        this._resetScheduleIfGenerated();
    },

    _resetScheduleIfGenerated() {
        if (this.generatedTasks.length > 0) {
            this.generatedTasks = [];
            this.filteredTasks  = [];
            document.getElementById('schedule-preview-area').classList.add('hidden');
            this.updateStats();
        }
    },

    /* ── Custom-property extraction (maintenance contract date) ─────────── */

    // Pulls a named custom property out of a contact object, tolerant of the
    // many shapes a CRM might return (array of {name,value}, dict keyed by
    // name, alternate key names). Returns the raw value or null.
    extractCustomProperty(contact, propName) {
        if (!contact || !propName) return null;
        // propName may be a single name or a list of accepted aliases.
        const targets = new Set(
            (Array.isArray(propName) ? propName : [propName])
                .filter(Boolean)
                .map(n => String(n).trim().toLowerCase())
        );
        if (targets.size === 0) return null;
        const nameKeys  = ['name', 'label', 'key', 'propertyName', 'fieldName', 'title', 'displayName', 'code'];
        const valueKeys = ['value', 'stringValue', 'dateValue', 'val', 'text', 'data', 'content'];

        const pickValue = (o) => {
            for (const vk of valueKeys) {
                if (o[vk] !== undefined && o[vk] !== null && o[vk] !== '') return o[vk];
            }
            return null;
        };

        const containers = [
            contact.customProperties, contact.customFields, contact.properties,
            contact.customPropertyValues, contact.customValues, contact.fields
        ];

        for (const cont of containers) {
            if (!cont) continue;
            if (Array.isArray(cont)) {
                for (const item of cont) {
                    if (!item || typeof item !== 'object') continue;
                    for (const nk of nameKeys) {
                        if (typeof item[nk] === 'string' && targets.has(item[nk].trim().toLowerCase())) {
                            const v = pickValue(item);
                            if (v != null) return v;
                        }
                    }
                }
            } else if (typeof cont === 'object') {
                for (const k of Object.keys(cont)) {
                    if (!targets.has(k.trim().toLowerCase())) continue;
                    const v = cont[k];
                    if (v && typeof v === 'object') {
                        const pv = pickValue(v);
                        if (pv != null) return pv;
                    } else if (v != null && v !== '') {
                        return v;
                    }
                }
            }
        }
        return null;
    },

    // Parses a contract date that may arrive as ISO, dd/mm/yyyy or dd-mm-yyyy.
    // Returns a Date or null.
    parseContractDate(raw) {
        if (raw == null || raw === '') return null;
        if (raw instanceof Date) return isNaN(raw.getTime()) ? null : raw;
        const s = String(raw).trim();
        if (!s) return null;

        // ISO-like (yyyy-mm-dd, optionally with time) — unambiguous, trust it.
        if (/^\d{4}-\d{2}-\d{2}/.test(s)) {
            const d = new Date(s);
            if (!isNaN(d.getTime())) return d;
        }

        // European dd/mm/yyyy or dd-mm-yyyy or dd.mm.yyyy
        const m = s.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})/);
        if (m) {
            let dd = +m[1], mm = +m[2], yy = +m[3];
            if (yy < 100) yy += 2000;
            const d = new Date(yy, mm - 1, dd);
            if (!isNaN(d.getTime())) return d;
        }

        // Last resort: let the engine try.
        const d = new Date(s);
        return isNaN(d.getTime()) ? null : d;
    },

    /* ── Assignee Pill-Picker ──────────────────────────────────────────── */

    renderAssigneePicker() {
        const pillsEl      = document.getElementById('assignee-pills');
        const placeholderEl = document.getElementById('assignee-placeholder');
        if (!pillsEl) return;

        // Remove existing pills (keep placeholder span)
        pillsEl.querySelectorAll('.assignee-pill').forEach(p => p.remove());

        if (this.selectedAssignees.length === 0) {
            if (placeholderEl) placeholderEl.style.display = '';
        } else {
            if (placeholderEl) placeholderEl.style.display = 'none';
            this.selectedAssignees.forEach(a => {
                const pill = document.createElement('span');
                pill.className = `assignee-pill assignee-pill-${a.type}`;
                pill.dataset.id   = a.id;
                pill.dataset.type = a.type;
                const icon = a.type === 'group' ? '👥' : '👤';
                pill.innerHTML = `${icon} ${this.escapeHtml(a.name)} <button type="button" class="pill-remove" title="Rimuovi">×</button>`;
                pill.querySelector('.pill-remove').addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.toggleAssigneeItem(a.id, a.type, a.name);
                });
                pillsEl.appendChild(pill);
            });
        }
        this.renderAssigneeDropdownList(document.getElementById('assignee-search')?.value || '');
    },

    renderAssigneeDropdownList(filter = '') {
        const container = document.getElementById('assignee-dropdown-list');
        if (!container) return;
        const q = filter.toLowerCase().trim();

        const filterFn = item => {
            const name = item.displayName || `${item.firstName || ''} ${item.lastName || ''}`.trim() || item.name || '';
            return !q || name.toLowerCase().includes(q);
        };

        const users  = this.users.filter(filterFn);
        const groups = this.groups.filter(filterFn);

        if (users.length === 0 && groups.length === 0) {
            container.innerHTML = `<div class="assignee-no-results">${this.t('config.assignee_no_results')}</div>`;
            return;
        }

        let html = '';

        if (groups.length > 0) {
            html += `<div class="assignee-section-header">${this.t('config.assignee_groups_section')}</div>`;
            groups.forEach(g => {
                const name = g.name || g.displayName || `Gruppo ${g.id}`;
                const safeName = this.escapeHtml(name);
                const isSelected = this.selectedAssignees.some(a => a.type === 'group' && a.id === g.id);
                html += `<div class="assignee-option${isSelected ? ' selected' : ''}" data-id="${g.id}" data-type="group" data-name="${safeName}">
                    <span class="assignee-option-check">${isSelected ? '✓' : ''}</span>
                    <span class="assignee-option-name">👥 ${safeName}</span>
                </div>`;
            });
        }

        if (users.length > 0) {
            html += `<div class="assignee-section-header">${this.t('config.assignee_users_section')}</div>`;
            users.forEach(u => {
                const name = u.displayName || `${u.firstName || ''} ${u.lastName || ''}`.trim();
                const safeName = this.escapeHtml(name);
                const isSelected = this.selectedAssignees.some(a => a.type === 'user' && a.id === u.id);
                html += `<div class="assignee-option${isSelected ? ' selected' : ''}" data-id="${u.id}" data-type="user" data-name="${safeName}">
                    <span class="assignee-option-check">${isSelected ? '✓' : ''}</span>
                    <span class="assignee-option-name">👤 ${safeName}</span>
                </div>`;
            });
        }

        container.innerHTML = html;
        container.querySelectorAll('.assignee-option').forEach(opt => {
            opt.addEventListener('click', () => {
                this.toggleAssigneeItem(parseInt(opt.dataset.id), opt.dataset.type, opt.dataset.name);
            });
        });
    },

    toggleAssigneeItem(id, type, name) {
        const idx = this.selectedAssignees.findIndex(a => a.id === id && a.type === type);
        if (idx >= 0) {
            this.selectedAssignees.splice(idx, 1);
        } else {
            this.selectedAssignees.push({ id, type, name });
        }
        this.renderAssigneePicker();
    },

    openAssigneeDropdown() {
        const dropdown = document.getElementById('assignee-dropdown');
        if (!dropdown) return;
        dropdown.classList.toggle('hidden');
        if (!dropdown.classList.contains('hidden')) {
            const search = document.getElementById('assignee-search');
            if (search) { search.value = ''; search.focus(); }
            this.renderAssigneeDropdownList('');
        }
    },

    resetContacts() {
        this.contactsData = [];
        this.generatedTasks = [];
        this.filteredTasks = [];
        document.getElementById('contacts-success-info').classList.add('hidden');
        document.getElementById('contacts-breakdown').classList.add('hidden');
        document.getElementById('contacts-list-section').classList.add('hidden');
        document.getElementById('schedule-preview-area').classList.add('hidden');
        document.getElementById('generator-panel').classList.add('disabled');
        this.updateStats();
    },

    /**
     * 8. Recurrence Engine & Date Math
     */
    async generateSchedule() {
        if (!this.contactsData || this.contactsData.length === 0) {
            alert(this.t('alert.no_contacts'));
            return;
        }

        const startDateInput = document.getElementById('input-start-date').value;
        if (!startDateInput) { alert(this.t('alert.no_start_date')); return; }

        const durationInput = parseInt(document.getElementById('input-duration-months').value);
        if (isNaN(durationInput) || durationInput <= 0) {
            alert(this.t('alert.invalid_duration'));
            return;
        }

        const offsetDaysInput = parseInt(document.getElementById('input-activation-offset').value) || 0;

        const btn = document.getElementById('btn-generate-schedule');
        const originalHtml = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i> ${this.t('loading.generating')}`;

        try {
            this.programStartDate = startDateInput;
            this.durationMonths = durationInput;

            const titleTemplate = document.getElementById('template-title').value;
            const descTemplate  = document.getElementById('template-description').value;
            const fallbackStart = new Date(startDateInput);
            const tasks         = [];
            const localeLang    = this.lang === 'it' ? 'it-IT' : 'es-ES';
            let fallbackCount   = 0;

            // Never recreate past maintenances: only cycles whose activation is
            // today or later are generated, within a window of `durationMonths`
            // from today. The contract date still anchors the cadence/day-of-month.
            const today     = new Date(); today.setHours(0, 0, 0, 0);
            const windowEnd = this.addMonths(today, this.durationMonths);

            this.contactsData.forEach(contact => {
                // Skip types that have been unchecked in the breakdown filter
                if (contact.enabled === false) return;

                const { contactId, clientName, recurrenceCode, jobId = null } = contact;

                let monthsFrequency = 0;
                switch (recurrenceCode) {
                    case 'M': monthsFrequency = 1;  break;
                    case 'B': monthsFrequency = 2;  break;
                    case 'T': monthsFrequency = 3;  break;
                    case 'C': monthsFrequency = 4;  break;
                    case 'S': monthsFrequency = 6;  break;
                    case 'A': monthsFrequency = 12; break;
                    default: return;
                }

                // Each contact starts its cycle on its own "Fecha Contrato
                // Mantenimiento"; fall back to the program date if missing.
                const usedFallback  = !contact.contractStartDate;
                if (usedFallback) fallbackCount++;
                const baseStartDate = contact.contractStartDate || fallbackStart;

                // Use the UI language for the recurrence label in templates
                const recLabel = this.t('rec.' + recurrenceCode);

                // Walk the cadence anchored on the contract date, skipping past
                // cycles and stopping at the end of the from-today window.
                for (let i = 0; ; i += monthsFrequency) {
                    const cycleStartDate = this.addMonths(baseStartDate, i);
                    if (cycleStartDate >= windowEnd) break;   // past the window
                    if (i > 12 * 300) break;                      // safety net
                    if (cycleStartDate < today) continue;      // never recreate past cycles

                    // Planning period = the full maintenance cycle: from the
                    // activation date to the day before the next cycle starts.
                    // e.g. monthly from 11/06 -> 11/06–10/07, quarterly -> 11/06–10/09.
                    const nextCycleStart = this.addMonths(baseStartDate, i + monthsFrequency);
                    const plannedStart   = new Date(cycleStartDate);
                    const plannedEnd     = new Date(nextCycleStart.getFullYear(), nextCycleStart.getMonth(), nextCycleStart.getDate() - 1);

                    const actualActivationDate = new Date(cycleStartDate);
                    if (offsetDaysInput > 0) {
                        actualActivationDate.setDate(actualActivationDate.getDate() - offsetDaysInput);
                    }

                    const variables = {
                        '{cliente}':          clientName,
                        '{codigo}':           contactId,
                        '{recurrencia}':      recLabel,
                        '{fecha_activacion}': actualActivationDate.toLocaleDateString(localeLang)
                    };

                    let title = titleTemplate;
                    let desc  = descTemplate;
                    for (const [key, val] of Object.entries(variables)) {
                        title = title.replaceAll(key, val);
                        desc  = desc.replaceAll(key, val);
                    }

                    tasks.push({
                        index: tasks.length,
                        contactId,
                        clientName,
                        jobId,
                        recurrence: recurrenceCode,
                        recurrenceLabel: recLabel,
                        startValidityDate: new Date(actualActivationDate),
                        plannedStart,
                        plannedEnd,
                        title,
                        description: desc,
                        usedFallbackDate: usedFallback,
                        selected: true
                    });
                }
            });

            if (fallbackCount > 0) {
                this.log(this.t('log.schedule_fallback', { n: fallbackCount }), 'warning');
            }

            tasks.sort((a, b) => a.startValidityDate - b.startValidityDate);
            tasks.forEach((t, i) => t.index = i);

            this.generatedTasks = tasks;
            this.filteredTasks  = [...tasks];

            this.renderPreviewTable();
            this.updateStats();
            document.getElementById('schedule-preview-area').classList.remove('hidden');
            this.log(this.t('log.schedule_done', { n: tasks.length, c: this.contactsData.length }), 'success');
        } catch (error) {
            console.error(error);
            alert(this.t('alert.schedule_error', { msg: error.message }));
        } finally {
            btn.disabled = false;
            btn.innerHTML = originalHtml;
        }
    },

    addMonths(date, months) {
        const result = new Date(date);
        const targetDay = date.getDate();
        result.setDate(1);
        result.setMonth(result.getMonth() + months);
        const daysInMonth = new Date(result.getFullYear(), result.getMonth() + 1, 0).getDate();
        result.setDate(Math.min(targetDay, daysInMonth));
        return result;
    },

    formatDateIso(date) {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    },

    formatDateLabel(date) {
        return `${String(date.getDate()).padStart(2,'0')}/${String(date.getMonth()+1).padStart(2,'0')}/${date.getFullYear()}`;
    },

    formatDateTimeInput(date) {
        const y  = date.getFullYear();
        const mo = String(date.getMonth() + 1).padStart(2, '0');
        const d  = String(date.getDate()).padStart(2, '0');
        const hh = String(date.getHours()).padStart(2, '0');
        const mm = String(date.getMinutes()).padStart(2, '0');
        return `${y}-${mo}-${d}T${hh}:${mm}`;
    },

    formatDateTimeIsoLocal(date) {
        const y  = date.getFullYear();
        const mo = String(date.getMonth() + 1).padStart(2, '0');
        const d  = String(date.getDate()).padStart(2, '0');
        const hh = String(date.getHours()).padStart(2, '0');
        const mm = String(date.getMinutes()).padStart(2, '0');
        const ss = String(date.getSeconds()).padStart(2, '0');
        return `${y}-${mo}-${d}T${hh}:${mm}:${ss}`;
    },

    /**
     * 9. Interactive Schedule Preview Panel
     */
    renderPreviewTable() {
        const tbody = document.getElementById('schedule-table-body');
        tbody.innerHTML = '';

        if (this.filteredTasks.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:24px;color:var(--text-muted);">${this.t('generator.no_results')}</td></tr>`;
            return;
        }

        this.filteredTasks.forEach(task => {
            const tr = document.createElement('tr');
            tr.id = `task-row-${task.index}`;
            if (!task.selected) tr.className = 'row-excluded';

            tr.innerHTML = `
                <td class="col-select">
                    <input type="checkbox" data-index="${task.index}" ${task.selected ? 'checked' : ''} class="task-select-checkbox">
                </td>
                <td class="col-client">
                    ${this.escapeHtml(task.clientName)}
                    <span>ID: ${this.escapeHtml(task.contactId)}</span>
                </td>
                <td class="col-badge">
                    <span class="freq-badge freq-${task.recurrence}">${task.recurrence}</span>
                </td>
                <td class="col-date">${this.formatDateLabel(task.startValidityDate)}${task.usedFallbackDate ? ` <span class="fallback-badge" title="${this.t('preview.fallback_badge_title')}"><i class="fa-solid fa-triangle-exclamation"></i></span>` : ''}</td>
                <td class="col-range">${this.formatDateLabel(task.plannedStart)} – ${this.formatDateLabel(task.plannedEnd)}</td>
                <td class="col-title">${this.escapeHtml(task.title)}</td>
                <td class="col-actions">
                    <button type="button" class="btn-icon btn-edit-task" data-index="${task.index}" title="${this.t('generator.edit_title')}">
                        <i class="fa-solid fa-pen-to-square"></i>
                    </button>
                </td>
            `;

            tr.querySelector('.task-select-checkbox').addEventListener('change', (e) => {
                this.toggleTaskSelection(task.index, e.target.checked);
            });
            tr.querySelector('.btn-edit-task').addEventListener('click', () => {
                this.openEditModal(task.index);
            });

            tbody.appendChild(tr);
        });
    },

    toggleTaskSelection(index, isChecked) {
        const task = this.generatedTasks[index];
        task.selected = isChecked;
        const tr = document.getElementById(`task-row-${index}`);
        if (tr) {
            if (isChecked) tr.classList.remove('row-excluded');
            else tr.classList.add('row-excluded');
        }
        this.updateStats();
    },

    toggleSelectAll(isChecked) {
        this.generatedTasks.forEach(t => t.selected = isChecked);
        this.filteredTasks.forEach(t => t.selected = isChecked);

        document.querySelectorAll('.task-select-checkbox').forEach(c => c.checked = isChecked);

        document.querySelectorAll('#schedule-table-body tr').forEach(r => {
            if (!r.id.startsWith('task-row-')) return;
            const task = this.generatedTasks[parseInt(r.id.replace('task-row-', ''))];
            if (!task) return;
            if (task.selected) r.classList.remove('row-excluded');
            else r.classList.add('row-excluded');
        });

        this.updateStats();
    },

    filterPreview(query) {
        const q = query.toLowerCase().trim();
        if (!q) {
            this.filteredTasks = [...this.generatedTasks];
        } else {
            this.filteredTasks = this.generatedTasks.filter(t =>
                t.clientName.toLowerCase().includes(q) ||
                String(t.contactId).includes(q) ||
                t.title.toLowerCase().includes(q)
            );
        }
        this.renderPreviewTable();
    },

    updateStats() {
        const total    = this.generatedTasks.length;
        const selected = this.generatedTasks.filter(t => t.selected).length;

        document.getElementById('stats-total-tasks').textContent    = total;
        document.getElementById('stats-selected-tasks').textContent = selected;

        const selectAllCb = document.getElementById('select-all-tasks');
        if (total > 0 && selected === total) {
            selectAllCb.checked = true;
            selectAllCb.indeterminate = false;
        } else if (selected > 0 && selected < total) {
            selectAllCb.checked = false;
            selectAllCb.indeterminate = true;
        } else {
            selectAllCb.checked = false;
            selectAllCb.indeterminate = false;
        }

        const btnBulk = document.getElementById('btn-bulk-create');
        btnBulk.disabled      = selected === 0;
        btnBulk.style.opacity = selected === 0 ? 0.5 : 1;
    },

    /**
     * 10. Edit Individual Task Modal
     */
    openEditModal(index) {
        const task = this.generatedTasks[index];
        document.getElementById('edit-task-index').value         = index;
        document.getElementById('edit-task-title').value         = task.title;
        document.getElementById('edit-task-activation').value    = this.formatDateTimeInput(task.startValidityDate);
        document.getElementById('edit-task-planned-start').value = this.formatDateIso(task.plannedStart);
        document.getElementById('edit-task-planned-end').value   = this.formatDateIso(task.plannedEnd);
        document.getElementById('edit-task-modal').classList.remove('hidden');
    },

    closeEditModal() {
        document.getElementById('edit-task-modal').classList.add('hidden');
    },

    saveIndividualTaskEdit() {
        const index = parseInt(document.getElementById('edit-task-index').value);
        const task  = this.generatedTasks[index];

        const newTitle        = document.getElementById('edit-task-title').value;
        const newActivation   = new Date(document.getElementById('edit-task-activation').value);
        const newPlannedStart = new Date(document.getElementById('edit-task-planned-start').value);
        const newPlannedEnd   = new Date(document.getElementById('edit-task-planned-end').value);

        if (!newTitle || isNaN(newActivation) || isNaN(newPlannedStart) || isNaN(newPlannedEnd)) {
            alert(this.t('alert.edit_invalid'));
            return;
        }

        task.title             = newTitle;
        task.startValidityDate = newActivation;
        task.plannedStart      = newPlannedStart;
        task.plannedEnd        = newPlannedEnd;

        this.renderPreviewTable();
        this.closeEditModal();
        this.log(this.t('log.task_edited', { n: index + 1, client: task.clientName }), 'info');
    },

    /**
     * 11. Throttled Bulk Creation Engine
     */
    async startBulkCreation() {
        const tasksToCreate = this.generatedTasks.filter(t => t.selected);
        if (tasksToCreate.length === 0) return;

        const taskTypeId = document.getElementById('select-task-type').value;
        const statusId   = document.getElementById('select-task-status').value;
        const priority   = parseInt(document.getElementById('select-priority').value);
        const important  = document.getElementById('input-important').checked;

        if (!taskTypeId || !statusId) {
            alert(this.t('alert.select_type_status'));
            return;
        }

        this.isExecuting   = true;
        this.cancelExecution = false;
        this.stats = { success: 0, failure: 0, skipped: 0, total: tasksToCreate.length, processed: 0 };

        document.getElementById('progress-ratio').textContent       = `0 / ${this.stats.total}`;
        document.getElementById('progress-bar-fill').style.width    = '0%';
        document.getElementById('stats-success-count').textContent  = '0';
        document.getElementById('stats-failure-count').textContent  = '0';
        document.getElementById('stats-skip-count').textContent     = '0';
        document.getElementById('stats-percent').textContent        = '0%';
        document.getElementById('btn-stop-execution').classList.remove('hidden');
        document.getElementById('btn-close-progress').classList.add('hidden');
        document.getElementById('progress-modal').classList.remove('hidden');

        this.clearConsole();
        this.log(this.t('log.bulk_start', { n: this.stats.total }), 'info');

        // If a project name is provided, pre-create one job per unique contact
        const projectName = document.getElementById('input-project-name').value.trim();
        const jobOverrideMap = {};
        if (projectName) {
            const uniqueContacts = [...new Map(tasksToCreate.map(t => [t.contactId, t])).values()];
            this.log(this.t('log.project_creating', { name: projectName, n: uniqueContacts.length }), 'info');
            for (const t of uniqueContacts) {
                try {
                    const newJobId = await this.client.createJob(projectName, t.contactId);
                    jobOverrideMap[t.contactId] = newJobId;
                    this.log(this.t('log.project_created', { client: t.clientName, id: newJobId }), 'info');
                } catch (err) {
                    this.log(this.t('log.project_warn', { client: t.clientName, msg: err.message }), 'warning');
                }
                await this.delay(100);
            }
        }

        // Load jobs (commesse) for selected contacts that don't have one yet
        const contactsNeedingJob = [...new Map(
            tasksToCreate
                .filter(t => t.jobId == null)
                .map(t => [t.contactId, t])
        ).values()];

        if (contactsNeedingJob.length > 0 && !projectName) {
            // Only load existing jobs if we're NOT creating a new project
            this.log(this.t('log.bulk_loading_jobs', { n: contactsNeedingJob.length }), 'info');
            for (const t of contactsNeedingJob) {
                if (this.cancelExecution) break;
                try {
                    const jobId = await this.client.getFirstJobForContact(t.contactId);
                    if (jobId) {
                        // Update all tasks for this contact
                        tasksToCreate.forEach(task => {
                            if (task.contactId === t.contactId) task.jobId = jobId;
                        });
                        // Also update contactsData for consistency
                        const contactData = this.contactsData.find(c => c.contactId === t.contactId);
                        if (contactData) contactData.jobId = jobId;
                        this.log(this.t('log.bulk_jobs_progress', { client: t.clientName, id: jobId }), 'info');
                    }
                } catch (e) {
                    // Non-blocking: tasks can be created without a job
                }
                await this.delay(50);
            }
        }

        const checkExisting = document.getElementById('input-check-existing').checked;
        if (checkExisting) {
            this.log(this.t('log.check_existing_active'), 'info');
        }

        const queue = [...tasksToCreate];
        // TakeOff assigns via assignedEntityIds: prefixed string ids,
        // "us_<id>" for users and "gr_<id>" for groups. The array supports
        // multiple assignees (any mix of users and groups).
        const assignedEntityIds = this.selectedAssignees
            .filter(a => a && (a.type === 'user' || a.type === 'group'))
            .map(a => `${a.type === 'user' ? 'us' : 'gr'}_${a.id}`);

        const workerParams = {
            taskTypeId: parseInt(taskTypeId),
            statusId:   parseInt(statusId),
            assignedEntityIds,
            priority,
            important,
            jobOverrideMap,
            checkExisting
        };

        this.activeWorkersCount = 2;
        await Promise.all([
            this.runWorker(queue, workerParams),
            this.runWorker(queue, workerParams)
        ]);

        this.isExecuting = false;
        document.getElementById('btn-stop-execution').classList.add('hidden');
        document.getElementById('btn-close-progress').classList.remove('hidden');

        if (this.cancelExecution) {
            this.log(this.t('log.interrupted', { success: this.stats.success, skipped: this.stats.skipped, failure: this.stats.failure }), 'warning');
        } else {
            this.log(this.t('log.complete', { success: this.stats.success, skipped: this.stats.skipped, failure: this.stats.failure }), 'success');
            alert(this.t('alert.bulk_complete', { success: this.stats.success, skipped: this.stats.skipped, failure: this.stats.failure }));
        }
    },

    async runWorker(queue, params) {
        while (queue.length > 0 && !this.cancelExecution) {
            const task = queue.shift();
            if (!task) break;

            try {
                const resolvedJobId = (params.jobOverrideMap && params.jobOverrideMap[task.contactId])
                    ?? task.jobId
                    ?? null;

                const plannedStartIso = this.formatDateTimeIsoLocal(task.plannedStart);
                const plannedEndIso   = this.formatDateTimeIsoLocal(task.plannedEnd);

                // Activation date = first day of each maintenance cycle.
                // Use the same LOCAL datetime format as plannedStart/End — sending
                // toISOString() (UTC "Z" + ms) is what previously caused a 400.
                const startValidityIso = (task.startValidityDate instanceof Date && !isNaN(task.startValidityDate))
                    ? this.formatDateTimeIsoLocal(task.startValidityDate)
                    : null;

                // Se la data di attivazione è futura, impostiamo lo stato a 0 (Pending) in modo che 
                // il CRM la mantenga in attesa e la attivi solo alla data startValidityDate.
                // Altrimenti, se è già passata o oggi, la creiamo come 1 (Accepted - attiva).
                const now = new Date();
                const taskState = (task.startValidityDate instanceof Date && task.startValidityDate > now) ? 0 : 1;

                // Optional duplicate check
                if (params.checkExisting) {
                    const exists = await this.client.taskExistsInPeriod(
                        parseInt(task.contactId),
                        params.taskTypeId,
                        plannedStartIso,
                        plannedEndIso
                    );
                    if (exists) {
                        this.stats.skipped++;
                        this.log(this.t('log.task_skip', { id: task.contactId, client: task.clientName }), 'info');
                        continue;
                    }
                }

                const payload = {
                    name:           task.title,
                    description:    task.description,
                    taskTypeId:     params.taskTypeId,
                    statusId:       params.statusId,
                    contactId:      parseInt(task.contactId),
                    jobId:          resolvedJobId,
                    important:      params.important,
                    priority:       params.priority,
                    plannedStart:   plannedStartIso,
                    plannedEnd:     plannedEndIso,
                    completeBefore: plannedEndIso,
                    creatorUserId:  this.connectedUser.id,
                    ...(params.assignedEntityIds.length > 0 && { assignedEntityIds: params.assignedEntityIds }),
                    // Task activation: "Válido a partir de fecha" (taskValidityType 10),
                    // activated from the first day of the maintenance cycle.
                    ...(startValidityIso && { 
                        taskValidityType: 10, 
                        startValidityDate: startValidityIso,
                        state: taskState
                    }),
                };

                await this.client.createTask(payload);
                this.stats.success++;
                this.log(this.t('log.task_ok', { id: task.contactId, client: task.clientName, title: task.title }), 'success');
            } catch (err) {
                this.stats.failure++;
                this.log(this.t('log.task_err', { id: task.contactId, client: task.clientName, msg: err.message }), 'error');
            } finally {
                this.stats.processed++;
                this.updateProgressUi();
            }

            await this.delay(180);
        }
        this.activeWorkersCount--;
    },

    stopBulkExecution() {
        this.cancelExecution = true;
        this.log(this.t('log.stop_cmd'), "warning");
        document.getElementById('btn-stop-execution').classList.add('hidden');
    },

    updateProgressUi() {
        const percent = Math.round((this.stats.processed / this.stats.total) * 100);
        document.getElementById('progress-ratio').textContent      = `${this.stats.processed} / ${this.stats.total}`;
        document.getElementById('progress-bar-fill').style.width   = `${percent}%`;
        document.getElementById('stats-success-count').textContent = this.stats.success;
        document.getElementById('stats-failure-count').textContent = this.stats.failure;
        document.getElementById('stats-skip-count').textContent    = this.stats.skipped;
        document.getElementById('stats-percent').textContent       = `${percent}%`;
    },

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
};

window.addEventListener('DOMContentLoaded', () => App.init());
