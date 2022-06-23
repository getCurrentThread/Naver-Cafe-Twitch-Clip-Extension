

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

});