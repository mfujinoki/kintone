
 /*
 * サンプルカスタマイズ
 * Copyright (c) 2014 Cybozu
 *
 * Licensed under the MIT License
 */
(function() {
    "use strict";

    //レコード一覧イベントを取得
    kintone.events.on('app.record.index.show', function(event) {
        //文字色の設定値
        var fontColorRed = "#ff0000";
        
        //「会社名」と「確度」の要素を取得
        var elCustomer = kintone.app.getFieldElements('文字列__1行_');    //会社名
        var elAccuracy = kintone.app.getFieldElements('ラジオボタン');    //確度
        
        for (var i = 0; i < elAccuracy.length; i++) {
            //レコード情報を取得
            var record = event.records[i];
            
            //「確度」が"A"の場合「会社名」と「確度」の文字色を変更する。
            if (record['ラジオボタン']['value'] == "A") {
                elCustomer[i].style.color = fontColorRed;
                elAccuracy[i].style.color = fontColorRed;
            }            
        }
    
		
		//アプリIDを取得
		var appID = kintone.app.getId();

		// ログインユーザ情報
		var user = kintone.getLoginUser();

		//クエリ文の設定
		var qryInfo = 'ユーザー選択 in (LOGINUSER())';  

		//リクエストを行う
		kintone.api('/k/v1/records', 'GET', { app: appID, query: qryInfo}, function(resp) {
			if (resp['records'].length > 0) {
				var msg = "";
				for (var i = 0; i < resp['records'].length; i++) {
					msg += "・ " + resp['records'][i]['文字列__1行_']['value'] + "\n";
				}
				alert(user.name + "が担当している会社\n\n" + msg);
			}
		});

});

    
    
	//レコード表示イベントを取得
	kintone.events.on('app.record.detail.show', function(event) {
		//表示したレコードの取得
		var record = event.record;
	
		//ユーザー数が500人以上であればメッセージを表示
		if (record['ユーザー数']['value'] >= 500) {
			alert("ユーザ数500人以上の案件です\n【見込み期限】" +　record['日付_0']['value']);
		}
	});

})();
