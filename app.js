/* ==========================================================================
   TakeOff CRM Recurring Task Generator — Core Javascript Engine
   ========================================================================== */

/**
 * 1. TakeOff REST API Service Client
 */
class TakeOffClient {
    constructor() {
        this.baseUrl = 'https://webapi.takeoffcrm.com';
        this.useCorsProxy = false;

        // Dynamic Environment Detection
        if (window.location.hostname.endsWith('.vercel.app')) {
            this.baseUrl = '/api/takeoff';
        }
    }

    setApiKey(apiKey) {
        this.apiKey = apiKey.trim();
    }

    getHeaders() {
        if (!this.apiKey) throw new Error("Chiave API non inserita.");
        return {
            'x-api-key': this.apiKey,
            'Content-Type': 'application/json'
        };
    }

    /**
     * Get clean request URL based on proxy, fallback and environment settings.
     */
    getUrl(endpoint) {
        if (window.location.hostname.endsWith('.vercel.app')) {
            // On Vercel, the base URL is /api/takeoff, and vercel.json transparently rewrites
            // "/api/takeoff/:path*" to "https://webapi.takeoffcrm.com/api/:path*".
            // So if endpoint starts with "/api/", we strip it to avoid double "/api" in the rewrite destination.
            const path = endpoint.startsWith('/api/') ? endpoint.substring(4) : endpoint;
            return `${this.baseUrl}/${path}`;
        }

        // Normally
        let targetUrl = `${this.baseUrl}${endpoint}`;
        if (this.useCorsProxy) {
            targetUrl = `https://corsproxy.io/?${targetUrl}`;
        }
        return targetUrl;
    }

    /**
     * Execute a request with automatic CORS Proxy fallback on local environments
     */
    async request(endpoint, options = {}) {
        const url = this.getUrl(endpoint);
        try {
            const response = await fetch(url, options);
            return response;
        } catch (error) {
            // If direct call fails due to a network error ('Failed to fetch' or similar)
            // and we are NOT on Vercel (where rewrites should handle it), and proxy is not yet enabled:
            const isNetworkError = error.name === 'TypeError' || 
                                   error.message.includes('fetch') || 
                                   error.message.includes('NetworkError');
            
            if (isNetworkError && !this.useCorsProxy && !window.location.hostname.endsWith('.vercel.app')) {
                console.warn("Direct request failed. Activating public CORS proxy fallback...", error);
                
                this.useCorsProxy = true;
                
                // Keep the UI toggle check state synced
                const checkbox = document.getElementById('input-cors-proxy');
                if (checkbox) {
                    checkbox.checked = true;
                }
                
                // Save the preference
                localStorage.setItem('takeoff_cors_proxy', 'true');
                
                if (typeof App !== 'undefined' && App.log) {
                    App.log("Connessione diretta fallita (errore CORS). Attivazione automatica del Proxy CORS...", "warning");
                }
                
                // Retry request with proxy
                const retryUrl = this.getUrl(endpoint);
                return await fetch(retryUrl, options);
            }
            throw error;
        }
    }

