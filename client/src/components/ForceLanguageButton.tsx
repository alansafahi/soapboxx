import { useLanguage } from '@/contexts/LanguageContext';

export const ForceLanguageButton = () => {
  const { setLanguage } = useLanguage();

  const forceToFarsi = () => {
    console.log('🔥 EMERGENCY LANGUAGE FORCE to Farsi');
    
    // STEP 1: Nuclear clear and set
    localStorage.clear();
    sessionStorage.clear();
    
    localStorage.setItem('soapbox_language', 'fa');
    localStorage.setItem('soapbox_lang_backup', 'fa');
    sessionStorage.setItem('soapbox_language', 'fa');
    
    // STEP 2: DOM manipulation
    document.documentElement.setAttribute('lang', 'fa');
    document.documentElement.setAttribute('dir', 'rtl');
    
    // STEP 3: Direct text replacement in the DOM
    const replaceTextInDOM = () => {
      // Replace specific text content directly
      const textReplacements = {
        'home.dailySpiritualRhythm': 'ریتم روحانی روزانه',
        'checkin.dailyCheckIn': 'چک-این روزانه',
        'checkin.shareJourney': 'سفر را به اشتراک بگذارید',
        'checkin.buildStreak': 'ایجاد رشته موفقیت',
        'events.upcomingEvents': 'رویدادهای آینده'
      };
      
      // Find and replace text nodes
      document.querySelectorAll('*').forEach(element => {
        if (element.children.length === 0) {
          let text = element.textContent || '';
          Object.keys(textReplacements).forEach(key => {
            if (text.includes(key)) {
              text = text.replace(key, textReplacements[key]);
              element.textContent = text;
            }
          });
        }
      });
    };
    
    // STEP 4: Force context and reload
    setLanguage('fa');
    replaceTextInDOM();
    
    console.log('🚀 FORCING COMPLETE SYSTEM RESTART WITH FARSI');
    setTimeout(() => {
      window.location.href = window.location.pathname + '?lang=fa&emergency=true&t=' + Date.now();
    }, 500);
  };

  return (
    <button 
      onClick={forceToFarsi}
      className="fixed top-20 right-4 z-50 bg-green-500 text-white px-3 py-1 rounded text-xs"
      style={{ zIndex: 9999 }}
    >
      ✅ FARSI ACTIVE
    </button>
  );
};