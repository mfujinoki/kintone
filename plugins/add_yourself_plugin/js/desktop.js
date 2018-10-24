/*
 * This sample plugin adds yourself to a User selection field with a click of a button
 * in the record details page.
 * Copyright (c) 2018 Cybozu
 *
 * Licensed under the MIT License
 */

(function(PLUGIN_ID) {
    'use strict';

    // Get plugin configuration settings
    var CONFIG = kintone.plugin.app.getConfig(PLUGIN_ID);
    if (!CONFIG) {
        return false;
    }
    // Get each settings
    var CONFIG_SPACE = CONFIG.space;
    var CONFIG_LABEL = CONFIG.label;
    var CONFIG_USER = CONFIG.user;

    // Create a variable
    var member;

    function addMemberMine() {

        var loginuser = kintone.getLoginUser();

        var objParam = {};
        objParam.app = kintone.app.getId(); // The App ID
        objParam.id = kintone.app.record.getId(); // The Record ID
        objParam.record = {};
        objParam.record[CONFIG_USER] = {};
        objParam.record[CONFIG_USER].value = [];

        // If there are other users in the User field, also add those users
        for (var i = 0; i < member.length; i++) {
            objParam.record[CONFIG_USER].value[i] = {};
            objParam.record[CONFIG_USER].value[i].code = {};
            objParam.record[CONFIG_USER].value[i].code = member[i].code;
        }

        // Add the logged-in user
        objParam.record[CONFIG_USER].value[member.length] = {};
        objParam.record[CONFIG_USER].value[member.length].code = {};
        objParam.record[CONFIG_USER].value[member.length].code = loginuser.code;

        // Refresh the page
        kintone.api('/k/v1/record', 'PUT', objParam, function(resp) {
            // Refresh the page on success
            location.reload(true);
        });
    }

    // Add a Record Details event
    kintone.events.on('app.record.detail.show', function(event) {
        member = event.record[CONFIG_USER].value;

        // Get the element of the Blank space field
        var se = kintone.app.record.getSpaceElement(CONFIG_SPACE);

        // Create a button
        var btn = document.createElement('button');
        btn.appendChild(document.createTextNode(' ' + CONFIG_LABEL + ' '));
        btn.id = 'btnAddMine';
        btn.name = 'btnAddMine';
        se.appendChild(btn);
        btn.style.marginTop = '30px';
        btn.addEventListener('click', addMemberMine);
    });
})(kintone.$PLUGIN_ID);
