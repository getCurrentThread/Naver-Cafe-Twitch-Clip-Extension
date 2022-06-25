NCTCLM.loadSettings().then(NCTCL_SETTINGS => {
    DEBUG("NCTCLM.loadSettings", NCTCL_SETTINGS);

    // 비디오 영상을 클릭했을 시에 일시정지/재생을 할 수 있도록 기능 추가
    // $(document).arrive("video", { existing: true }, function (video) {
    //     const $video = $(video);
    //     // DEBUG("video", video);
    //     $video.on("click", function (e) {
    //         DEBUG("video click", e);
    //         if ($video.prop("paused")) {
    //             $video.prop("play");
    //         } else {
    //             $video.prop("pause");
    //         }
    //     });
    // });

    // 임베디드 비디오에 대한 추가 조정 (소리, 자동재생, 비디오 사이즈)
    $(document).arrive("video", { onlyOnce: true, existing: true }, function (video) {
        // DEBUG("video", video);
        
        // 재생 이벤트
        video.addEventListener("play", (e) => {
            DEBUG("twitch clip play()", e);
            if(NCTCL_SETTINGS.autoPauseOtherClips || NCTCL_SETTINGS.autoPlayNextClip)
                chrome.runtime.sendMessage({"type":"NCTCL", "event":"play", "clipId":e.target.baseURI.replace(/^.*clip=/, '').replace(/&.*/, '')});
        });

        // 일시정지 이벤트
        video.addEventListener("pause", (e) => {
            DEBUG("twitch clip pause()", e);
            if(NCTCL_SETTINGS.autoPauseOtherClips)
                chrome.runtime.sendMessage({"type":"NCTCL", "event":"pause", "clipId":e.target.baseURI.replace(/^.*clip=/, '').replace(/&.*/, '')});
        });

        // 종료 이벤트
        video.addEventListener("ended", (e) => {
            DEBUG("twitch clip ended()", e);
            if(NCTCL_SETTINGS.autoPlayNextClip)
                chrome.runtime.sendMessage({"type":"NCTCL", "event":"ended", "clipId":e.target.baseURI.replace(/^.*clip=/, '').replace(/&.*/, '')});
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
    });

    // if window message is received, then do something
    // window.addEventListener("message", function (event) {
    //     DEBUG("window message", event);
    //     if (event.origin !== "https://www.twitch.tv") {
    //         return;
    //     }
    //     if (event.data.type === "NCTCL") {
    //         DEBUG("window message", event.data);
    //         if (event.data.event === "play") {
    //             DEBUG("window message", event.data);
    //             $("#" + event.data.clipId).prop("play");
    //         } else if (event.data.event === "pause") {
    //             DEBUG("window message", event.data);
    //             $("#" + event.data.clipId).prop("pause");
    //         }
    
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