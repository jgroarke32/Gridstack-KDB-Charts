(function () {
    util = window.util = {};
    util.ws = {};
    //util.pageload = {};
    util.functionsarray = [];
    util.startingposfuncs = [];
    var registermessageHandler = [];
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
                //Add if messagrHandler.ID = e.decoded.function then execute line below;
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
                alertmessage("Connected to websocket");
                queryready(ws);
            };
        } else {
            queryready(ws);
        }
    };

    util.pushFunction = function (query) {
        if (util.functionsarray.includes(query) === false) {
            util.functionsarray.push(query);
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

function getFuncs(e) { //Get List of all available functions 
    var json = e.decoded;
    if (json.function === "Functions") {
        for (var i = 0; i < json.data.length; i++) {
            vm.Funcs.push(json.data[i].fid);
        }

        console.log(vm.Funcs());
    }
};
util.pushFunction("Functions");

function createconn() { //Creates initial connection to WS.
    createconn = function () { };
    var x = document.cookie;
    alert(x);
    console.log(x);
    var authToken = 'R3YKZFKBVi';

    document.cookie = 'X-Authorization=' + authToken + '; path=/';
    ws = util.ws.webSocket.getInstance("wss://" + "35.204.238.205" + ":" + "5656" + "/");
    util.ws.onopencheck(ws, AfterConnection);
    util.ws.onmessage(ws, getFuncs);
}
createconn();

function AfterConnection(ws) { //Function that runs after websocket has been opened
    for (var i = 0; i < vm.widgets().length; i++) {
        var widget = vm.widgets()[i].options();
        var query = widget.func();
        util.pushFunction(query);
    }
    for (var i = 0; i < util.functionsarray.length; i++) {
        ws.send(util.functionsarray[i]);
    }
}

