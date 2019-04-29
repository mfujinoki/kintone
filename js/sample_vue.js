/*
 * vue.js + vuetify.js + Custom view sample program
 * Copyright (c) 201９ Cybozu
 *
 * Licensed under the MIT License
*/
(function() {
    "use strict";
    kintone.events.on("app.record.index.show", function(event) {
        if (event.viewId !== 5520055) {return event;} // 作成したカスタマイズビューのIDを指定
        var records = event.records;
        var appId = kintone.app.getId();
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
                    customer: {},
                    search: '',
                    rankList: [
                        'A', 'B', 'C'
                    ],
                    pagination: {rowsPerPage: 10}
                };
            },
            methods: {
                showDetail: function(item) {
                    this.detailView = true;
                    this.customer = item;
                },
                back: function() {
                    this.detailView = false;
                },
                save: function() {
                    let param = {
                        "app": appId,
                        "id": this.customer.record_no.value,
                        "record": {
                            "Company_name": {
                                "value": this.customer.Company_name.value
                            },
                            "Department": {
                                "value": this.customer.Department.value
                            },
                            "Representative": {
                                "value": this.customer.Representative.value
                            },
                            "Zip_code": {
                                "value": this.customer.Zip_code.value
                            },
                            "Phone": {
                                "value": this.customer.Phone.value
                            },
                            "Fax": {
                                "value": this.customer.Fax.value
                            },
                            "Address": {
                                "value": this.customer.Address.value
                            },
                            "Rank": {
                                "value": this.customer.Rank.value
                            },
                            "Mail": {
                                "value": this.customer.Mail.value
                            },
                            "Note": {
                                "value": this.customer.Note.value
                            },
                            "lat": {
                                "value": this.customer.lat.value
                            },
                            "lng": {
                                "value": this.customer.lng.value
                            }
                        }
                    };
                    kintone.api(kintone.api.url('/k/v1/record', true), 'PUT', param).then(function(resp) {
                        return event;
                    }, function(err) {
                        alert(err.message);
                    });
                }
            },
            computed: {
                pages() {
                    if (this.pagination.rowsPerPage === null || this.pagination.totalItems === null) {
                        return 0;
                    }
                    return Math.ceil(this.pagination.totalItems / this.pagination.rowsPerPage);
                }
            }
        });
        return event;
    });
})();
