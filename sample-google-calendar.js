(function () {

    "use strict";

    // API キー
    var api_key = "AIzaSyCwAdw_BxT0WmK1paDxdphWIQodE9Hdiiw";
    // クライアントID
    var client_id = '478055048977-sbhonj53kd5q7oagj1fr2qlt5jkka85g.apps.googleusercontent.com';

    // カレンダーID
    var calendar_id = 'fujibiz.com_88jjuijlam3s1ja3nr6nuekmf8@group.calendar.google.com';

    // 認証用URL（読み取り／更新）
    var scope = "https://www.googleapis.com/auth/calendar";

    //Discovery Docs
    var discovery_docs = ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'];

    //レコード編集画面の保存成功後イベント及びレコード追加画面の保存成功後イベント
    kintone.events.on(['app.record.edit.submit.success','app.record.create.submit.success'],
        function(event) {
          sendEvent(event.record);
    });

    function sendEvent(record)
    {
      //公開フラグが有効な時のみデータ送信
      if(record.publish.value == '公開する')
      {
          // APIクライアントとOauth2モジュールのロード
          // モジュールロード後のinitClient関数の呼び出し
          gapi.load('client:auth2', initClient);

      }
    }
    function initClient()
    {
        gapi.client.init({
            'apiKey': api_key,
            'discoveryDocs': discovery_docs,
            'clientId': client_id,
            'scope': scope
        }).then(function () {
            // Google認証済みのチェック
            checkSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
        });

    }
    function checkSigninStatus(isSignedIn) {
      if (isSignedIn) {
          // APIリクエストの実行
          makeApiCall();

      } else {
        // Google認証の呼び出し
        gapi.auth2.getAuthInstance().signIn();
      }
    }

    function makeApiCall() {
        // API リクエスト
        // kintone詳細画面の情報取得
        var record = kintone.app.record.get().record;
        // リクエストパラメータの設定
        var event = {
            // イベントのタイトル
            'summary': record.event_name.value,
            'start': {
                // 開始日・時刻
                'dateTime': record.start_datetime.value,
                'timezone': 'America/Los_Angeles'
            },
            'end': {
                // 終了日・時刻
                'dateTime': record.end_datetime.value,
                'timezone': 'America/Los_Angeles'
            },
            // 場所の指定
            'location': record.event_location.value,
            // イベントの説明
            'description': record.event_description.value
        };
        // リクエストメソッドとパラメータを設定し、実行
        gapi.client.calendar.events.insert(
        {
                'calendarId': calendar_id,
                'resource': event
        }).execute(function(resp){
            if(resp.error){
                alert("イベントの登録に失敗しました。");
            }else{
                alert("カレンダーにイベントを登録しました。");
            }

        });
    }
})();
