/*
MIT License
Copyright (c) 2020 Cybozu
Oauth2 Zoho CRM Plugin
*/
jQuery.noConflict();
(function($, PLUGIN_ID) {
  'use strict';
  const URL = 'https://accounts.zoho.com/oauth/v2/token';
  // const URL = 'https://00ccae31749393ad06e510968f7805f5.m.pipedream.net';
  // Get configuration settings
  // const CONF = kintone.plugin.app.getConfig(PLUGIN_ID);
  const CONF = kintone.plugin.app.getProxyConfig(URL, 'POST');

  $(document).ready(() => {
    if (CONF) {
      $('#text-client-id').val(CONF.data.client_id);
      $('#text-client-secret').val(CONF.data.client_secret);
    }

    // Set input values when 'Save' button is clicked
    $('#oauth2-plugin-submit').click(() => {
      const config = [];
      const client_id = $('#text-client-id').val();
      const client_secret = $('#text-client-secret').val();

      // Check required fields
      if (client_id === '' || client_secret === '') {
        alert('Please set the required field(s)');
        return;
      }
      config.client_id = client_id;
      config.client_secret = client_secret;
      kintone.plugin.app.setConfig(config, () => {
        /* const data = 'grant_type=authorization_code' +
            '&client_id=' + client_id +
            '&client_secret=' + client_secret;*/
        const data = {
          'grant_type': 'authorization_code',
          'client_id': client_id,
          'client_secret': client_secret
        };
        const headers = {
          'Content-Type': 'application/x-www-form-urlencoded'
        };
        kintone.plugin.app.setProxyConfig(URL, 'POST', headers, data);
      });
    });
    // Process when 'Cancel' is clicked
    $('#oauth2-plugin-cancel').click(() => {
      history.back();
    });
  });
})(jQuery, kintone.$PLUGIN_ID);
