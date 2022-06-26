// escapeHTML
const entityMap = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '/': '&#x2F;', '`': '&#x60;', '=': '&#x3D;' };
function escapeHtml(string) { return String(string).replace(/[&<>"'`=/]/g, function (s) { return entityMap[s]; }); };


// debug message
function DEBUG( /**/ ) {
  if (NCTCLM?.settings?.debug) {
      var args = arguments, args_length = args.length, args_copy = args;
      for (var i = args_length; i > 0; i--) args[i] = args_copy[i - 1];
      args[0] = "[NCTC]  ";
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
  autoLoadLimit: 3,
  autoPlayFirstClip: false,
  autoPlayFirstClipMuted: true,
  clickRequiredAutoPlay: true,
  setVolumeWhenStreamStarts: false,       // 특정 사운드로 볼륨 조절
  targetStartVolume: 1.0,                 // 클립 볼륨
  autoPauseOtherClips: true,              // 자동으로 다른 클립 정지
  autoPauseOtherClipsForNaverVideo: true, // 자동으로 다른 클립 정지 (네이버 동영상)
  removeOriginalLinks: true, // 오리지널 링크 삭제
  autoPlayNextClip: false,   // 자동으로 다음 클립을 이어서 재생
  playAndPauseByClick: true, // 트위치 클립 페이지 스타일로 표시
  fixFullScreenScrollChange: true, // 클립 페이지 스타일로 표시할 때 풀스크린 스크롤 이동 문제 해결
  naverVideoAutoMaxQuality: true, // 네이버 동영상 자동 최대 화질 설정
  naverBoardDefaultArticleCount: "0", // 네이버 게시판 기본 게시글 수 (기본값 0)
  improvedRefresh: false, // 네이버 카페에서 새로고침을 할 때에 메인 페이지로 이동하지 않도록 수정
}

class NCTCLM{
  static async reset() {
    NCTCLM.settings = NCTCL_INIT_SETTINGS;
    await NCTCLM.saveSettings();
    return NCTCLM.settings;
  }

  static async loadSettings() {
    NCTCLM.settings = await getObjectFromLocalStorage('NCTCL_settings');
    NCTCLM.settings = {...NCTCL_INIT_SETTINGS, ...NCTCLM.settings};
    return NCTCLM.settings;
  }
  
  static async saveSettings() {
    await saveObjectInLocalStorage({
      NCTCL_settings: NCTCLM.settings
    });
    chrome.runtime.sendMessage({ type: "NCTCLM", event: "update", settings: NCTCLM.settings });
    DEBUG("[NCTCL] saveSettings", NCTCLM.settings);
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

function addStyle(css) {
  var style = document.createElement('style');
  style.type = 'text/css';
  style.innerHTML = css;
  document.getElementsByTagName('head')[0].appendChild(style);
  return style;
}

function addStyleFromFile(css){
  const topCss = chrome.runtime.getURL(css);
  const topCssLink = document.createElement("link");
  topCssLink.setAttribute("rel", "stylesheet");
  topCssLink.setAttribute("href", topCss);
  return document.head.appendChild(topCssLink);
}