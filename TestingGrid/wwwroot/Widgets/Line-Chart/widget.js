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
ws = util.ws.webSocket.getInstance("wss://" + "35.204.238.205" + ":" + "5656" + "/"); // might remove dependency for this;
util.ws.onmessage(ws, IsJsonString); //Add more here;
function createLineChart(item) {
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

util.startingposfuncs.push({ WidgetType: "Line-Chart", "func": createLineChart });

