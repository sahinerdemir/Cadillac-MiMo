/* ==========================================================================
   Cadillac MiMo - Guest Portal Controller
   Interactivity: Accordion drawers, copy-to-clipboard, dynamic database sync
   and seamless English-to-Spanish translation system
   ========================================================================== */

let currentLang = 'en';
let stayData = null;

document.addEventListener('DOMContentLoaded', () => {
  initLanguageSwitcher();
  fetchDirectoryData();
  initAccordions();
  initCopyToClipboard();
});

/**
 * Translation Dictionary for Static UI Labels
 */
const TRANSLATIONS = {
  en: {
    welcomeText: "Welcome! Thank you for staying with us. We're delighted to host you and hope you have a comfortable and memorable stay. Please review our guide below.",
    contactManager: "Contact Hospitality Manager",
    
    // Accordion triggers
    titleCodes: "Entrance Codes & Wi-Fi",
    titleProperty: "Property Information",
    titleHk: "Housekeeping & Stays",
    titleRules: "House Rules & Safety",
    titleGuide: "Local Guide & Explore",
    titleSupport: "Guest Support & Help",

    // Access Codes Section
    cardTitleEntrance: "Main Entrance Code",
    badgeActive: "Active",
    btnCopyGate: "Copy Code",
    cardTitleWifi: "Wi-Fi Network",
    badgeFreeWifi: "Free Guest Wi-Fi",
    btnCopy: "Copy",
    cardTitleWifiPw: "Wi-Fi Password",

    // Property Info section labels
    labelLaundry: "Laundry Room:",
    labelTrash: "Trash Disposal:",
    labelPark: "Morningside Park Access:",
    labelHotWater: "Hot Water System:",
    labelSmoking: "Smoking Policy:",
    badgeProhibited: "STRICTLY PROHIBITED",
    labelPackage: "Package Deliveries:",
    labelParking: "Parking / Free Parking:",

    // Housekeeping section labels
    hkIntro: "<strong>Complimentary Starter Supplies:</strong> Toilet Paper, Shampoo, Body Wash, and Fresh Towels are provided in your room upon arrival.",
    hkRatesSubtitle: "On-Demand Housekeeping Rates",
    hkStudioLabel: "Studio Apartment",
    hkOneBedLabel: "One-Bedroom Apartment",
    hkTwoBedLabel: "Two-Bedroom Apartment",
    labelExtraTowels: "Extra Towels:",
    labelPerTowel: "per towel",
    labelLongTerm: "Long-Term Stay Policy:",

    // House Rules section labels
    labelQuiet: "Quiet Hours:",
    labelCheckout: "Check-out Time:",
    labelAc: "Air Conditioning Guidelines:",
    labelSecurity: "Security & Damage Policy:",

    // Local Guide labels
    guideIntro: "Explore the historic MiMo district and nearby hotspots. Here is an interactive map and a handpicked list of our favorite spots around 5201 Biscayne:",
    tagFood: "🍕 Food & Drinks",
    tagRestaurant: "🍽️ Restaurant",
    tagLeisure: "🌳 Leisure",
    tagArts: "🎨 Art & Shopping",
    placeExploreBtn: "Explore All Nearby in Google Maps",

    // Support section labels
    supportRole: "Hospitality Manager",
    supportHours: "Support Hours",
    supportCall: "Call Now",
    supportText: "WhatsApp",
    supportExtendTitle: "Need to extend your stay?",

    // Review & Social elements
    socialReviewTitle: "Share Your Experience",
    socialReviewDesc: "Enjoyed your stay at Cadillac MiMo? We would love to hear your feedback on Google.",
    socialReviewBtn: "Leave a Google Review",
    socialFollowTitle: "Follow Our Journey",
    socialFollowDesc: "Stay connected and share your favorite moments. Tag us in your Miami stories!",
    footerRights: "All rights reserved."
  },
  es: {
    welcomeText: "¡Bienvenido! Gracias por hospedarse con nosotros. Nos complace recibirle y esperamos que tenga una estadía cómoda y memorable. Por favor revise nuestra guía a continuación.",
    contactManager: "Contactar al Gerente de Hospitalidad",
    
    // Accordion triggers
    titleCodes: "Códigos de acceso y Wi-Fi",
    titleProperty: "Información de la propiedad",
    titleHk: "Limpieza y estadías",
    titleRules: "Reglas de la casa y seguridad",
    titleGuide: "Guía local y exploración",
    titleSupport: "Soporte para huéspedes y ayuda",

    // Access Codes Section
    cardTitleEntrance: "Código de la entrada principal",
    badgeActive: "Activo",
    btnCopyGate: "Copiar código",
    cardTitleWifi: "Red de Wi-Fi",
    badgeFreeWifi: "Wi-Fi gratis para huéspedes",
    btnCopy: "Copiar",
    cardTitleWifiPw: "Contraseña de Wi-Fi",

    // Property Info section labels
    labelLaundry: "Lavandería:",
    labelTrash: "Eliminación de basura:",
    labelPark: "Acceso al Morningside Park:",
    labelHotWater: "Sistema de agua caliente:",
    labelSmoking: "Política de fumar:",
    badgeProhibited: "ESTRICTAMENTE PROHIBIDO",
    labelPackage: "Entrega de paquetes:",
    labelParking: "Estacionamiento:",

    // Housekeeping section labels
    hkIntro: "<strong>Suministros iniciales de cortesía:</strong> Se proporcionan papel higiénico, champú, gel de baño y toallas limpias en su habitación a su llegada.",
    hkRatesSubtitle: "Tarifas de limpieza a pedido",
    hkStudioLabel: "Estudio",
    hkOneBedLabel: "Apartamento de 1 dormitorio",
    hkTwoBedLabel: "Apartamento de 2 dormitorios",
    labelExtraTowels: "Toallas adicionales:",
    labelPerTowel: "por toalla",
    labelLongTerm: "Estadías a largo plazo:",

    // House Rules section labels
    labelQuiet: "Horas de silencio:",
    labelCheckout: "Hora de check-out:",
    labelAc: "Pautas de aire acondicionado:",
    labelSecurity: "Política de seguridad y daños:",

    // Local Guide labels
    guideIntro: "Explore el distrito histórico de MiMo y los lugares de interés cercanos. Aquí tiene un mapa interactivo y una lista seleccionada de nuestros lugares favoritos alrededor de 5201 Biscayne:",
    tagFood: "🍕 Comidas y bebidas",
    tagRestaurant: "🍽️ Restaurante",
    tagLeisure: "🌳 Recreación",
    tagArts: "🎨 Arte y compras",
    placeExploreBtn: "Explorar todos los alrededores en Google Maps",

    // Support section labels
    supportRole: "Gerente de Hospitalidad",
    supportHours: "Horario de soporte",
    supportCall: "Llamar ahora",
    supportText: "WhatsApp",
    supportExtendTitle: "¿Necesita extender su estadía?",

    // Review & Social elements
    socialReviewTitle: "Comparta su experiencia",
    socialReviewDesc: "¿Disfrutó de su estadía en Cadillac MiMo? Nos encantaría escuchar sus comentarios en Google.",
    socialReviewBtn: "Dejar una reseña en Google",
    socialFollowTitle: "Siga nuestro viaje",
    socialFollowDesc: "¡Manténgase conectado y comparta sus momentos favoritos. Etiquétenos en sus historias de Miami!",
    footerRights: "Todos los derechos reservados."
  }
};

