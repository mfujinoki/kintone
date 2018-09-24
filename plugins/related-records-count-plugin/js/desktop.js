/*
 * This sample code counts the number of records in related records field
 * and displays the number in a Space field of your App.
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

    var CONFIG_RELATEDRECORDS = CONFIG.relatedRecords;
    var CONFIG_SPACE = CONFIG.numberSpace;

    // Field codes of the fields set for the Fetch Criteria of the Related Records field
    var FETCH_CRITERIA_A = CONFIG.fetch_criteria_a; // Field code of the field in this App
    var FETCH_CRITERIA_B = CONFIG.fetch_criteria_b; // Field code of the field in the datasource App

    kintone.events.on('app.record.detail.show', function(event) {
        // Get all records related to the related records field
        function fetchRecords(opt_Field, opt_offset, opt_limit, opt_records) {
            var Id = kintone.app.getRelatedRecordsTargetAppId(CONFIG_RELATEDRECORDS);
            var offset = opt_offset || 0;
            var limit = opt_limit || 100;
            var allRecords = opt_records || [];
            var params = {app: Id, query: opt_Field + ' order by $id asc limit ' + limit + ' offset ' + offset};
            return kintone.api('/k/v1/records', 'GET', params).then(function(resp) {
                allRecords = allRecords.concat(resp.records);
                if (resp.records.length === limit) {
                    return fetchRecords(offset + limit, limit, allRecords);
                }
                return allRecords;
            });
        }

        // Create query based on the Filter settings for the related records field
        var keyValue = event.record[FETCH_CRITERIA_A].value;
        var opt_Field = FETCH_CRITERIA_B + '=' + '"' + keyValue + '"';

        fetchRecords(opt_Field).then(function(records) {
            // Insert the total number of records into the Space field
            var num = records.length;
            var divTotalAmount = document.createElement('div');
            divTotalAmount.style.textAlign = 'center';
            divTotalAmount.style.fontSize = '16px';
            divTotalAmount.innerHTML = String(num) + ' related sale(s)';
            kintone.app.record.getSpaceElement(CONFIG_SPACE).appendChild(divTotalAmount);
            return event;
        });
    });
})(kintone.$PLUGIN_ID);
