function loadScript(location) {
    // Check for existing script element and delete it if it exists
    var js = document.getElementById("sandboxScript");
    if (js !== null) {
        document.body.removeChild(js);
        console.info("---------- Script refreshed ----------");
    }

    // Create new script element and load a script into it
    //js = document.createElement("script");
    //js.src = location;
    //js.id = "sandboxScript";
    //js.type = "text/javascript";


    var s = document.createElement('script');
    s.src = location;
    s.type = "text/javascript";
    s.async = false;                                 // <-- this is important
    s.onload = function () {
        
        addwidgets();
    };
    document.getElementsByTagName('head')[0].appendChild(s);
    //document.body.appendChild(js);
}

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
    
    return {
        new: function (p) {
            return p + (util.seed++);
        }
    }
}();

function alertmessage(message) {
    document.getElementById('snoAlertBox').innerHTML = message;
    showalert();
}

function showalert() {
    $("#snoAlertBox").fadeIn();
    closeSnoAlertBox();
};

function closeSnoAlertBox() {
    window.setTimeout(function () {
        $("#snoAlertBox").fadeOut(4000)
    }, 4000);
}