/**
 * Dynamic Sentence Translator (Translates English database paragraphs on-the-fly)
 */
function translateSentence(text, lang) {
  if (!text) return '';
  if (lang === 'en') return text; // Default English

  const txtLower = text.toLowerCase();

  // 1. Laundry Room
  const laundryMatch = text.match(/washer and dryer \(([^)]+)\)\. Please avoid using machines after ([^.]+)\./i);
  if (laundryMatch) {
    return `Lavadora y secadora con monedas (${laundryMatch[1]}). Por favor, evite usar las máquinas después de las ${laundryMatch[2]}.`;
  }
  if (txtLower.includes("washer and dryer")) {
    return "Lavadora ve secadora con monedas. Por favor, evite usar las máquinas tarde en la noche.";
  }

  // 2. Trash Disposal
  if (txtLower.includes("dispose of all household trash") || txtLower.includes("large dumpsters")) {
    return "Por favor, deposite toda la basura doméstica en los contenedores grandes ubicados al lado de la entrada del garaje.";
  }

  // 3. Morningside Park Access
  if (txtLower.includes("morningside park") || txtLower.includes("direct access")) {
    return "Acceso directo al parque Morningside (senderos para caminar, canchas de tenis/baloncesto, área de juegos infantiles, hermosas vistas al mar).";
  }

  // 4. Hot Water
  if (txtLower.includes("hot water system") || txtLower.includes("allow water to run")) {
    return "Sistema central de agua caliente. Durante las horas pico de la noche (alrededor de las 8:00 PM), por favor deje correr el agua brevemente.";
  }

  // 5. Smoking
  if (txtLower.includes("smoke-free property") || txtLower.includes("strictly prohibited inside")) {
    return " dentro de todas las habitaciones de huéspedes. Permitido ÚNICAMENTE en el área exterior de bancos de madera designada. Se aplican cargos de limpieza adicionales por infracciones.";
  }

  // 6. Package Deliveries
  if (txtLower.includes("package delivery is not accepted") || txtLower.includes("ups store")) {
    return "No se acepta la entrega de paquetes en la propiedad. Por favor, dirija sus pedidos a una oficina de UPS o FedEx cercana.";
  }

  // 7. Parking
  if (txtLower.includes("free parking") || txtLower.includes("street next to the property")) {
    return "Estacionamiento gratuito en la calle al lado de la propiedad. El área dentro del portón del garaje es estrictamente propiedad privada.";
  }

  // 8. Housekeeping Long-Term Policy
  const hkPolicyMatch = text.match(/exceeding ([0-9]+) nights.*every ([0-9]+) days/i);
  if (hkPolicyMatch) {
    return `Para estadías que superen las ${hkPolicyMatch[1]} noches, se requiere un servicio de limpieza obligatorio cada ${hkPolicyMatch[2]} días.`;
  }

  // 9. Quiet Hours
  const quietMatch = text.match(/(.+)\. In respect of neighboring/i);
  if (quietMatch) {
    return `${quietMatch[1]}. En respeto a los huéspedes vecinos, no se permiten fiestas ni eventos.`;
  }

  // 10. Check-out Time
  const checkoutMatch = text.match(/Before ([^.]+)\./i);
  if (checkoutMatch) {
    return `Antes de las ${checkoutMatch[1]}.`;
  }

  // 11. Air Conditioning
  const acMatch = text.match(/never set below ([^ ]+) to prevent/i);
  if (acMatch) {
    return `Mantenga el aire acondicionado en modo automático y nunca lo configure por debajo de ${acMatch[1]} para evitar el congelamiento de la unidad y la condensación. Por favor, mantenga todas las puertas y ventanas cerradas mientras esté en funcionamiento.`;
  }

  // 12. Security
  if (txtLower.includes("doors locked") || txtLower.includes("responsible for damages")) {
    return "Por favor, mantenga las puertas de las habitaciones cerradas con llave en todo momento. Los huéspedes son responsables de los daños o artículos robados, cuyo costo se deducirá del depósito.";
  }

  // 13. Emergency Note
  const emergencyMatch = text.match(/\* (.+) for emergencies only/i);
  if (emergencyMatch) {
    return `* ${emergencyMatch[1]} solo para emergencias`;
  }

  return text; // Fallback to raw DB value
}

