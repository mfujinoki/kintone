/*
 * kintone - Discord Integration sample program
 * Copyright (c) 201９ Cybozu
 *
 * Licensed under the MIT License
*/
(function() {
    "use strict";
    kintone.events.on("app.record.detail.process.proceed", function(e) {
        if (e.nextStatus.value == '完了') {
            var thisUrl = "https://<ドメイン名>.cybozu.com/k/" + kintone.app.getId() + "/show#record=" + kintone.app.record.getId();
            var webhookUrl = 'https://hooks.slack.com/services/<WebHookのURLパラメータ>';
            var payload = {
                "text": "案件<" + thisUrl + "|「" + e.record.<フィールドコード>.value + "」>が完了しました！"
            };
            return new kintone.Promise(function(resolve, reject) {
                kintone.proxy(webhookUrl, 'POST', {}, payload, function(body, status, headers) {
                    console.log(status, body);            
                    resolve(e);
                });
            });
        }
    });
})();
