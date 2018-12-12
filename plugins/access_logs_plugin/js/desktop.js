/*
 * This sample zero-fills a number, and sets it into another number field.
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

    var APP_ID = CONFIG.app_id_text; //App ID of Access Log App
    var APP_ID_FIELD = CONFIG.app_id_dropdown; //Field Code of APP ID
    var RECORD_ID_FIELD = CONFIG.record_id_dropdown; //Field Code of Record ID

    kintone.events.on('app.record.detail.show', function(event) {
        // Get the App ID
        var appId = event.appId;
        // Get the Record ID
        var recordId = event.recordId;
        // Request parameters as JSON
        var params = {
            'app': APP_ID, // Enter the App ID of App where the logs will be stored
            'record': {
                [APP_ID_FIELD]: { 'value': appId },
                [RECORD_ID_FIELD]: { 'value': recordId }
            }
        };

        // Use the kintone REST API request to run kintone's Add Record API
        kintone.api(
            kintone.api.url('/k/v1/record', true), // - pathOrUrl
            'POST', // - method
            params, // - params
            function(resp) { // - callback
                // (do nothing)
            },
            function(resp) { // - errback
                // (do nothing)
            }
        );
    });
})(kintone.$PLUGIN_ID);
