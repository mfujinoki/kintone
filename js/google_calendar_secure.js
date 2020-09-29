(function() {
  'use strict';
  // クライアントID
  const client_id = '939234561653-rk43agh4ddrosveg2pn00v33h3uitelk.apps.googleusercontent.com';
  // コールバックURI
  const redirect_uri = 'https://devxorudc.cybozu.com/k/138/';
  // Hash後のクエリーパラメーター
  const fragmentString = location.hash.substring(1);
  // カレンダーID
  const calendar_id = 'c_5u6qqrfnlcc4pt6mih4nm93s10@group.calendar.google.com';
  // Scope
  const scope = 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events';

  /*
   * Create form to request access token from Google's OAuth 2.0 server.
   */
  function oauth2SignIn(recordId) {
    const detailLink = 'show#record=' + recordId;// レコード詳細ページへのリンク
    // Google's OAuth 2.0 endpoint for requesting an access token
    const oauth2Endpoint = 'https://accounts.google.com/o/oauth2/v2/auth';

    // Create element to open OAuth 2.0 endpoint in new window.
    const form = document.createElement('form');
    form.setAttribute('method', 'GET'); // Send as a GET request.
    form.setAttribute('action', oauth2Endpoint);

    // Parameters to pass to OAuth 2.0 endpoint.
    const oauthParams = {'client_id': client_id,
      'redirect_uri': redirect_uri + detailLink,
      'scope': scope,
      'state': 'request_from_kintone',
      'include_granted_scopes': 'true',
      'response_type': 'token'};

    // Add form parameters as hidden input values.
    for (const p in oauthParams) {
      if ({}.hasOwnProperty.call(oauthParams, p)) {
        const input = document.createElement('input');
        input.setAttribute('type', 'hidden');
        input.setAttribute('name', p);
        input.setAttribute('value', oauthParams[p]);
        form.appendChild(input);
      }
    }

    // Add form to page and submit it to open the OAuth 2.0 endpoint.
    document.body.appendChild(form);
    form.submit();
  }


  // Google Calendarへのイベント公開関数
  function publishEvent(access_token) {
    // レコードのデータの取得
    const record = kintone.app.record.get().record;
    if (record) {
      // API リクエスト
      // ヘッダーの設定
      const header = {Authorization: 'Bearer' + access_token};
      // リクエストパラメータの設定
      const params = {
        // イベントのタイトル
        'summary': record.event_name.value,
        'start': {
          // 開始日・時刻
          'dateTime': record.start_datetime.value,
          'timeZone': 'America/Los_Angeles'
        },
        'end': {
          // 終了日・時刻
          'dateTime': record.end_datetime.value,
          'timeZone': 'America/Los_Angeles'
        },
        // 場所の指定
        'location': record.event_location.value,
        // イベントの説明
        'description': record.event_description.value
      };

      let url = '';
      let method = '';
      // リクエストメソッドとアクセストークンの設定
      if (record.event_id.value) { // 公開済みイベントを更新
        method = 'PUT';
        url = 'https://www.googleapis.com/calendar/v3/calendars/' +
          calendar_id +
          '/events/' +
          record.event_id.value;
      } else {// 未公開のイベントを追加
        method = 'POST';
        url = 'https://www.googleapis.com/calendar/v3/calendars/' +
          calendar_id +
          '/events/';
      }
      // HTTPリクエストの送信（Google Calendar APIの呼び出し）
      kintone.proxy(url, method, header, params).then((args) => {
        if (args[1] >= 200 && args[1] < 300) {
          const responseJSON = JSON.parse(args[0]);
          const body = {
            'app': kintone.app.getId(),
            'id': record.$id.value,
            'record': {
              'event_id': {
                'value': responseJSON.id
              }
            }
          };
          return kintone.api(kintone.api.url('/k/v1/record', true), 'PUT', body).then((resp) => {
            alert('カレンダーにイベントを登録しました。' + resp);
            location.reload();
          }).catch((error) => {
            alert('Google イベントIDの登録に失敗しました。' + error);
          });
        }
        alert('イベントの登録に失敗しました。');
      });
    }
  }
  // レコード詳細画面の表示後イベント
  kintone.events.on('app.record.detail.show', (event) => {
    // Parse query string to see if page request is coming from OAuth 2.0 server.
    const queryParams = {};
    const regex = /([^&=]+)=([^&]*)/g;
    let m;
    while ((m = regex.exec(fragmentString)) !== null) {
      queryParams[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
    }
    if (Object.keys(queryParams).length > 0) {
      const params = queryParams;
      // If there's an access token, publish event to Google Calendar.
      if (queryParams.state && queryParams.state === 'request_from_kintone') {
        if (params && params.access_token) {
          publishEvent(params.access_token);
        }
      }
    }
    // 増殖バグ回避
    if (document.getElementById('publish_button') !== null) {
      return event;
    }
    // 画面下部にボタンを設置
    const publishButton = document.createElement('button');
    publishButton.id = 'publish_button';
    publishButton.innerHTML = '公開する';
    publishButton.className = 'button-simple-cybozu geo-search-btn';
    publishButton.style = 'margin-top: 30px; margin-left: 10px;';
    publishButton.addEventListener('click', () => {
      oauth2SignIn(event.record.$id.value);
    });
    kintone.app.record.getSpaceElement('publish_button_space').appendChild(publishButton);
    return event;
  });
  // レコード新規作成・編集画面表示イベント
  kintone.events.on(['app.record.create.show', 'app.record.edit.show'], (event) => {
    // フィールドを編集不可へ
    event.record.event_id.disabled = true;
    return event;
  });
})();