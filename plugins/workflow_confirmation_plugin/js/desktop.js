/*
 * This sample plugin displays a confirmation dialogue when proceeding a process management status.
 * The Process Management settings must be enabled in your App for this customization to run.
 * Copyright (c) 2018 Cybozu
 *
 * Licensed under the MIT License
 */
(function(PLUGIN_ID) {
    'use strict';

    // Get plugin configuration settings
    var CONFIG = kintone.plugin.app.getConfig(PLUGIN_ID);
    // Get each settings
    if (!CONFIG) {
        return false;
    }

    var STATUSES = JSON.parse(CONFIG.status_names);//Status names for confirmation
    kintone.events.on("app.record.detail.process.proceed", function(event) {
        //Get value of current status (before proceeding)
        var status = event.status.value;

        //Only proceed if the current status matches selected status(es)
        var confirm = false;
        for (var i = 0, max_length = STATUSES.length; i < max_length; i++) {
            if (status === STATUSES[i][0]) {
                confirm = true;
            }
        }
        if (!confirm) {
            return (event);
        }

        //Display Sweet Alert message
        return new kintone.Promise(function(resolve, reject) {
            swal({
                title: CONFIG.title_text,
                text: CONFIG.body_text,
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: CONFIG.button_text
            }, function(isConfirm) {
                if (isConfirm) {
                    resolve(event);
                } else {
                    resolve(false);
                }
            });
        });
    });
})(kintone.$PLUGIN_ID);
