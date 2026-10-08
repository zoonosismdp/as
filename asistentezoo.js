const chatBody = document.getElementById('chatBody');
const msgInput = document.getElementById('msgInput');
const sendBtn = document.getElementById('sendBtn');

let currentState = 'MAIN_MENU';

const ZOOBASE_API_URL = "https://script.google.com/macros/s/AKfycbw4-Js7I6gVtCsUNd_gMXsMKkLkk3I7HDfjed7LDqiFwmfkS7c9OHVVuEFUSNL1fE4ueQ/exec";

let chatbotActivo = true;

const firebaseConfigGestor = {
    apiKey: "BNdkvikO5zi_aksx4pHWLLer73m96z6Vvf9I46fpepynP9bMdUfDM-53qjUHnCnl84nWF-wNUjLgscL8Lie6Rok",
    authDomain: "zoobase-14159.firebaseapp.com",
    projectId: "zoobase-14159",
    storageBucket: "zoobase-14159.appspot.com",
    messagingSenderId: "146527380127",
    appId: "1:146527380127:web:zoobase"
};

// Inicializamos la app con nombre 'gestorZoonosis'
const appGestor = firebase.initializeApp(firebaseConfigGestor, "gestorZoonosis");
const dbGestor = appGestor.firestore();

function setChatbotUIState(isActive) {
    const msgInput = document.getElementById('msgInput');
    const sendBtn = document.getElementById('sendBtn');
    const headerStatusText = document.getElementById('headerStatusText');
    const avatarStatusDot = document.getElementById('avatarStatusDot');

    if (isActive) {
        if (msgInput) msgInput.disabled = false;
        if (sendBtn) sendBtn.disabled = false;
        if (msgInput) msgInput.placeholder = "Escribe tu consulta...";
        if (headerStatusText) {
            headerStatusText.innerHTML = '<i class="fa-solid fa-bolt text-yellow-400 text-[10px]"></i> En línea';
        }
        if (avatarStatusDot) {
            avatarStatusDot.className = "absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-slate-800 rounded-full";
        }
    } else {
        if (msgInput) msgInput.disabled = true;
        if (sendBtn) sendBtn.disabled = true;
        if (msgInput) msgInput.placeholder = "Asistente inactivo momentáneamente.";
        if (headerStatusText) {
            headerStatusText.innerHTML = '<i class="fa-solid fa-ban text-red-500 text-[10px]"></i> Fuera de línea';
        }
        if (avatarStatusDot) {
            avatarStatusDot.className = "absolute bottom-0 right-0 w-3.5 h-3.5 bg-red-500 border-2 border-slate-800 rounded-full";
        }
    }
}

// Escuchar cambios en vivo
dbGestor.collection('asistente_virtual').doc('configuracion').onSnapshot((doc) => {
    if (doc.exists) {
        chatbotActivo = doc.data().estado;
        setChatbotUIState(chatbotActivo);

        if (chatbotActivo === true) {
            console.log("🟢 El Asistente está ENCENDIDO en el Gestor.");
            if (chatBody.innerHTML.includes("momentáneamente fuera de servicio")) {
                chatBody.innerHTML = '';
                appendMessage(getMenuText(), 'received', true);
            }
        } else {
            console.log("🔴 El Asistente está APAGADO en el Gestor.");
            chatBody.innerHTML = '';
            let offlineMessage = `<div class="bg-red-50 text-red-700 p-3 rounded-xl border border-red-200 text-sm mb-4"><i class="fa-solid fa-triangle-exclamation mr-2"></i>El Asistente Virtual se encuentra momentáneamente fuera de servicio.<br><br><b>Disculpe las molestias.</b></div>`;
            offlineMessage += `
<div class="font-black text-emerald-700 flex items-center gap-2 mb-4 text-lg"><i class="fa-solid fa-headset"></i> MESA DE AYUDA</div>
<div class="space-y-3">
  <a href="https://wa.me/5492235280718?text=hola" target="_blank" class="animate-pulse relative flex items-center gap-3 p-4 bg-emerald-50 border-2 border-emerald-400 hover:bg-emerald-100 rounded-2xl transition shadow-md group overflow-hidden">
    <div class="absolute -right-4 -top-4 opacity-10"><i class="fa-brands fa-whatsapp text-6xl text-emerald-600"></i></div>
    <div class="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center text-2xl shadow-sm z-10"><i class="fa-brands fa-whatsapp"></i></div>
    <div class="z-10">
      <div class="text-sm font-black text-emerald-900 flex items-center gap-1">Chatbot Zoonosis <span class="bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-full animate-bounce">24/7</span></div>
      <div class="text-xs text-emerald-700 font-medium">Atención virtual inmediata</div>
    </div>
  </a>
  <a href="https://api.whatsapp.com/send/?phone=5492233452651&text=Hola,+quisiera+realizar+una+consulta.&type=phone_number&app_absent=0" target="_blank" class="flex items-center gap-3 p-4 bg-white border border-slate-200 hover:border-emerald-300 hover:bg-slate-50 rounded-2xl transition shadow-sm group relative overflow-hidden">
    <div class="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xl z-10"><i class="fa-brands fa-whatsapp"></i></div>
    <div class="z-10">
      <div class="text-sm font-bold text-slate-800">Municipalidad Gral. Pueyrredon</div>
      <div class="text-xs text-slate-500">Soporte municipal</div>
    </div>
  </a>
</div>`;
            appendMessage(offlineMessage, 'received', true);
        }
    }
});

