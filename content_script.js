

NCTCLM.loadSettings().then(NCTCL_SETTINGS => {
    DEBUG("NCTCLM.loadSettings", NCTCL_SETTINGS);
    ////////////////////////////////////////////////////////////////////////////////////
    // Main
    ////////////////////////////////////////////////////////////////////////////////////
    // 콘텐츠 width 계산
    var contentWidth = 800;
    var videoWidth, videoHeight, videoWidthStr, videoHeightStr;
    var reCalculateIframeWidth = function(width){
        videoWidth = Number(NCTCL_SETTINGS.videoWidth)/100.0 * contentWidth;
        videoHeight = Number(videoWidth)/16*9;// + 30
        videoWidthStr = String(videoWidth) + "px";
        videoHeightStr = String(videoHeight) + "px";
        DEBUG("reCalculateIframeWidth", width);
    }
    reCalculateIframeWidth(contentWidth);

    // Twitch clip 링크 설명 삽입
    var insertTwitchCilpDescription = function($elem, clipId){
        try{
            var $parentContainer = $elem.closest("div.se-section-oglink");
            var $article_container = $elem.closest("div.article_container");
            $parentContainer.find(".se-oglink-info").hide();
            if($article_container.length !== 0) {
                reCalculateIframeWidth($article_container.width());
            }
            var clipurl = `https://clips.twitch.tv/${clipId}`;
            var $title = $parentContainer.find(".se-oglink-title");
            var title = "", titleText = "", clipurlText = clipurl;
            if($title.length !== 0){
                title = escapeHtml($title.text());
                titleText = `<span class="NCTCL-titleText">${title}</span>`;
                clipurlText = `<span class="NCTCL-clipurlText">(<span class="UnderLine">${clipurl}</span>)</span>`;
            }
            $parentContainer.append(`
                <div class="NCTCL-container">
                    <div class="NCTCL-iframe-container" data-clip-id="${clipId}"></div>
                    <div class="NCTCL-description" data-clip-id="${clipId}">
                        <a title="클릭 시 다음의 Twitch Clip 페이지로 이동합니다. ${clipurl}" href="${clipurl}" class="se-link" target="_blank">
                            <svg style="vertical-align: middle;" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="14" height="14" viewBox="0 0 256 256" xml:space="preserve">
                                <g transform="translate(128 128) scale(0.72 0.72)" style="">
                                    <g style="stroke: none; stroke-width: 0; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill: none; fill-rule: nonzero; opacity: 1;" transform="translate(-175.05 -175.05000000000004) scale(3.89 3.89)" >
                                        <path d="M 2.015 15.448 v 63.134 h 21.493 V 90 h 12.09 l 11.418 -11.418 h 17.463 l 23.507 -23.507 V 0 H 8.06 L 2.015 15.448 z M 15.448 8.06 h 64.478 v 42.985 L 66.493 64.478 H 45 L 33.582 75.896 V 64.478 H 15.448 V 8.06 z" style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill: rgb(97,59,162); fill-rule: nonzero; opacity: 1;" transform=" matrix(1 0 0 1 0 0) " stroke-linecap="round" />
                                        <rect x="58.43" y="23.51" rx="0" ry="0" width="8.06" height="23.48" style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill: rgb(97,59,162); fill-rule: nonzero; opacity: 1;" transform=" matrix(1 0 0 1 0 0) "/>
                                        <rect x="36.94" y="23.51" rx="0" ry="0" width="8.06" height="23.48" style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill: rgb(97,59,162); fill-rule: nonzero; opacity: 1;" transform=" matrix(1 0 0 1 0 0) "/>
                                    </g>
                                </g>
                            </svg>
                            ${titleText}
                            ${clipurlText}
                        </a>
                    </div>
                </div>
            `);
        }
        catch(e){
            DEBUG("Error from insertTwitchCilpDescription", e);
        }
    }
    // Twitch clip 링크를 iframe 으로 변환
    var changeToTwitchCilpIframe = function($elem, clipId, autoPlay, muted, lazy) {
        try{
            var $parentContainer = $elem.closest("div.se-component-content");
            var $article_container = $elem.closest("div.article_container");
            if($article_container.length !== 0) reCalculateIframeWidth($article_container.width());
            $parentContainer.hide();
            var tempary = document.location.href.split("/");
            var parentHref = tempary[2];
            var clipurl = `https://clips.twitch.tv/${clipId}`;
            var $title = $parentContainer.find(".se-oglink-title");
            var title = "", titleText = "", clipurlText = clipurl;
            if($title.length !== 0){
                title = escapeHtml($title.text());
                titleText = `<span style="font-weight:bold">${title}</span>`;
                clipurlText = ` (${clipurl})`;
            }
            $parentContainer.after(`
            <div class="NCTCL-iframe-container">
                <iframe ${lazy ? "loading='lazy'" : ""} class="NCTCL-iframe" src="https://clips.twitch.tv/embed?clip=${clipId}&parent=${parentHref}&autoplay=${autoPlay}&muted=${muted}" frameborder="0" allowfullscreen="true" scrolling="no" height="${videoHeightStr}" width="${videoWidthStr}"></iframe>
                <br />
                <a href="${clipurl}" class="se-link" target="_blank" style="width:${videoWidthStr};">
                    ${titleText}
                    ${clipurlText}
                </a>
            </div>
            `);
        }
        catch(e){
            console.error("Error from changeToTwitchCilpIframe", e);
        }
    }
    var loop = function(){
        // 내부 iframe의 document를 가져오기
        const mainContent = document.querySelector("iframe#cafe_main")?.contentDocument;
        DEBUG("mainContent", mainContent);
        if(!mainContent) return;
        // Twitch clip 링크 찾기
        $(mainContent).arrive("div.se-module-oglink", {
            onlyOnce: true,
            existing: true
        }, function(elem) {
            try{
                var $elem = $(elem);
                if($elem.hasClass("fired")) return;
                $elem.addClass("fired");

                var $as = $elem.find("a");
                var regex = /^(?:https?:\/\/)(?:clips\.twitch\.tv|(?:www\.)?twitch\.tv\/[a-zA-Z0-9-_]+\/clip)\/([a-zA-Z0-9-_]+)/;
                
                // 자동 변환 시
                if(NCTCL_SETTINGS.method === "autoLoad"){
                    var $a = $as.first();
                    var href = $a.attr("href");
                    var match = href.match(regex);

                    if(match !== null && match.length > 1){
                        var clipId = match[1];
                        removeOriginalLinks(href);
                        insertTwitchCilpDescription($elem, clipId);
                        DEBUG("TWITCH CILP FOUND, CLIP ID = ", clipId);
                        var isAutoPlay = false;
                        var isMuted = false;
                        var NCTCL_Length = mainContent.querySelectorAll(".NCTCL-iframe").length;
                            if(NCTCL_Length == 0){
                                if(NCTCL_SETTINGS.autoPlayFirstClip) isAutoPlay = true;
                                if(NCTCL_SETTINGS.autoPlayFirstClip && NCTCL_SETTINGS.autoPlayFirstClipMuted) isMuted = true;
                                changeToTwitchCilpIframe($elem, clipId, isAutoPlay, isMuted, true);
                            }
                            else if(NCTCL_Length < NCTCL_SETTINGS.autoLoadLimit){
                                changeToTwitchCilpIframe($elem, clipId, isAutoPlay, isMuted, true);
                            }
                            else{
                                if($a.hasClass("se-oglink-thumbnail")) $a.addClass("hoverPlayButton");
                                $a.on("click", function(e){
                                    e.preventDefault();
                                    changeToTwitchCilpIframe($(e.target), clipId, NCTCL_SETTINGS.clickRequiredAutoPlay, false, false);
                                });
                            }
                        
                    }
                }
                // 클릭 변환 시
                else{ 
                    $as.each(function(i, v){
                        var $a = $(v);
                        var href = $a.attr("href");
                        var match = href.match(regex);

                        if(match !== null && match.length > 1){
                            var clipId = match[1];
                            if($a.hasClass("se-oglink-thumbnail")) $a.addClass("hoverPlayButton");
                            $a.on("click", function(e){
                                e.preventDefault();
                                changeToTwitchCilpIframe($(e.target), clipId, NCTCL_SETTINGS.clickRequiredAutoPlay, false, false);
                            });
                        }
                    });
                }
            }
            catch(e){
                console.error("Error from arrive", e);
            }
        });

        // 임베디드 비디오에 대한 추가 조정 (소리, 자동재생, 비디오 사이즈)
        $(mainContent).arrive("video", { onlyOnce: true, existing: true }, function (video) {
            DEBUG("video", video);
            
            // 재생 이벤트
            video.addEventListener("play", (e) => {
                let $e = $(e.target);
                DEBUG("twitch clip play()", e);
                if(NCTCL_SETTINGS.autoPauseOtherClips || NCTCL_SETTINGS.autoPlayNextClip) window.parent.postMessage({"type":"NCTCL", "event":"play", "clipId":clipId}, "https://cafe.naver.com");
                
                if(!$e.hasClass("_FIRSTPLAYED")){
                    $e.addClass("_FIRSTPLAYED");
                    // TODO: CSS 테마를 하단에 넣어야함
                }
            });

            // 일시정지 이벤트
            video.addEventListener("pause", (e) => {
                DEBUG("twitch clip pause()", e);
                if(NCTCL_SETTINGS.autoPauseOtherClips) window.parent.postMessage({"type":"NCTCL", "event":"pause", "clipId":clipId}, "https://cafe.naver.com");
            });

            // 종료 이벤트
            video.addEventListener("ended", (e) => {
                DEBUG("twitch clip ended()", e);
                if(NCTCL_SETTINGS.autoPlayNextClip) window.parent.postMessage({"type":"NCTCL", "event":"ended", "clipId":clipId}, "https://cafe.naver.com");
            });

            // setVolumeWhenStreamStarts 비디오의 전체 볼륨을 수정
            if(NCTCL_SETTINGS.setVolumeWhenStreamStarts && !is_volume_changed){
                if(video.volume !== undefined){
                    DEBUG("MUTE?", video.muted, "CURRENT VOLUME", video.volume, "TARGET VOLUME", NCTCL_SETTINGS.targetStartVolume);
                    setTimeout(function(){
                        if(NCTCL_SETTINGS.targetStartVolume !== 0.0){
                            video.muted = false; // 기본 볼륨이 0아니라면 음소거를 해제해야 함
                        }
                        // 실제 볼륨 조절
                        video.volume = NCTCL_SETTINGS.targetStartVolume;
                        is_volume_changed = true;
                    }, 100);
                }
            }
        });

        // 클립 자동 정지 
        var autoPauseVideo = function(e){
            if(!NCTCL_SETTINGS.use) return;
            if(!NCTCL_SETTINGS.autoPauseOtherClips && !NCTCL_SETTINGS.autoPlayNextClip) return;
            if(e.origin === "https://clips.twitch.tv" && e.data.type === "NCTCL"){
                DEBUG("autoPauseVideo", e.data);
                if(e.data.clipId === undefined || e.data.clipId === "") return;

                var $iframes = $(mainContent).find("div.NCTCL-container iframe");
                var endedNextFound = false;
                $iframes.each(function(i, v){
                    switch(e.data.event){
                        default:
                            return false;
                            // break;
                        case "play":
                            if(!NCTCL_SETTINGS.autoPauseOtherClips) return false;
                            if(v.dataset.clipId === e.data.clipId) return true;
                            var newData = {"type":"NCTCL", "event":"pause", "clipId":e.data.clipId};
                            v.contentWindow.postMessage(newData, "https://clips.twitch.tv");
                            break;
                        case "ended":
                            if(!NCTCL_SETTINGS.autoPlayNextClip) return false;
                            if(endedNextFound){
                                var newData = {"type":"NCTCL", "event":"play", "clipId":v.dataset.clipId};
                                v.contentWindow.postMessage(newData, "https://clips.twitch.tv");
                                return false;
                            }
                            if(v.dataset.clipId === e.data.clipId){
                                endedNextFound = true;
                                return true;
                            }
                    }
                });

                // for naver video
                if(!NCTCL_SETTINGS.autoPauseOtherClips || !NCTCL_SETTINGS.autoPauseOtherClipsForNaverVideo) return true;
                if(e.data.event == "play"){
                    var $videos = $(mainContent).find("video");
                    $videos.each(function(i, v){
                        var $nvideo = $(v);
                        var $id = $nvideo.attr("id");
                        if(e.data.clipId == $id) return;
                        if(!$nvideo.hasClass("_FIRSTPLAYED") || $nvideo[0].paused) return;

                        var $sevideo = $nvideo.closest(".se-video");
                        if ($sevideo.length == 0) {
                            DEBUG("no se-video");
                            return;
                        }

                        var $playbtn = $sevideo.find(".u_rmc_play_area button");
                        if($playbtn.length == 0) {
                            DEBUG("no playbtn");
                            return;
                        }

                        $playbtn.trigger("click");
                        DEBUG("NAVER VIDEO PAUSE");
                    });
                }
            }
        }

        // 메시지 이벤트가 발생하는 경우에 클립 정지 이벤트 함수 호출
        window.addEventListener("message", function(e){
            autoPauseVideo(e);
        });

        // 오리지널 링크를 제거하는 함수
        var removeOriginalLinks = function(url){
            if(!NCTCL_SETTINGS.use) return;
            if(!NCTCL_SETTINGS.removeOriginalLinks) return;
            try{
                var $as = $(mainContent).find("a.se-link");
                $as.each(function(i, v){
                    var $a = $(v);
                    var href = $a.attr("href");
                    if(href !== url || $a.hasClass("fired")){
                        return true;
                    }

                    var $p = $a.closest("p");
                    if($p.text() === url){
                        $p.remove();
                    }
                    else{
                        $a.remove();
                    }
                });
            }
            catch(e){
                DEBUG("Error from removeOriginalLinks", e);
            }
        }

    
        // improvedRefresh : [실험적] 향상된 새로고침
    function improvedRefresh(){
        try{
            DEBUG("improvedRefresh");
            const $cafeMain = $("#cafe_main");

            // 카페 메인 컨텐츠를 불러 올 수 없다면 과정 취소
            if($cafeMain.length === 0){
                return;
            }

            var saveCurrentCafeMainUrl = function()
            {
                // 현재 페이지 위치를 저장
                let lastCafeMainUrl = $cafeMain[0].contentWindow.location.href;
                
                DEBUG("save lastCafeMainUrl", lastCafeMainUrl);
                localStorage.setItem('lastCafeMainUrl', JSON.stringify({
                    "url":lastCafeMainUrl,
                    "date":Number(new Date())
                }));
            }

            if($cafeMain.attr('refreshed') !== "true"){
                $cafeMain.attr('refreshed', 'true');
                // 아래는 새로고침 시에 가장 마지막에 접속했던 주소와 url이 다르다면 리다이렉션을 합니다.
                (() => {
                    let savedLastCafeMainUrl = {url:undefined, date:-1};
                    try{
                        let savedLSLSCMU = localStorage.getItem('lastCafeMainUrl');
                        if(savedLSLSCMU === null){
                            DEBUG("savedLSLSCMU = null");
                            return;
                        }
                        savedLastCafeMainUrl = JSON.parse(savedLSLSCMU);
                    }
                    catch(e){
                        DEBUG("Error from improvedRefresh JSON.parse", e);
                        return;
                    }
        
                    DEBUG("savedLastCafeMainUrl", savedLastCafeMainUrl);
                    if(document.location.href === savedLastCafeMainUrl.url /*|| 
                        (document.location.href.match(/^https:\/\/cafe.naver.com\/\\w*$/) !== null 
                        && savedLastCafeMainUrl.url.indexOf("https://cafe.naver.com/MyCafeIntro.nhn") !== -1)*/
                    ){
                        DEBUG("저장된 url 과 현재 url 이 같다", savedLastCafeMainUrl.url);
                        return;
                    }

                    var exceptUrl = ["https://cafe.naver.com/MyCafeListGNBView.nhn"];
                    for(var i=0;i<exceptUrl.length;i++){
                        if(document.location.href.indexOf(exceptUrl[i]) !== -1){
                            DEBUG("예외 목록에 포함된 URL", exceptUrl[i], document.location.href);
                            return;
                        }
                    }
            
                    const parentWindowRefreshed = String(window.top.performance.getEntriesByType("navigation")[0].type) === "reload";
                    let refreshDelay = Number(new Date()) - savedLastCafeMainUrl.date;
            
                    DEBUG("PARENT REFRESHED? = ", parentWindowRefreshed, "CURRENT URL = ", document.location.href, ", REFRESHDELAY = ", refreshDelay);
        
                    if(parentWindowRefreshed && refreshDelay > 2000.0){
                        DEBUG("LOAD SAVED IFRAME URL. CURRRENT URL = ", document.location.href, ", SAVED URL = ", savedLastCafeMainUrl.url);
                        document.location.href = savedLastCafeMainUrl.url;
                        return;
                    }
                })();
                saveCurrentCafeMainUrl();
            }
            else{
                // 현재 페이지 위치를 저장
                saveCurrentCafeMainUrl();
            }
        }
        catch(e){
            DEBUG("Error from improvedRefresh", e);
        }
    }
        
    if(NCTCL_SETTINGS.improvedRefresh){
        improvedRefresh();
    }
    } // end loop.


    var letswatch = function (cb) {
        DEBUG("letswatch");
        var myIframe = document.getElementById("cafe_main");
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

    if(NCTCL_SETTINGS.use){
        letswatch(loop);
    }

    return;
});