NCTCLM.loadSettings().then(NCTCL_SETTINGS => {
    DEBUG("NCTCLM.loadSettings", NCTCL_SETTINGS);

    $(document).arrive("video", { existing: true }, function (video) {
        const $video = $(video);
        DEBUG("video", video);
        $video.on("click", function (e) {
            DEBUG("video click", e);
            if ($video.prop("paused")) {
                $video.prop("play");
            } else {
                $video.prop("pause");
            }
        });
    });

    // 임베디드 비디오에 대한 추가 조정 (소리, 자동재생, 비디오 사이즈)
    $(document).arrive("video", { onlyOnce: true, existing: true }, function (video) {
        DEBUG("video", video);
        
        // 재생 이벤트
        video.addEventListener("play", (e) => {
            let $e = $(e.target);
            DEBUG("twitch clip play()", e);
            if(NCTCL_SETTINGS.autoPauseOtherClips || NCTCL_SETTINGS.autoPlayNextClip) 
                window.postMessage({"type":"NCTCL", "event":"play", "clipId":$e.attr("id")}, "https://cafe.naver.com");
            
            if(!$e.hasClass("_FIRSTPLAYED")){
                $e.addClass("_FIRSTPLAYED");
                // // TODO: CSS 테마를 하단에 넣어야함
                // addStyle(`
                // html body .player-overlay-background--darkness-5{background:unset !important;}
                // [data-a-target="player-overlay-play-button"]{display:none;}
                // `);
            }
        });

        // 일시정지 이벤트
        video.addEventListener("pause", (e) => {
            DEBUG("twitch clip pause()", e);
            if(NCTCL_SETTINGS.autoPauseOtherClips) 
                window.postMessage({"type":"NCTCL", "event":"pause", "clipId":$(e.target).attr("id")}, "https://clips.twitch.tv");
        });

        // 종료 이벤트
        video.addEventListener("ended", (e) => {
            DEBUG("twitch clip ended()", e);
            if(NCTCL_SETTINGS.autoPlayNextClip) 
                window.postMessage({"type":"NCTCL", "event":"ended", "clipId":$(e.target).attr("id")}, "https://clips.twitch.tv");
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
});