/*
 * Zoho CRM Oauth2 sample program
 * Copyright (c) 2020 Cybozu
 *
 * Licensed under the MIT License
*/
(function() {
    "use strict";
    kintone.events.on('app.record.index.show', function(event) {
        
        const client_id = '1000.9F87O0N1RMNYR44DFVYVCFLC4W2RBH';
        const client_secret = 'bede29ad1a96def77cddcb5a478ee75534caa983fc';
        
        const params = 'scope=ZohoCRM.modules.all&&client_id=' + client_id + '&response_type=code&redirect_uri=' + encodeURIComponent('https://' + location.host + '/k/' + kintone.app.getId() + '/');
        // 画面上部にボタンを設置
        const button = document.createElement('button');
        button.id = 'sync_button';
        button.innerHTML = 'Zoho CRM 同期';
        button.className = "button-simple-cybozu geo-search-btn";
        button.style = "margin-left: 30px;";
        button.addEventListener('click', function() {
            location.href = 'https://accounts.zoho.com/oauth/v2/auth?' + params;
            //window.open("https://accounts.zoho.com/oauth/v2/auth?" + params, "Zoho CRM Sync", "width=1200,height=1200");
        });
        kintone.app.getHeaderMenuSpaceElement().appendChild(button);

        //Query String 取得
        const queryString = location.search;

        if (queryString.substr(0, 6) === '?code=') {
            const authCode = queryString.substr(6);
            if (!authCode) {
                alert('Zoho CRMの認証情報取得に失敗しました。');
                return;
            }
            // 読み取った認可コードを使って認証する
            const body = 'grant_type=authorization_code' +
                '&client_id=' + client_id +
                '&client_secret=' + client_secret +
                '&redirect_uri=' + encodeURIComponent('https://' + location.host + '/k/' + kintone.app.getId() + '/') +
                '&code=' + authCode;
            const header = {
                'Content-Type': 'application/x-www-form-urlencoded'
            };

            return kintone.proxy('https://accounts.zoho.com/oauth/v2/token', 'POST', header, body).then((args) => {
                if (args[1] === 200) {
                    //success
                    const responseBody = JSON.parse(args[0]);
                    console.log(responseBody);
                    const header2 = {
                        'Authorization': 'Zoho-oauthtoken ' + responseBody.access_token
                    };
                    kintone.proxy('https://www.zohoapis.com/crm/v2/Contacts', 'GET', header2, {}).then((args2) => {
                        if (args2[1] === 200) {
                            //success
                            const responseBody2 = JSON.parse(args2[0]);
                            console.log(responseBody2);
                        } else {
                            event.error = args[0];
                            return event;
                        }
                    });

                } else {
                    event.error = args[0];
                    return event;
                }
            }).catch(function(error) {
                //error
                console.log(error);
                event.error = error;
                return event;
            });
        }
        return event;
    });
})();