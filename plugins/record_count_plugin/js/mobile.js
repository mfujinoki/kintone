/*
 * This sample code calculates the total number of records with a given value,
 * and displays the total at the top of the record list page.
 * If the record list has a filter condition,
 * the calculation will take in account of the filter condition.
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

    var DROPDOWN = CONFIG.dropdown_field; //field code of dropdown field
    var DROPDOWN_CHOICE1 = CONFIG.dropdown_choice; //name of dropdown choice

    // Record List Event
    kintone.events.on('mobile.app.record.index.show', function(event) {
        // Gets records based on the current filter of the list
        var query = ' ' + DROPDOWN + ' in ("' + DROPDOWN_CHOICE1 + '")';

        kintone.api('/k/v1/records', 'GET', {
            app: event.appId,
            query: query,
            totalCount: true
        }, function(resp) {
            kintone.mobile.app.getHeaderSpaceElement().innerHTML = DROPDOWN_CHOICE1 + '：' + resp.totalCount;
        });
    });
})(kintone.$PLUGIN_ID);
