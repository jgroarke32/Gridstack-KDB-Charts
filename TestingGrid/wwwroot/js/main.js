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

ko.bindingHandlers.gridStack = {
    helpers: {
        cloneNodes: function (nodesArray, shouldCleanNodes) {
            for (var i = 0, j = nodesArray.length, newNodesArray = []; i < j; i++) {
                var clonedNode = nodesArray[i].cloneNode(true);
                newNodesArray.push(shouldCleanNodes ? ko.cleanNode(clonedNode) : clonedNode);
            }
            return newNodesArray;
        }
    },
    init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
        var $element = $(element);
        var gridItems = [];
        var fromObs = false;
        var template = ko.bindingHandlers.gridStack.helpers.cloneNodes(element.getElementsByClassName('grid-stack-item'), true);
        ko.virtualElements.emptyNode(element);

        var timeout;
        var grid = $element.gridstack(ko.utils.extend(ko.unwrap(valueAccessor().settings) || {}, {
            auto: true
        })).data('gridstack');

        $element.on('change', function (eve, items) {
            if (!fromObs) {
                if (timeout) {
                    clearTimeout(timeout);
                }
                timeout = setTimeout(function () {
                    for (var i = 0; i < gridItems.length; i++) {
                        var item = gridItems[i];
                        var from = {
                            x: ko.unwrap(item.item.x),
                            y: ko.unwrap(item.item.y),
                            width: ko.unwrap(item.item.width),
                            height: ko.unwrap(item.item.height)
                        };
                        var to = {
                            x: parseInt(item.element.getAttribute("data-gs-x")),
                            y: parseInt(item.element.getAttribute("data-gs-y")),
                            width: parseInt(item.element.getAttribute("data-gs-width")),
                            height: parseInt(item.element.getAttribute("data-gs-height"))
                        };

                        if (from.x != to.x) {
                            if (ko.isWritableObservable(item.item.x)) {
                                item.item.x(to.x);
                            } else if (!ko.isObservable()) {
                                item.item.x = to.x;
                            }
                        }

                        if (from.y != to.y) {
                            if (ko.isWritableObservable(item.item.y)) {
                                item.item.y(to.y);
                            } else if (!ko.isObservable()) {
                                item.item.y = to.y;
                            }
                        }

                        if (from.width != to.width) {
                            if (ko.isWritableObservable(item.item.width)) {
                                item.item.width(to.width);
                            } else if (!ko.isObservable()) {
                                item.item.width = to.width;
                            }
                        }

                        if (from.height != to.height) {
                            if (ko.isWritableObservable(item.item.height)) {
                                item.item.height(to.height);
                            } else if (!ko.isObservable()) {
                                item.item.height = to.height;
                            }
                        }
                    }
                }, 10);

            }
        });

        ko.computed({
            read: function () {
                fromObs = true;
                var widgets = ko.unwrap(valueAccessor().widgets);
                var newGridItems = [];

                for (var i = 0; i < gridItems.length; i++) {
                    var item = ko.utils.arrayFirst(widgets, function (w) { return w == gridItems[i].item; });
                    if (item == null) {
                        grid.removeWidget(gridItems[i].element);
                        ko.cleanNode(gridItems[i].element);
                    } else {
                        newGridItems.push(gridItems[i]);
                    }
                }

                for (var i = 0; i < widgets.length; i++) {
                    var item = ko.utils.arrayFirst(gridItems, function (w) { return w.item == widgets[i]; });
                    if (item == null) {
                        console.log(widgets[i].options());
                        var innerBindingContext = bindingContext['createChildContext'](widgets[i]);
                        var itemElement = ko.bindingHandlers.gridStack.helpers.cloneNodes(template)[0];
                        grid.addWidget(itemElement, ko.unwrap(widgets[i].x), ko.unwrap(widgets[i].y), ko.unwrap(widgets[i].width), ko.unwrap(widgets[i].height), true, 4, 6, 5, 8, ko.unwrap(widgets[i].options().id));
                        ko.applyBindings(innerBindingContext, itemElement)
                        vm.createstartingpos(widgets[i]);
                        newGridItems.push({ item: widgets[i], element: itemElement });
                    } else {
                        var to = {
                            x: ko.unwrap(widgets[i].x),
                            y: ko.unwrap(widgets[i].y),
                            width: ko.unwrap(widgets[i].width),
                            height: ko.unwrap(widgets[i].height)
                        };
                        var from = {
                            x: parseInt(item.element.getAttribute("data-gs-x")),
                            y: parseInt(item.element.getAttribute("data-gs-y")),
                            width: parseInt(item.element.getAttribute("data-gs-width")),
                            height: parseInt(item.element.getAttribute("data-gs-height"))
                        };

                        if (from.x != to.x || from.y != to.y) {
                            grid.move(item.element, to.x, to.y);
                        }

                        if (from.width != to.width || from.height != to.height) {
                            grid.resize(item.element, to.width, to.height);
                        }
                    }
                }
                gridItems = newGridItems;

                fromObs = false;
            },
            disposeWhenNodeIsRemoved: element
        }).extend({ deferred: true });


        ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
            gridStack.destroy();
        });

        return { 'controlsDescendantBindings': true };
    }
};

