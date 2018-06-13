(function() {
    "use strict";

    kintone.events.on('app.record.create.submit', function(event) {
        var record = event.record;
        // 在庫管理アプリのアプリID
        var zaikoAppId = 113;
        return new kintone.Promise(function(resolve, reject) {
            // 商品名が一致する在庫を取得
            kintone.api('/k/v1/records', 'GET',
            {app: zaikoAppId, query: '商品名 = "' + record.商品名.value + '"'}, function(resp) {
                // 在庫から売上数量だけ差し引く
                var zaiko = resp.records[0].在庫.value - record.売上数量.value;
                if (zaiko < 0) {
                    record.在庫連携.value = "エラー";
                    resolve(event);
                } else {
                    var body = {
                        "id": resp.records[0].$id.value,
                        "app": zaikoAppId,
                        "record": {
                            "在庫": {
                                "value": zaiko
                            }
                        }
                    };
                    kintone.api(kintone.api.url('/k/v1/record', true), 'PUT', body, function() {
                        record.在庫連携.value = "連携済";
                        resolve(event);
                    });
                }
            });
        });
    });

})();
