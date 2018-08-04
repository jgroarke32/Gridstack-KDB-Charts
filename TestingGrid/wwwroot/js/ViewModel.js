//VM
var vm = {
    widgets: ko.observableArray([
        //    { x: ko.observable(0), y: ko.observable(0), width: ko.observable(2), height: ko.observable(2) },
        //    { x: ko.observable(2), y: ko.observable(0), width: ko.observable(4), height: ko.observable(2) },
        //    { x: ko.observable(6), y: ko.observable(0), width: ko.observable(2), height: ko.observable(4) }
    ]),
    widgetType: ko.observableArray(),
    add: function (WidgetType) {
        var wtype = ko.utils.arrayFirst(vm.widgetType(), function (wig) { return wig.TypeName == WidgetType.TypeName });
        var origoptions = new Array({ "name": util.seed, "show": "true", "id": uid.new("Line-Chart"), "func": "getrtfeed", "htmllink": wtype.nestedhtml, "backgroundc": "#F8F8FF"});
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
            x: ko.observable(0), y: ko.observable(0), width: ko.observable(4), height: ko.observable(2), type: WidgetType.TypeName,
            options: ko.observable(kooptions[0])
        });
    },
    delete: function (widget) {
        var delwidget = ko.utils.arrayFirst(vm.widgets(), function (item) { //acts wierd if delete before any change in movement in widgets
            return (item.options().id() === widget.id());                   //if x and y pf widgets overlap
        });
        vm.widgets.remove(delwidget);
    },
    saveGrid: function () {
        //var jsonData = ko.toJSON(vm.widgets);
        var jsonData = ko.toJS(vm.widgets);
        //_.sortBy(jsonData, 'x');
        _.each(jsonData, function(widget) {
            delete widget.options.htmllink;
        });
        console.log(JSON.stringify(jsonData));
    },
    currentWidget: ko.observable(null),
    objects: ko.observableArray([]),
    Funcs: ko.observableArray([]),
    showoptions: function (widget) {
        vm.currentWidget(widget);
        $('#exampleModalLong').modal('show');
    },
    createstartingpos: function (item) {
        for (var i = 0; i < util.startingposfuncs.length; i++) {
            if (util.startingposfuncs[i].WidgetType === item.type) {
                util.startingposfuncs[i].func(item);
            }
        }
        
    },
    acceptItemEdit: function () {
        vm.currentWidget().name.commit();
        vm.currentWidget().backgroundc.commit();
        vm.currentWidget(null);
        $('#exampleModalLong').modal('hide');
    },
    cancelItemEdit: function () {
        vm.currentWidget().name.reset();
        vm.currentWidget().quantity.reset();
        vm.currentWidget(null);
        $('#exampleModalLong').modal('hide');
    }
};

vm.currentWidget.subscribe(function (newResult) {  //instead do this on save changes.
    console.log(newResult);
});

ko.applyBindings(vm);
function getWidgets() {
    for (var i = 0; i < JSONsource.length; i++) {
        loadScript("/Widgets/" + JSONsource[i] + "/widget.js");

        var url = "/Widgets/" + JSONsource[i] + "/widget.html";
        $.ajax({
            type: "GET",
            url: url,
            dataType: "html",
            success: function (innerhtml) {
                var tname = this.url.replace("/Widgets/", '');
                tname = tname.replace("/widget.html", '');
                var maxmin = innerhtml.substring(0, 17);
                var arrayOfStrings = (innerhtml.substring(0, 17)).split(";");
                _.each(arrayOfStrings, function (widget, index, list) {
                    arrayOfStrings[index] = Number(_.last(widget));
                });
                vm.widgetType.push({ TypeName: tname, nestedhtml: innerhtml.substring(18), maxHeight: arrayOfStrings[0], maxWidth: arrayOfStrings[1] }); //array push here then after function join together;
            },
            error: function (x) {
                alert("Failed");
            }
        });
    }
}
getWidgets();

var addwidgets = function () {
    addwidgets = function () { };
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
                    console.log(vm.widgetType());
                    var wtype = ko.utils.arrayFirst(vm.widgetType(), function (wig) { return wig.TypeName == result[i].type });
                    opt.htmllink = wtype.nestedhtml;
                    var optionskeys = Object.keys(opt);
                    for (var j = 0; j < optionskeys.length; j++) {
                        var currone = optionskeys[j];
                        opt[currone] = ko.protectedObservable(opt[currone]);
                    }
                    return opt;
                });
                vm.widgets.push({
                    x: ko.observable(result[i].x), y: ko.observable(result[i].y), width: ko.observable(result[i].width), height: ko.observable(result[i].height), type: result[i].type,
                    options: ko.observable(kooptions[0])
                });
            }
            util.seed = result.length;
        },
        error: function (x) {
            alert("Failed");
            console.log(x);
        }
    });
};

ko.protectedObservable = function (initialValue) {
    //private variables
    var _temp = initialValue;
    var _actual = ko.observable(initialValue);

    var result = ko.dependentObservable({
        read: _actual,
        write: function (newValue) {
            _temp = newValue;
        }
    }).extend({ notify: "always" }); //needed in KO 3.0+ for reset, as computeds no longer notify when value is the same

    //commit the temporary value to our observable, if it is different
    result.commit = function () {
        if (_temp !== _actual()) {
            _actual(_temp);
        }
    };

    //notify subscribers to update their value with the original
    result.reset = function () {
        _actual.valueHasMutated();
        _temp = _actual();
    };

    return result;
};;