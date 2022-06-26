var NCTCL_SETTINGS = {};
var played = []; // 현재 재생중인 음원 목록 (리스트로 관리하는 이유는 이벤트가 동시 다발적으로 이루어질 수 있기 때문)
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if(request.type === "NCTCL"){
            // 익스텐션 처리 옵션이 꺼져 있는 경우 처리하지 않음
            console.log("request", request);
            if(!NCTCL_SETTINGS.used) return;
            // 네이버 동영상에 대한 옵션이 꺼져 있는 경우에는 네이버 동영상 메시지를 처리하지 않음
            if(!NCTCL_SETTINGS.autoPauseOtherClipsForNaverVideo && request.origin === "naver.com") return;
            if(request.event === "play"){
                // 중복이 아닌 경우만 리스트에 추가
                if(!played.some(function(item){ return item.clipId === request.clipId })){
                    played.push({type: request.type, clipId: request.clipId, origin: request.origin, tabId: sender.tab.id});
                }
            }
            else if(request.event === "pause"){
                played = played.filter(function(item){
                    return item.clipId !== request.clipId;
                });
            }else if(request.event === "ended"){
                played = played.filter(function(item){
                    return item.clipId !== request.clipId;
                });
            }
            // 이전 영상에 대한 종료 처리
            played.slice(0, -1).forEach(function(item){
                try{
                    if(!NCTCL_SETTINGS.autoPauseOtherClipsForNaverVideo && item.origin === "naver.com") return; // 네이버 비디오 옵션이 꺼져있는 상태라면 네이버 영상들은 스킵
                    chrome.tabs.sendMessage(item.tabId, {type: item.type, clipId: item.clipId, origin: item.origin, event: "pause"});
                    // console.log("send message to tab", item.tabId, item.type, item.clipId, item.origin, "pause");
                }catch(e){
                    console.log("error", e);
                    played = played.filter(function(x){
                        return x.clipId !== item.clipId;
                        
                    });
                }
            });
        // NCTCL_SETTINGS 옵션값을 업데이트
        }else if(request.type === "NCTCLM" && request.event === "update"){
            NCTCL_SETTINGS = request.settings;
        }
    }
);