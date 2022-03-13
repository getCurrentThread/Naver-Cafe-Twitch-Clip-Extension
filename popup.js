document.addEventListener('DOMContentLoaded', function() {
    console.log("[NCTCL] Naver-Cafe-Twitch-Clip-Loader", document.location.href);

    // 설정 불러와서 #use 체크
    NCTCLM.loadSettings().then(function(settings) {
        if (settings.use) {
            document.getElementById("use")?.checked = true;
        }
    });
    
    $('#use')?.click(function(){
        NCTCLM.setValue('use', $(this).is(':checked'));
    });
    
});