//VM
var vm = {
    widgets: ko.observableArray([
        //    { x: ko.observable(0), y: ko.observable(0), width: ko.observable(2), height: ko.observable(2) },
        //    { x: ko.observable(2), y: ko.observable(0), width: ko.observable(4), height: ko.observable(2) },
        //    { x: ko.observable(6), y: ko.observable(0), width: ko.observable(2), height: ko.observable(4) },
        //    { x: ko.observable(1), y: ko.observable(2), width: ko.observable(4), height: ko.observable(2) }
    ]),
    add: function () {
        var origoptions = new Array({ "name": uid.seed, "show": "true", "id": uid.new("Line-Chart"), "func": "getrtfeed" });
        var kooptions = ko.utils.arrayMap(origoptions, function (opt) {
            var optionskeys = Object.keys(opt);;
            for (var j = 0; j < optionskeys.length; j++) {
                var currone = optionskeys[j];
                console.log(opt[currone]);
                opt[currone] = ko.observable(opt[currone]);
            }
            return opt;
        });
            vm.widgets.push({
                x: ko.observable(0), y: ko.observable(0), width: ko.observable(4), height: ko.observable(2),
                options: ko.observable(kooptions[0])
            });
    },
    twoWay: function () {
        if (vm.widgets()[0].x() == 10) {
            vm.widgets()[0].x(0);
        } else {
            vm.widgets()[0].x(vm.widgets()[0].x() + 1)
        }
    },
    delete: function (widget) {
        var delwidget = ko.utils.arrayFirst(vm.widgets(), function (item) { //acts wierd if delete before any change in movement in widgets
            return (item.options().id() === widget.id());                   //if x and y pf widgets overlap
        });
        vm.widgets.remove(delwidget);
    },
    saveGrid: function () {
        var jsonData = ko.toJSON(vm.widgets);

        console.log(jsonData);
    },
    currentWidget: ko.observable(null),
    objects: ko.observableArray([]),
    showoptions: function (widget) {
        vm.currentWidget(widget);
        $('#exampleModalLong').modal('show');

    },
    startsub: function (widget) {
        console.log(ko.unwrap(widget));
        console.log(vm.objects());
        var chart = ko.utils.arrayFirst(vm.objects(), function (item) {
            return (item.id === widget.id());
        });
        console.log(chart.obj);
        if (chart.obj != undefined) {
            chart.obj.options.title = {
                display: true,
                text: 'Custom Chart Title'
            };
            chart.obj.update();
            createconn(chart.obj);
        }
    },
    createstartingpos: function (item) {
        var item = item.options();
        var queuelabels = [];
        var config = {
            type: 'line',
            data: {
                labels: queuelabels,
                datasets: []
            },

            options: {
                scales: {
                    yAxes: [{
                        ticks: {}
                    }],
                    xAxes: [{
                        type: "time",
                        display: true,
                        scaleLabel: {
                            display: true,
                            labelString: 'Date'
                        },
                        ticks: {
                            autoSkip: true
                        }

                    }],
                }
            }
        };

        var ctx = document.getElementById(item.id()).getContext("2d");
        var myChart = new Chart(ctx, config);
        myChart.queuelabels = [];
        myChart.roomarray = [];
        myChart.queue = [];
        myChart.multiarray = [myChart.queue];
        var top = item.id;
        vm.objects.push({ id: item.id(), obj: myChart, func: (item.func() + "[]") });
        myChart.options.title = {
            display: true,
            text: 'Custom Chart Title'
        };
        myChart.update();
        createconn();
    }
};

vm.currentWidget.subscribe(function (newResult) {  //instead do this on save changes.
    console.log(newResult);
    console.log(vm.widgets().length);
    for (var i = 0; i < vm.widgets().length; i++) {
        var listwidget = ko.unwrap(vm.widgets()[i].options);
        console.log(listwidget.id());

    }
});

ko.applyBindings(vm);

