(function() {

    "use strict";

    // API キー
    var api_key = config.GOOGLE_API_KEY;
    // クライアントID
    var client_id = config.GOOGLE_CLIENT_ID;

    // カレンダーID
    var calendar_id = config.GOOGLE_CALENDAR_ID;

    // 認証用URL（読み取り／更新）
    var scope = 'https://www.googleapis.com/auth/calendar';

    //Discovery Docs
    var discovery_docs = ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'];

    // APIクライアントとOauth2モジュールのロード
    // モジュールロード後のinitClient関数の呼び出し
    gapi.load('client:auth2', {
      callback: function() {
        // gapi.clientのイニシャライズ処理
        initClient();
      },
      onerror: function() {
        // エラー時の処理
        alert('gapi.client のロードに失敗しました!');
      }
    });

    function initClient() {
        gapi.client.init({
            'apiKey': api_key,
            'discoveryDocs': discovery_docs,
            'clientId': client_id,
            'scope': scope
        }).then(function () {
            // Google認証済みのチェック
            if (!gapi.auth2.getAuthInstance().isSignedIn.get()) {
              // Google認証の呼び出し
              gapi.auth2.getAuthInstance().signIn();
            }
        });
    }
    //レコード詳細画面の表示後イベント
    kintone.events.on('app.record.detail.show', function(event) {
      // 増殖バグ回避
      if (document.getElementById('publish_button') !== null) {
          return event;
      }
      // 画面下部にボタンを設置
      var publishButton = document.createElement('button');
      publishButton.id = 'publish_button';
      publishButton.innerHTML = '公開する';
      publishButton.className = "button-simple-cybozu geo-search-btn";
      publishButton.style = "margin-top: 30px; margin-left: 10px;";
      publishButton.addEventListener('click', function() {
            publishEvent(event);
      });
      kintone.app.record.getSpaceElement('publish_button_space').appendChild(publishButton);

      return event;
    });

    kintone.events.on(['app.record.create.show', 'app.record.edit.show'], function(event) {

      // フィールドを編集不可へ
      event.record.event_id.disabled = true;
      return event;
    });

    function publishEvent(event) {
      //レコードのデータの取得
      var record = kintone.app.record.get().record;
      if (record) {
        // Google認証済みのチェック
        if (!gapi.auth2.getAuthInstance().isSignedIn.get()) {
          // Google認証の呼び出し
          gapi.auth2.getAuthInstance().signIn();
          alert('Google認証されていません。');
          return;
        }
        // API リクエスト
        // リクエストパラメータの設定
        var params = {
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
        var request;
        // リクエストメソッドとパラメータの設定
        if (record.event_id.value) { //公開済みイベントを更新
          request = gapi.client.calendar.events.update(
          {
            'calendarId': calendar_id,
            'eventId': record.event_id.value,
            'resource': params
          });
        }else {//未公開のイベントを追加
          request = gapi.client.calendar.events.insert(
          {
            'calendarId': calendar_id,
            'resource': params
          });
        }
        //Googleカレンダーへのイベント登録の実行
        request.execute(function(resp) {
            if (resp.error) {
                alert("イベントの登録に失敗しました。");
            }else {
                  var body = {
                    "app": kintone.app.getId(),
                    "id": record.$id.value,
                    "record": {
                      "event_id": {
                        "value": resp.result.id
                      }
                    }
                  };
                  return kintone.api(kintone.api.url('/k/v1/record', true), 'PUT', body).then(function(success) {
                    alert("カレンダーにイベントを登録しました。");
                    location.reload();
                  }).catch(function(error) {
                    alert("Google イベントIDの登録に失敗しました。");
                  });
            }
        }, function(error) {
          alert("Google イベントIDの登録に失敗しました。");
        });
      }
    }
})();
