//Add animated d3 svg elements to vis-slide1
Reveal.addEventListener("vis-slide1", function() {

  //Data for total requests
  var data1 = {"Total": 164, "Glass": 130, "Rift": 34};

  function createBars() {
    var barContainer = d3.select("svg")
      .append("g")
      .attr({
        "class": "bar-container",
        "y": 0,
        "x": 0
      });
    //Create and place request bars
    var ySize = 6;
    var textPadX = 0.25;

    //Create groups for rects and text
    var bars = barContainer.selectAll("bars")
      .data(d3.entries(data1))
      .enter()
      .append("g")
      .attr("class", "total-breakdown fragment");

      bars.append("rect")
        .attr({
          "class": function(d) { return "bar " + d.key; },
          "height": "0",
          "width": function(d) { return (d.value / 164) * 100 + "%"; },
          "y": function(d, i) { return d.key === "Rift" ?
            1 * ySize + "%" : i * ySize + "%"; },
          "x": function(d, i) { return d.key === "Rift" ?
            data1.Glass / 164 * 100 + "%" : 0; }
        });

      bars.append("text")
        .attr({
          "x": function(d, i) { return d.key === "Rift" ?
            data1.Glass / 164 * 100 + textPadX + "%" : textPadX + "%"; },
          "y": function(d, i) { return d.key === "Rift" ?
            1 * ySize + (ySize / 2) + "%" : i * ySize + (ySize / 2) + "%"; },
        })
        .style({
          "font-size": "70%",
          "alignment-baseline": "middle"
        });
  }

  function createTimeScales(data) {
    var timeContainer = d3.select("svg")
      .append("g")
      .attr({
        "class": "fragment time-container",
        "transform": "translate(0," + 760 * 0.18 + ")"
      });

    var yAxis = d3.svg.axis()
      .scale(timeScale)
      .tickFormat(d3.time.format("%b-%y"))
      .ticks(d3.time.months, 2)
      .orient("left");

    var timelines = timeContainer.selectAll("timelines")
      .data(d3.entries(data))
      .enter()
      .append("g")
      .attr({
        "class": function(d) { return "time-lines " + d.key; },
        "transform": function(d, i) { return "translate(" +
          svgWidth1 / 2 * i + ",0)"; }
      });

    timelines.selectAll("day-req")
      .data(function(d) { return d.value; })
      .enter().append("rect")
      .attr({
        "class": "day-req",
        "x": svgWidth1 / 4,
        "y": 0,
        "width": function(d) { return d[1] * 40; },
        "height": "1px"
      });

    timelines.append("g")
        .attr("class", "graph-axis")
    		.attr("transform", "translate(" + svgWidth1 / 4 + ",0)")
        .call(yAxis);

  }

  function createAvgBars() {
    var data2 = {"Total": 11.7, "Glass": 9.3, "Rift": 6.8};
    var avgBarContainer = d3.select("svg")
      .append("g")
      .attr({
        "class": "avg-bar-container fragment",
        "y": 0,
        "x": 0
      });

    var avgBars = avgBarContainer.selectAll("avg-bars")
      .data(d3.entries(data2))
      .enter()
      .append("g")
      .attr("class", "avg-breakdown");

      avgBars.append("rect")
        .attr({
          "class": function(d) { return "bar " + d.key; },
          "height": svgHeight1,
          "width": "6%",
          "y": svgHeight1,
          "x": function(d, i) { return (2 / 3 * svgWidth1 + (i * svgWidth1 * 0.06)) - svgWidth1 * 0.06 * 1.5; }
        });

      avgBars.append("text")
        .attr({
          "class": "bar-text",
          "x": function(d, i) { return (2 / 3 * svgWidth1 + (i * svgWidth1 * 0.06)) - svgWidth1 * 0.06; },
          "y": function(d) { return svgHeight1 - (d.value * 15) - 5; }
        })
        .style({
          "font-size": "70%",
          "alignment-baseline": "baseline",
          "text-anchor": "middle"
        });

        avgBars.append("text")
        .attr({
          "class": "title",
          "x": 2 / 3 * svgWidth1,
          "y": svgHeight1 - (data2.Total * 15) - 50
        })
        .style({
          "font-size": "70%",
          "text-anchor": "middle"
        });
  }

  //Add svg canvas and draw bars if not already added
  if (!d3.select(".vis-container-1").classed("drawn")) {
    d3.select(".vis-container-1").classed("drawn", true);
    var svg = d3.select(".vis-container-1").append("svg");
    var svgWidth1 = parseInt(svg.style("width").split("p")[0]);
    var svgHeight1 = parseInt(svg.style("height").split("p")[0]);

    d3.json("./js/reqDates.json", function(data) {
      createBars();
      createTimeScales(data);
      createAvgBars();
    });
  }

  var timeScale = d3.time.scale()
    .domain([new Date(2014, 2, 1), new Date(2015, 10, 1)])
    .range([0, 450]);

  //Setup animations to occur on fragment change
  d3.select("body").on("keyup", function() {
    if (d3.select(".current-fragment")[0][0] !== null &&
      !d3.select(".vis-container-2").classed("drawn")) {
      var t1 = d3.select(".current-fragment").transition();
      var t2 = t1.transition();
      //Animate request bars and then text
      if (d3.select(".current-fragment").classed("total-breakdown")) {
        t1.select("rect").attr("height", "6%");
        t2.select("text").text(function(d) {
          return d.key + " Requests: " + d.value;
        });
      } else if (d3.select(".current-fragment").classed("time-container")) {
        t1.selectAll(".day-req").attr("y", function(d) {
          return timeScale(new Date(d[0]));
        });
      } else if (d3.select(".current-fragment").classed("avg-bar-container")) {
        d3.selectAll(".time-lines").transition()
          .attr("transform", "translate(" + (svgWidth1 / 16) + ",0)");
        t1.selectAll("rect").attr("y", function(d) {
          return svgHeight1 - (d.value * 15);
        });
        t2.select(".title")
          .text("Average Requests/Month");
        t2.transition()
            .selectAll(".bar-text")
            .text(function(d) {
              return d.value;
            });
      }
    }
  });

});