    /**
     * Test connection and retrieve profile data
     */
    async getMeInfo() {
        const response = await this.request('/api/me/infos', {
            method: 'GET',
            headers: this.getHeaders()
        });
        if (!response.ok) {
            if (response.status === 401) throw new Error("Chiave API non valida (401 Unauthorized).");
            throw new Error(`Errore di connessione: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        return data.value; // DTO wrapper
    }

    /**
     * Get list of Task Types
     */
    async getTaskTypes() {
        const response = await this.request('/api/tasks/types', {
            method: 'GET',
            headers: this.getHeaders()
        });
        if (!response.ok) throw new Error("Impossibile caricare i tipi task.");
        const data = await response.json();
        return data.value;
    }

    /**
     * Get active workflow steps (statuses) for a specific Task Type
     */
    async getTaskStatuses(taskTypeId) {
        const response = await this.request(`/api/tasks/types/${taskTypeId}/steps`, {
            method: 'GET',
            headers: this.getHeaders()
        });
        if (!response.ok) throw new Error(`Impossibile caricare gli stati per il tipo task #${taskTypeId}`);
        const data = await response.json();
        return data.value;
    }

    /**
     * Get list of active users
     */
    async getUsers() {
        const response = await this.request('/api/users', {
            method: 'GET',
            headers: this.getHeaders()
        });
        if (!response.ok) throw new Error("Impossibile caricare la lista utenti.");
        const data = await response.json();
        return data.value;
    }

    /**
     * Create a single Task in TakeOff CRM
     */
    async createTask(taskDto) {
        const response = await this.request('/api/tasks', {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(taskDto)
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            // Handle ActionResult errors if wrapped
            const errorMsg = data.result?.errors?.join(', ') || data.title || "Errore sconosciuto";
            throw new Error(errorMsg);
        }
        
        // TakeOff returns ActionResults, usually value holds the response DTO
        if (data.result && !data.result.isSuccess) {
            const errorMsg = data.result.errors?.join(', ') || "Errore server TakeOff";
            throw new Error(errorMsg);
        }
        
        return data.value;
    }

    /**
     * Get a Contact profile by ReferenceCode
     */
    async getContactByReferenceCode(referenceCode) {
        const response = await this.request(`/api/contacts/referencecode/${encodeURIComponent(referenceCode)}`, {
            method: 'GET',
            headers: this.getHeaders()
        });
        if (response.status === 404) {
            return null; // Valid business logic: contact not found
        }
        if (!response.ok) {
            throw new Error(`Errore nella chiamata API per il contatto '${referenceCode}': ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        return data.value;
    }
}

/**
 * 2. Core Application State
 */
const App = {
    client: new TakeOffClient(),
    
    // Auth & Lookup State
    apiKey: '',
    connectedUser: null,
    taskTypes: [],
    users: [],
    currentStatuses: [],
    contactCache: {}, // Cache for ReferenceCode resolutions

    // Excel Parsing State
    excelData: null, // parsed raw JSON rows
    excelHeaders: [],
    columnMapping: {
        customerCode: '',
        referenceCode: '',
        customerName: '',
        recurrence: ''
    },

    // Generator & Preview State
    programStartDate: '',
    durationMonths: 12,
    generatedTasks: [],
    filteredTasks: [],

    // Execution Queue Control
    isExecuting: false,
    cancelExecution: false,
    activeWorkersCount: 0,
    stats: {
        success: 0,
        failure: 0,
        total: 0,
        processed: 0
    },

    /**
     * Initialize Application DOM Bindings
     */
    init() {
        this.programStartDate = this.formatDateIso(new Date());
        document.getElementById('input-start-date').value = this.programStartDate;

        // Try restoring API key
        const savedKey = localStorage.getItem('takeoff_api_key');
        if (savedKey) {
            document.getElementById('api-key-input').value = savedKey;
        }

        // Try restoring CORS proxy preference or auto-adjust for Vercel
        if (window.location.hostname.endsWith('.vercel.app')) {
            const corsGroup = document.getElementById('cors-proxy-group');
            if (corsGroup) {
                const label = corsGroup.querySelector('.switch-label');
                if (label) label.textContent = 'Proxy Vercel Attivo (Automatico)';
                const switchEl = corsGroup.querySelector('.switch');
                if (switchEl) switchEl.style.display = 'none';
                const hint = document.getElementById('cors-proxy-hint');
                if (hint) hint.textContent = 'In esecuzione su Vercel: proxy trasparente attivo.';
            }
        } else {
            const savedCorsProxy = localStorage.getItem('takeoff_cors_proxy');
            const corsProxyInput = document.getElementById('input-cors-proxy');
            if (corsProxyInput) {
                if (savedCorsProxy === 'true') {
                    corsProxyInput.checked = true;
                    this.client.useCorsProxy = true;
                } else {
                    corsProxyInput.checked = false;
                    this.client.useCorsProxy = false;
                }
            }
        }

        this.bindEvents();
    },

    bindEvents() {
        // Auth events
        document.getElementById('btn-connect').addEventListener('click', () => this.connectApi());
        document.getElementById('btn-toggle-api-key').addEventListener('click', () => this.toggleApiKeyVisibility());

        // CORS proxy event
        const corsProxyInput = document.getElementById('input-cors-proxy');
        if (corsProxyInput) {
            corsProxyInput.addEventListener('change', (e) => {
                this.client.useCorsProxy = e.target.checked;
                localStorage.setItem('takeoff_cors_proxy', e.target.checked ? 'true' : 'false');
                this.log(`Proxy CORS ${e.target.checked ? 'attivato' : 'disattivato'} manualmente.`, 'info');
            });
        }
        
        // Expandable text areas trigger
        document.getElementById('templates-trigger').addEventListener('click', () => {
            const trigger = document.getElementById('templates-trigger');
            const content = document.getElementById('templates-content');
            trigger.classList.toggle('open');
            content.classList.toggle('hidden');
        });

        // Excel parser events
        const dropZone = document.getElementById('excel-drop-zone');
        const fileInput = document.getElementById('excel-file-input');

        dropZone.addEventListener('click', () => fileInput.click());
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('dragover');
        });
        dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('dragover');
            if (e.dataTransfer.files.length) {
                this.handleExcelFile(e.dataTransfer.files[0]);
            }
        });
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length) {
                this.handleExcelFile(e.target.files[0]);
            }
        });

        document.getElementById('btn-reset-excel').addEventListener('click', () => this.resetExcel());
        document.getElementById('btn-download-sample').addEventListener('click', () => this.downloadSampleExcel());

        // Mapping selectors change
        document.getElementById('map-customer-code').addEventListener('change', (e) => this.columnMapping.customerCode = e.target.value);
        document.getElementById('map-reference-code').addEventListener('change', (e) => this.columnMapping.referenceCode = e.target.value);
        document.getElementById('map-customer-name').addEventListener('change', (e) => this.columnMapping.customerName = e.target.value);
        document.getElementById('map-recurrence').addEventListener('change', (e) => this.columnMapping.recurrence = e.target.value);

        // Task Configuration Lookups Change
        document.getElementById('select-task-type').addEventListener('change', (e) => this.handleTaskTypeChange(e.target.value));

        // Generator events
        document.getElementById('btn-generate-schedule').addEventListener('click', () => this.generateSchedule());
        document.getElementById('preview-search').addEventListener('input', (e) => this.filterPreview(e.target.value));
        document.getElementById('select-all-tasks').addEventListener('change', (e) => this.toggleSelectAll(e.target.checked));

        // Edit single task modal events
        document.getElementById('btn-close-edit-modal').addEventListener('click', () => this.closeEditModal());
        document.getElementById('btn-cancel-edit').addEventListener('click', () => this.closeEditModal());
        document.getElementById('btn-save-edit').addEventListener('click', () => this.saveIndividualTaskEdit());

        // Bulk execution events
        document.getElementById('btn-bulk-create').addEventListener('click', () => this.startBulkCreation());
        document.getElementById('btn-stop-execution').addEventListener('click', () => this.stopBulkExecution());
        document.getElementById('btn-close-progress').addEventListener('click', () => {
            document.getElementById('progress-modal').classList.add('hidden');
        });
        document.getElementById('btn-copy-logs').addEventListener('click', () => this.copyConsoleLogs());
    },

    /**
     * 3. UI Interactions & Animations
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
        
        const timestamp = new Date().toLocaleTimeString();
        row.textContent = `[${timestamp}] ${message}`;
        
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
        
        const text = consoleLogs.innerText;
        navigator.clipboard.writeText(text).then(() => {
            alert("Registro copiato negli appunti!");
        }).catch(err => {
            console.error("Impossibile copiare i log: ", err);
        });
    },

    /**
     * 4. API Authentication & Lookups
     */
    async connectApi() {
        const keyInput = document.getElementById('api-key-input').value.trim();
        if (!keyInput) {
            alert("Inserisci una chiave API per connetterti.");
            return;
        }

        const btn = document.getElementById('btn-connect');
        const originalText = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i> Connessione in corso...`;

        try {
            this.client.setApiKey(keyInput);
            const userProfile = await this.client.getMeInfo();
            
            // Save Key on Success
            localStorage.setItem('takeoff_api_key', keyInput);
            this.apiKey = keyInput;
            this.connectedUser = userProfile;

            // Connect Badge Animation
            const badge = document.getElementById('connection-badge');
            badge.className = 'badge badge-connected';
            badge.querySelector('.status-text').textContent = 'Connesso';

            // Populate User Card
            const userCard = document.getElementById('user-profile-card');
            userCard.classList.remove('hidden');
            document.getElementById('user-display-name').textContent = userProfile.displayName || `${userProfile.firstName} ${userProfile.lastName}`;
            document.getElementById('user-role').textContent = userProfile.companyRole || 'Collaboratore TakeOff';
            document.getElementById('user-company').textContent = `ID Azienda: ${userProfile.inDittaCompanyId}`;

            if (userProfile.profileImage) {
                document.getElementById('user-avatar').innerHTML = `<img src="${userProfile.profileImage}" alt="avatar">`;
            } else {
                document.getElementById('user-avatar').innerHTML = `<span style="font-weight:bold">${userProfile.initials || 'U'}</span>`;
            }

            // Load Dynamic Lookups
            await this.loadLookups();

            // Enable Controls
            document.getElementById('defaults-panel').classList.remove('disabled');
            document.getElementById('generator-panel').classList.remove('disabled');

            this.log(`Connessione riuscita. Benvenuto ${userProfile.displayName}!`, 'success');
        } catch (error) {
            console.error(error);
            alert(`Errore di connessione: ${error.message}`);
            this.client.setApiKey('');
            localStorage.removeItem('takeoff_api_key');
            
            // Reset Badge
            const badge = document.getElementById('connection-badge');
            badge.className = 'badge badge-disconnected';
            badge.querySelector('.status-text').textContent = 'Disconnesso';
            document.getElementById('user-profile-card').classList.add('hidden');
            
            // Disable Controls
            document.getElementById('defaults-panel').classList.add('disabled');
            document.getElementById('generator-panel').classList.add('disabled');
        } finally {
            btn.disabled = false;
            btn.innerHTML = originalText;
        }
    },

    async loadLookups() {
        try {
            // 1. Task Types
            const types = await this.client.getTaskTypes();
            this.taskTypes = types;
            const selectType = document.getElementById('select-task-type');
            selectType.innerHTML = '<option value="">Seleziona un tipo task...</option>';
            types.forEach(t => {
                const opt = document.createElement('option');
                opt.value = t.id;
                opt.textContent = t.name;
                selectType.appendChild(opt);
            });
            selectType.disabled = false;

            // 2. Users (Assignees)
            const usersList = await this.client.getUsers();
            this.users = usersList;
            const selectAssignee = document.getElementById('select-assignee');
            selectAssignee.innerHTML = '<option value="">Nessuno (Non assegnato)</option>';
            usersList.forEach(u => {
                const opt = document.createElement('option');
                opt.value = u.id;
                opt.textContent = u.displayName || `${u.firstName} ${u.lastName}`;
                
                // Pre-select if matches connected user
                if (u.id === this.connectedUser.id) {
                    opt.selected = true;
                }
                selectAssignee.appendChild(opt);
            });
            selectAssignee.disabled = false;

            this.log("Lookup statici caricati con successo.", "info");
        } catch (error) {
            this.log(`Errore nel caricamento dei dati di supporto: ${error.message}`, 'error');
        }
    },

    async handleTaskTypeChange(typeId) {
        const selectStatus = document.getElementById('select-task-status');
        selectStatus.innerHTML = '<option value="">Seleziona uno stato...</option>';
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
            
            // Auto-select first step/status
            if (steps.length > 0) {
                selectStatus.value = steps[0].id;
            }
        } catch (error) {
            this.log(`Errore nel caricamento degli stati: ${error.message}`, 'error');
        }
    },

    /**
     * 5. Excel Parsing (Drag-and-Drop + Mapping)
     */
    handleExcelFile(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                
                if (workbook.SheetNames.length === 0) {
                    throw new Error("Il file Excel non contiene fogli di lavoro.");
                }

                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const rawRows = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

                if (rawRows.length === 0) {
                    throw new Error("Il foglio Excel è vuoto.");
                }

                // Gather headers (keys of first row)
                const headers = Object.keys(rawRows[0]);
                
                this.excelData = rawRows;
                this.excelHeaders = headers;

                // Animate DOM transitions
                document.getElementById('excel-drop-zone').classList.add('hidden');
                
                const successInfo = document.getElementById('excel-success-info');
                successInfo.classList.remove('hidden');
                document.getElementById('excel-filename').textContent = file.name;
                document.getElementById('excel-row-count').textContent = `Trovati ${rawRows.length} elementi registrati nella lista.`;

                // Populate column mapping selectors
                this.populateMapper(headers);
                this.autoMapHeaders(headers);
                
                document.getElementById('mapping-panel').classList.remove('hidden');
                
                this.log(`File caricato con successo: ${file.name} (${rawRows.length} righe).`, 'success');
            } catch (err) {
                alert(`Errore nella lettura del file Excel: ${err.message}`);
                this.resetExcel();
            }
        };
        reader.readAsArrayBuffer(file);
    },

    resetExcel() {
        this.excelData = null;
        this.excelHeaders = [];
        this.columnMapping = { customerCode: '', referenceCode: '', customerName: '', recurrence: '' };
        
        document.getElementById('excel-file-input').value = '';
        document.getElementById('excel-drop-zone').classList.remove('hidden');
        document.getElementById('excel-success-info').classList.add('hidden');
        document.getElementById('mapping-panel').classList.add('hidden');
        document.getElementById('schedule-preview-area').classList.add('hidden');
        
        this.generatedTasks = [];
        this.filteredTasks = [];
        this.updateStats();
    },

    populateMapper(headers) {
        const codeSel = document.getElementById('map-customer-code');
        const refSel = document.getElementById('map-reference-code');
        const nameSel = document.getElementById('map-customer-name');
        const recSel = document.getElementById('map-recurrence');

        const populateOptions = (select) => {
            if (!select) return;
            select.innerHTML = '<option value="">-- Seleziona colonna --</option>';
            headers.forEach(h => {
                const opt = document.createElement('option');
                opt.value = h;
                opt.textContent = h;
                select.appendChild(opt);
            });
        };

        populateOptions(codeSel);
        populateOptions(refSel);
        populateOptions(nameSel);
        populateOptions(recSel);
    },

    autoMapHeaders(headers) {
        const normalize = str => str.toLowerCase().replace(/[^a-z0-9]/g, '');

        headers.forEach(h => {
            const norm = normalize(h);
            
            // Map Customer Code (id, codice, codicecliente, customercode, code)
            if (['codicecliente', 'customercode', 'codice', 'id', 'code', 'cod'].includes(norm)) {
                document.getElementById('map-customer-code').value = h;
                this.columnMapping.customerCode = h;
            }

            // Map Reference Code (codiceriferimento, codiceriferimentocliente, referencecode, refcode, rif, riferimento)
            if (['codiceriferimento', 'codiceriferimentocliente', 'referencecode', 'refcode', 'rif', 'riferimento', 'codicerif'].includes(norm)) {
                document.getElementById('map-reference-code').value = h;
                this.columnMapping.referenceCode = h;
            }
            
            // Map Customer Name (cliente, nome, ragionesociale, customer, name)
            if (['cliente', 'nome', 'ragionesociale', 'customer', 'name', 'nom'].includes(norm)) {
                document.getElementById('map-customer-name').value = h;
                this.columnMapping.customerName = h;
            }
            
            // Map Recurrence (manutenzione, ricorrenza, freq, frequenza, recurrence, periodo)
            if (['manutenzione', 'ricorrenza', 'freq', 'frequenza', 'recurrence', 'periodo'].includes(norm)) {
                document.getElementById('map-recurrence').value = h;
                this.columnMapping.recurrence = h;
            }
        });
    },

    downloadSampleExcel() {
        const sampleData = [
            { "Codice Cliente": 12, "Cliente": "Lorenzo", "Manutenzione": "M" },
            { "Codice Cliente": 35, "Cliente": "Mario", "Manutenzione": "S" },
            { "Codice Cliente": 48, "Cliente": "Giuseppe s.r.l.", "Manutenzione": "T" },
            { "Codice Cliente": 99, "Cliente": "Azienda Beta", "Manutenzione": "A" }
        ];

        try {
            const worksheet = XLSX.utils.json_to_sheet(sampleData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Manutenzioni");
            XLSX.writeFile(workbook, "Esempio_Lista_Manutenzioni.xlsx");
            this.log("File Excel di esempio generato e scaricato.", "info");
        } catch (error) {
            console.error(error);
            alert("Errore nella generazione del file di esempio.");
        }
    },

    /**
     * 6. Recurrence Engine & Date Math
     */
    async generateSchedule() {
        if (!this.excelData) {
            alert("Carica prima un file Excel.");
            return;
        }

        const map = this.columnMapping;
        if (!map.customerCode && !map.referenceCode) {
            alert("Associa almeno una colonna tra 'Codice Cliente (ID)' e 'Codice Riferimento Cliente' nel pannello Mappatura prima di generare.");
            return;
        }
        if (!map.customerName || !map.recurrence) {
            alert("Associa le colonne 'Nome Cliente' e 'Codice Manutenzione' nel pannello Mappatura prima di generare.");
            return;
        }

        const startDateInput = document.getElementById('input-start-date').value;
        if (!startDateInput) {
            alert("Imposta una data d'inizio programma.");
            return;
        }
        
        const durationInput = parseInt(document.getElementById('input-duration-months').value);
        if (isNaN(durationInput) || durationInput <= 0) {
            alert("Imposta una durata di generazione valida.");
            return;
        }

        const btn = document.getElementById('btn-generate-schedule');
        const originalText = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i> Risoluzione contatti...`;

        try {
            this.programStartDate = startDateInput;
            this.durationMonths = durationInput;

            const titleTemplate = document.getElementById('template-title').value;
            const descTemplate = document.getElementById('template-description').value;

            const baseStartDate = new Date(startDateInput);
            const tasks = [];

            // 1. Collect unique reference codes and resolve them asynchronously, with caching
            if (map.referenceCode) {
                const uniqueRefCodes = [];
                this.excelData.forEach(row => {
                    const refCode = String(row[map.referenceCode] || '').trim();
                    if (refCode && !uniqueRefCodes.includes(refCode)) {
                        uniqueRefCodes.push(refCode);
                    }
                });

                const codesToResolve = uniqueRefCodes.filter(code => !(code in this.contactCache));
                if (codesToResolve.length > 0) {
                    this.log(`Risoluzione di ${codesToResolve.length} nuovi Codici Riferimento in corso...`, 'info');
                    for (let i = 0; i < codesToResolve.length; i++) {
                        const code = codesToResolve[i];
                        try {
                            const contact = await this.client.getContactByReferenceCode(code);
                            this.contactCache[code] = contact; // Stores either contact profile or null
                            if (contact) {
                                this.log(`Codice Riferimento '${code}' risolto con successo (ID Contatto: ${contact.id}).`, 'success');
                            } else {
                                this.log(`ATTENZIONE: Codice Riferimento '${code}' non trovato in TakeOff CRM.`, 'error');
                            }
                        } catch (err) {
                            this.log(`Errore nella risoluzione del codice '${code}': ${err.message}`, 'error');
                            this.contactCache[code] = null; // Prevent retrying bad requests
                        }
                        await this.delay(50); // slight throttling
                    }
                }
            }

            // 2. Generate schedule cycles for each customer row
            this.excelData.forEach(row => {
                const rawContactId = map.customerCode ? String(row[map.customerCode] || '').trim() : '';
                const referenceCode = map.referenceCode ? String(row[map.referenceCode] || '').trim() : '';
                const clientName = String(row[map.customerName] || '').trim();
                const recCode = String(row[map.recurrence] || '').trim().toUpperCase();

                if ((!rawContactId && !referenceCode) || !clientName || !recCode) return; // skip empty rows

                // Translate Recurrence code
                let monthsFrequency = 0;
                let recLabel = '';
                switch (recCode) {
                    case 'M': monthsFrequency = 1; recLabel = 'Mensile'; break;
                    case 'B': monthsFrequency = 2; recLabel = 'Bimestrale'; break;
                    case 'T': monthsFrequency = 3; recLabel = 'Trimestrale'; break;
                    case 'S': monthsFrequency = 6; recLabel = 'Semestrale'; break;
                    case 'A': monthsFrequency = 12; recLabel = 'Annuale'; break;
                    default:
                        this.log(`Riga ignorata: ricorrenza '${recCode}' non riconosciuta per il cliente '${clientName}'.`, 'error');
                        return;
                }

                // Resolve contact details
                let contactId = null;
                let contactResolved = null;
                let referenceCodeUsed = null;

                if (rawContactId) {
                    contactId = parseInt(rawContactId);
                }

                if (referenceCode) {
                    referenceCodeUsed = referenceCode;
                    const cachedContact = this.contactCache[referenceCode];
                    if (cachedContact) {
                        contactId = cachedContact.id;
                        contactResolved = true;
                    } else {
                        contactResolved = false;
                        if (!contactId && rawContactId) {
                            contactId = parseInt(rawContactId);
                        }
                    }
                }

                // Loop and generate cycles within the requested total duration
                for (let i = 0; i < this.durationMonths; i += monthsFrequency) {
                    
                    // 1. Activation Date (startValidityDate)
                    const startValidityDate = this.addMonths(baseStartDate, i);
                    
                    // 2. Planning Month (Last month of current cycle)
                    const planningMonthStart = this.addMonths(baseStartDate, i + (monthsFrequency - 1));
                    
                    // Check bounds
                    if (i >= this.durationMonths) break;

                    // 3. plannedStart = 1st day of the last month of cycle
                    const plannedStart = new Date(planningMonthStart.getFullYear(), planningMonthStart.getMonth(), 1);
                    
                    // 4. plannedEnd = Last day of the last month of cycle
                    const plannedEnd = new Date(planningMonthStart.getFullYear(), planningMonthStart.getMonth() + 1, 0);

                    // Check overall schedule boundaries (defensive check)
                    const limitDate = this.addMonths(baseStartDate, this.durationMonths);
                    if (startValidityDate >= limitDate) break;

                    // Format variables for templates
                    const formattedActDate = startValidityDate.toLocaleDateString('it-IT');
                    const variables = {
                        '{cliente}': clientName,
                        '{codice}': contactId || (referenceCode ? `REF:${referenceCode}` : 'N/D'),
                        '{ricorrenza}': recLabel,
                        '{data_attivazione}': formattedActDate
                    };

                    // Compile Title & Description
                    let title = titleTemplate;
                    let desc = descTemplate;
                    for (const [key, val] of Object.entries(variables)) {
                        title = title.replaceAll(key, val);
                        desc = desc.replaceAll(key, val);
                    }

                    tasks.push({
                        index: tasks.length,
                        contactId: contactId,
                        clientName: clientName,
                        recurrence: recCode,
                        recurrenceLabel: recLabel,
                        startValidityDate: new Date(startValidityDate),
                        plannedStart: plannedStart,
                        plannedEnd: plannedEnd,
                        title: title,
                        description: desc,
                        selected: contactId ? true : false, // Deselect automatically if contact is not resolved
                        referenceCodeUsed: referenceCodeUsed,
                        contactResolved: contactResolved
                    });
                }
            });

            // Sort chronologically by activation date
            tasks.sort((a, b) => a.startValidityDate - b.startValidityDate);
            
            // Re-assign indexes
            tasks.forEach((t, i) => t.index = i);

            this.generatedTasks = tasks;
            this.filteredTasks = [...tasks];

            this.renderPreviewTable();
            this.updateStats();

            document.getElementById('schedule-preview-area').classList.remove('hidden');
            this.log(`Scadenziario generato: calcolati ${tasks.length} task complessivi.`, 'success');
        } catch (error) {
            console.error(error);
            alert(`Errore nella generazione dello scadenziario: ${error.message}`);
        } finally {
            btn.disabled = false;
            btn.innerHTML = originalText;
        }
    },

    addMonths(date, months) {
        const result = new Date(date);
        // Correct overflow issues by locking to day 1 first, adding months, then restoring target day
        const targetDay = date.getDate();
        result.setDate(1);
        result.setMonth(result.getMonth() + months);
        
        // Restoring target day, adjusting for shorter months
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
        const d = String(date.getDate()).padStart(2, '0');
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const y = date.getFullYear();
        return `${d}/${m}/${y}`;
    },

    formatDateTimeInput(date) {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        const hh = String(date.getHours()).padStart(2, '0');
        const mm = String(date.getMinutes()).padStart(2, '0');
        return `${y}-${m}-${d}T${hh}:${mm}`;
    },

    /**
     * 7. Interactive Schedule Preview Panel
     */
    renderPreviewTable() {
        const tbody = document.getElementById('schedule-table-body');
        tbody.innerHTML = '';

        if (this.filteredTasks.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 24px; color: var(--text-muted);">Nessuna scadenza corrisponde alla ricerca.</td></tr>`;
            return;
        }

        this.filteredTasks.forEach(task => {
            const tr = document.createElement('tr');
            tr.id = `task-row-${task.index}`;
            
            let rowClasses = [];
            if (!task.selected) {
                rowClasses.push('row-excluded');
            }
            if (task.referenceCodeUsed && task.contactResolved === false) {
                rowClasses.push('row-warning-contact');
            }
            if (rowClasses.length > 0) {
                tr.className = rowClasses.join(' ');
            }

            const formattedAct = this.formatDateLabel(task.startValidityDate);
            const rangeStr = `${this.formatDateLabel(task.plannedStart)} – ${this.formatDateLabel(task.plannedEnd)}`;

            let clientColContent = `${task.clientName}`;
            if (task.referenceCodeUsed) {
                if (task.contactResolved) {
                    clientColContent += `
                        <span>Rif: <strong>${task.referenceCodeUsed}</strong></span>
                        <span>ID Cliente: ${task.contactId}</span>
                    `;
                } else {
                    clientColContent += `
                        <span>Rif: <strong>${task.referenceCodeUsed}</strong></span>
                        <span class="warning-badge"><i class="fa-solid fa-triangle-exclamation"></i> Cliente non trovato in TakeOff</span>
                    `;
                }
            } else {
                clientColContent += `<span>ID Cliente: ${task.contactId}</span>`;
            }

            const checkboxDisabled = !task.contactId ? 'disabled' : '';

            tr.innerHTML = `
                <td class="col-select">
                    <input type="checkbox" data-index="${task.index}" ${task.selected ? 'checked' : ''} ${checkboxDisabled} class="task-select-checkbox">
                </td>
                <td class="col-client">
                    ${clientColContent}
                </td>
                <td class="col-badge">
                    <span class="freq-badge freq-${task.recurrence}">${task.recurrence}</span>
                </td>
                <td class="col-date">${formattedAct}</td>
                <td class="col-range">${rangeStr}</td>
                <td class="col-title">${task.title}</td>
                <td class="col-actions">
                    <button type="button" class="btn-icon btn-edit-task" data-index="${task.index}" title="Modifica task">
                        <i class="fa-solid fa-pen-to-square"></i>
                    </button>
                </td>
            `;

            // Bind Toggle Select Individual
            if (task.contactId) {
                tr.querySelector('.task-select-checkbox').addEventListener('change', (e) => {
                    this.toggleTaskSelection(task.index, e.target.checked);
                });
            }

            // Bind Edit Single task
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
        this.generatedTasks.forEach(t => {
            if (t.contactId) t.selected = isChecked;
            else t.selected = false;
        });
        this.filteredTasks.forEach(t => {
            if (t.contactId) t.selected = isChecked;
            else t.selected = false;
        });
        
        const checkboxes = document.querySelectorAll('.task-select-checkbox:not([disabled])');
        checkboxes.forEach(c => c.checked = isChecked);

        const rows = document.querySelectorAll('#schedule-table-body tr');
        rows.forEach(r => {
            if (r.id.startsWith('task-row-')) {
                const index = parseInt(r.id.replace('task-row-', ''));
                const task = this.generatedTasks[index];
                if (task) {
                    if (task.selected) r.classList.remove('row-excluded');
                    else r.classList.add('row-excluded');
                }
            }
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
                (t.contactId && String(t.contactId).includes(q)) ||
                (t.referenceCodeUsed && t.referenceCodeUsed.toLowerCase().includes(q)) ||
                t.title.toLowerCase().includes(q)
            );
        }
        this.renderPreviewTable();
    },

    updateStats() {
        const total = this.generatedTasks.length;
        const selected = this.generatedTasks.filter(t => t.selected).length;

        document.getElementById('stats-total-tasks').textContent = total;
        document.getElementById('stats-selected-tasks').textContent = selected;
        
        const selectAllCheckbox = document.getElementById('select-all-tasks');
        if (total > 0 && selected === total) {
            selectAllCheckbox.checked = true;
            selectAllCheckbox.indeterminate = false;
        } else if (selected > 0 && selected < total) {
            selectAllCheckbox.checked = false;
            selectAllCheckbox.indeterminate = true;
        } else {
            selectAllCheckbox.checked = false;
            selectAllCheckbox.indeterminate = false;
        }

        const btnBulk = document.getElementById('btn-bulk-create');
        if (selected === 0) {
            btnBulk.disabled = true;
            btnBulk.style.opacity = 0.5;
        } else {
            btnBulk.disabled = false;
            btnBulk.style.opacity = 1;
        }
    },

    /**
     * 8. Edit Individual Task Modal
     */
    openEditModal(index) {
        const task = this.generatedTasks[index];
        document.getElementById('edit-task-index').value = index;
        document.getElementById('edit-task-title').value = task.title;
        
        // Formats for HTML Inputs
        document.getElementById('edit-task-activation').value = this.formatDateTimeInput(task.startValidityDate);
        document.getElementById('edit-task-planned-start').value = this.formatDateIso(task.plannedStart);
        document.getElementById('edit-task-planned-end').value = this.formatDateIso(task.plannedEnd);

        document.getElementById('edit-task-modal').classList.remove('hidden');
    },

    closeEditModal() {
        document.getElementById('edit-task-modal').classList.add('hidden');
    },

    saveIndividualTaskEdit() {
        const index = parseInt(document.getElementById('edit-task-index').value);
        const task = this.generatedTasks[index];

        task.title = document.getElementById('edit-task-title').value;
        task.startValidityDate = new Date(document.getElementById('edit-task-activation').value);
        task.plannedStart = new Date(document.getElementById('edit-task-planned-start').value);
        task.plannedEnd = new Date(document.getElementById('edit-task-planned-end').value);

        this.renderPreviewTable();
        this.closeEditModal();
        this.log(`Task #${index + 1} per il cliente '${task.clientName}' modificato manualmente.`, 'info');
    },

    /**
     * 9. Throttled Bulk Creation Engine
     */
    async startBulkCreation() {
        const tasksToCreate = this.generatedTasks.filter(t => t.selected);
        if (tasksToCreate.length === 0) return;

        // Global Configurations
        const taskTypeId = document.getElementById('select-task-type').value;
        const statusId = document.getElementById('select-task-status').value;
        const assigneeId = document.getElementById('select-assignee').value;
        const priority = parseInt(document.getElementById('select-priority').value);
        const important = document.getElementById('input-important').checked;

        if (!taskTypeId || !statusId) {
            alert("Per favore seleziona il Tipo Task e lo Stato Iniziale prima di procedere.");
            return;
        }

        // Initialize progress UI
        this.isExecuting = true;
        this.cancelExecution = false;
        
        this.stats = {
            success: 0,
            failure: 0,
            total: tasksToCreate.length,
            processed: 0
        };

        // Reset Modal Values
        document.getElementById('progress-ratio').textContent = `0 / ${this.stats.total}`;
        document.getElementById('progress-bar-fill').style.width = '0%';
        document.getElementById('stats-success-count').textContent = '0';
        document.getElementById('stats-failure-count').textContent = '0';
        document.getElementById('stats-percent').textContent = '0%';

        document.getElementById('btn-stop-execution').classList.remove('hidden');
        document.getElementById('btn-close-progress').classList.add('hidden');
        document.getElementById('progress-modal').classList.remove('hidden');

        this.clearConsole();
        this.log(`Inizio della creazione massiva di ${this.stats.total} task...`, 'info');

        // Queue preparation
        const queue = [...tasksToCreate];
        
        // Build worker parameters
        const workerParams = {
            taskTypeId: parseInt(taskTypeId),
            statusId: parseInt(statusId),
            assigneeId: assigneeId ? parseInt(assigneeId) : null,
            priority: priority,
            important: important
        };

        // Spawn Parallel workers (e.g. concurrency = 2)
        const concurrency = 2;
        const workerPromises = [];
        this.activeWorkersCount = concurrency;

        for (let w = 0; w < concurrency; w++) {
            workerPromises.push(this.runWorker(queue, workerParams));
        }

        // Wait for all workers to finish
        await Promise.all(workerPromises);

        this.isExecuting = false;
        document.getElementById('btn-stop-execution').classList.add('hidden');
        document.getElementById('btn-close-progress').classList.remove('hidden');

        if (this.cancelExecution) {
            this.log(`Processo interrotto dall'utente. Creati: ${this.stats.success}, Errori: ${this.stats.failure}.`, 'warning');
        } else {
            this.log(`Processo completato! Task creati correttamente: ${this.stats.success}, Errori: ${this.stats.failure}.`, 'success');
            alert(`Bulk creation completata!\nSuccessi: ${this.stats.success}\nErrori: ${this.stats.failure}`);
        }
    },

    async runWorker(queue, params) {
        while (queue.length > 0 && !this.cancelExecution) {
            const task = queue.shift();
            if (!task) break;

            try {
                if (!task.contactId) {
                    throw new Error("ID Cliente non valido o mancante (ReferenceCode non risolto).");
                }
                // Construct standard TaskRequestDto payload
                const payload = {
                    name: task.title,
                    description: task.description,
                    taskTypeId: params.taskTypeId,
                    statusId: params.statusId,
                    contactId: task.contactId,
                    important: params.important,
                    priority: params.priority,
                    
                    // Validity and Scheduling calculations mapped correctly to the DTO
                    taskValidityType: 10, // 10 = ValidityDate ("Válido a partir de fecha")
                    startValidityDate: task.startValidityDate.toISOString(), // Activation Date
                    plannedStart: task.plannedStart.toISOString(), // Beginning of last month
                    plannedEnd: task.plannedEnd.toISOString() // End of last month
                };

                if (params.assigneeId) {
                    payload.assignedEntityIds = [`user_${params.assigneeId}`]; // Typical CRM entity format or similar
                    payload.creatorUserId = this.connectedUser.id;
                }

                // API call
                await this.client.createTask(payload);
                
                this.stats.success++;
                this.log(`SUCCESS [Cliente ID: ${task.contactId} - ${task.clientName}] Task '${task.title}' creato con successo.`, 'success');
            } catch (err) {
                this.stats.failure++;
                this.log(`ERROR [Cliente ID: ${task.contactId} - ${task.clientName}] Impossibile creare il task: ${err.message}`, 'error');
            } finally {
                this.stats.processed++;
                this.updateProgressUi();
            }

            // Throttling delay (e.g., 180ms to prevent server overhead and rate limits)
            await this.delay(180);
        }
        this.activeWorkersCount--;
    },

    stopBulkExecution() {
        this.cancelExecution = true;
        this.log("Invio comando di interruzione del processo...", "warning");
        document.getElementById('btn-stop-execution').classList.add('hidden');
    },

    updateProgressUi() {
        const total = this.stats.total;
        const processed = this.stats.processed;
        const percent = Math.round((processed / total) * 100);

        document.getElementById('progress-ratio').textContent = `${processed} / ${total}`;
        document.getElementById('progress-bar-fill').style.width = `${percent}%`;
        document.getElementById('stats-success-count').textContent = this.stats.success;
        document.getElementById('stats-failure-count').textContent = this.stats.failure;
        document.getElementById('stats-percent').textContent = `${percent}%`;
    },

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
};

// Start application on page load
window.addEventListener('DOMContentLoaded', () => App.init());
