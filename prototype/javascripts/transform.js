/* transform.js
 * Script to transform a normal form page to a multiquestion wizard page
*/

var actualElements = {};
// utilities.js
var global_control = null;
var full_keyboard = false;

// Array of max days in month in a year and in a leap year
monthMaxDays	= [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
monthMaxDaysLeap= [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
hideSelectTags = [];

function $(id){
    return document.getElementById(id);
}

function getRealYear(dateObj)
{
    return (dateObj.getYear() % 100) + (((dateObj.getYear() % 100) < 39) ? 2000 : 1900);
}

function getDaysPerMonth(month, year)
{
    /*
	Check for leap year. These are some conditions to check year is leap year or not...
	1.Years evenly divisible by four are normally leap years, except for...
	2.Years also evenly divisible by 100 are not leap years, except for...
	3.Years also evenly divisible by 400 are leap years.
	*/
    if ((year % 4) == 0)
    {
        if ((year % 100) == 0 && (year % 400) != 0)
            return monthMaxDays[month];

        return monthMaxDaysLeap[month];
    }
    else
        return monthMaxDays[month];
}

function createCalender(year, month, day)
{
    // current Date
    var curDate = new Date();
    var curDay = curDate.getDate();
    var curMonth = curDate.getMonth();
    var curYear = getRealYear(curDate)

    // if a date already exists, we calculate some values here
    if (!year)
    {
        var year = curYear;
        var month = curMonth;
    }

    var yearFound = 0;
    for (var i=0; i<document.getElementById('selectYear').options.length; i++)
    {
        if (document.getElementById('selectYear').options[i].value == year)
        {
            document.getElementById('selectYear').selectedIndex = i;
            yearFound = true;
            break;
        }
    }
    if (!yearFound)
    {
        document.getElementById('selectYear').selectedIndex = 0;
        year = document.getElementById('selectYear').options[0].value;
    }
    document.getElementById('selectMonth').selectedIndex = month;

    // first day of the month.
    var fristDayOfMonthObj = new Date(year, month, 1);
    var firstDayOfMonth = fristDayOfMonthObj.getDay();

    continu		= true;
    firstRow	= true;
    var x	= 0;
    var d	= 0;
    var trs = []
    var ti = 0;
    while (d <= getDaysPerMonth(month, year))
    {
        if (firstRow)
        {
            trs[ti] = document.createElement("TR");
            if (firstDayOfMonth > 0)
            {
                while (x < firstDayOfMonth)
                {
                    trs[ti].appendChild(document.createElement("TD"));
                    x++;
                }
            }
            firstRow = false;
            var d = 1;
        }
        if (x % 7 == 0)
        {
            ti++;
            trs[ti] = document.createElement("TR");
        }
        if (day && d == day)
        {
            var setID = 'calenderChoosenDay';
            var styleClass = 'choosenDay';
            var setTitle = 'this day is currently selected';
        }
        else if (d == curDay && month == curMonth && year == curYear)
        {
            var setID = 'calenderToDay';
            var styleClass = 'toDay';
            var setTitle = 'this day today';
        }
        else
        {
            var setID = false;
            var styleClass = 'normalDay';
            var setTitle = false;
        }
        var td = document.createElement("TD");
        td.className = styleClass;
        if (setID)
        {
            td.id = setID;
        }
        if (setTitle)
        {
            td.title = setTitle;
        }
        td.onmouseover = new Function('highLiteDay(this)');
        td.onmouseout = new Function('deHighLiteDay(this)');
        if (targetEl)
            td.onclick = new Function('pickDate('+year+', '+month+', '+d+')');
        else
            td.style.cursor = 'default';
        td.appendChild(document.createTextNode(d));
        trs[ti].appendChild(td);
        x++;
        d++;
    }
    return trs;
}

function showCalender(elPos, tgtEl)
{
    if(document.getElementById("calenderTable").style.display == "block"){
        closeCalender();
        return;
    }

    targetEl = false;

    if (document.getElementById(tgtEl))
    {
        targetEl = document.getElementById(tgtEl);
    }
    else
    {
        if (document.forms[0].elements[tgtEl])
        {
            targetEl = document.forms[0].elements[tgtEl];
        }
    }
    var calTable = document.getElementById('calenderTable');

    //var positions = [0,0];
    //var positions = getParentOffset(elPos, positions);

    var positions = checkCtrl($(tgtEl));

    calTable.style.left = positions[3]+'px';
    calTable.style.top = ( positions[2] - $("divScroller").scrollTop + elPos.offsetHeight)+'px';

    calTable.style.display='block';

    var matchDate = new RegExp('^([0-9]{2})-([0-9]{2})-([0-9]{4})$');
    var m = matchDate.exec(targetEl.value);
    if (m == null)
    {
        trs = createCalender(false, false, false);
        showCalenderBody(trs);
    }
    else
    {
        if (m[1].substr(0, 1) == 0)
            m[1] = m[1].substr(1, 1);
        if (m[2].substr(0, 1) == 0)
            m[2] = m[2].substr(1, 1);
        m[2] = m[2] - 1;
        trs = createCalender(m[3], m[2], m[1]);
        showCalenderBody(trs);
    }

    //calTable.style.left = (positions[0] + elPos.offsetWidth - calTable.offsetWidth)+'px';
    //calTable.style.top = (positions[1]-calTable.offsetHeight)+'px';

    hideSelect(document.body, 1);
}
function showCalenderBody(trs)
{
    var calTBody = document.getElementById('calender');
    while (calTBody.childNodes[0])
    {
        calTBody.removeChild(calTBody.childNodes[0]);
    }
    for (var i in trs)
    {
        calTBody.appendChild(trs[i]);
    }
}
function setYears(sy, ey)
{
    // current Date
    var curDate = new Date();
    var curYear = getRealYear(curDate);
    if (sy)
        startYear = curYear;
    if (ey)
        endYear = curYear;
    document.getElementById('selectYear').options.length = 0;
    var j = 0;
    for (y=ey; y>=sy; y--)
    {
        document.getElementById('selectYear')[j++] = new Option(y, y);
    }
}
function hideSelect(el, superTotal)
{
    if (superTotal >= 100)
    {
        return;
    }

    var totalChilds = el.childNodes.length;
    for (var c=0; c<totalChilds; c++)
    {
        var thisTag = el.childNodes[c];
        if (thisTag.tagName == 'SELECT')
        {
            if (thisTag.id != 'selectMonth' && thisTag.id != 'selectYear')
            {
                var calenderEl = document.getElementById('calenderTable');
                var positions = [0,0];
                var positions = getParentOffset(thisTag, positions);	// nieuw
                var thisLeft	= positions[0];
                var thisRight	= positions[0] + thisTag.offsetWidth;
                var thisTop	= positions[1];
                var thisBottom	= positions[1] + thisTag.offsetHeight;
                var calLeft	= calenderEl.offsetLeft;
                var calRight	= calenderEl.offsetLeft + calenderEl.offsetWidth;
                var calTop	= calenderEl.offsetTop;
                var calBottom	= calenderEl.offsetTop + calenderEl.offsetHeight;

                if (
                    (
                        /* check if it overlaps horizontally */
                        (thisLeft >= calLeft && thisLeft <= calRight)
                        ||
                        (thisRight <= calRight && thisRight >= calLeft)
                        ||
                        (thisLeft <= calLeft && thisRight >= calRight)
                        )
                    &&
                    (
                        /* check if it overlaps vertically */
                        (thisTop >= calTop && thisTop <= calBottom)
                        ||
                        (thisBottom <= calBottom && thisBottom >= calTop)
                        ||
                        (thisTop <= calTop && thisBottom >= calBottom)
                        )
                    )
                    {
                    hideSelectTags[hideSelectTags.length] = thisTag;
                    thisTag.style.display = 'none';
                }
            }

        }
        else if(thisTag.childNodes.length > 0)
        {
            hideSelect(thisTag, (superTotal+1));
        }
    }
}
function closeCalender()
{
    for (var i=0; i<hideSelectTags.length; i++)
    {
        hideSelectTags[i].style.display = 'block';
    }
    hideSelectTags.length = 0;
    document.getElementById('calenderTable').style.display='none';
}
function highLiteDay(el)
{
    el.className = 'hlDay';
}
function deHighLiteDay(el)
{
    if (el.id == 'calenderToDay')
        el.className = 'toDay';
    else if (el.id == 'calenderChoosenDay')
        el.className = 'choosenDay';
    else
        el.className = 'normalDay';
}
function pickDate(year, month, day)
{
    month++;
    day	= day < 10 ? '0'+day : day;
    month	= month < 10 ? '0'+month : month;
    if (!targetEl)
    {
        alert('target for date is not set yet');
    }
    else
    {
        targetEl.value= year+'-'+month+'-'+day;
        closeCalender();
    }
}
function getParentOffset(el, positions)
{
    positions[0] += el.offsetLeft;
    positions[1] += el.offsetTop;
    if (el.offsetParent)
        positions = getParentOffset(el.offsetParent, positions);
    return positions;
}

function checkCtrl(obj){
    var o = obj;
    var t = o.offsetTop;
    var l = o.offsetLeft + 1;
    var w = o.offsetWidth;
    var h = o.offsetHeight;

    while(o.offsetParent != document.body){
        o = o.offsetParent;
        t += o.offsetTop;
        l += o.offsetLeft;
    }
    return Array(w, h, t, l);
}

function showKeyboard(id){

    if($("divMenu")){
        document.body.removeChild($("divMenu"));
    }

    var p = checkCtrl($(id));

    var d = checkCtrl($("divScroller"));

    $("divScroller").scrollTop = p[2] - d[2] - 10;

    p = checkCtrl($(id));

    var iWidth = p[0];

    var div = document.createElement("div");
    div.id = "divMenu";
    div.style.top = "px";
    div.style.zIndex = 1001;
    div.style.top = p[2] + p[1] - $("divScroller").scrollTop;
    div.style.left = p[3];
    div.style.position = "absolute";

    global_control = id;

    var row1 = ["Q","W","E","R","T","Y","U","I","O","P"];
    var row2 = ["A","S","D","F","G","H","J","K","L",":"];
    var row3 = ["Z","X","C","V","B","N","M",",",".","?"];
    var row4 = ["cap","space","clear",(full_keyboard?"basic":"full")];
    var row5 = ["1","2","3","4","5","6","7","8","9","0"];
    var row6 = ["_","-","@","(",")","+",";","=","\\","/"];

    var tbl = document.createElement("table");
    tbl.className = "keyBoardTable";
    tbl.cellSpacing = 0;
    tbl.cellPadding = 3;
    tbl.id = "tblKeyboard";

    var tr5 = document.createElement("tr");

    for(var i = 0; i < row5.length; i++){
        var td5 = document.createElement("td");
        td5.align = "center";
        td5.vAlign = "middle";
        td5.style.cursor = "pointer";
        td5.bgColor = "#ffffff";
        td5.width = "30px";

        tr5.appendChild(td5);

        var btn = document.createElement("button");
        btn.className = "blue";
        btn.innerHTML = "<span>" + row5[i] + "</span>";
        btn.onclick = function(){
            if(!this.innerHTML.match(/^$/)){
                $(global_control).value += this.innerHTML.match(/<span>(.+)<\/span>/)[1];
            }
        }

        td5.appendChild(btn);

    }

    if(full_keyboard){
        tbl.appendChild(tr5);
    }

    var tr1 = document.createElement("tr");

    for(var i = 0; i < row1.length; i++){
        var td1 = document.createElement("td");
        td1.align = "center";
        td1.vAlign = "middle";
        td1.style.cursor = "pointer";
        td1.bgColor = "#ffffff";
        td1.width = "30px";

        tr1.appendChild(td1);

        var btn = document.createElement("button");
        btn.className = "blue";
        btn.innerHTML = "<span>" + row1[i] + "</span>";
        btn.onclick = function(){
            if(!this.innerHTML.match(/^$/)){
                $(global_control).value += this.innerHTML.match(/<span>(.+)<\/span>/)[1];
            }
        }

        td1.appendChild(btn);

    }

    tbl.appendChild(tr1);

    var tr2 = document.createElement("tr");

    for(var i = 0; i < row2.length; i++){
        var td2 = document.createElement("td");
        td2.align = "center";
        td2.vAlign = "middle";
        td2.style.cursor = "pointer";
        td2.bgColor = "#ffffff";
        td2.width = "30px";

        tr2.appendChild(td2);

        var btn = document.createElement("button");
        btn.className = "blue";
        btn.innerHTML = "<span>" + row2[i] + "</span>";
        btn.onclick = function(){
            if(!this.innerHTML.match(/^$/)){
                $(global_control).value += this.innerHTML.match(/<span>(.+)<\/span>/)[1];
            }
        }

        td2.appendChild(btn);

    }

    tbl.appendChild(tr2);

    var tr3 = document.createElement("tr");

    for(var i = 0; i < row3.length; i++){
        var td3 = document.createElement("td");
        td3.align = "center";
        td3.vAlign = "middle";
        td3.style.cursor = "pointer";
        td3.bgColor = "#ffffff";
        td3.width = "30px";

        tr3.appendChild(td3);

        var btn = document.createElement("button");
        btn.className = "blue";
        btn.innerHTML = "<span>" + row3[i] + "</span>";
        btn.onclick = function(){
            if(!this.innerHTML.match(/^$/)){
                $(global_control).value += this.innerHTML.match(/<span>(.+)<\/span>/)[1];
            }
        }

        td3.appendChild(btn);

    }

    tbl.appendChild(tr3);

    var tr6 = document.createElement("tr");

    for(var i = 0; i < row6.length; i++){
        var td6 = document.createElement("td");
        td6.align = "center";
        td6.vAlign = "middle";
        td6.style.cursor = "pointer";
        td6.bgColor = "#ffffff";
        td6.width = "30px";

        tr6.appendChild(td6);

        var btn = document.createElement("button");
        btn.className = "blue";
        btn.innerHTML = "<span>" + row6[i] + "</span>";
        btn.onclick = function(){
            if(!this.innerHTML.match(/^$/)){
                $(global_control).value += this.innerHTML.match(/<span>(.+)<\/span>/)[1];
            }
        }

        td6.appendChild(btn);

    }

    if(full_keyboard){
        tbl.appendChild(tr6);
    }

    var tr4 = document.createElement("tr");

    for(var i = 0; i < row4.length; i++){
        var td4 = document.createElement("td");
        td4.align = "center";
        td4.vAlign = "middle";
        td4.style.cursor = "pointer";
        td4.bgColor = "#ffffff";

        switch(row4[i]){
            case "cap":
                td4.colSpan = 2;
                break;
            case "space":
                td4.colSpan = 4;
                break;
            case "clear":
                td4.colSpan = 2;
                break;
            default:
                td4.colSpan = 2;
        }

        tr4.appendChild(td4);

        var btn = document.createElement("button");
        btn.innerHTML = "<span>" + row4[i] + "</span>";
        btn.onclick = function(){
            if(this.innerHTML.match(/<span>(.+)<\/span>/)[1].toLowerCase() == "cap"){
                if(this.innerHTML.match(/<span>(.+)<\/span>/)[1] == "cap"){
                    this.innerHTML = "<span>" + this.innerHTML.match(/<span>(.+)<\/span>/)[1].toUpperCase() + "</span>";

                    var cells = $("tblKeyboard").getElementsByTagName("button");

                    for(var c = 0; c < cells.length; c++){
                        if(cells[c].innerHTML.match(/<span>(.+)<\/span>/)[1].toLowerCase() != "cap"
                            && cells[c].innerHTML.match(/<span>(.+)<\/span>/)[1].toLowerCase() != "clear"
                            && cells[c].innerHTML.match(/<span>(.+)<\/span>/)[1].toLowerCase() != "space"
                            && cells[c].innerHTML.match(/<span>(.+)<\/span>/)[1].toLowerCase() != "full"
                            && cells[c].innerHTML.match(/<span>(.+)<\/span>/)[1].toLowerCase() != "basic" ){

                            cells[c].innerHTML = "<span>" + cells[c].innerHTML.match(/<span>(.+)<\/span>/)[1].toLowerCase() + "</span>";

                        }
                    }

                } else {
                    this.innerHTML = "<span>" + this.innerHTML.match(/<span>(.+)<\/span>/)[1].toLowerCase() + "</span>";

                    var cells = $("tblKeyboard").getElementsByTagName("button");

                    for(var c = 0; c < cells.length; c++){
                        if(cells[c].innerHTML.match(/<span>(.+)<\/span>/)[1].toLowerCase() != "cap"
                            && cells[c].innerHTML.match(/<span>(.+)<\/span>/)[1].toLowerCase() != "clear"
                            && cells[c].innerHTML.match(/<span>(.+)<\/span>/)[1].toLowerCase() != "space"
                            && cells[c].innerHTML.match(/<span>(.+)<\/span>/)[1].toLowerCase() != "full"
                            && cells[c].innerHTML.match(/<span>(.+)<\/span>/)[1].toLowerCase() != "basic" ){

                            cells[c].innerHTML = "<span>" + cells[c].innerHTML.match(/<span>(.+)<\/span>/)[1].toUpperCase() + "</span>";

                        }
                    }

                }
            } else if(this.innerHTML.match(/<span>(.+)<\/span>/)[1].toLowerCase() == "space"){

                $(global_control).value += " ";

            } else if(this.innerHTML.match(/<span>(.+)<\/span>/)[1].toLowerCase() == "clear"){

                $(global_control).value = $(global_control).value.substring(0,$(global_control).value.length - 1);

            } else if(this.innerHTML.match(/<span>(.+)<\/span>/)[1].toLowerCase() == "full"){

                full_keyboard = true;

                showKeyboard(global_control);

            } else if(this.innerHTML.match(/<span>(.+)<\/span>/)[1].toLowerCase() == "basic"){

                full_keyboard = false;

                showKeyboard(global_control);

            } else if(!this.innerHTML.match(/<span>(.+)<\/span>/)[1].match(/^$/)){

                $(global_control).value += this.innerHTML.match(/<span>(.+)<\/span>/)[1];

            }
        }

        td4.appendChild(btn);

    }

    tbl.appendChild(tr4);

    div.appendChild(tbl);
    document.body.appendChild(div);

    var u = checkCtrl(div);
    p = checkCtrl($(id));

    if(u[3] > ((d[0]/2)+d[3])){
        div.style.left = (parseInt(p[3]) - parseInt(u[0]) + parseInt(p[0]))+"px";
    } else if((parseInt(u[3]) + parseInt(u[0])) > (parseInt(d[3])+parseInt(d[0]))){
        div.style.left = (parseInt(d[3]) - parseInt(u[0]) + parseInt(d[0]))+"px";
    }

}

function showCalendar(id){

    if($("divMenu")){
        document.body.removeChild($("divMenu"));
    }

    var p = checkCtrl($(id));

    var d = checkCtrl($("divScroller"));

    $("divScroller").scrollTop = p[2] - d[2] - 10;

    p = checkCtrl($(id));

    var yr = new Date();
    setYears(yr.getFullYear() - 30, yr.getFullYear() + 10);
    showCalender($(id), id);
}

function showNumber(id){

    if($("divMenu")){
        document.body.removeChild($("divMenu"));
    }

    var p = checkCtrl($(id));

    var d = checkCtrl($("divScroller"));

    $("divScroller").scrollTop = p[2] - d[2] - 10;

    p = checkCtrl($(id));

    var div = document.createElement("div");
    div.id = "divMenu";
    div.style.top = "px";
    div.style.zIndex = 1001;
    div.style.top = p[2] + p[1] - $("divScroller").scrollTop;
    div.style.left = p[3];
    div.style.position = "absolute";

    global_control = id;

    var row1 = ["1","2","3"];
    var row2 = ["4","5","6"];
    var row3 = ["7","8","9"];
    var row4 = [".","0","C"];

    var tbl = document.createElement("table");
    tbl.className = "keyBoardTable";
    tbl.cellSpacing = 0;
    tbl.cellPadding = 3;
    tbl.id = "tblKeyboard";

    var tr1 = document.createElement("tr");

    for(var i = 0; i < row1.length; i++){
        var td1 = document.createElement("td");
        td1.align = "center";
        td1.vAlign = "middle";
        td1.style.cursor = "pointer";
        td1.bgColor = "#ffffff"
        td1.width = "30px";

        tr1.appendChild(td1);

        var btn = document.createElement("button");
        btn.className = "blue";
        btn.innerHTML = "<span>" + row1[i] + "</span>";
        btn.onclick = function(){
            if(!this.innerHTML.match(/^$/)){
                $(global_control).value += this.innerHTML.match(/<span>(.+)<\/span>/)[1];
            }
        }

        td1.appendChild(btn);

    }

    tbl.appendChild(tr1);

    var tr2 = document.createElement("tr");

    for(var i = 0; i < row2.length; i++){
        var td2 = document.createElement("td");
        td2.align = "center";
        td2.vAlign = "middle";
        td2.style.cursor = "pointer";
        td2.bgColor = "#ffffff";
        td2.width = "30px";
        td2.className = "blue";

        tr2.appendChild(td2);

        var btn = document.createElement("button");
        btn.className = "blue";
        btn.innerHTML = "<span>" + row2[i] + "</span>";
        btn.onclick = function(){
            if(!this.innerHTML.match(/^$/)){
                $(global_control).value += this.innerHTML.match(/<span>(.+)<\/span>/)[1];
            }
        }

        td2.appendChild(btn);

    }

    tbl.appendChild(tr2);

    var tr3 = document.createElement("tr");

    for(var i = 0; i < row3.length; i++){
        var td3 = document.createElement("td");
        td3.align = "center";
        td3.vAlign = "middle";
        td3.style.cursor = "pointer";
        td3.bgColor = "#ffffff";
        td3.width = "30px";
        td3.className = "blue";

        tr3.appendChild(td3);

        var btn = document.createElement("button");
        btn.className = "blue";
        btn.innerHTML = "<span>" + row3[i] + "</span>";
        btn.onclick = function(){
            if(!this.innerHTML.match(/^$/)){
                $(global_control).value += this.innerHTML.match(/<span>(.+)<\/span>/)[1];
            }
        }

        td3.appendChild(btn);

    }

    tbl.appendChild(tr3);

    var tr4 = document.createElement("tr");

    for(var i = 0; i < row4.length; i++){
        var td4 = document.createElement("td");
        td4.align = "center";
        td4.vAlign = "middle";
        td4.style.cursor = "pointer";
        td4.bgColor = "#ffffff";
        td4.width = "30px";
        td4.className = "blue";

        tr4.appendChild(td4);

        var btn = document.createElement("button");
        btn.innerHTML = "<span>" + row4[i] + "</span>";
        btn.className = "blue";
        btn.onclick = function(){
            if(this.innerHTML.match(/<span>(.+)<\/span>/)[1] == "C"){
                $(global_control).value = $(global_control).value.substring(0,$(global_control).value.length - 1);
            }else if(!this.innerHTML.match(/^$/)){
                $(global_control).value += this.innerHTML.match(/<span>(.+)<\/span>/)[1];
            }
        }

        td4.appendChild(btn);

    }

    tbl.appendChild(tr4);

    div.appendChild(tbl);
    document.body.appendChild(div);

}

function showYear(id){

    if($("divMenu")){
        document.body.removeChild($("divMenu"));
    }

    var p = checkCtrl($(id));

    var d = checkCtrl($("divScroller"));

    $("divScroller").scrollTop = p[2] - d[2] - 10;

    p = checkCtrl($(id));

    var div = document.createElement("div");
    div.id = "divMenu";
    div.style.top = "px";
    div.style.zIndex = 1001;
    div.style.backgroundColor = "#EEEEEE";
    div.style.top = p[2] + p[1] - $("divScroller").scrollTop;
    div.style.width = p[0];
    div.style.left = p[3];
    div.style.position = "absolute";

    var sel = document.createElement("select");
    sel.style.height = "200px";
    sel.style.width = "100%";
    sel.size = 10;
    sel.style.fontSize = "1.5em";

    div.appendChild(sel);

    sel.onclick = function(){
        $(id).value = this[this.selectedIndex].innerHTML;
        document.body.removeChild($("divMenu"));
    }

    var d = new Date();

    for(var i = 1970; i < d.getFullYear()+10; i++){
        var opt = document.createElement("option");

        opt.innerHTML = i;

        if(i == d.getFullYear()){
            opt.selected = "true";
        }

        sel.appendChild(opt);
    }

    document.body.appendChild(div);

}

function showMenu(id, original_id){

    if($("divMenu")){
        document.body.removeChild($("divMenu"));
    }

    var p = checkCtrl($(id));

    var d = checkCtrl($("divScroller"));

    $("divScroller").scrollTop = p[2] - d[2] - 10;

    p = checkCtrl($(id));

    var div = document.createElement("div");
    div.id = "divMenu";
    div.style.top = "px";
    div.style.zIndex = 1001;
    div.style.backgroundColor = "#EEEEEE";
    div.style.top = p[2] + p[1] - $("divScroller").scrollTop;
    div.style.width = p[0];
    div.style.left = p[3];
    div.style.position = "absolute";

    var sel = document.createElement("select");
    sel.style.height = "200px";
    sel.style.width = "100%";
    sel.size = 10;
    sel.style.fontSize = "1.5em";

    div.appendChild(sel);

    sel.onclick = function(){
        $(id).value = this[this.selectedIndex].innerHTML;
        document.body.removeChild($("divMenu"));
    }


    document.body.appendChild(div);

    for(var i = 0; i < $(original_id).options.length; i++){
        var opt = document.createElement("option");

        opt.value = $(original_id).options[i].value;
        opt.innerHTML = $(original_id).options[i].innerHTML;

        sel.appendChild(opt);
    }
}

function transformPage(){
    var formElements = document.forms[0].elements;

    for(var i = 0; i < formElements.length; i++){
        if(formElements[i].tagName != "BUTTON"){
            if(formElements[i].tagName == "INPUT"){
                if(formElements[i].type != "button"){
                    actualElements[formElements[i].id] = [formElements[i],
                    getLabel(formElements[i].id), formElements[i].getAttribute("field_type")];
                }
            } else {
                actualElements[formElements[i].id] = [formElements[i],
                getLabel(formElements[i].id), formElements[i].getAttribute("field_type")];
            }
        }
    }

    generatePage(document.forms[0].action, document.forms[0].method);
}

function getLabel(id){
    var labels = document.getElementsByTagName("label");

    if($(id)){
        var helpText = $(id).getAttribute("helpText");

        if(helpText)
            return helpText;
    }

    // Get the value of the label text
    for(var l = 0; l < labels.length; l++){
        if(labels[l].getAttribute("for") == id){
            // if found, return the value else keep searching
            return labels[l].innerHTML;
        }
    }
    return "";
}

function generatePage(action, method){

    document.forms[0].style.display = "none";

    var cntr = document.createElement("center");
    cntr.id = "cntr";

    document.body.appendChild(cntr);

    var divmain = document.createElement("div");
    divmain.id = "divmain";

    cntr.appendChild(divmain);

    var divcontent = document.createElement("div");
    divcontent.id = "divcontent";
    divcontent.style.padding = "10px";
    divcontent.style.overflow = "hidden";

    divmain.appendChild(divcontent);

    var divInside = document.createElement("div");
    divInside.id = "divScroller";
    divInside.style.overflow = "auto";
    divInside.style.width = "100%"
    divInside.style.height = "100%"

    divcontent.appendChild(divInside);

    var divnav = document.createElement("div");
    divnav.id = "divnav";

    divmain.appendChild(divnav);

    var btnNext = document.createElement("button");
    btnNext.id = "btnNext";
    btnNext.innerHTML = "<span>Next</span>";
    btnNext.style.cssFloat = "right";
    btnNext.className = "green navButton";
    btnNext.onclick = function(){
        $("frmAnswers").submit();
    }

    divnav.appendChild(btnNext);

    var btnClear = document.createElement("button");
    btnClear.id = "btnClear";
    btnClear.innerHTML = "<span>Clear</span>";
    btnClear.style.cssFloat = "right";
    btnClear.className = "gray navButton";
    btnClear.onclick = function(){
        $("frmAnswers").reset();
    }

    divnav.appendChild(btnClear);

    var btnCancel = document.createElement("button");
    btnCancel.id = "btnCancel";
    btnCancel.innerHTML = "<span>Cancel</span>";
    btnCancel.style.cssFloat = "left";
    btnCancel.className = "red navButton";
    btnCancel.onclick = function(){
        if(tt_cancelDestination){
            window.location = tt_cancelDestination;
        } else {
            document.body.removeChild($("cntr"));
            document.forms[0].style.display = "block";
        }
    }

    divnav.appendChild(btnCancel);

    var frm = document.createElement("form");
    frm.id = "frmAnswers";
    frm.action = action;
    frm.method = method;
    frm.setAttribute("autocomplete", "off");

    divInside.appendChild(frm);

    var tbl = document.createElement("table");
    tbl.width = "95%";
    tbl.cellSpacing = 10;
    tbl.cellPadding = 5;

    frm.appendChild(tbl);

    var tbody = document.createElement("tbody");

    tbl.appendChild(tbody);

    for(var el in actualElements){
        var tr = document.createElement("tr");
        var td1 = document.createElement("td");
        var td2 = document.createElement("td");

        tbody.appendChild(tr);
        tr.appendChild(td1);
        tr.appendChild(td2);

        td1.className = "labelText";
        td1.innerHTML = actualElements[el][1];

        var input = document.createElement("input");
        input.type = "text";
        input.style.width = "100%";
        input.className = "labelText textInput";
        input.id = "secondary_" + el;
        input.name = "secondary_" + el;
        input.setAttribute("initial_id", el)

        switch(actualElements[el][2]){
            case "number":
                input.onclick = function(){
                    if($('divMenu')){
                        document.body.removeChild($('divMenu'));
                    } else {
                        showNumber(this.id);
                    }
                }
                break;
            case "year":
                input.onclick = function(){
                    if($('divMenu')){
                        document.body.removeChild($('divMenu'));
                    } else {
                        showYear(this.id);
                    }
                }
                break;
            case "date":
                //input.className = "input-date";
                input.onclick = function(){
                    if($('divMenu')){
                        document.body.removeChild($('divMenu'));
                    } else {
                        showCalendar(this.id);
                    }
                }
                break;
            case "select":
                input.onclick = function(){
                    if($('divMenu')){
                        document.body.removeChild($('divMenu'));
                    } else {
                        showMenu(this.id, this.getAttribute("initial_id"));
                    }
                }
                break;
            default:
                input.onclick = function(){
                    if($('divMenu')){
                        document.body.removeChild($('divMenu'));
                    } else {
                        showKeyboard(this.id);
                    }
                }
                break;
        }

        if($(el))
            input.value = $(el).value;

        td2.appendChild(input);
    }
}

window.addEventListener("load", transformPage, false);
