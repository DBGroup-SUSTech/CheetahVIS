// function initial_Date() {
//     document.getElementById("ahour").
// }

function set_Departure_time_h() {
    var Arrival_time_h = document.getElementById("ahour").value;
    var Departure_time_h = document.getElementById("dhour");
    Departure_time_h.innerHTML = "";
    //Departure_time_h.options.add(new Option("--", -1));
    for (var i = Arrival_time_h; i <= 23; i++) {
        if(i<10){
            Departure_time_h.options.add(new Option("0"+i, i));
        }
        else{
            Departure_time_h.options.add(new Option(i, i)); }}
}

function set_Departure_time_m() {
    var Departure_time_h = document.getElementById("dhour").value;
    var Arrival_time_h = document.getElementById("ahour").value;
    var Departure_time_m = document.getElementById("dminute");
    var Arrival_time_m = document.getElementById("aminute").value;
    Departure_time_m.innerHTML = "";
    //Departure_time_m.options.add(new Option("--", -1));
    if(Departure_time_h == Arrival_time_h)
        for (var i = Arrival_time_m; i <= 59; i++) {
            if(i<10){
                Departure_time_m.options.add(new Option("0"+i, i));
            }
            else{
                Departure_time_m.options.add(new Option(i, i)); }}
    else
        for (var i = 1; i <= 59; i++) {
            if(i<10){
                Departure_time_m.options.add(new Option("0"+i, i));
            }
            else{
                Departure_time_m.options.add(new Option(i, i)); }}
}

function set_Departure_time_s() {
    var Departure_time_h = document.getElementById("dhour").value;
    var Arrival_time_h = document.getElementById("ahour").value;
    var Departure_time_m = document.getElementById("dminute").value;
    var Arrival_time_m = document.getElementById("aminute").value;
    var Departure_time_s = document.getElementById("dsecond");
    var Arrival_time_s = document.getElementById("asecond").value;
    Departure_time_s.innerHTML = "";
    //Departure_time_s.options.add(new Option("--", -1));
    if(Departure_time_h == Arrival_time_h && Departure_time_m == Arrival_time_m)
        for (var i = Arrival_time_s; i <= 59; i++) {
            if(i<10){
                Departure_time_s.options.add(new Option("0"+i, i));
            }
            else{
                Departure_time_s.options.add(new Option(i, i)); }}
    else
        for (var i = 1; i <= 59; i++) {
            if(i<10){
                Departure_time_s.options.add(new Option("0"+i, i));
            }
            else{
                Departure_time_s.options.add(new Option(i, i));
            }
        }
}



function initialDate() {
    var Arrival_time_h = document.getElementById("ahour");
    var Departure_time_h = document.getElementById("dhour");
    var Departure_time_m = document.getElementById("dminute");
    var Departure_time_s = document.getElementById("dsecond");


    Arrival_time_h.innerHTML = "";
    Arrival_time_h.options.add(new Option("--", -1));
    Departure_time_h.options.add(new Option("--", -1));
    Departure_time_m.options.add(new Option("--", -1));
    Departure_time_s.options.add(new Option("--", -1));
    for (var i = 0; i <= 23; i++) {
        if(i < 10){
            Arrival_time_h.options.add(new Option("0"+i, i));
        }
        else{
            Arrival_time_h.options.add(new Option(i, i));
        }
    }
    var Arrival_time_m = document.getElementById("aminute");
    Arrival_time_m.innerHTML = "";
    Arrival_time_m.options.add(new Option("--", -1));
    for (var i = 0; i <= 59; i++) {
        if(i < 10){
            Arrival_time_m.options.add(new Option("0"+i, i));
        }
        else{
            Arrival_time_m.options.add(new Option(i, i)); }
    }
    var Arrival_time_s = document.getElementById("asecond");
    Arrival_time_s.innerHTML = "";
    Arrival_time_s.options.add(new Option("--", -1));
    for (var i = 0; i <= 59; i++) {
        if(i < 10){
            Arrival_time_s.options.add(new Option("0"+i, i));
        }
        else{
            Arrival_time_s.options.add(new Option(i, i)); }
    }
}
