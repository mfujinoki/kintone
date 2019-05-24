/*
 * Gist Management sample program
 * Copyright (c) 201９ Cybozu
 *
 * Licensed under the MIT License
*/
(function() {
    "use strict";
    const app_id = kintone.app.getId(); // kintone App Idの取得
    const octokit = new Octokit({
        auth: '7cd1eaed43ffe6719590cf16a5e8b352231f2973',
        log: console
    });
    // Gistの新規作成
    function createGist() {
        octokit.gists.create({
            "files": {
                "sample.js": {
                    "content": "_"
                }
            }
        }).then(function(resp) {
            if (resp.status === 201) { // Statusが201だと成功
                let gist_id = resp.data.id;// Gist Idを取得
                let gist_url = resp.data.html_url;// Gist Urlを取得
                let param = {
                    "app": app_id,
                    "record": {
                        "gist_id": {
                            "value": gist_id
                        }
                    }
                };

                kintone.api(kintone.api.url('/k/v1/record', true), 'POST', param).then(function(resp) {
                    alert('ID: ' + gist_id + ' でGistを作成しました。');
                    location.href = gist_url;
                }, function(error) {
                    if (error.message) {
                        alert(error.message);
                    }
                });
            } else {
                alert('Gistの作成に失敗しました!');
            }
        }).catch(function(err) {
            alert(err);
        });
    }
    // Gistのコンテンツ取得
    function getGist(gist_id) {
        let gist_contents;
        octokit.gists.get({ gist_id }
        ).then(function(resp) {
            if (resp.status === 200) { // Statusが200だと成功
                gist_contents = resp.data;
            } else {
                alert('Gistの取得に失敗しました!');
            }
        }).catch(function(err) {
            alert(err);
        });
        return gist_contents;
    }
    kintone.events.on('app.record.index.show', function(event) {
        // 画面上部にボタンを設置
        let gistButton = document.createElement('button');
        gistButton.id = 'gist_button';
        gistButton.innerHTML = 'Gist 新規作成';
        gistButton.className = "button-simple-cybozu geo-search-btn";
        gistButton.style = "margin-left: 30px;";
        gistButton.addEventListener('click', function() {
            createGist();
        });
        kintone.app.getHeaderMenuSpaceElement().appendChild(gistButton);
        return event;
    });
    kintone.events.on(['app.record.create.show', 'app.record.edit.show', 'app.record.index.edit.show'],
        function(event) {
            event.record.gist_id.disabled = true;//Gist Idの編集を不可にする
            return event;
        }
    );
    kintone.events.on('app.record.detail.show',
        function(event) {
            // Gistのコンテンツを取得
            let contents = getGist(event.record.gist_id.value);
            kintone.app.record.getSpaceElement('gist_contents').appendChild(contents);
            // Gist編集ボタンを設置
            let gistButton = document.createElement('button');
            gistButton.id = 'gist_button';
            gistButton.innerHTML = 'Gist 編集';
            gistButton.className = "button-simple-cybozu geo-search-btn";
            gistButton.style = "margin-left: 30px; margin-top: 30px;";
            gistButton.addEventListener('click', function(resp) {
                location.href = contents.html_url;
            });
            kintone.app.record.getSpaceElement('button_space').appendChild(gistButton);
            return event;
        }
    );
})();
