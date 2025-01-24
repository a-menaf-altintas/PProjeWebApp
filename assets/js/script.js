/*********************************************
 * 1) FETCH PARTIALS: header.html & footer.html
 *********************************************/
let headerLoaded = false;
let footerLoaded = false;
let i18nData = {};

document.addEventListener('DOMContentLoaded', () => {
  // Fetch header
  fetch('header.html')
    .then(resp => {
      if (!resp.ok) throw new Error('Network response was not ok for header.html');
      return resp.text();
    })
    .then(html => {
      document.getElementById('header').innerHTML = html;
      headerLoaded = true;
      tryInitialize();
    })
    .catch(err => console.error('Error fetching header:', err));

  // Fetch footer
  fetch('footer.html')
    .then(resp => {
      if (!resp.ok) throw new Error('Network response was not ok for footer.html');
      return resp.text();
    })
    .then(html => {
      document.getElementById('footer').innerHTML = html;
      footerLoaded = true;
      tryInitialize();
    })
    .catch(err => console.error('Error fetching footer:', err));

  // Fetch translation files
  Promise.all([
    fetch('locales/tr.json').then(resp => {
      if (!resp.ok) throw new Error('Network response was not ok for tr.json');
      return resp.json();
    }),
    fetch('locales/en.json').then(resp => {
      if (!resp.ok) throw new Error('Network response was not ok for en.json');
      return resp.json();
    })
  ])
    .then(([trData, enData]) => {
      i18nData.tr = trData;
      i18nData.en = enData;
      tryInitialize();
    })
    .catch(err => console.error('Error fetching locales:', err));
});

/*********************************************
 * 2) Initialize After Partials and Locales Are Loaded
 *********************************************/
function tryInitialize() {
  if (!headerLoaded || !footerLoaded || !i18nData.tr || !i18nData.en) return;

  // 1) Determine current language
  let currentLang = localStorage.getItem('portalProjeLang') || 'tr';

  // 2) Grab references to the newly-injected elements
  const languageSwitchBtn = document.getElementById('languageSwitch');
  const flagIcon = document.getElementById('flagIcon');
  const languageText = document.getElementById('languageText');

  if (!languageSwitchBtn || !flagIcon || !languageText) {
    console.error('Language switch elements not found in header.');
    return;
  }

  // Language data
  const languageData = {
    tr: { flag: 'assets/images/usa-flag.png', text: 'English' },
    en: { flag: 'assets/images/turkey-flag.png', text: 'Türkçe' }
  };

  // 3) Update the UI
  function updateLanguageUI() {
    const { flag, text } = languageData[currentLang];
    flagIcon.src = flag;
    languageText.textContent = text;
    translatePage(currentLang);
  }

  // 4) On load
  updateLanguageUI();

  // 5) On click => toggle language
  languageSwitchBtn.addEventListener('click', () => {
    currentLang = (currentLang === 'tr') ? 'en' : 'tr';
    localStorage.setItem('portalProjeLang', currentLang);
    updateLanguageUI();
  });
}

/*********************************************
 * 3) Translate Page
 *********************************************/
function translatePage(lang) {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (i18nData[lang] && i18nData[lang][key]) {
      el.innerHTML = i18nData[lang][key]; // Use innerHTML here
    } else {
      console.warn(`Missing translation for key: ${key} in language: ${lang}`);
    }
  });
}