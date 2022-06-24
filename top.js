

NCTCLM.loadSettings().then(NCTCL_SETTINGS => {
    DEBUG("NCTCLM.loadSettings", NCTCL_SETTINGS);
    var loop = function(){
        if(!NCTCL_SETTINGS.use) return;
        // 내부 iframe의 document를 가져오기
        const mainContent = document.querySelector("iframe#cafe_main")?.contentDocument;
        DEBUG("mainContent", mainContent);
        if(!mainContent) return;


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
                            let newData = {"type":"NCTCL", "event":"pause", "clipId":e.data.clipId};
                            v.contentWindow.postMessage(newData, "https://clips.twitch.tv");
                            break;
                        case "ended":
                            if(!NCTCL_SETTINGS.autoPlayNextClip) return false;
                            if(endedNextFound){
                                let newData = {"type":"NCTCL", "event":"play", "clipId":v.dataset.clipId};
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

 

    
        // improvedRefresh : [실험적] 향상된 새로고침
        // if(NCTCL_SETTINGS.improvedRefresh){
        //     try{
        //         DEBUG("improvedRefresh");
        //         const $cafeMain = $("#cafe_main");

        //         // 카페 메인 컨텐츠를 불러 올 수 없다면 과정 취소
        //         if($cafeMain.length === 0){
        //             return;
        //         }

        //         var saveCurrentCafeMainUrl = function()
        //         {
        //             // 현재 페이지 위치를 저장
        //             let lastCafeMainUrl = $cafeMain[0].contentWindow.location.href;
                    
        //             DEBUG("save lastCafeMainUrl", lastCafeMainUrl);
        //             localStorage.setItem('lastCafeMainUrl', JSON.stringify({
        //                 "url":lastCafeMainUrl,
        //                 "date":Number(new Date())
        //             }));
        //         }

        //         if($cafeMain.attr('refreshed') !== "true"){
        //             $cafeMain.attr('refreshed', 'true');
        //             // 아래는 새로고침 시에 가장 마지막에 접속했던 주소와 url이 다르다면 리다이렉션을 합니다.
        //             (() => {
        //                 let savedLastCafeMainUrl = {url:undefined, date:-1};
        //                 try{
        //                     let savedLSLSCMU = localStorage.getItem('lastCafeMainUrl');
        //                     if(savedLSLSCMU === null){
        //                         DEBUG("savedLSLSCMU = null");
        //                         return;
        //                     }
        //                     savedLastCafeMainUrl = JSON.parse(savedLSLSCMU);
        //                 }
        //                 catch(e){
        //                     DEBUG("Error from improvedRefresh JSON.parse", e);
        //                     return;
        //                 }
            
        //                 DEBUG("savedLastCafeMainUrl", savedLastCafeMainUrl);
        //                 if(document.location.href === savedLastCafeMainUrl.url /*|| 
        //                     (document.location.href.match(/^https:\/\/cafe.naver.com\/\\w*$/) !== null 
        //                     && savedLastCafeMainUrl.url.indexOf("https://cafe.naver.com/MyCafeIntro.nhn") !== -1)*/
        //                 ){
        //                     DEBUG("저장된 url 과 현재 url 이 같다", savedLastCafeMainUrl.url);
        //                     return;
        //                 }

        //                 var exceptUrl = ["https://cafe.naver.com/MyCafeListGNBView.nhn"];
        //                 for(var i=0;i<exceptUrl.length;i++){
        //                     if(document.location.href.indexOf(exceptUrl[i]) !== -1){
        //                         DEBUG("예외 목록에 포함된 URL", exceptUrl[i], document.location.href);
        //                         return;
        //                     }
        //                 }
                
        //                 const parentWindowRefreshed = String(window.top.performance.getEntriesByType("navigation")[0].type) === "reload";
        //                 let refreshDelay = Number(new Date()) - savedLastCafeMainUrl.date;
                
        //                 DEBUG("PARENT REFRESHED? = ", parentWindowRefreshed, "CURRENT URL = ", document.location.href, ", REFRESHDELAY = ", refreshDelay);
            
        //                 if(parentWindowRefreshed && refreshDelay > 2000.0){
        //                     DEBUG("LOAD SAVED IFRAME URL. CURRRENT URL = ", document.location.href, ", SAVED URL = ", savedLastCafeMainUrl.url);
        //                     document.location.href = savedLastCafeMainUrl.url;
        //                     return;
        //                 }
        //             })();
        //             saveCurrentCafeMainUrl();
        //             }
        //             else{
        //                 // 현재 페이지 위치를 저장
        //                 saveCurrentCafeMainUrl();
        //             }
        //     }catch(e){
        //         DEBUG("Error from improvedRefresh", e);
        //     }
        // }

        // playAndPauseByClick
        if(NCTCL_SETTINGS.playAndPauseByClick){
            try {
                DEBUG("playAndPauseByClick");

                // $(mainContent).arrive("iframe.NCTCL-iframe", { existing: true }, function (iframe) {
                //     const $iframe = $(iframe.contentDocument);
                //     DEBUG("iframe.contentDocument", $iframe);
                //     // $iframe.find("head").append(`<style>
                //     //     html body .top-bar
                //     //     ,[data-a-target="player-twitch-logo-button"]
                //     //     {
                //     //         display:none !important;
                //     //     }
                //     //     html body .video-player__container
                //     //     ,html body .video-player{
                //     //         background:unset;
                //     //     }
                //     //     </style>`);
                //     $iframe.arrive("video", { existing: true }, function (video) {
                //         const $video = $(video);
                //         DEBUG("video", video);
                //         $video.on("click", function (e) {
                //             if ($video.prop("paused")) {
                //                 $video.prop("play");
                //             } else {
                //                 $video.prop("pause");
                //             }
                //         });
                //     });
                // });
                    // DEBUG("iframe.NCTCL-iframe", $iframe);
                    // // add style on iframe.
                    

                    // var backgroundDblclicked = false;
                    // var dblclickSetTimeout = undefined;

                    // DEBUG($iframe.find("[data-a-target='player-overlay-click-handler']"));
                    // $iframe.find("[data-a-target='player-overlay-click-handler']").on('click', (e) => {
                    //     DEBUG('clicked - playing', e);
                    //     $iframe.find("button[data-a-target='player-play-pause-button']").click();
                    //     // e.target.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter'}));

                    //     backgroundDblclicked = true;
                    //     clearTimeout(dblclickSetTimeout);
                    //     dblclickSetTimeout = setTimeout(function(){
                    //         backgroundDblclicked = false;
                    //     },300);
                    // });

                //     $iframe.find(".player-overlay-background").on('click', (e) => {
                //         DEBUG('clicked - end or play', e);
                //         if($(e.target).find(".clip-postplay-recommendations").length !== 0){
                //             DEBUG("There is recommendations div");
                //             $iframe.querySelector("button[data-a-target='player-play-pause-button']").click();
                //             // e.target.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter'}));
                //         }
                //         else{
                //             DEBUG("There is no recommendations div");
                //         }

                //         if(backgroundDblclicked){
                //             clearTimeout(dblclickSetTimeout);
                //             backgroundDblclicked = false;
                //             $iframe.find("button[data-a-target='player-fullscreen-button']").click();
                //             // e.target.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter'}));
                //         }
                //     });
                // });
            } catch (e) {
                DEBUG("ERROR FROM playAndPauseByClick", e);
            }
        }

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