//Add animated d3 svg elements to vis-slide2
Reveal.addEventListener("vis-slide2", function() {

function drawGraphs() {
  var data3 = {"Glass": [
      ["Undergraduate", 35.4], ["Masters", 36.2], ["PhD", 16.2], ["Staff", 4.6], ["Faculty", 3.8], ["Other", 3.8]
    ],
    "Rift": [
      ["Undergraduate", 55.9], ["Masters", 35.3], ["PhD", 0], ["Staff", 5.9], ["Faculty", 0], ["Other", 2.9]
    ],
    "Total": [
      ["Undergraduate", 39.6], ["Masters", 36.0], ["PhD", 12.8], ["Staff", 4.9], ["Faculty", 3.0], ["Other", 3.7]
    ]
  };

  var colors = ['#a6cee3','#1f78b4','#b2df8a','#33a02c','#fb9a99','#e31a1c'];

  var graphContainers = svg.selectAll("graphs")
    .data(d3.entries(data3))
    .enter().append("g")
    .attr({
      "class": "aff-graphs",
      "transform": function(d, i) { return "translate(0," + (i * svgHeight / 3.25) + ")"; }
    });

  //Add bars
  var barWidth = svgHeight / 21;
  graphContainers.selectAll("graph-bars")
    .data(function(d) { return d.value; })
    .enter().append("rect")
      .attr({
        "class": "graph-bars",
        "x": svgWidth / 4,
        "y": function(d, i) { return barWidth * i + 10; },
        "width": function(d) { return d[1] / 60 * svgWidth / 2; },
        "height": barWidth - 5,
        "fill": function(d, i) { return colors[i]; }
      });

  //Add group titles
  graphContainers.append("text")
    .attr({
      "class": "graph-title",
      "x": svgWidth / 4 - 10,
      "y": barWidth * 3.5,
      "font-size": "70%",
      "alignment-baseline": "baseline",
      "text-anchor": "end"
    })
    .text(function(d) { console.log(d); return d.key; });

  graphContainers.append("path")
    .attr({
      "class": "graph-axis",
      "d": "M" + svgWidth / 4 + "," + 10 + "L" + svgWidth / 4 + "," + (barWidth * 6 + 5)
    });

  //Add scale from 0 - 60
  var graphScale = d3.scale.linear()
    .domain([0, 60])
    .range([svgWidth / 4, svgWidth * 3 / 4]);

  //Used scale to set up axis
  var xAxis = d3.svg.axis()
    .scale(graphScale)
    .ticks(10)
    .orient("bottom");

  svg.append("g")
    .attr("class", "graph-axis")
		.attr("transform", "translate(0," + (svgHeight - 30) + ")")
    .call(xAxis);

  svg.append("text")
    .attr({
      "class": "x-axis-label",
      "transform": "translate(" + svgWidth * 3 / 4 + "," + (svgHeight - 38) + ")",
      "font-size": "55%",
      "alignment-baseline": "baseline",
      "text-anchor": "end"
    })
    .text("Percentage of whole.")
}

//Add svg canvas and draw bars if not already added
if (!d3.select(".vis-container-2").classed("drawn")) {
  d3.select(".vis-container-2").classed("drawn", true);
  var svg = d3.select(".vis-container-2").append("svg");
  var svgWidth = parseInt(svg.style("width").split("p")[0]);
  var svgHeight = parseInt(svg.style("height").split("p")[0]);

  drawGraphs();
}

});