// Funciones para el Modal del Mapa
function openMapModal(url, title) {
    document.getElementById('mapModalTitle').innerText = title;
    document.getElementById('mapModalIframe').src = url;
    document.getElementById('mapModal').classList.remove('hidden');
    document.getElementById('mapModal').classList.add('flex');
}

function closeMapModal() {
    document.getElementById('mapModal').classList.add('hidden');
    document.getElementById('mapModal').classList.remove('flex');
    document.getElementById('mapModalIframe').src = '';
}

function appendMessage(content, type, isHtml = false) {
    const el = document.createElement('div');
    el.className = `msg-container ${type === 'received' ? 'msg-received' : 'msg-sent'}`;

    const bubble = document.createElement('div');
    bubble.className = `msg-bubble ${type === 'received' ? 'msg-bubble-received' : 'msg-bubble-sent'} message relative`;

    const contentDiv = document.createElement('div');
    contentDiv.className = 'mb-3'; // Margen extra para que no pise la hora
    if (isHtml) {
        contentDiv.innerHTML = content;
    } else {
        contentDiv.innerText = content;
    }
    bubble.appendChild(contentDiv);

    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const timeDiv = document.createElement('div');
    timeDiv.className = 'text-[10px] text-slate-400 absolute bottom-1 right-2 flex items-center gap-1 leading-none';

    if (type === 'sent') {
        timeDiv.innerHTML = `${timeString} <i class="fa-solid fa-check-double text-sky-500"></i>`;
    } else {
        timeDiv.innerHTML = `${timeString}`;
    }

    bubble.appendChild(timeDiv);

    el.appendChild(bubble);
    chatBody.appendChild(el);

    // Mejor scroll: si el mensaje es del bot, que scrollee hasta el inicio del mensaje
    // para que no quede la información cortada arriba si el texto es muy largo.
    if (type === 'received') {
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
    } else {
        chatBody.scrollTop = chatBody.scrollHeight;
    }
}

function showTyping() {
    const el = document.createElement('div');
    el.className = 'msg-container msg-received';
    const bubble = document.createElement('div');
    bubble.className = 'msg-bubble msg-bubble-received message';
    bubble.innerHTML = '<div class="typing-dots"><span></span><span></span><span></span></div>';

    el.appendChild(bubble);
    chatBody.appendChild(el);
    chatBody.scrollTop = chatBody.scrollHeight;
    return el;
}

function getMenuText(isReturning = false) {
    const hour = new Date().getHours();
    let saludo = "Buenas noches";
    if (hour >= 5 && hour < 12) saludo = "Buenos días";
    else if (hour >= 12 && hour < 20) saludo = "Buenas tardes";

    const greetingHtml = isReturning
        ? `<div class="mb-3 text-slate-800 font-medium">Te muestro las opciones nuevamente:</div>`
        : `<div class="mb-3 text-slate-800">¡${saludo}! 👋 Soy el <strong>Asistente Virtual de Zoonosis</strong>.</div>
           <div class="text-xs text-slate-500 font-bold uppercase tracking-wider mb-3">Seleccioná una categoría:</div>`;

    return `
    ${greetingHtml}
    <div class="flex flex-col gap-3">
      <button onclick="sendOption('Consultar por gestión de turno castración en SEDE', '1');" class="text-left p-4 rounded-2xl border-2 border-pink-100 bg-white hover:border-pink-400 hover:bg-pink-50 transition-all flex items-center gap-4 group shadow-md relative overflow-hidden">
        <div class="absolute right-[-10px] top-[10px] opacity-5"><i class="fa-solid fa-stethoscope text-6xl text-pink-500"></i></div>
        <div class="w-12 h-12 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center group-hover:scale-110 transition shrink-0 z-10"><i class="fa-solid fa-calendar-check text-xl"></i></div>
        <div class="z-10"><div class="text-base font-black text-slate-800 group-hover:text-pink-700 transition leading-tight">Consultar por gestión de turno castración en SEDE</div><div class="text-[11px] font-medium text-slate-500 leading-tight mt-1">Requisitos, cuidados postoperatorios y lugares de registro.</div></div>
      </button>
      
      <button onclick="sendOption('Ver Cronograma Móviles', 'B');" class="text-left p-4 rounded-2xl border-2 border-violet-100 bg-white hover:border-violet-400 hover:bg-violet-50 transition-all flex items-center gap-4 group shadow-md relative overflow-hidden">
        <div class="absolute right-[-10px] top-[10px] opacity-5"><i class="fa-solid fa-truck-medical text-6xl text-violet-500"></i></div>
        <div class="w-12 h-12 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center group-hover:scale-110 transition shrink-0 z-10"><i class="fa-solid fa-truck-medical text-xl"></i></div>
        <div class="z-10"><div class="text-base font-black text-slate-800 group-hover:text-violet-700 transition leading-tight">Ver Cronograma Móviles</div><div class="text-[11px] font-medium text-slate-500 leading-tight mt-1">Fechas y barrios donde se ubican los quirófanos.</div></div>
      </button>
      
      <button onclick="sendOption('Mesa de Ayuda', '2');" class="text-left p-4 rounded-2xl border-2 border-emerald-100 bg-white hover:border-emerald-400 hover:bg-emerald-50 transition-all flex items-center gap-4 group shadow-md relative overflow-hidden">
        <div class="absolute right-[-10px] top-[10px] opacity-5"><i class="fa-solid fa-headset text-6xl text-emerald-500"></i></div>
        <div class="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition shrink-0 z-10"><i class="fa-brands fa-whatsapp text-xl"></i></div>
        <div class="z-10"><div class="text-base font-black text-slate-800 group-hover:text-emerald-700 transition">Mesa de Ayuda</div><div class="text-[11px] font-medium text-slate-500 leading-tight mt-1">Contactá directamente con operadores o atención ciudadana.</div></div>
      </button>
    </div>`;
}

