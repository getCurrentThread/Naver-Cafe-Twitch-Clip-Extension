// escapeHTML
const entityMap = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '/': '&#x2F;', '`': '&#x60;', '=': '&#x3D;' };
function escapeHtml(string) { return String(string).replace(/[&<>"'`=/]/g, function (s) { return entityMap[s]; }); };


// debug message
function NOMO_DEBUG( /**/ ) {
  if (!! NCTCLM?.settings?.debug) {
      var args = arguments, args_length = args.length, args_copy = args;
      for (var i = args_length; i > 0; i--) args[i] = args_copy[i - 1];
      args[0] = "[NCTCL]  ";
      args.length = args_length + 1;
      console.log.apply(console, args);
  }
};

/**
 * @author https://gist.github.com/sumitpore/47439fcd86696a71bf083ede8bbd5466
 * Chrome의 Local StorageArea에서 개체 가져오기
 * @param {string} key
 */
 async function getObjectFromLocalStorage(key) {
    return new Promise((resolve, reject) => {
        try {
            chrome.storage.local.get(key, function (value) {
                resolve(value[key]);
            });
        } catch (ex) {
            reject(ex);
        }
    });
}
  
/**
 * @author https://gist.github.com/sumitpore/47439fcd86696a71bf083ede8bbd5466
 * Chrome의 Local StorageArea에 개체 저장
 * @param {*} obj
 */
async function saveObjectInLocalStorage(obj) {
  return new Promise((resolve, reject) => {
    try {
      chrome.storage.local.set(obj, function () {
        resolve();
      });
    } catch (ex) {
      reject(ex);
    }
  });
}

const NCTCL_INIT_SETTINGS = {
  debug: false,
  use: true,
  videoWidth: 100,
  method: "autoLoad",
  autoLoadLimit: 5,
  autoPlayFirstClip: false,
  autoPlayFirstClipMuted: true,
  clickRequiredAutoPlay: true,
  clickRequiredMuted: false,
}

class NCTCLM{
  static async reset() {
    NCTCLM.settings = NCTCL_INIT_SETTINGS;
    await NCTCLM.saveSettings();
    return NCTCLM.settings;
  }

  static async loadSettings() {
    NCTCLM.settings = await getObjectFromLocalStorage('NCTCL_settings');
    if (!NCTCLM.settings) {
      NCTCLM.settings = NCTCL_INIT_SETTINGS;
      await NCTCLM.saveSettings();
    }
    return NCTCLM.settings;
  }
  
  static async saveSettings() {
    await saveObjectInLocalStorage({
      NCTCL_settings: NCTCLM.settings
    });
  }

  static async setValue(key, value) {
    await NCTCLM.loadSettings();
    NCTCLM.settings[key] = value;
    await NCTCLM.saveSettings();
  }
  static async getValue(key) {
    await NCTCLM.loadSettings();
    return NCTCLM.settings[key];
  }
}