NCTCLM.loadSettings().then(NCTCL_SETTINGS => {
    if(!NCTCL_SETTINGS.use) return;
    DEBUG("NCTCLM.loadSettings", NCTCL_SETTINGS);

    // chrome extension inject embed.css file
    addStyleFromFile("css/embed.css");

    // 임베디드 비디오에 대한 추가 조정 (소리, 자동재생, 비디오 사이즈)
    $(document).arrive("video", { onlyOnce: true, existing: true }, function (video) {
        // DEBUG("video", video);
        
        if(NCTCL_SETTINGS.autoPauseOtherClips){
            const clipId = video.baseURI.replace(/^.*clip=/, '').replace(/&.*/, '');
            // 재생 이벤트
            video.addEventListener("play", (e) => {
                DEBUG("twitch clip play()", e);
                chrome.runtime.sendMessage({
                    "type":"NCTCL", 
                    "event":"play", 
                    "clipId":clipId, 
                    "origin": "twitch.tv"
                });
                // setVolumeWhenStreamStarts 비디오의 전체 볼륨을 수정
                if(NCTCL_SETTINGS.setVolumeWhenStreamStarts){
                    if(video.volume !== undefined){
                        DEBUG("MUTE?", video.muted, "CURRENT VOLUME", video.volume, "TARGET VOLUME", NCTCL_SETTINGS.targetStartVolume);
                        // setTimeout(function(){
                            if(NCTCL_SETTINGS.targetStartVolume !== 0.0){
                                e.target.muted = false; // 기본 볼륨이 0아니라면 음소거를 해제해야 함
                            }
                            // 실제 볼륨 조절
                            e.target.volume = NCTCL_SETTINGS.targetStartVolume;
                            DEBUG("targetStartVolume", NCTCL_SETTINGS.targetStartVolume);
                            DEBUG("video.volume = ", e.target.volume);
                            // is_volume_changed = true;
                        // }, 100);
                    }
                }
            });

            // 일시정지 이벤트
            video.addEventListener("pause", (e) => {
                DEBUG("twitch clip pause()", e);
                chrome.runtime.sendMessage({
                    "type":"NCTCL", 
                    "event":"pause", 
                    "clipId":clipId, 
                    "origin": "twitch.tv"
                });
            });

            // 종료 이벤트
            video.addEventListener("ended", (e) => {
                DEBUG("twitch clip ended()", e);
                chrome.runtime.sendMessage({
                    "type":"NCTCL", 
                    "event":"ended", 
                    "clipId":clipId, 
                    "origin": "twitch.tv"
                });
            });

            // 백그라운드에게 전달 받은 이벤트 처리 (주로 비디오 중지)
            chrome.runtime.onMessage.addListener(
                function(request, sender, sendResponse) {
                    DEBUG("embed get message!", request, sender, sendResponse);
                    if(request.type === "NCTCL" && request.clipId === clipId){
                        if(request.event === "pause"){
                            video.pause();
                        }else if(request.event === "play"){
                            video.play();
                        }
                    }
                }
            );
        }
        // setVolumeWhenStreamStarts 비디오의 전체 볼륨을 수정
        if(NCTCL_SETTINGS.setVolumeWhenStreamStarts){
            video.addEventListener("play", (e) => {
                if(video.volume !== undefined){
                    DEBUG("MUTE?", video.muted, "CURRENT VOLUME", video.volume, "TARGET VOLUME", NCTCL_SETTINGS.targetStartVolume);
                    // setTimeout(function(){
                        if(NCTCL_SETTINGS.targetStartVolume !== 0.0){
                            e.target.muted = false; // 기본 볼륨이 0아니라면 음소거를 해제해야 함
                        }
                        // 실제 볼륨 조절
                        e.target.volume = NCTCL_SETTINGS.targetStartVolume;
                        DEBUG("targetStartVolume", NCTCL_SETTINGS.targetStartVolume);
                        DEBUG("video.volume = ", e.target.volume);
                        // is_volume_changed = true;
                    // }, 100);
                }
            });
        }
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