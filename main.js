NCTCLM.loadSettings().then(NCTCL_SETTINGS => {
    DEBUG("NCTCLM.loadSettings", NCTCL_SETTINGS);

    // 콘텐츠 width 계산
    var contentWidth = 800;
    var videoWidth, videoHeight, videoWidthStr, videoHeightStr;
    var videoCSSElem = undefined;
    var contentWidthInit = false;
    var reCalculateIframeWidth = function(width){
        if(contentWidthInit && contentWidth === width){
            return;
        }
        contentWidthInit = true;

        if(videoCSSElem !== undefined){
            $(videoCSSElem).remove();
        }
        contentWidth = width;
        videoWidth = Number(NCTCL_SETTINGS.videoWidth)/100.0 * contentWidth;
        videoHeight = Number(videoWidth)/16.0*9.0;// + 30
        videoWidthStr = String(videoWidth) + "px";
        videoHeightStr = String(videoHeight) + "px";

        videoCSSElem = addStyle(`
        .NCTCL-iframe{
        width:${videoWidthStr};
        height:${videoHeightStr} ;
        }
        .NCTCL-container .se-link{
            width:${videoWidthStr}
        }
        `);
        DEBUG("reCalculateIframeWidth", width);
    }
    reCalculateIframeWidth(contentWidth);

    // 논 영화관 모드 CSS 설정
    var $article_container = $("div.article_container");
    if($article_container.length !== 0) {
        reCalculateIframeWidth($article_container.width());
    }

    $("html").removeClass("theaterMode");
    nonTheaterModeCSSElem = addStyle(`
    .CafeViewer .se-viewer .se-section-oglink.twitchClipFound .se-oglink-thumbnail-resource{
        object-fit:cover;
    }
    .CafeViewer .se-viewer .se-section-oglink.twitchClipFound {
        max-width:${contentWidth * Number(Number(NCTCL_SETTINGS.videoWidth)) / 100.0}px !important;
        max-height:calc(${contentWidth * Number(Number(NCTCL_SETTINGS.videoWidth)) / 100.0}px / 16.0 * 9.0 + 48px) !important;
    }
    .se-viewer .se-section-oglink.se-l-large_image.twitchClipFound .se-oglink-thumbnail,
    .se-viewer .se-section-oglink.se-l-large_image.twitchClipFound .se-oglink-thumbnail-resource{
        max-width:${contentWidth * Number(Number(NCTCL_SETTINGS.videoWidth)) / 100.0}px !important;
        max-height:calc(${contentWidth * Number(Number(NCTCL_SETTINGS.videoWidth)) / 100.0}px / 16.0 * 9.0) !important;
    }
    `);

    var $article_container = $("div.article_container");
    if($article_container.length !== 0) {
        reCalculateIframeWidth($article_container.width());
    }

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
    var changeToTwitchCilpIframe = function($elem, clipId, autoPlay, muted, lazy){
        try{
            var $parentContainer = $elem.closest("div.se-component-content");
            var $article_container = $elem.closest("div.article_container");
            if($article_container.length !== 0) {
                reCalculateIframeWidth($article_container.width());
            }
            $parentContainer.find(".se-oglink-thumbnail").hide();
            var tempary = document.location.href.split("/");
            var parentHref = tempary[2];
            
            $(document).find(`.NCTCL-iframe-container[data-clip-id='${clipId}']`)
            .append(`<iframe ${lazy ? "loading='lazy'" : ""} class="NCTCL-iframe" data-clip-id="${clipId}" src="https://clips.twitch.tv/embed?clip=${clipId}&parent=${parentHref}&autoplay=${autoPlay}&muted=${muted}" frameborder="0" allowfullscreen="true" allow="autoplay" scrolling="no"></iframe>`);
            // iframeNo += 1;
        }
        catch(e){
            DEBUG("Error from changeToTwitchCilpIframe", e);
        }
    }

    // Twitch clip 링크 찾기
    $(document).arrive("div.se-module-oglink", {
        onlyOnce: true,
        existing: true
    }, function(elem) {
        try{
            var $elem = $(elem);
            if($elem.hasClass("fired")) return;
            $elem.addClass("fired");
            $elem.parent("div.se-section-oglink").addClass("fired");

            var regex = /^(?:https?:\/\/)(?:clips\.twitch\.tv|(?:www\.)?twitch\.tv\/[a-zA-Z0-9-_]+\/clip)\/([a-zA-Z0-9-_]+)/;
            
            var $a = $elem.find("a.se-oglink-thumbnail").first();
            if($a.length === 0) return; // thumbnail 이 없는 것은 제외한다.

            var href = $a.attr("href");
            var match = href.match(regex);
            var clipId;
            if(match !== null && match.length > 1){
                clipId = match[1];
                removeOriginalLinks(href);
                insertTwitchCilpDescription($elem, clipId);
                //DEBUG("TWITCH CILP FOUND, CLIP ID = ", clipId);
            }
            else{
                return;
            }
            
            // 자동 변환 시
            if(NCTCL_SETTINGS.method === "autoLoad"){
                var isAutoPlay = false;
                var isMuted = false;
                if(NCTCL_SETTINGS.setVolumeWhenStreamStarts && NCTCL_SETTINGS.targetStartVolume == 0) isMuted = true;
                var NCTCL_Length = document.querySelectorAll(".NCTCL-iframe").length;
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
                            var isClickRequiredMuted = false;
                            if(NCTCL_SETTINGS.setVolumeWhenStreamStarts && NCTCL_SETTINGS.targetStartVolume == 0) isClickRequiredMuted = true;
                            changeToTwitchCilpIframe($(e.target), clipId, NCTCL_SETTINGS.clickRequiredAutoPlay, isClickRequiredMuted, false);
                        });
                    }
            }else{ 
                $as.each(function(i, v){
                    var $a = $(v);
                    var href = $a.attr("href");
                    var match = href.match(regex);

                    if(match !== null && match.length > 1){
                        var clipId = match[1];
                        if($a.hasClass("se-oglink-thumbnail")) $a.addClass("hoverPlayButton");
                        $a.on("click", function(e){
                            e.preventDefault();
                            var isClickRequiredMuted = false;
                            if(NCTCL_SETTINGS.setVolumeWhenStreamStarts && NCTCL_SETTINGS.targetStartVolume == 0) isClickRequiredMuted = true;
                            changeToTwitchCilpIframe($(e.target), clipId, NCTCL_SETTINGS.clickRequiredAutoPlay, false, false);
                        });
                    }
                });
            }
            $elem.addClass("twitchClipFound");
            $elem.closest("div.se-section-oglink").addClass("twitchClipFound");
            $elem.closest("div.se-component-content").addClass("twitchClipFound");
        }catch(e){
            console.error("Error from arrive", e);
        }
    });

    // 오리지널 링크를 제거하는 함수
    var removeOriginalLinks = function(url){
        if(!NCTCL_SETTINGS.use) return;
        if(!NCTCL_SETTINGS.removeOriginalLinks) return;
        try{
            var $as = $(document).find("a.se-link");
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

    // naverVideoAutoMaxQuality 네이버 동영상을 최대 화질로 고정합니다.
    if(NCTCL_SETTINGS.naverVideoAutoMaxQuality){
        $(document).arrive(".u_rmc_definition_ly", { existing: true }, function (elem) {
            setTimeout(function(){
                try{
                    DEBUG("TRY TO SET BEST QUALITY");
                    var $elem = $(elem);
                    var $u_rmcplayer = $elem.closest(".u_rmcplayer");
                    if($u_rmcplayer.length === 0) {
                        DEBUG("no $u_rmcplayer");
                        return;
                    }

                    if($u_rmcplayer.hasClass("_QSET")) {
                        DEBUG("ALREADY QSET");
                        return;
                    }

                    var $qli = $(elem).find("li");
                    if($qli.length > 2){
                        var $last = $qli.last();
                        if($last.hasClass("u_rmc_on")) {
                            DEBUG("u_rmc_on - ALREADY QSET");
                            return;
                        }

                        DEBUG("BEST QUALITY SET", $last.text());
                        $last.find("button").trigger("click");

                        $u_rmcplayer.addClass("_QSET");
                    }
                    else{
                        DEBUG("no li elements for QSET");
                    }

                }
                catch(e){
                    DEBUG("Error from naverVideoAutoMaxQuality arrive", e);
                }
            }, 1);
        });
    }
});