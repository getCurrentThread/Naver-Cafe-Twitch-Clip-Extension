var NCTCL_SETTINGS = {};
var played = []; // 현재 재생중인 음원 목록 (리스트로 관리하는 이유는 이벤트가 동시 다발적으로 이루어질 수 있기 때문)
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if(request.type === "NCTCL"){
            // 익스텐션 처리 옵션이 꺼져 있는 경우 처리하지 않음
            DEBUG("request", request);
            if(!NCTCL_SETTINGS.use) return;
            // 네이버 동영상에 대한 옵션이 꺼져 있는 경우에는 네이버 동영상 메시지를 처리하지 않음
            if(!NCTCL_SETTINGS.autoPauseOtherClipsForNaverVideo && request.origin === "naver.com") return;
            // 유튜브 동영상에 대한 옵션이 꺼져 있는 경우에는 유튜브 동영상 메시지를 처리하지 않음
            if(!NCTCL_SETTINGS.autoPauseOtherClipsForYoutubeVideo && request.origin === "youtube.com") return;

            if(request.event === "play"){
                // 중복이 아닌 경우만 리스트에 추가
                if(!played.some(function(item){ return item.clipId === request.clipId && item.tabId === sender.tab.id; })){
                    played.push({type: request.type, clipId: request.clipId, origin: request.origin, tabId: sender.tab.id});
                }
            }
            else if(request.event === "pause" || request.event === "ended"){
                played = played.filter(function(item){
                    return item.clipId !== request.clipId && item.tabId !== sender.tab.id;
                })
                return;
            }
            // 이전 영상에 대한 종료 처리
            let existed = new Set();
            let isFirst = (id) => {let ret = existed.has(id); existed.add(id); return !ret;};
            played.reverse().forEach(function(item){
                let needless = true;
                try{
                    if(!NCTCL_SETTINGS.autoPauseOtherClipsForNaverVideo && item.origin === "naver.com") return; // 네이버 비디오 옵션이 꺼져있는 상태라면 네이버 영상들은 스킵
                    if(!NCTCL_SETTINGS.autoPauseOtherClipsForYoutubeVideo && item.origin === "youtube.com") return; // 유튜브 비디오 옵션이 꺼져있는 상태라면 유튜브 영상들은 스킵
                    if(!NCTCL_SETTINGS.autoPauseOtherClipsForShareTabs && isFirst(item.tabId)) needless = false; // 탭 공유 옵션이 꺼져있는 상태라면 같은 텝의 영상만 하나씩 처리
                    if(NCTCL_SETTINGS.autoPauseOtherClipsForShareTabs && isFirst(null)) needless = false; // 탭 공유 옵션이 켜져있는 상태라면 가장 최근 영상만 제외
                    if(needless){
                        chrome.tabs.sendMessage(item.tabId, {type: item.type, clipId: item.clipId, origin: item.origin, event: "pause"});
                        DEBUG("send message to tab", item.tabId, item.type, item.clipId, item.origin, "pause");
                    }
                }catch(e){
                    DEBUG("error", e);
                }finally{
                    if(needless){
                        played = played.filter(function(x){
                            return x.clipId !== item.clipId && x.tabId !== item.tabId;
                        });
                    }
                }
            });
            
        // NCTCL_SETTINGS 옵션값을 업데이트
        }else if(request.type === "NCTCLM" && request.event === "update"){
            NCTCL_SETTINGS = request.settings;
        }
    }
);

// debug message
function DEBUG( /**/ ) {
    if (NCTCL_SETTINGS?.debug) {
        var args = arguments, args_length = args.length, args_copy = args;
        for (var i = args_length; i > 0; i--) args[i] = args_copy[i - 1];
        args[0] = "[NCTC]  ";
        args.length = args_length + 1;
        console.log.apply(console, args);
    }
};
  