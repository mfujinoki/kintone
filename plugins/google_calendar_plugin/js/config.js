/*
MIT License
Copyright (c) 2020 Cybozu
Google カレンダープラグイン
*/
jQuery.noConflict();
(function($, PLUGIN_ID) {
  'use strict';
  // Hash後のクエリーパラメーター
  const fragmentString = location.hash.substring(1);
  // Scope
  const scope = 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events';
  // 実行する外部APIのURL
  const URL = 'https://www.googleapis.com/calendar/v3/calendars/';

  // プラグイン設定情報の取得
  const CONF = kintone.plugin.app.getConfig(PLUGIN_ID);

  /*
   * Google's OAuth 2.0 サーバーにアクセストークンをリクエストするフォームを作成
   */
  function oauth2SignIn(config) {
    // アクセストークンをリクエストするGoogle's OAuth 2.0 エンドポイント
    const oauth2Endpoint = 'https://accounts.google.com/o/oauth2/v2/auth';

    // 新しいウィンドウでOAuth 2.0 エンドポイントを開くエレメント作成
    const form = document.createElement('form');
    form.setAttribute('method', 'GET'); // GET リクエストとして送信
    form.setAttribute('action', oauth2Endpoint);

    // OAuth 2.0 エンドポイントへ送信するパラメーター
    const oauthParams = {'client_id': config.client_id,
      'redirect_uri': config.redirect_uri,
      'scope': scope,
      'state': 'request_from_kintone',
      'include_granted_scopes': 'true',
      'response_type': 'token'};

    // 秘匿フィールドとしてフォームにパラメーターを追加
    for (const p in oauthParams) {
      if ({}.hasOwnProperty.call(oauthParams, p)) {
        const input = document.createElement('input');
        input.setAttribute('type', 'hidden');
        input.setAttribute('name', p);
        input.setAttribute('value', oauthParams[p]);
        form.appendChild(input);
      }
    }

    // ページにフォームを追加して、送信、OAuth 2.0 エンドポイントを開く
    document.body.appendChild(form);
    form.submit();
  }

  $(document).ready(() => {
    if (CONF) {
      $('#text-client-id').val(CONF.client_id);
      $('#text-calendar-id').val(CONF.calendar_id);
      $('#text-redirect-uri').val(CONF.redirect_uri);

      // OAuth 2.0 サーバーから送信されたページリクエストの確認のため、クエリーテキストを分析
      const queryParams = {};
      const regex = /([^&=]+)=([^&]*)/g;
      let m;
      while ((m = regex.exec(fragmentString)) !== null) {
        queryParams[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
      }
      if (Object.keys(queryParams).length > 0) {
        const params = queryParams;
        // アクセストークンが存在する場合、Google カレンダーにイベントを公開
        if (queryParams.state && queryParams.state === 'request_from_kintone') {
          if (params && params.access_token) {
            const headers = {
              'Authorization': 'Bearer ' + params.access_token
            };
            kintone.plugin.app.setProxyConfig(URL, 'POST', headers, {});
            kintone.plugin.app.setProxyConfig(URL, 'PUT', headers, {});
          } else {
            oauth2SignIn(CONF);
          }

        }
      }
    }

    // 保存ボタンをクリックすると設定値を保存
    $('#google-calendar-plugin-submit').click(() => {
      const config = [];
      const client_id = $('#text-client-id').val();
      const calendar_id = $('#text-calendar-id').val();
      const redirect_uri = $('#text-redirect-uri').val();

      // 必須入力項目をチェック
      if (client_id === '' || calendar_id === '' || redirect_uri === '') {
        alert('必須項目を設定してください');
        return;
      }
      config.client_id = client_id;
      config.calendar_id = calendar_id;
      config.redirect_uri = redirect_uri;

      // プラグインに設定を保存
      kintone.plugin.app.setConfig(config, () => {
        oauth2SignIn(config);
      });
    });
    // キャンセルボタンがクリックされた時の処理
    $('#google-calendar-plugin-cancel').click(() => {
      history.back();
    });
  });
})(jQuery, kintone.$PLUGIN_ID);
