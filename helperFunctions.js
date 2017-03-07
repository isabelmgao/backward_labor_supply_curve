function getPieChartData(data) {
    var totalTime = data.length * 1440;
    var travel = d3.sum(data, function(d) { return +d.travel}) / totalTime;
    var sleep = d3.sum(data, function(d) { return +d.sleep}) / totalTime;
    var work_act = d3.sum(data, function(d) { return +d.work_act}) / totalTime;
    var household = d3.sum(data, function(d) { return +d.household_combine}) / totalTime;
    var leisure = d3.sum(data, function(d) { return +d.Leisure_Combine}) / totalTime;
    var others = d3.sum(data, function(d) { return +d.Others}) / totalTime;
    // { "travel": travel, "sleep": sleep, "work": work_act,
    // "household": household, "leisure": leisure, "others": others };
    return [{label: "travel", value: travel},
            {label: "sleep", value: sleep},
            {label: "work", value: work_act},
            {label: "household", value: household},
            {label: "leisure", value: leisure},
            {label: "others", value: others}
            ];
}

// Return regression data, labels, max of x, max of y
function filterDataByKey(data, key) {
    if (data.length <= 0) {
        console.log("filterDataByKey: data empty");
        return;
    }
    if (!data.hasOwnProperty(key)) {
        console.log("filterDataByKey: key not found");
        return;
    }

    var pie_data_array = [];
    var line_data_array = [];
    var maxX = 0, maxY = 0, minX = 999999, minY = 999999, labels=[];
    var selectedData = data[key];
    var subgroups = Object.keys(data[key]);
    if (key == "age_group") {
        subgroups = ["under 20", "20-29", "30-39", "40-49", "50-59", "over 60" ];
    } else if (key == "education_category") {
        subgroups = ["Primary School", "High School", "GED", "College", "Master", "PhD" ];
    }
    for (var index in subgroups) {
        var subgroup = subgroups[index];
        pie_data_array.push(selectedData[subgroup]["pie_data"]);
        line_data = selectedData[subgroup]["line_data"];
        line_data_array.push(line_data);
        labels.push(subgroup);
        var curMaxX = d3.max(line_data, function(d) { return d[0]; });
        var curMaxY = d3.max(line_data, function(d) { return d[1]; });
        var curMinX = d3.min(line_data, function(d) { return d[0]; });
        var curMinY = d3.min(line_data, function(d) { return d[1]; });
        if (maxX < curMaxX) maxX = curMaxX;
        if (maxY < curMaxY) maxY = curMaxY;
        if (minX > curMinX) minX = curMinX;
        if (minY > curMinY) minY = curMinY;
    }
    return [line_data_array, pie_data_array, labels, maxX, maxY, minX, minY];
}

function getRegressionDataForY(data) {
    data = data.map(function(d) { return [ +d[1], +d[0] ]; });
    xmax = d3.max(data, function(d) { return d[0]; });
    var myRegression = regression('polynomial', data, degree);
    var equation = myRegression.equation;
    reg_data = [];
    for (var x=0; x<xmax; ++x) {
        var y = 0;
        for(var i=0; i<equation.length; ++i) {
            y += Math.pow(x, i) * equation[i];
        }
        reg_data.push([y, x]);
    }
    // console.log(reg_data);
    return reg_data;
}

function getMedianForY(data) {
    var xs_y = {};
    for (var point of data) {
        x = parseInt(point[0]);
        y = parseInt(point[1]);
        if (xs_y.hasOwnProperty(y)) {
            xs_y[y][0].push(x);
        } else {
            xs_y[y] = [[x], y];
        }
    }
    console.log(Object.keys(xs_y).length);

    var median_data = [];
    for (var key in xs_y) {
        xs = xs_y[key][0];
        y = xs_y[key][1];
        xs.sort(sortInt);
        median = xs[Math.floor(xs.length/2)];
        if (median == undefined) {
            console.log(xs);
        }
        // median_data.push([y, median]);
        median_data.push([median, y]);
    }
    return median_data;
}

function sortInt(a,b) { return a - b; }