function getVolverBtn() {
    return `<button onclick="sendOption('Volver al Menú Principal', '0');" class="mt-4 w-full py-2.5 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold hover:bg-slate-200 transition flex items-center justify-center gap-2 border border-slate-200"><i class="fa-solid fa-arrow-rotate-left"></i> Volver al Menú Principal</button>`;
}

async function fetchCronograma() {
    let isFetched = false;

    const waitTimer = setTimeout(() => {
        if (!isFetched) {
            appendMessage(`<div class="text-[13px] text-slate-700 font-medium"><i class="fa-solid fa-clock text-violet-500 mr-2 animate-pulse"></i>Aguarde un momento más, buscando cronograma de móviles...</div>`, 'received', true);
            const typings = document.querySelectorAll('.typing-dots');
            typings.forEach(t => {
                const container = t.closest('.msg-container');
                if (container) chatBody.appendChild(container);
            });
            chatBody.scrollTop = chatBody.scrollHeight;
        }
    }, 2000);

    try {
        const resp = await fetch(ZOOBASE_API_URL, { method: 'GET', mode: 'cors' });
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
        const data = await resp.json();

        if (data && data.status === 'success' && data.cronograma && data.cronograma.bloques.length > 0) {
            let mensaje = `<div class="font-black text-violet-700 flex items-center gap-2 mb-3"><i class="fa-solid fa-truck-medical"></i> CRONOGRAMA DE QUIRÓFANOS</div>`;
            mensaje += `<div class="space-y-3">`;
            data.cronograma.bloques.forEach(bloque => {
                mensaje += `<div class="bg-violet-50 border border-violet-100 rounded-xl p-3">
                              <div class="text-xs font-bold uppercase text-violet-800 mb-2 border-b border-violet-200 pb-1">${bloque.periodo}</div>`;
                bloque.sedes.forEach(sede => {
                    let locationQuery = sede.nombre.toLowerCase().includes('batan') || sede.nombre.toLowerCase().includes('batán')
                        ? sede.nombre + ', Batán'
                        : sede.nombre + ', Mar del Plata';
                    let transitUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(locationQuery)}&travelmode=transit`;
                    mensaje += `
                    <div class="mb-2 last:mb-0">
                      <div class="font-bold text-slate-800 text-sm"><i class="fa-solid fa-location-dot text-violet-500 mr-1"></i> ${sede.nombre}</div>
                      ${sede.detalle ? `<div class="text-[11px] text-slate-500 my-0.5 ml-4">${sede.detalle}</div>` : ''}
                      <button onclick="window.open('${transitUrl}', '_blank')" class="text-[10px] ml-4 font-bold text-sky-600 hover:text-sky-800 hover:bg-sky-100 transition flex items-center gap-1 mt-1 bg-sky-50 px-2 py-1 rounded-lg border border-sky-200"><i class="fa-solid fa-map"></i> Cómo llegar (Colectivos)</button>
                    </div>`;
                });
                mensaje += `</div>`;
            });
            mensaje += `</div>`;
            mensaje += `<div class="text-[10px] text-slate-500 mt-3 text-center bg-slate-50 p-2 rounded-lg"><i class="fa-solid fa-circle-info mr-1"></i> Los móviles operan sin turno previo por orden de llegada.</div>`;
            mensaje += getVolverBtn();
            return { text: mensaje, html: true };
        } else {
            return { text: `<div class="text-center p-3"><i class="fa-solid fa-calendar-xmark text-3xl text-slate-300 mb-2"></i><br><b>No hay cronogramas activos</b><br><span class="text-xs text-slate-500">Por el momento no hay fechas disponibles.</span></div>` + getVolverBtn(), html: true };
        }
    } catch (error) {
        return { text: `<div class="bg-red-50 text-red-700 p-3 rounded-xl border border-red-200 text-sm"><i class="fa-solid fa-triangle-exclamation mr-2"></i>Hubo un error al conectar. Por favor, revisá mardelplata.gob.ar/quirofanobarriosweb.</div>` + getVolverBtn(), html: true };
    } finally {
        isFetched = true;
        clearTimeout(waitTimer);
    }
}

async function getBotResponse(userMsg) {
    let msg = userMsg.trim().toUpperCase();

    if (msg === '0') {
        currentState = 'MAIN_MENU';
        return { text: getMenuText(true), html: true };
    }

    // Indexación de palabras clave para consultas en texto libre
    if (msg.length > 2) {
        const textNormalizado = msg.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();

        const keywordIndex = [
            // Prioridad alta: temas específicos
            { code: 'A3', state: 'SUBMENU_SACAR_TURNO', keys: ['VIDEO', 'TUTORIAL', 'YOUTUBE'] },
            { code: 'C', state: 'SUBMENU_TURNOS', keys: ['REQUISITO', 'AYUNO', 'PREVIO', 'ANTES'] },
            { code: 'D', state: 'SUBMENU_TURNOS', keys: ['POSTOPERATORIO', 'CUIDADO', 'MEDICACION', 'SUTURA', 'PUNTO', 'DESPUES'] },
            { code: 'B', state: 'SUBMENU_TURNOS', keys: ['CRONOGRAMA', 'MOVIL', 'BARRIO', 'FECHA', 'CALENDARIO'] },
            { code: 'E', state: 'SUBMENU_TURNOS', keys: ['REGISTRO', 'POLIDEPORTIVO', 'MDQ', 'CUENTA'] },
            { code: 'F', state: 'SUBMENU_TURNOS', keys: ['CONSENTIMIENTO', 'QUIRURGICO', 'FIRMA', 'PDF', 'PLANILLA'] },
            { code: 'A', state: 'SUBMENU_TURNOS', keys: ['SACAR', 'PEDIR', 'NUEVO', 'SOLICITAR', 'RESERVAR'] },
            { code: '2', state: 'MAIN_MENU', keys: ['CONTACTO', 'TELEFONO', 'WHATSAPP', 'AYUDA', 'OPERADOR', 'HUMANO', 'PROBLEMA', 'MESA'] },
            { code: '1', state: 'MAIN_MENU', keys: ['TURNO', 'CASTRACION', 'CASTRAR', 'PERRO', 'GATO', 'MASCOTA'] }
        ];

        let matched = false;
        for (let item of keywordIndex) {
            if (item.keys.some(key => textNormalizado.includes(key))) {
                msg = item.code;
                currentState = item.state;
                matched = true;
                break;
            }
        }

        // Si escribe un texto largo y no coincide nada, se notifica y se vuelve al menú
        if (!matched && !['0', '1', '2', 'A', 'B', 'C', 'D', 'E', 'F', 'A1', 'A2', 'A3'].includes(msg)) {
            return { text: `<div class="bg-amber-50 text-amber-700 p-3 rounded-xl border border-amber-200 text-sm"><i class="fa-solid fa-circle-question mr-2"></i>No encontré información exacta sobre eso. Por favor, seleccioná una de las opciones del menú:</div>` + getMenuText(), html: true };
        }
    }

    // Auto-corrección de estado para botones de historial
    const validCodes = {
        '1': 'MAIN_MENU',
        '2': 'MAIN_MENU',
        'A': 'SUBMENU_TURNOS',
        'B': 'SUBMENU_TURNOS',
        'C': 'SUBMENU_TURNOS',
        'D': 'SUBMENU_TURNOS',
        'E': 'SUBMENU_TURNOS',
        'F': 'SUBMENU_TURNOS',
        'A1': 'SUBMENU_SACAR_TURNO',
        'A2': 'SUBMENU_SACAR_TURNO',
        'A3': 'SUBMENU_SACAR_TURNO'
    };

    if (validCodes[msg]) {
        currentState = validCodes[msg];
    }

    if (currentState === 'MAIN_MENU') {
        switch (msg) {
            case '1':
                currentState = 'SUBMENU_TURNOS';
                return {
                    text: `
    <div class="font-black text-pink-700 flex items-center gap-2 mb-3"><i class="fa-solid fa-stethoscope text-lg"></i> CONSULTAS DE TURNOS</div>
    <div class="flex flex-col gap-2">
      <button onclick="sendOption('Sacar Turno Castración', 'A');" class="text-left p-2.5 rounded-xl border border-slate-200 bg-white hover:border-pink-400 hover:bg-pink-50 transition-all flex items-center gap-3 shadow-sm">
        <div class="w-8 h-8 rounded-lg bg-pink-100 text-pink-600 flex items-center justify-center"><i class="fa-solid fa-scissors"></i></div>
        <div class="text-[13px] font-bold text-slate-800">Sacar Turno Castración</div>
      </button>
      <button onclick="sendOption('Requisitos y Ayuno', 'C');" class="text-left p-2.5 rounded-xl border border-slate-200 bg-white hover:border-amber-400 hover:bg-amber-50 transition-all flex items-center gap-3 shadow-sm">
        <div class="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center"><i class="fa-solid fa-triangle-exclamation"></i></div>
        <div class="text-[13px] font-bold text-slate-800">Requisitos y Ayuno</div>
      </button>
      <button onclick="sendOption('Cuidados Postoperatorios', 'D');" class="text-left p-2.5 rounded-xl border border-slate-200 bg-white hover:border-red-400 hover:bg-red-50 transition-all flex items-center gap-3 shadow-sm">
        <div class="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center"><i class="fa-solid fa-heart-pulse"></i></div>
        <div class="text-[13px] font-bold text-slate-800">Cuidados Postoperatorios</div>
      </button>
      <button onclick="sendOption('Consentimientos Quirúrgicos', 'F');" class="text-left p-2.5 rounded-xl border border-slate-200 bg-white hover:border-orange-400 hover:bg-orange-50 transition-all flex items-center gap-3 shadow-sm">
        <div class="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center"><i class="fa-solid fa-file-signature"></i></div>
        <div class="text-[13px] font-bold text-slate-800">Consentimientos Quirúrgicos</div>
      </button>
    </div>
${getVolverBtn()}`, html: true
                };

            case '2':
                return {
                    text: `
<div class="font-black text-emerald-700 flex items-center gap-2 mb-4 text-lg"><i class="fa-solid fa-headset"></i> MESA DE AYUDA</div>
<div class="space-y-3">
  <a href="https://wa.me/5492235280718?text=hola" target="_blank" class="animate-pulse relative flex items-center gap-3 p-4 bg-emerald-50 border-2 border-emerald-400 hover:bg-emerald-100 rounded-2xl transition shadow-md group overflow-hidden">
    <div class="absolute -right-4 -top-4 opacity-10"><i class="fa-brands fa-whatsapp text-6xl text-emerald-600"></i></div>
    <div class="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center text-2xl shadow-sm z-10"><i class="fa-brands fa-whatsapp"></i></div>
    <div class="z-10">
      <div class="text-sm font-black text-emerald-900 flex items-center gap-1">Chatbot Zoonosis <span class="bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-full animate-bounce">24/7</span></div>
      <div class="text-xs text-emerald-700 font-medium">Atención virtual inmediata</div>
    </div>
  </a>
  <a href="https://api.whatsapp.com/send/?phone=5492233452651&text=Hola,+quisiera+realizar+una+consulta.&type=phone_number&app_absent=0" target="_blank" class="flex items-center gap-3 p-4 bg-white border border-slate-200 hover:border-emerald-300 hover:bg-slate-50 rounded-2xl transition shadow-sm group relative overflow-hidden">
    <div class="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xl z-10"><i class="fa-brands fa-whatsapp"></i></div>
    <div class="z-10">
      <div class="text-sm font-bold text-slate-800">Municipalidad Gral. Pueyrredon</div>
      <div class="text-xs text-slate-500">Soporte municipal</div>
    </div>
  </a>
</div>
${getVolverBtn()}`, html: true
                };

            default:
                return { text: `<div class="bg-red-50 text-red-700 p-3 rounded-xl border border-red-200 text-sm"><i class="fa-solid fa-circle-question mr-2"></i>Opción incorrecta.<br>Por favor elige 1 o 2.</div>` + getVolverBtn(), html: true };
        }
    }

    if (currentState === 'SUBMENU_TURNOS') {
        switch (msg) {
            case 'A': // Sacar turno
                currentState = 'SUBMENU_SACAR_TURNO';
                return {
                    text: `
<div class="font-black text-pink-700 flex items-center gap-2 mb-3"><i class="fa-solid fa-calendar-check text-lg"></i> SOLICITUD DE TURNO</div>
<div class="text-sm text-slate-700 mb-3">Para solicitar un turno de castración debés ingresar al portal oficial <strong class="text-brand-navy">MDQ Digital</strong>.</div>
<a href="https://autenticar.mardelplata.gob.ar/" target="_blank" class="block w-full py-3 bg-brand-navy hover:bg-slate-800 text-white text-center rounded-xl font-bold shadow-md transition mb-1">Ingresar al Portal</a>
<div class="text-[11px] text-center text-slate-500 mb-4 break-all"><a href="https://autenticar.mardelplata.gob.ar/" target="_blank" class="hover:underline hover:text-sky-600">https://autenticar.mardelplata.gob.ar/</a></div>
<div class="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">¿Ya tenés usuario?</div>
<div class="flex gap-2">
  <button onclick="sendOption('Sí, ya tengo', 'A1');" class="flex-1 py-2 bg-pink-50 hover:bg-pink-100 text-pink-700 border border-pink-200 rounded-xl font-bold text-xs transition">Sí, ya tengo</button>
  <button onclick="sendOption('Aún no tengo', 'A2');" class="flex-1 py-2 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 rounded-xl font-bold text-xs transition">Aún no tengo</button>
</div>
${getVolverBtn()}`, html: true
                };

            case 'B': // Cronograma
                return await fetchCronograma();

            case 'C': // Requisitos
                return {
                    text: `
<div class="bg-[#fefce8] border border-[#fef08a] rounded-xl p-4 text-[#78350f] text-[13px] leading-snug">
  <div class="font-bold text-[#b45309] flex items-center gap-2 mb-4 text-sm">
    <i class="fa-solid fa-triangle-exclamation"></i> Requisitos obligatorios para la cirugía:
  </div>
  <div class="flex gap-2 items-start mb-3"><i class="fa-solid fa-clock text-[#d97706] mt-0.5"></i><div><strong>Edad y Ayuno:</strong> Los animales deben tener más de 6 meses de edad y cumplir con <strong>12 horas de ayuno sólido y líquido</strong>.</div></div>
  <div class="flex gap-2 items-start mb-3"><i class="fa-solid fa-cat text-[#d97706] mt-0.5"></i><div><strong>Gatos/as:</strong> Trasladar en bolsa de red y/o dentro de un carrier. Las hembras no deben estar preñadas ni amamantando (mínimo 60 días desde el parto).</div></div>
  <div class="flex gap-2 items-start mb-3"><i class="fa-solid fa-dog text-[#d97706] mt-0.5"></i><div><strong>Perros/as:</strong> Concurrir con collar y correa, sujetos en todo momento. Si es raza potencialmente peligrosa, debe asistir con collar, correa y <strong>bozal</strong>.</div></div>
  <div class="flex gap-2 items-start mb-3"><i class="fa-solid fa-bag-shopping text-[#d97706] mt-0.5"></i><div><strong>Elementos a llevar:</strong> Una manta para luego de la operación, rollo de papel de cocina y bolsas de polietileno para la materia fecal.</div></div>
  <div class="flex gap-2 items-start"><i class="fa-solid fa-user-check text-[#d97706] mt-0.5"></i><div><strong>Permanencia:</strong> La persona propietaria/autorizada deberá permanecer en el lugar hasta la entrega del animal y la firma de la planilla.</div></div>
</div>
${getVolverBtn()}`, html: true
                };

            case 'D': // Postoperatorio
                return {
                    text: `
<div class="bg-[#fef2f2] border border-[#fca5a5] rounded-xl p-4 text-[#7f1d1d] text-[13px] leading-snug">
  <div class="font-bold text-[#b91c1c] flex items-center gap-2 mb-3 text-sm border-b border-[#fecaca] pb-2"><i class="fa-solid fa-heart-pulse"></i> Cuidados Postoperatorios</div>
  <div class="space-y-3">
    <div class="flex gap-2 items-start"><i class="fa-solid fa-bed text-[#ef4444] mt-0.5"></i><div><strong>Reposo:</strong> Dejar en lugar cálido, tranquilo y en el piso (sobre manta). Evitar camas/sillones.</div></div>
    <div class="flex gap-2 items-start"><i class="fa-solid fa-shield-cat text-[#ef4444] mt-0.5"></i><div><strong>Protección:</strong> Colocar collar isabelino para evitar que se lama la herida.</div></div>
    <div class="flex gap-2 items-start"><i class="fa-solid fa-bowl-food text-[#ef4444] mt-0.5"></i><div><strong>Alimentación:</strong> Agua de a poco tras 8hs. Comida moderada tras 12hs.</div></div>
    <div class="flex gap-2 items-start"><i class="fa-solid fa-pills text-[#ef4444] mt-0.5"></i><div><strong>Medicación (a las 24hs):</strong><br>• Antibiótico: Cefalexina 500mg (1 comp/20kg c/12hs x 7 días).<br>• Analgésico: Meloxicam 2mg (1 comp/20kg c/24hs x 3 días).</div></div>
    <div class="flex gap-2 items-start"><i class="fa-solid fa-scissors text-[#ef4444] mt-0.5"></i><div><strong>Suturas:</strong> Se retiran a los 12 días. <em>(Gatos machos no llevan puntos).</em></div></div>
  </div>
</div>
${getVolverBtn()}`, html: true
                };

            case 'F': // Consentimientos Quirúrgicos
                return {
                    text: `
<div class="bg-[#fef2f2] border border-[#fca5a5] rounded-xl p-4 text-[#7f1d1d] text-[13px] leading-snug">
  <div class="font-bold text-[#b91c1c] flex items-center gap-2 mb-3 text-sm border-b border-[#fecaca] pb-2"><i class="fa-solid fa-file-signature"></i> Consentimiento Quirúrgico</div>
  <a href="consentimiento-veterinario.pdf" target="_blank" rel="noopener noreferrer" class="w-full flex items-center justify-center gap-2 bg-[#b91c1c] hover:bg-[#991b1b] text-white py-2.5 rounded-xl font-bold text-xs transition shadow-sm border border-[#7f1d1d]"><i class="fa-solid fa-file-pdf text-lg"></i> Leer Consentimiento PDF</a>
</div>
${getVolverBtn()}`, html: true
                };

            case 'E': // Puntos Registro
                return {
                    text: `
<div class="font-black text-sky-700 flex items-center gap-2 mb-3"><i class="fa-solid fa-building text-lg"></i> PUNTOS DE REGISTRO</div>
<div class="text-sm text-slate-700 mb-3">Si no tenés cuenta en MDQ Digital, podés acercarte personalmente con tu DNI a:</div>
<div class="space-y-3">
  <div class="bg-sky-50 border border-sky-100 p-3 rounded-xl">
    <div class="font-extrabold text-sky-900 text-sm">Polideportivo Libertad</div>
    <div class="text-xs text-slate-600 mt-1"><i class="fa-solid fa-clock text-sky-600 mr-1"></i> Lu a Vi 9 a 13hs</div>
    <div class="text-xs text-slate-600 mt-1"><i class="fa-solid fa-map-pin text-sky-600 mr-1"></i> Ituzaingó 8350</div>
    <button onclick="window.open('https://www.google.com/maps/dir/?api=1&destination=Ituzaingo+8350,+Mar+del+Plata&travelmode=transit', '_blank')" class="mt-2 text-[10px] font-bold text-white bg-sky-600 hover:bg-sky-700 transition px-3 py-1.5 rounded-lg inline-flex items-center gap-1 shadow-sm"><i class="fa-solid fa-map"></i> Abrir Mapa</button>
  </div>
  <div class="bg-emerald-50 border border-emerald-100 p-3 rounded-xl">
    <div class="font-extrabold text-emerald-900 text-sm">Polideportivo Colinas</div>
    <div class="text-xs text-slate-600 mt-1"><i class="fa-solid fa-clock text-emerald-600 mr-1"></i> Lu a Vi 9 a 13hs</div>
    <div class="text-xs text-slate-600 mt-1"><i class="fa-solid fa-map-pin text-emerald-600 mr-1"></i> Einstein 1502</div>
    <button onclick="window.open('https://www.google.com/maps/dir/?api=1&destination=Albert+Einstein+1502,+Mar+del+Plata&travelmode=transit', '_blank')" class="mt-2 text-[10px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition px-3 py-1.5 rounded-lg inline-flex items-center gap-1 shadow-sm"><i class="fa-solid fa-map"></i> Abrir Mapa</button>
  </div>
</div>
${getVolverBtn()}`, html: true
                };

            default:
                return { text: `<div class="bg-red-50 text-red-700 p-3 rounded-xl border border-red-200 text-sm"><i class="fa-solid fa-circle-question mr-2"></i>No entendí esa opción. Elegí tocando los botones.</div>` + getVolverBtn(), html: true };
        }
    }

    if (currentState === 'SUBMENU_SACAR_TURNO') {
        if (msg === 'A1') {
            return {
                text: `
<div class="font-black text-pink-700 flex items-center gap-2 mb-3"><i class="fa-solid fa-list-check text-lg"></i> LOS 8 PASOS DEL TRÁMITE</div>
<div class="bg-pink-50/50 border border-pink-100 rounded-xl p-3 text-xs text-slate-700 space-y-2 mb-4">
  <div><span class="font-bold text-pink-600 w-4 inline-block">1.</span> Ingresá con DNI y clave</div>
  <div><span class="font-bold text-pink-600 w-4 inline-block">2.</span> Clic en <b>Zoonosis</b></div>
  <div><span class="font-bold text-pink-600 w-4 inline-block">3.</span> Sede Canesa esq. Guanahani</div>
  <div><span class="font-bold text-pink-600 w-4 inline-block">4.</span> Trámite: <b>Castraciones</b></div>
  <div><span class="font-bold text-pink-600 w-4 inline-block">5.</span> Concurre titular o tercero</div>
  <div><span class="font-bold text-pink-600 w-4 inline-block">6.</span> Llená datos del animal</div>
  <div><span class="font-bold text-pink-600 w-4 inline-block">7.</span> Aceptá consentimiento</div>
  <div><span class="font-bold text-pink-600 w-4 inline-block">8.</span> Elegí fecha y <b>Reservá</b></div>
</div>
<a href="https://autenticar.mardelplata.gob.ar/auth/login-option" target="_blank" class="w-full text-left p-3 rounded-xl border border-slate-200 bg-brand-navy hover:bg-slate-800 transition-all flex items-center gap-3 shadow-md mb-2 group">
  <div class="w-8 h-8 rounded-lg bg-white/20 text-white flex items-center justify-center shrink-0"><i class="fa-solid fa-user"></i></div>
  <div class="text-[14px] font-bold text-white">Ingresar con DNI y Clave</div>
</a>
${getVolverBtn()}`, html: true
            };
        } else if (msg === 'A2') {
            return {
                text: `
<div class="text-sm text-slate-700 mb-3">Si aún no tenés usuario, podés registrarte en MDQ DIGITAL, crearlo presencialmente en los puntos de registro o ver nuestro video tutorial online.</div>
<div class="flex flex-col gap-2 mb-2">
  <a href="https://autenticar.mardelplata.gob.ar/auth/register" target="_blank" class="w-full text-left p-2.5 rounded-xl border border-slate-200 bg-white hover:border-emerald-400 hover:bg-emerald-50 transition-all flex items-center gap-3 shadow-sm">
    <div class="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0"><i class="fa-solid fa-user-plus"></i></div>
    <div class="text-[13px] font-bold text-slate-800">Registrarte en MDQ DIGITAL</div>
  </a>
  <button onclick="currentState='SUBMENU_TURNOS'; sendOption('Puntos de Registro MDQ DIGITAL', 'E');" class="w-full text-left p-2.5 rounded-xl border border-slate-200 bg-white hover:border-sky-400 hover:bg-sky-50 transition-all flex items-center gap-3 shadow-sm">
    <div class="w-8 h-8 rounded-lg bg-sky-100 text-sky-600 flex items-center justify-center shrink-0"><i class="fa-solid fa-location-dot"></i></div>
    <div class="text-[13px] font-bold text-slate-800">Puntos de Registro MDQ DIGITAL</div>
  </button>
  <button onclick="sendOption('Ver video tutorial de ayuda', 'A3');" class="w-full text-left p-2.5 rounded-xl border border-slate-200 bg-white hover:border-red-400 hover:bg-red-50 transition-all flex items-center gap-3 shadow-sm">
    <div class="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center shrink-0"><i class="fa-brands fa-youtube text-lg"></i></div>
    <div class="text-[13px] font-bold text-slate-800">Ver video tutorial de ayuda</div>
  </button>
</div>
${getVolverBtn()}`, html: true
            };
        } else if (msg === 'A3') {
            return {
                text: `
<div class="font-black text-red-600 flex items-center gap-2 mb-3"><i class="fa-brands fa-youtube text-lg"></i> VIDEO TUTORIAL</div>
<div class="text-sm text-slate-700 mb-3">Mirá este video paso a paso para aprender a generar tu usuario en MDQ Digital:</div>
<div class="relative w-full overflow-hidden rounded-xl shadow-md border border-slate-200 mb-3 bg-black" style="padding-top: 56.25%;">
  <iframe class="absolute top-0 left-0 w-full h-full" src="https://www.youtube-nocookie.com/embed/videoseries?list=PLPSK3rQBNRuJBZbKjrD0DYkmjfHsDH6aH&si=5FvyPLDn6cHM34Z6" title="YouTube video tutorial" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
</div>
${getVolverBtn()}`, html: true
            };
        } else {
            return { text: `Por favor, elige una de las opciones habilitadas.` + getVolverBtn(), html: true };
        }
    }

    currentState = 'MAIN_MENU';
    return { text: getMenuText(), html: true };
}

window.sendOption = async function (displayText, code) {
    if (!chatbotActivo) return;
    appendMessage(displayText, 'sent', false);
    const typingEl = showTyping();
    const response = await getBotResponse(code);
    setTimeout(() => {
        typingEl.remove();
        appendMessage(response.text, 'received', response.html);
    }, 2000);
}

async function sendMessage() {
    if (!chatbotActivo) return;
    const text = msgInput.value.trim();
    if (!text) return;

    appendMessage(text, 'sent', false);
    msgInput.value = '';

    const typingEl = showTyping();

    const response = await getBotResponse(text);

    setTimeout(() => {
        typingEl.remove();
        appendMessage(response.text, 'received', response.html);
    }, 2000);
}

sendBtn.addEventListener('click', sendMessage);
msgInput.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

window.addEventListener('load', () => {
    setTimeout(() => {
        if (!chatbotActivo) return;
        const typingEl = showTyping();
        setTimeout(() => {
            if (!chatbotActivo) return;
            typingEl.remove();
            appendMessage(getMenuText(), 'received', true);
        }, 2000);
    }, 300);
});
