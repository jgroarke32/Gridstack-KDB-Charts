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