/**
 * Fetch stay details from database API
 */
async function fetchDirectoryData() {
  try {
    const response = await fetch('/api/get-data');
    if (!response.ok) throw new Error('Data fetch failed');
    stayData = await response.json();
    renderPage();
  } catch (err) {
    console.warn("Could not load dynamic database stay information, using HTML defaults:", err);
    renderPage();
  }
}

/**
 * Render all static and dynamic elements based on language & loaded database values
 */
function renderPage() {
  // 1. Translate all static label text placeholders marked with data-i18n
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (TRANSLATIONS[currentLang] && TRANSLATIONS[currentLang][key]) {
      el.innerHTML = TRANSLATIONS[currentLang][key];
    }
  });

  // 2. Overwrite directions button texts
  document.querySelectorAll('.place-map-link').forEach(el => {
    el.innerHTML = currentLang === 'en' ? 'Get Directions ➡️' : 'Cómo llegar ➡️';
  });

  if (!stayData) return;

  const setText = (id, val, isSentence = false) => {
    const el = document.getElementById(id);
    if (el && val !== undefined && val !== null) {
      el.innerHTML = isSentence ? translateSentence(val, currentLang) : val;
    }
  };
  const setAttr = (id, attr, val) => {
    const el = document.getElementById(id);
    if (el && val) el.setAttribute(attr, val);
  };

  // Codes
  if (stayData.codes) {
    setText('gateCodeDisplay', stayData.codes.gateCode);
    setAttr('gateCodeCopyBtn', 'data-copy', stayData.codes.gateCode);

    setText('wifiNetworkDisplay', stayData.codes.wifiNetwork);
    setAttr('wifiNetworkCopyBtn', 'data-copy', stayData.codes.wifiNetwork);

    setText('wifiPasswordDisplay', stayData.codes.wifiPassword);
    setAttr('wifiPasswordCopyBtn', 'data-copy', stayData.codes.wifiPassword);
  }

  // Info Guidelines
  if (stayData.info) {
    setText('infoLaundryDisplay', stayData.info.laundry, true);
    setText('infoTrashDisplay', stayData.info.trash, true);
    setText('infoParkDisplay', stayData.info.park, true);
    setText('infoHotWaterDisplay', stayData.info.hotWater, true);
    setText('infoSmokingDisplay', stayData.info.smoking, true);
    setText('infoPackageDisplay', stayData.info.package, true);
    setText('infoParkingDisplay', stayData.info.parking, true);
  }

  // Housekeeping
  if (stayData.housekeeping) {
    setText('hkStudioRateDisplay', stayData.housekeeping.studioRate);
    setText('hkOneBedRateDisplay', stayData.housekeeping.oneBedRate);
    setText('hkTwoBedRateDisplay', stayData.housekeeping.twoBedRate);
    setText('hkExtraTowelDisplay', stayData.housekeeping.extraTowelCost);
    setText('hkLongTermDisplay', stayData.housekeeping.longTermPolicy, true);
  }

  // Rules
  if (stayData.rules) {
    setText('rulesQuietDisplay', stayData.rules.quietHours, true);
    setText('rulesCheckoutDisplay', stayData.rules.checkoutTime, true);
    setText('rulesAcDisplay', stayData.rules.acGuidelines, true);
    setText('rulesSecurityDisplay', stayData.rules.security, true);
  }

  // Support & Contact CTAs
  if (stayData.support) {
    setText('supportNameDisplay', stayData.support.name || 'Nisa');
    setText('heroCallBtnName', stayData.support.name || 'Nisa');
    setText('supportHoursDisplay', stayData.support.hours);
    setText('supportEmergencyDisplay', stayData.support.emergencyNote, true);
    
    // Sanitize phone for tel: tags
    const cleanPhone = stayData.support.phone ? stayData.support.phone.replace(/\D/g, '') : '7866228549';
    setAttr('supportPhoneBtn', 'href', `tel:${cleanPhone}`);
    setAttr('heroCallBtn', 'href', `tel:${cleanPhone}`);
    setAttr('supportWhatsappBtn', 'href', stayData.support.whatsapp);

    // Update dynamic stay extension message
    const extendText = currentLang === 'en'
      ? `Contact ${stayData.support.name || 'Nisa'} directly to check availability for extending your stay or requesting a late check-out.`
      : `Contacte a ${stayData.support.name || 'Nisa'} directamente para consultar la disponibilidad para extender su estadía o solicitar un check-out tardío.`;
    const extendEl = document.getElementById('supportExtendDesc');
    if (extendEl) extendEl.textContent = extendText;
  }
}

