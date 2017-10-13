function getFormResponse(e) {
    'use strict';
    var itemResponses = e.response.getItemResponses();//アンケートの回答を取得
    var records = '[';
    records += Utilities.formatString('{"Email": { "value": "%s" }', e.response.getRespondentEmail());//回答者のEmailアドレスの取得
    for (var i = 0; i < itemResponses.length; i++) {
        var itemResponse = itemResponses[i];
        records += ',';
        switch (itemResponse.getItem().getTitle()) {
            case "参加しますか?":
                records += Utilities.formatString('"attend" : { "value": "%s" }',
                itemResponse.getResponse());//質問に対する回答を取得
                break;
            case "参加人数":
                records += Utilities.formatString('"number_of_attendee" : { "value": "%s" }',
                itemResponse.getResponse());//質問に対する回答を取得
                break;
            case "参加者の名前を記入してください":
                records += Utilities.formatString('"name_of_attendee" : { "value": "%s" }',
                itemResponse.getResponse());//質問に対する回答を取得
                break;
        }
    }
    records += '}]';
    Logger.log('Response JSON is "%s"', records);
    return records;
}
function sendToKintone(e) {
    'use strict';
    Logger.log('Form submitted');
    var subdomain = "9i25n";//サブドメイン名
    var apps = {
        YOUR_APPLICATION1: { appid: 23, name: "kintone Meetup 参加者", token: "CaXbAkrysVmnuRS7hDUaPyUiZfFR6gZtbkkwFtWb" }
    };
    var manager = new KintoneManager.KintoneManager(subdomain, apps);// ライブラリーの初期化
    //var records = JSON.parse(getFormResponse(e));//JSON形式に変換
    var str = getFormResponse(e);
    str = str.replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/\t/g, "\\t");
    var records = JSON.parse(str);// JSON形式に変換
    var response = manager.create("YOUR_APPLICATION1", records);//kintone レコードの生成
    // ステータスコード
    // 成功すれば200になる
    var code = response.getResponseCode();
    Logger.log('Response code is "%s"', code);
}
