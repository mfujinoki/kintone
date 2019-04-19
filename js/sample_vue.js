
(function() {
    "use strict";
    kintone.events.on("app.record.index.show", function(event) {
        if (event.viewId !== 5520055) {return event;} // 作成したカスタマイズビューのIDを指定
        var records = event.records;
        var vm = new Vue({
            el: '#app',
            data() {
                return {
                    headers: [
                        {
                            text: '詳細表示',
                            sortable: false
                        },
                        {
                            text: 'レコード番号',
                            align: 'left',
                            sortable: true,
                            value: 'record_no.value'
                        },
                        { text: '会社名', value: 'Company_name.value' },
                        { text: '部署名', value: 'Department.value' },
                        { text: '担当者名', value: 'Representative.value' },
                        { text: '住所', value: 'Address.value' }
                    ],
                    customers: records,
                    detailView: false,
                    customer: null
                };
            },
            methods: {
                showDetail(item) {
                    this.detailView = true;
                    this.customer = item;
                },
                back() {
                    this.detailView = false;
                }
            }
        });
    });
})();
