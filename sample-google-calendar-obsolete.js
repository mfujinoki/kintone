(function () {

    "use strict";

    // クライアントID
    var CLIENT_ID = '478055048977-sbhonj53kd5q7oagj1fr2qlt5jkka85g.apps.googleusercontent.com';

    // カレンダーID
    var CALENDAR_ID = 'fujibiz.com_88jjuijlam3s1ja3nr6nuekmf8@group.calendar.google.com';

    // 認証用URL（読み取り／更新）
    var SCOPES = ["https://www.googleapis.com/auth/calendar"];

    //レコード編集画面の保存成功後イベント
    kintone.events.on('app.record.edit.submit.success',
        function(event) {
          sendEvent(event.record);
        });
    //レコード追加画面の保存成功後イベント
    kintone.events.on('app.record.create.submit.success',
        function(event) {
          sendEvent(event.record);
        });
    function sendEvent(erc){

      //公開フラグが有効な時のみデータ送信
      if(erc.publish.value == '公開する')
      {
          // 認証処理
          gapi.auth.authorize(
              {client_id: CLIENT_ID, scope: SCOPES, immediate: false},
              function (authResult)
              {
                  if (authResult && !authResult.error)
                  {

                      // 認証に成功したらGoogleカレンダーへイベント登録を行う
                      gapi.client.load('calendar', 'v3', function()
                      {
                          // kintone詳細画面の情報取得
                          var record = kintone.app.record.get().record;
                          // リクエストパラメータの設定
                          var data = {
                              // 予定のタイトル
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

                          // リクエストメソッドとパラメータを設定
                          var request = gapi.client.calendar.events.insert(
                          {
                                  'calendarId': CALENDAR_ID,
                                  'resource': data
                          });

                          // リクエスト実行
                          request.execute(function(resp){
                              if(resp.error){
                                  alert("スケジュールの登録に失敗しました。");
                              }else{
                                  alert("カレンダーにスケジュールを登録しました。");
                              }

                          });
                      });
                  }
                  else
                  {
                      alert("Google認証失敗");
                  }
          });
      }
    }
})();
