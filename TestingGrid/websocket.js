(function () {
    if (window.util) {
        console.log('util defined. returning from util.js');
        return;
    }
    util = window.util = {};
    util.ws = {};
    util.pageload = {};
    util.functionsarray = [];
    var registermessageHandler = [];
    // ws=websocket,onsuccess=function to process data when auth check complete
    util.ws.onmessage = function (ws, onsuccess) {
        registermessageHandler.push(onsuccess);
        ws.binaryType = 'arraybuffer';
        ws.onmessage = function (e) {
            var json = e.data;
            if (typeof json === 'object') {
                json = deserialize(json);
            } else {
                json = JSON.parse(json);
            }
            e.decoded = json;
            registermessageHandler.forEach((messageHandler) => {
                messageHandler(e);
            });
        };
    };

    var ws = '';
    // ws=websocket,queryready=function to process sending query only if the websocket is open
    util.ws.onopencheck = function (ws, queryready) {
        if (!ws.readyState) {
            ws.onopen = function (e) {
                console.log('websocket opened', ws, e);
                alert("Connected");
                queryready(ws);
            };
        } else {
            queryready(ws);
        }
    };



    util.ws.webSocket = (function () {
        var instanceList = Object.create(null);
        return {
            getInstance: function (wurl) {
                if (!instanceList[wurl]) {
                    instanceList[wurl] = new WebSocket(wurl);
                }
                return instanceList[wurl];
            }
        };
    })();
})();