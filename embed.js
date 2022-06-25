NCTCLM.loadSettings().then(NCTCL_SETTINGS => {
    DEBUG("NCTCLM.loadSettings", NCTCL_SETTINGS);


    // 임베디드 비디오에 대한 추가 조정 (소리, 자동재생, 비디오 사이즈)
    $(document).arrive("video", { onlyOnce: true, existing: true }, function (video) {
        // DEBUG("video", video);
        
        // 재생 이벤트
        video.addEventListener("play", (e) => {
            DEBUG("twitch clip play()", e);
            // if(NCTCL_SETTINGS.autoPauseOtherClips || NCTCL_SETTINGS.autoPlayNextClip)
                chrome.runtime.sendMessage({"type":"NCTCL", "event":"play", "clipId":e.target.baseURI.replace(/^.*clip=/, '').replace(/&.*/, ''), origin: "twitch.tv"});
        });

        // 일시정지 이벤트
        video.addEventListener("pause", (e) => {
            DEBUG("twitch clip pause()", e);
            // if(NCTCL_SETTINGS.autoPauseOtherClips)
                chrome.runtime.sendMessage({"type":"NCTCL", "event":"pause", "clipId":e.target.baseURI.replace(/^.*clip=/, '').replace(/&.*/, ''), origin: "twitch.tv"});
        });

        // 종료 이벤트
        video.addEventListener("ended", (e) => {
            DEBUG("twitch clip ended()", e);
            // if(NCTCL_SETTINGS.autoPlayNextClip)
                chrome.runtime.sendMessage({"type":"NCTCL", "event":"ended", "clipId":e.target.baseURI.replace(/^.*clip=/, '').replace(/&.*/, ''), origin: "twitch.tv"});
        });

        // TODO: setVolumeWhenStreamStarts 비디오의 전체 볼륨을 수정
        var is_volume_changed = false;
        if(NCTCL_SETTINGS.setVolumeWhenStreamStarts && !is_volume_changed){
            if(video.volume !== undefined){
                DEBUG("MUTE?", video.muted, "CURRENT VOLUME", video.volume, "TARGET VOLUME", NCTCL_SETTINGS.targetStartVolume);
                setTimeout(function(){
                    if(NCTCL_SETTINGS.targetStartVolume !== 0.0){
                        video.muted = false; // 기본 볼륨이 0아니라면 음소거를 해제해야 함
                    }
                    // 실제 볼륨 조절
                    video.volume = NCTCL_SETTINGS.targetStartVolume;
                    DEBUG("targetStartVolume", NCTCL_SETTINGS.targetStartVolume);
                    DEBUG("video.volume = ", video.volume);
                    is_volume_changed = true;
                }, 100);
            }
        }

        // 백그라운드에게 전달 받은 이벤트 처리 (주로 비디오 중지)
        chrome.runtime.onMessage.addListener(
            function(request, sender, sendResponse) {
                console.log(request, sender, sendResponse);
                // console.log(sender.tab ?
                //             "from a content script:" + sender.tab.url :
                //             "from the extension");
                // if (request.greeting === "hello")
                //     sendResponse({farewell: "goodbye"});
            }
        );
    });



    // playAndPauseByClick : 비디오를 클릭하면 자동으로 재생/일시정지를 하는 기능
    if(NCTCL_SETTINGS.playAndPauseByClick){
        try {
            addStyle(`
                html body .top-bar
                ,[data-a-target="player-twitch-logo-button"]
                {
                    display:none !important;
                }
                html body .video-player__container
                ,html body .video-player{
                    background:unset;
                }
            `);

            var backgroundDblclicked = false;
            var dblclickSetTimeout = undefined;

            $(document).on('click', "[data-a-target='player-overlay-click-handler']", (e) => {
                DEBUG('clicked - playing', e);
                document.querySelector("button[data-a-target='player-play-pause-button']").click();

                backgroundDblclicked = true;
                clearTimeout(dblclickSetTimeout);
                dblclickSetTimeout = setTimeout(function(){
                    backgroundDblclicked = false;
                },300);
            });

            $(document).on('click', ".player-overlay-background", (e)=>{
                DEBUG('clicked - end or play', e);
                if($(e.target).find(".clip-postplay-recommendations").length !== 0){
                    DEBUG("There is recommendations div");
                    document.querySelector("button[data-a-target='player-play-pause-button']").click();
                }
                else{
                    DEBUG("There is no recommendations div");
                }

                if(backgroundDblclicked){
                    clearTimeout(dblclickSetTimeout);
                    backgroundDblclicked = false;
                    $("button[data-a-target='player-fullscreen-button']").click();
                }
            });

        } catch (e) {
            DEBUG("ERROR FROM playAndPauseByClick", e);
        }
    }
});