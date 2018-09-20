<script>
    var roomarray = [];
    var queue = [0];
    var multiarray = [queue];
    max = 30; min = -30;

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


    var ctx = document.getElementById("canvas1").getContext("2d");
    var myChart = new Chart(ctx, config);
    var functionsarray = [];
    var ws, out = document.getElementById("out");
    function connect() {
        if ("WebSocket" in window) {
        ws = new WebSocket("wss://" + "35.204.238.205" + ":" + "4040" + "/");
    //functionsarray.push("getrtfeed[]");
    out.value = "connecting...";
            ws.onopen = function (e) {out.value += "connected"; multiarray.pop(); }
            ws.onclose = function (e) {out.value = "disconnected"; }
            ws.onmessage = function (e) {
        IsJsonString(e.data);
    }
            ws.onerror = function (e) {out.value = e.data; }
        } else alert("WebSockets not supported on your browser.");
    }

    function IsJsonString(str) {
        try {
            var parsed = JSON.parse(str);
            var data = parsed[0];
            var room = data.sym;
            if (roomarray.includes(room) === false) {

        roomarray.push(room);
    };
            var roomindex = roomarray.indexOf(room);
            var flowrate = data.temp;
            var time = data.time;
            var time = time.replace('0D', '');
            var hour = time.charAt(0) + time.charAt(1);
            var minute = time.charAt(3) + time.charAt(4);
            var sec = time.charAt(6) + time.charAt(7);
            var millisec = time.charAt(8) + time.charAt(9) + time.charAt(10);
            var d = new Date();
            var momentDate = moment(d);
            d.setHours(hour, minute, sec, millisec);
            if (flowrate == null) {
        out.value = str;
    }
            else {
                var roomdata = multiarray[roomindex];
                if (roomdata === undefined) {roomdata = []; }
                roomdata.push(flowrate);
                multiarray[roomindex] = roomdata;
                if (myChart.data.datasets.length <= roomindex) {
                    var color = random_rgba();
                    myChart.data.datasets[roomindex] =
                        {
        label: room,
                            data: multiarray[roomindex],
                            backgroundColor: color,
                            borderColor: color,
                            borderWidth: 1
                        };
                }

                else {
        myChart.data.datasets[roomindex].data = multiarray[roomindex];
    }

                if (multiarray[0].length > queuelabels.length) {queuelabels.push(d)};
                console.log(myChart);
                if (myChart.data.labels.length > 20) {}

    myChart.update();
            }
        } catch (e) {
        out.value = str;
    }
        return true;
    }

    function newDate(days) {
        return moment().add(days, 'd');
    }

    function send() {
        x = document.getElementById("x");
    v = x.value;
        ws.send(v);
        out.value = "sent " + v;
        return false;
    }

    setInterval(function () {
        var list = functionsarray;
        for (i = 0; i < list.length; i++) {
        ws.send(list[i]);
    }
    }, 5000);

    function random_rgba() {
        var o = Math.round, r = Math.random, s = 255;
        return 'rgba(' + o(r() * s) + ',' + o(r() * s) + ',' + o(r() * s) + ',' + r().toFixed(1) + ')';
    }

</script>