/**
 * 1. Independent Accordion Menu System
 * Toggles accordion blocks open and closed independently.
 */
function initAccordions() {
  const triggers = document.querySelectorAll('.accordion-trigger');
  triggers.forEach(trigger => {
    trigger.addEventListener('click', () => {
      const item = trigger.parentElement;
      const isOpen = item.classList.contains('active');
      
      // Toggle active layout
      item.classList.toggle('active');
      trigger.setAttribute('aria-expanded', !isOpen);
    });
  });
}

/**
 * 2. Clipboard Copy Interactivity
 */
function initCopyToClipboard() {
  const copyButtons = document.querySelectorAll('.copy-btn');
  copyButtons.forEach(btn => {
    btn.addEventListener('click', async () => {
      const textToCopy = btn.getAttribute('data-copy');
      const textSpan = btn.querySelector('.btn-text');
      
      if (!textToCopy) return;

      try {
        await navigator.clipboard.writeText(textToCopy);
        
        // Success animation
        btn.classList.add('copied');
        if (textSpan) textSpan.innerHTML = TRANSLATIONS[currentLang].btnCopied;
        
        // Reset state after delay
        setTimeout(() => {
          btn.classList.remove('copied');
          if (textSpan) {
            const isGate = btn.id === 'gateCodeCopyBtn';
            textSpan.innerHTML = isGate 
              ? TRANSLATIONS[currentLang].btnCopyGate 
              : TRANSLATIONS[currentLang].btnCopy;
          }
        }, 2000);
      } catch (err) {
        console.error('Copy to clipboard failed:', err);
      }
    });
  });
}

/**
 * 3. Language Switcher Event Listeners
 */
function initLanguageSwitcher() {
  const btnEn = document.getElementById('btn-en');
  const btnEs = document.getElementById('btn-es');
  
  if (!btnEn || !btnEs) return;

  btnEn.addEventListener('click', () => {
    if (currentLang === 'en') return;
    currentLang = 'en';
    btnEn.classList.add('active');
    btnEs.classList.remove('active');
    renderPage();
  });

  btnEs.addEventListener('click', () => {
    if (currentLang === 'es') return;
    currentLang = 'es';
    btnEs.classList.add('active');
    btnEn.classList.remove('active');
    renderPage();
  });
}
