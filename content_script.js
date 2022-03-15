

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





    // Twitch clip 링크를 iframe 으로 변환
    var changeToTwitchCilpIframe = function($elem, clipId, autoPlay, muted){
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
                <iframe class="NCTCL-iframe" src="https://clips.twitch.tv/embed?clip=${clipId}&parent=${parentHref}&autoplay=${autoPlay}&muted=${muted}" frameborder="0" allowfullscreen="true" scrolling="no" height="${videoHeightStr}" width="${videoWidthStr}"></iframe>
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
        $(mainContent).arrive("div.se-module-oglink", { onlyOnce: true, existing: true }, function (elem) {
            try{
                var $elem = $(elem);
                if($elem.hasClass("fired")) return;
                $elem.addClass("fired");

                var $as = $elem.find("a");
                var regex = /^https?:\/\/clips\.twitch\.tv\/([a-zA-Z0-9-_]+)/;
                var regex2 = /^https?:\/\/www.twitch.tv\/[a-zA-Z0-9-_]+\/clip\/([a-zA-Z0-9-_]+)/;
                
                // 자동 변환 시
                if(NCTCL_SETTINGS.method === "autoLoad"){
                    var $a = $as.first();
                    var href = $a.attr("href");
                    var match = href.match(regex) || href.match(regex2);

                    if(!!match && match.length > 1){
                        var clipId = match[1];
                        DEBUG("clipId", clipId);
                        var isAutoPlay = false;
                        var isMuted = false;
                        var NCTCL_Length = mainContent.querySelectorAll(".NCTCL-iframe").length;
                            if(NCTCL_Length == 0){
                                if(NCTCL_SETTINGS.autoPlayFirstClip) isAutoPlay = true;
                                if(NCTCL_SETTINGS.autoPlayFirstClip && NCTCL_SETTINGS.autoPlayFirstClipMuted) isMuted = true;
                                changeToTwitchCilpIframe($elem, clipId, isAutoPlay, isMuted);
                            }
                            else if(NCTCL_Length < NCTCL_SETTINGS.autoLoadLimit){
                                changeToTwitchCilpIframe($elem, clipId, isAutoPlay, isMuted);
                            }
                            else{
                                if($a.hasClass("se-oglink-thumbnail")) $a.addClass("hoverPlayButton");
                                $a.on("click", function(e){
                                    e.preventDefault();
                                    changeToTwitchCilpIframe($(e.target), clipId, NCTCL_SETTINGS.clickRequiredAutoPlay, NCTCL_SETTINGS.clickRequiredMuted);
                                });
                            }
                        
                    }
                }
                // 클릭 변환 시
                else{ 
                    $as.each(function(i, v){
                        var $a = $(v);
                        var href = $a.attr("href");
                        var match = href.match(regex) || href.match(regex2);

                        if(match !== null && match.length > 1){
                            var clipId = match[1];
                            if($a.hasClass("se-oglink-thumbnail")) $a.addClass("hoverPlayButton");
                            $a.on("click", function(e){
                                e.preventDefault();
                                changeToTwitchCilpIframe($(e.target), clipId, NCTCL_SETTINGS.clickRequiredAutoPlay, NCTCL_SETTINGS.clickRequiredMuted);
                            });
                        }
                    });
                }
            }
            catch(e){
                console.error("Error from arrive", e);
            }
        });
    }
    if(NCTCL_SETTINGS.use){
        loop();
        // interval timer every 5 seconds
        var intervalTimer = setInterval(loop, 5000);
    }

    return;
});