

NCTCLM.loadSettings().then(NCTCL_SETTINGS => {
    DEBUG("NCTCLM.loadSettings", NCTCL_SETTINGS);
    // check is window top
    // if(window.top !== window) return;
    // DEBUG("top window");

    // send settings to background.js
    chrome.runtime.sendMessage({
        "type":"NCTCLM",
        "event":"update",
        "settings":NCTCL_SETTINGS
    });
    var loop = function(){
        if(!NCTCL_SETTINGS.use) return;
        // 내부 iframe의 document를 가져오기
        const mainContent = document.querySelector("iframe#cafe_main")?.contentDocument;
        DEBUG("mainContent", mainContent);
        if(!mainContent) return;

        // chrome extension inject top.css file
        addStyleFromFile("css/top.css");
        
        // fixFullScreenScrollChange 전체 화면에서 돌아올 때에 잘못된 스크롤 위치를 조정하는 기능을 추가한다.
        var parentHtml = parent.document.querySelector("html");
        var lastScrollY = parentHtml.scrollTop;
        var checkIsFullScreen = function(){ return document.fullScreen || document.mozFullScreen || document.webkitIsFullScreen };
        try{
            if(NCTCL_SETTINGS.fixFullScreenScrollChange /*&& window.self !== window.top*/){
                $(document).on ('mozfullscreenchange webkitfullscreenchange fullscreenchange',function(){
                    var isFullScreen = checkIsFullScreen();
                    DEBUG("FullScreen", isFullScreen);
                    if(!isFullScreen){
                        if(parentHtml.scrollTop !== lastScrollY){
                            DEBUG("parentHtml.scrollTop = ", parentHtml.scrollTop, "lastScrollY = ", lastScrollY);
                        }
                        parentHtml.scrollTop = lastScrollY;
                    }
                });

                $(parent.window).scroll(function() {
                    var isFullScreen = checkIsFullScreen();
                    if(!isFullScreen){
                        lastScrollY = parentHtml.scrollTop;
                    }
                });
            }
        }
        catch(e){
            DEBUG("Error from fixFullScreenScrollChange", e);
        }


    } // end loop.


    var letswatch = function (cb) {
        DEBUG("letswatch");
        let myIframe = document.getElementById("cafe_main");
        if(myIframe == null) return;
        var oldonload = myIframe.onload;
        if (typeof myIframe.onload != 'function') {
            myIframe.onload = cb;
        } else {
            window.onload = function() {
                oldonload();
                cb();
            }
        }
    }

    letswatch(loop);

    return;
});