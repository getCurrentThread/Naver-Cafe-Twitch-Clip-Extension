NCTCLM.loadSettings().then(NCTCL_SETTINGS => {
    if(!NCTCL_SETTINGS.use) return;
    DEBUG("NCTCLM.loadSettings", NCTCL_SETTINGS);

    // chrome extension inject youtube.css file
    // addStyleFromFile("css/youtube.css");

    // 임베디드 비디오에 대한 추가 조정 (소리, 자동재생, 비디오 사이즈)
    $(document).arrive("video", { onlyOnce: true, existing: true }, function (video) {
        // DEBUG("video", video);
        
        if(NCTCL_SETTINGS.autoPauseOtherClips && NCTCL_SETTINGS.autoPauseOtherClipsForYoutubeVideo){
            const youtubeId = video.baseURI.replace(/^.*youtube\.com\//, '').replace(/&.*/, '').trim();
            // 재생 이벤트
            video.addEventListener("play", (e) => {
                DEBUG("twitch clip play()", e);
                chrome.runtime.sendMessage({
                    "type":"NCTCL", 
                    "event":"play", 
                    "clipId":youtubeId, 
                    "origin": "youtube.com"
                });
                // setVolumeWhenStreamStarts 비디오의 전체 볼륨을 수정
                // if(NCTCL_SETTINGS.setVolumeWhenStreamStarts){
                //     if(video.volume !== undefined){
                //         DEBUG("MUTE?", video.muted, "CURRENT VOLUME", video.volume, "TARGET VOLUME", NCTCL_SETTINGS.targetStartVolume);
                //         // setTimeout(function(){
                //             if(NCTCL_SETTINGS.targetStartVolume !== 0.0){
                //                 e.target.muted = false; // 기본 볼륨이 0아니라면 음소거를 해제해야 함
                //             }
                //             // 실제 볼륨 조절
                //             e.target.volume = NCTCL_SETTINGS.targetStartVolume;
                //             DEBUG("targetStartVolume", NCTCL_SETTINGS.targetStartVolume);
                //             DEBUG("video.volume = ", e.target.volume);
                //             // is_volume_changed = true;
                //         // }, 100);
                //     }
                // }
            });

            // 일시정지 이벤트
            video.addEventListener("pause", (e) => {
                DEBUG("youtube video pause()", e);
                chrome.runtime.sendMessage({
                    "type":"NCTCL", 
                    "event":"pause", 
                    "clipId":youtubeId, 
                    "origin": "youtube.com"
                });
            });

            // 종료 이벤트
            video.addEventListener("ended", (e) => {
                DEBUG("youtube video ended()", e);
                chrome.runtime.sendMessage({
                    "type":"NCTCL", 
                    "event":"ended", 
                    "clipId":youtubeId, 
                    "origin": "youtube.com"
                });
            });

            // 백그라운드에게 전달 받은 이벤트 처리 (주로 비디오 중지)
            chrome.runtime.onMessage.addListener(
                function(request, sender, sendResponse) {
                    DEBUG("embed get message!", request, sender, sendResponse);
                    if(request.type === "NCTCL" && request.clipId === youtubeId){
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
        // if(NCTCL_SETTINGS.setVolumeWhenStreamStarts){
        //     video.addEventListener("play", (e) => {
        //         if(video.volume !== undefined){
        //             DEBUG("MUTE?", video.muted, "CURRENT VOLUME", video.volume, "TARGET VOLUME", NCTCL_SETTINGS.targetStartVolume);
        //             // setTimeout(function(){
        //                 if(NCTCL_SETTINGS.targetStartVolume !== 0.0){
        //                     e.target.muted = false; // 기본 볼륨이 0아니라면 음소거를 해제해야 함
        //                 }
        //                 // 실제 볼륨 조절
        //                 e.target.volume = NCTCL_SETTINGS.targetStartVolume;
        //                 DEBUG("targetStartVolume", NCTCL_SETTINGS.targetStartVolume);
        //                 DEBUG("video.volume = ", e.target.volume);
        //                 // is_volume_changed = true;
        //             // }, 100);
        //         }
        //     });
        // }
    });

    // hideYoutubePauseOverlayContents : 유튜브 일시정지 시에 나오는 더보기 컨텐츠 숨김
    if(NCTCL_SETTINGS.hideYoutubePauseOverlayContents){
        addStyle('.ytp-expand-pause-overlay .ytp-pause-overlay{visibility: hidden;}')
    }
    // hideYoutubeEndScreenContents : 유튜브 영상 종료 후에 나오는 추천 컨텐츠 숨김
    if(NCTCL_SETTINGS.hideYoutubeEndScreenContents){
        addStyle('.ytp-endscreen-content{visibility: hidden;}');
    }
});