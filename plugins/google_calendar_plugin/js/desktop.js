/*
 * This sample plug-in calls Google Calendar API via Oauth2 and publish event record to Google Caledar with a click of the button
 *
 * Copyright (c) 2020 Cybozu
 *
 * Licensed under the MIT License
 */
(function(PLUGIN_ID) {
  'use strict';
  // プラグイン設定値の取得
  const CONFIG = kintone.plugin.app.getConfig(PLUGIN_ID);
  if (!CONFIG) {
    return;
  }
  // カレンダーIDの取得
  const CONFIG_CALENDAR_ID = CONFIG.calendar_id;

  // Google カレンダーへのイベント公開関数
  function publishEvent() {
    // レコードのデータの取得
    const record = kintone.app.record.get().record;
    if (record) {
      // API リクエスト
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
            CONFIG_CALENDAR_ID +
            '/events/' +
            record.event_id.value;
      } else {// 未公開のイベントを追加
        method = 'POST';
        url = 'https://www.googleapis.com/calendar/v3/calendars/' +
        CONFIG_CALENDAR_ID +
          '/events/';
      }
      // HTTPリクエストの送信（Google Calendar APIの呼び出し）
      kintone.plugin.app.proxy(PLUGIN_ID, url, method, {}, params).then((args) => {
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
            alert('カレンダーにイベントを登録しました。');
            location.reload();
          }).catch((error) => {
            alert('Google イベントIDの登録に失敗しました。' + error);
          });
        }
        alert('イベントの登録に失敗しました。プラグインの設定に戻って、認証をやり直してください');
        return false;
      });
    }
  }
  // レコード詳細画面の表示後イベント
  kintone.events.on('app.record.detail.show', (event) => {
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
      publishEvent();
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
})(kintone.$PLUGIN_ID);