function addwidgets() {

    $.ajax({
        type: "GET",
        url: "serialize.json",
        dataType: "json",
        success: function (x) {
            var result = x;
            console.log(result);
            for (var i = 0; i < result.length; i++) {
                var origoptions = new Array(result[i].options);
                var kooptions = ko.utils.arrayMap(origoptions, function (opt) {
                    var optionskeys = Object.keys(opt);;
                    for (var j = 0; j < optionskeys.length; j++) {
                        var currone = optionskeys[j];
                        console.log(opt[currone]);
                        opt[currone] = ko.observable(opt[currone]);
                    }
                    return opt;
                });
                vm.widgets.push({
                    x: ko.observable(result[i].x), y: ko.observable(result[i].y), width: ko.observable(result[i].width), height: ko.observable(result[i].height),
                    options: ko.observable(kooptions[0])
                });
            }
            uid.seed = result.length;
        },
        error: function (x) {
            alert("Failed");
            console.log(x);
        }
    });
};
addwidgets();

function createconn() {
    ws = util.ws.webSocket.getInstance("wss://" + "35.204.238.205" + ":" + "5656" + "/");
    util.ws.onopencheck(ws, fetFeed);
    util.ws.onmessage(ws, IsJsonString);
}

function fetFeed(ws) {
    //util.functionsarray.push("getrtfeed[]"); //Observable via get functions
    var sendfuncs = []; //Use util.functionsarray to hold page while funcs load; This is good for now.
    for (var i = 0; i < vm.widgets().length; i++) {
        var widget = vm.widgets()[i].options();
        var query = widget.func() + "[]";
        if (sendfuncs.includes(query) === false) {
            sendfuncs.push(query);
        }
    }
    for (var i = 0; i < sendfuncs.length; i++) {
        ws.send(sendfuncs[i]);
    }
}

function IsJsonString(e) {
    var json = e.decoded;
    //console.log(json);

    var funcsubs = ko.utils.arrayMap(vm.objects(), function (item) {
        if (json.function == item.func) {
            return item.obj;
        }
    });
    funcsubs = funcsubs.filter(function (n) { return n != undefined });
    try {
        for (var i = 0; i < funcsubs.length; i++) {
            var myChart = funcsubs[i];
            //var data = json.data[0]; //First element in array;
            for (var j = 0; j < json.data.length; j++) {
                //var data = json.data[json.data.length - 1] //Last element in array
                var data = json.data[j];
                var room = data.sym;
                if (myChart.roomarray.includes(room) === false) {

                    myChart.roomarray.push(room);
                };
                var roomindex = myChart.roomarray.indexOf(room);
                var flowrate = data.temp;
                var d = getTime(data.time);

                if (flowrate == null) {
                    alert(data);
                }
                else {
                    var roomdata = myChart.multiarray[roomindex];
                    if (roomdata === undefined) { roomdata = []; }
                    roomdata.push(flowrate);
                    myChart.multiarray[roomindex] = roomdata;
                    if (myChart.data.datasets.length <= roomindex) {
                        var color = random_rgba(); //Colours could be observable
                        myChart.data.datasets[roomindex] =
                            {
                                label: room, //Room observable
                                data: myChart.multiarray[roomindex],
                                backgroundColor: color,
                                borderColor: color,
                            borderWidth: 1,
                            fill: false
                            };
                    }

                    else {
                        myChart.data.datasets[roomindex].data = myChart.multiarray[roomindex];
                    }

                    if (myChart.multiarray[0].length > myChart.queuelabels.length) { myChart.queuelabels.push(d); myChart.data.labels = myChart.queuelabels };

                    if (myChart.data.labels.length > 20) { }

                    myChart.update();
                }
            }
        }
    } catch (e) {
        console.log(e);
    }
    return true;
}

//setInterval(function () {
//    ws = util.ws.webSocket.getInstance("wss://" + "35.204.238.205" + ":" + "5656" + "/");
//    var list = util.functionsarray;
//    for (i = 0; i < list.length; i++) {
//        ws.send(list[i]);
//    }
//}, 10000);

function random_rgba() {  //possibly put in utils
    var o = Math.round, r = Math.random, s = 255;
    return 'rgba(' + o(r() * s) + ',' + o(r() * s) + ',' + o(r() * s) + ',' + r().toFixed(1) + ')';
}

function getTime(jstime) {
    var time = jstime;
    var time = time.replace('0D', '');
    var hour = time.charAt(0) + time.charAt(1);
    var minute = time.charAt(3) + time.charAt(4);
    var sec = time.charAt(6) + time.charAt(7);
    var millisec = time.charAt(8) + time.charAt(9) + time.charAt(10);
    var d = new Date();
    var momentDate = moment(d);
    d.setHours(hour, minute, sec, millisec);
    return d;
}

var uid = function () {
    var seed = 1;
    return {
        new: function (p) {
            return p + (seed++);
        }
    }
}();