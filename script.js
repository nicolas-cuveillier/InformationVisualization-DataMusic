const margin = { top: 40, right: 60, bottom: 60, left: 60 };
const width = 550 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;

var units = "albums";
var decade = null;
var source = null;
var rows = [];
var clicked = [];

const color = {
  Pop: "#4e79a7",
  Rock: "#f28e2c",
  RB: "#e15759",
  HipHop: "#76b7b2",
  Country: "#59a14f",
  EDM: "#edc949",
  Blues: "#af7aa1",
  World: "#ff9da7",
  Classical: "#9c755f",
  Jazz: "#838383",
};

function init() {
  createCustomLineChart("#customLineChart");
  createDualAxisLineChart("#dualLineChart");
  createHeatmap("#heatMap");
  createSankeyChart("", "#all");
  d3.select("#first").on("click", () => {
    createSankeyChart("_90s", "#first");
    updateDecadeSelected(1990);
  });
  d3.select("#second").on("click", () => {
    createSankeyChart("_00s", "#second");
    updateDecadeSelected(2000);
  });
  d3.select("#third").on("click", () => {
    createSankeyChart("_10s", "#third");
    updateDecadeSelected(2010);
  });
  d3.select("#all").on("click", () => {
    createSankeyChart("", "#all");
    updateDecadeSelected(0);
  });
}
let selected_ranking = 0;
let selected_decade = 0;

function updateRankSelected(row) {
  d3.selectAll(".heatmap-" + selected_ranking).style("stroke", function (d) {
    return null;
  });
  if (selected_ranking == row) {
    selected_ranking = 0;
  } else selected_ranking = row;
  update();
  highlightAlbums(selected_ranking);
  clicked = [];
  updateAlbumHighlight();
}

function updateAlbumHighlight() {
  for (let i = 1; i < 4; i++) {
    for (let j = 1990; j < 2022; j++) {
      d3.select("#heatmap-" + i + "-" + j).style("fill", function (d) {
        if (clicked.includes(reformatGenreNameBack(d.Genre))) {
          return "#FF5C5C";
        } else {
          return heatmapColor(d.AlbumLength);
        }
      });
    }
  }
}

function updateDecadeSelected(decade) {
  selected_decade = decade;
  clicked = [];
  handleCustomLineChartMouseLeave();
  updateAlbumHighlight();
  update();
}

function update() {
  d3.select("#dualLineChart g").transition().duration(50).remove();

  createDualAxisLineChart("#dualLineChart");

  d3.selectAll(".heatmap-" + selected_ranking).style("stroke", function (d) {
    return setHighlightRow(d.Ranking);
  });
}

function setHighlightRow(row) {
  if (row == selected_ranking) {
    return "black";
  }
  return null;
}

function createCustomLineChart(id) {
  //create the svg
  const svg = d3
    .select(id)
    .attr("width", width + 2 * (margin.left + margin.right) + 100)
    .attr("height", height + margin.top)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  //open data and build the chart
  d3.json("final.json").then(function (data) {
    //build x-scale and x-axis
    const x = d3.scaleLinear().domain([0, 45]).range([0, width]);
    svg
      .append("g")
      .attr("id", "gXAxisC")
      .attr("stroke-width", 1.5)
      .attr(
        "transform",
        `translate(20, ${height - margin.bottom + margin.top / 2})`
      )
      .call(
        d3.axisBottom(x).tickFormat(function (d, i) {
          return d + "-" + (d + 5);
        })
      );

    //build y-scale and y-axis
    const y = d3
      .scaleLinear()
      .domain([
        d3.max(data, (d) => parseInt(d.Sales.replace(/,/g, ""))) / 1.5,
        0,
      ])
      .range([0, height - margin.bottom]);
    svg
      .append("g")
      .attr("id", "gYAxisC")
      .attr("stroke-width", 1.5)
      .attr("transform", `translate(20,20)`)
      .call(
        d3.axisLeft(y).tickFormat(function (d, i) {
          return d / 1000000;
        })
      );

    //List of genre and number of tracks that will be display on the chart
    var list_of_genre = [
      "Pop",
      "Rock",
      "RB",
      "HipHop",
      "Country",
      "Jazz",
      "Classical",
      "World",
      "Blues",
      "EDM",
    ];
    var list_of_Tracks = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45];

    var selected_data = [];
    var new_data = new Map();

    //for each genre, build the path and the circles
    list_of_genre.forEach((elem) => {
      selected_data = data
        .filter((d) => d.Genre == elem)
        .sort((a, b) => a.Tracks - b.Tracks);

      new_data = new Map();
      list_of_Tracks.forEach((e) => {
        mean = d3.mean(
          selected_data
            .filter((d) => Math.ceil(d.Tracks / 5) * 5 == e)
            .map((z) => parseInt(z.Sales.replace(/,/g, "")))
        );
        if (mean == undefined) mean = 0;
        new_data.set(e, mean);
      });

      //create the path
      svg
        .append("path")
        .datum(new_data)
        .attr("class", "customItemValue_" + elem + "_path")
        .on("mouseover", (event, d) => handleCustomLineChartMouseOver(elem))
        .on("mouseleave", (event, d) => handleCustomLineChartMouseLeave())
        .attr("fill", "none")
        .transition()
        .duration(1000)
        .attr("stroke", color[elem])
        .attr("stroke-width", 2)
        .attr("transform", `translate(20,20)`)
        .attr(
          "d",
          d3
            .line()
            .x(function (d) {
              return x(d[0]);
            })
            .y(function (d) {
              return y(d[1]);
            })
        );

      //plot the circles
      circles = "circle" + new String(list_of_genre.indexOf(elem));
      svg
        .selectAll(circles)
        .append("g")
        .data(new_data)
        .enter()
        .append("circle")
        .attr("class", "customItemValue_" + elem + "_circle")
        .attr("stroke-width", 2)
        .attr("transform", `translate(20,20)`)
        .on("mouseover", (event, d) => {
          handleCustomLineChartMouseOver(elem);
          showInfoCustomLineChart(svg, d, elem);
        })
        .on("mouseleave", (event, d) => handleCustomLineChartMouseLeave())
        .attr("cx", (d) => x(d[0]))
        .attr("cy", (d) => y(d[1]))
        .attr("r", 4)
        .style("fill", color[elem]);
    });

    //Add name for y-axis
    svg.append("text").attr("x", -20).attr("y", -15).text("Worldwide Sales");
    svg.append("text").attr("x", -15).attr("y", -0).text("(in millions)");

    //Add name for x-axis
    svg
      .append("text")
      .attr("x", width / 2 + 20)
      .attr("y", height + margin.top - 42)
      .text("Number of tracks");

    //Add legend
    list_of_genre.forEach((elem) => {
      svg
        .append("text")
        .attr("class", "text_" + elem)
        .attr("x", width - margin.left)
        .attr("y", 20 * list_of_genre.indexOf(elem))
        .style("fill", color[elem])
        .style("user-select", "none")
        .on("mouseover", (event, d) => handleCustomLineChartMouseOver(elem))
        .on("mouseleave", (event, d) => handleCustomLineChartMouseLeave())
        .text(reformatGenreNameBack(elem));
    });

    //change font
    d3.selectAll("text")
      .attr("text-anchor", "left")
      .style("font-size", "13px")
      .style("font-family", "Monaco");
  });
}

function showInfoCustomLineChart(svg, d, elem) {
  svg
    .append("text")
    /* .transition()
    .duration(50) */
    .attr("class", "CircleInfo")
    .attr("x", margin.left)
    .attr("y", 1.5 * margin.top)
    .style("fill", color[elem])
    .style("user-select", "none")
    .text("Sales: " + (d[1] / 1000000).toFixed(3) + " millions");

  //change font
  d3.selectAll("text")
    .attr("text-anchor", "left")
    .style("font-size", "13px")
    .style("font-family", "Monaco");
}

const list_of_genre = [
  "Pop",
  "Rock",
  "RB",
  "HipHop",
  "Country",
  "Jazz",
  "Classical",
  "World",
  "Blues",
  "EDM",
];

function handleCustomLineChartMouseOver(genre) {
  genre = reformatGenreName(genre);
  if (!list_of_genre.includes(genre)) return;

  list_of_genre
    .filter((e) => e !== genre)
    .forEach((genre) => {
      d3.selectAll(".customItemValue_" + genre + "_path")
        .transition()
        .duration(250)
        .attr("opacity", 0.35)
        .attr("stroke", "gray");
      d3.selectAll(".customItemValue_" + genre + "_circle")
        .transition()
        .duration(250)
        .attr("opacity", 0.35)
        .style("fill", "gray");
      d3.selectAll(".text_" + genre)
        .transition()
        .duration(250)
        .style("fill", "gray");
    });
  updateAlbumHighlight();

  genre = reformatGenreNameBack(genre);
  clicked = [];

  d3.selectAll("#sankey .link").style("stroke-opacity", function (d) {
    if (genre === d.source.name) rows.push(d.row);
    return rows.includes(d.row) ? "0.35" : "0.05";
  });
}

function handleCustomLineChartSelectMultipleGenres(genres) {
  handleCustomLineChartMouseLeave();
  list_of_genre
    .filter((e) => !genres.includes(reformatGenreNameBack(e)))
    .forEach((genre) => {
      d3.selectAll(".customItemValue_" + reformatGenreName(genre) + "_path")
        .transition()
        .duration(250)
        .attr("opacity", 0.35)
        .attr("stroke", "gray");
      d3.selectAll(".customItemValue_" + reformatGenreName(genre) + "_circle")
        .transition()
        .duration(250)
        .attr("opacity", 0.35)
        .style("fill", "gray");
      d3.selectAll(".text_" + reformatGenreName(genre))
        .transition()
        .duration(250)
        .style("fill", "gray");
    });
}

function handleCustomLineChartMouseLeave() {
  d3.selectAll(".CircleInfo").transition().duration(50).remove();

  list_of_genre.forEach((genre) => {
    genre = reformatGenreName(genre);
    d3.selectAll(".customItemValue_" + genre + "_path")
      .transition()
      .duration(250)
      .attr("opacity", 1)
      .attr("stroke", color[genre]);
    d3.selectAll(".customItemValue_" + genre + "_circle")
      .transition()
      .duration(250)
      .attr("opacity", 1)
      .style("fill", color[genre]);
    d3.selectAll(".text_" + genre)
      .transition()
      .duration(250)
      .style("fill", color[genre]);

    rows = [];
    source = null;
    d3.selectAll("#sankey .link").style("stroke-opacity", function (d) {
      return "0.2";
    });
  });
}

function createDualAxisLineChart(id) {
  const colorY1 = "#424B54";
  const colorY2 = "#6F58C9";

  //create the svg
  const svg = d3
    .select(id)
    .attr("width", width + margin.left + margin.right + margin.right / 2)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  //retrieve data and build the chart
  d3.json("final.json").then(function (data) {
    //list of all years

    if (selected_decade != 0) {
      var list_of_year = new Set(
        data
          .filter(
            (d) => d.Year >= selected_decade && d.Year < selected_decade + 11
          )
          .map((d) => d.Year)
      );
    } else {
      var list_of_year = new Set(data.map((d) => d.Year));
    }

    //build x-scale and x-axis
    const x = d3
      .scaleLinear()
      .domain([d3.min(list_of_year), d3.max(list_of_year)])
      .range([0, width]);
    svg
      .append("g")
      .attr("id", "gXAxisD")
      .attr("stroke-width", 1.5)
      .attr("transform", `translate(25, ${height - margin.top / 2})`)
      .call(
        d3.axisBottom(x).tickFormat(function (d, i) {
          return d;
        })
      );

    d3.selectAll("#gXAxisD  .tick text").attr(
      "transform",
      "translate(-2,5) rotate(-25)"
    );

    //build the left y-scale and y-axis
    const y = d3
      .scaleLinear()
      .domain([8, 0])
      .range([0, height - margin.top]);
    svg
      .append("g")
      .attr("id", "gYAxis1")
      .style("color", colorY1)
      .attr("stroke-width", 1.5)
      .attr("transform", `translate(25 ,20)`)
      .call(d3.axisLeft(y));

    //change color of the axis
    svg.select("#gYAxis1 path").attr("stroke", colorY1);
    svg.selectAll("#gYAxis1 line").attr("stroke", colorY1);

    //build the right y-scale and y-axis
    const y2 = d3
      .scaleLinear()
      .domain([d3.max(data, (d) => parseInt(d.Sales.replace(/,/g, ""))), 0])
      .range([0, height - margin.top]);
    svg
      .append("g")
      .attr("id", "gYAxis2")
      .attr("transform", `translate(${width + 25} ,20)`)
      .style("color", colorY2)
      .attr("stroke-width", 1.5)
      .call(
        d3.axisRight(y2).tickFormat(function (d, i) {
          return d / 1000000;
        })
      );

    //change color of the axis
    svg.select("#gYAxis2 path").attr("stroke", colorY2);
    svg.selectAll("#gYAxis2 line").attr("stroke", colorY2);

    //create the new data to be plotted from the left axis
    var new_data1 = new Map();
    list_of_year.forEach((e) => {
      if (selected_ranking == 0) {
        if (clicked.length === 0) {
          mean = d3.mean(
            data.filter((d) => d.Year == e).map((d) => d.AvgSongLength)
          );
        } else {
          mean = d3.mean(
            data
              .filter(
                (d) =>
                  d.Year == e &&
                  clicked.includes(reformatGenreNameBack(d.Genre))
              )
              .map((d) => d.AvgSongLength)
          );
        }
      } else {
        if (clicked.length === 0) {
          mean = d3.mean(
            data
              .filter((d) => d.Year == e && d.Ranking == selected_ranking)
              .map((d) => d.AvgSongLength)
          );
        } else {
          mean = d3.mean(
            data
              .filter(
                (d) =>
                  d.Year == e &&
                  d.Ranking == selected_ranking &&
                  clicked.includes(reformatGenreNameBack(d.Genre))
              )
              .map((d) => d.AvgSongLength)
          );
        }
      }
      mean !== undefined ? new_data1.set(e, mean) : new_data1.set(e, 0);
    });

    svg
      .append("path")
      .datum(new_data1)
      .attr("fill", "none")
      .attr("id", "length_line")
      .attr("stroke", colorY1)
      .transition()
      .duration(1000)
      .attr("stroke-width", 2)
      .attr("transform", `translate(25, 20)`)
      .attr(
        "d",
        d3
          .line()
          .x(function (d) {
            return x(d[0]);
          })
          .y(function (d) {
            return y(d[1]);
          })
      );

    //create the new data to be plotted from the right axis
    var new_data2 = new Map();

    list_of_year.forEach((e) => {
      if (selected_ranking == 0) {
        if (clicked.length === 0) {
          mean = d3.mean(
            data
              .filter((d) => d.Year == e)
              .map((d) => parseInt(d.Sales.replace(/,/g, "")))
          );
        } else {
          mean = d3.mean(
            data
              .filter(
                (d) =>
                  d.Year == e &&
                  clicked.includes(reformatGenreNameBack(d.Genre))
              )
              .map((d) => parseInt(d.Sales.replace(/,/g, "")))
          );
        }
      } else {
        if (clicked.length === 0) {
          mean = d3.mean(
            data
              .filter((d) => d.Year == e && d.Ranking == selected_ranking)
              .map((d) => parseInt(d.Sales.replace(/,/g, "")))
          );
        } else {
          mean = d3.mean(
            data
              .filter(
                (d) =>
                  d.Year == e &&
                  d.Ranking == selected_ranking &&
                  clicked.includes(reformatGenreNameBack(d.Genre))
              )
              .map((d) => parseInt(d.Sales.replace(/,/g, "")))
          );
        }
      }
      mean !== undefined ? new_data2.set(e, mean) : new_data2.set(e, 0);
    });

    svg
      .append("path")
      .datum(new_data2)
      .attr("fill", "none")
      .attr("id", "sales_line")
      .attr("stroke", colorY2)
      .transition()
      .duration(1000)
      .attr("stroke-width", 2)
      .attr("transform", `translate(25, 20)`)
      .attr(
        "d",
        d3
          .line()
          .x(function (d) {
            return x(d[0]);
          })
          .y(function (d) {
            return y2(d[1]);
          })
      );

    var decades_avg_length = new Map();
    if (selected_ranking == 0) {
      if (clicked.length === 0) {
        mean_avg_length = d3.mean(
          data
            .filter((d) => list_of_year.has(d.Year))
            .map((d) => d.AvgSongLength)
        );
      } else {
        mean_avg_length = d3.mean(
          data
            .filter(
              (d) =>
                list_of_year.has(d.Year) &&
                clicked.includes(reformatGenreNameBack(d.Genre))
            )
            .map((d) => d.AvgSongLength)
        );
      }
    } else {
      if (clicked.length === 0) {
        mean_avg_length = d3.mean(
          data
            .filter(
              (d) => list_of_year.has(d.Year) && d.Ranking == selected_ranking
            )
            .map((d) => d.AvgSongLength)
        );
      } else {
        mean_avg_length = d3.mean(
          data
            .filter(
              (d) =>
                list_of_year.has(d.Year) &&
                d.Ranking == selected_ranking &&
                clicked.includes(reformatGenreNameBack(d.Genre))
            )
            .map((d) => d.AvgSongLength)
        );
      }
    }
    list_of_year.forEach((e) => {
      decades_avg_length.set(e, mean_avg_length);
    });

    svg
      .append("path")
      .datum(decades_avg_length)
      .attr("fill", "none")
      .attr("class", "avg_length_line")
      .attr("stroke", colorY1)
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "5,5")
      .attr("transform", `translate(25, 20)`)
      .attr(
        "d",
        d3
          .line()
          .x(function (d) {
            return x(d[0]);
          })
          .y(function (d) {
            return y(d[1]);
          })
      );

    var decades_avg_sales = new Map();
    if (selected_ranking == 0) {
      if (clicked.length === 0) {
        mean_avg_sales = d3.mean(
          data
            .filter((d) => list_of_year.has(d.Year))
            .map((d) => parseInt(d.Sales.replace(/,/g, "")))
        );
      } else {
        mean_avg_sales = d3.mean(
          data
            .filter(
              (d) =>
                list_of_year.has(d.Year) &&
                clicked.includes(reformatGenreNameBack(d.Genre))
            )
            .map((d) => parseInt(d.Sales.replace(/,/g, "")))
        );
      }
    } else {
      if (clicked.length === 0) {
        mean_avg_sales = d3.mean(
          data
            .filter(
              (d) => list_of_year.has(d.Year) && d.Ranking == selected_ranking
            )
            .map((d) => parseInt(d.Sales.replace(/,/g, "")))
        );
      } else {
        mean_avg_sales = d3.mean(
          data
            .filter(
              (d) =>
                list_of_year.has(d.Year) &&
                d.Ranking == selected_ranking &&
                clicked.includes(reformatGenreNameBack(d.Genre))
            )
            .map((d) => parseInt(d.Sales.replace(/,/g, "")))
        );
      }
    }
    list_of_year.forEach((e) => {
      decades_avg_sales.set(e, mean_avg_sales);
    });

    svg
      .append("path")
      .datum(decades_avg_sales)
      .attr("fill", "none")
      .attr("class", "avg_sales_line")
      .attr("stroke", colorY2)
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "5,5")
      .attr("transform", `translate(25, 20)`)
      .attr(
        "d",
        d3
          .line()
          .x(function (d) {
            return x(d[0]);
          })
          .y(function (d) {
            return y2(d[1]);
          })
      );

    svg
      .append("text")
      .attr("id", "avg_text")
      .attr("x", 60)
      .attr("y", 30)
      .attr("stroke-width", 0.8);

    d3.selectAll(".avg_sales_line")
      .style("cursor", "pointer")
      .on("mouseover", function (d) {
        d3.selectAll(".avg_sales_line").style("stroke-width", 3);
        d3.select("#avg_text")
          .style("fill", colorY2)
          .text(
            "Average: " +
              (mean_avg_sales / 1000000).toFixed(3) +
              " million sales"
          );
      })
      .on("mouseleave", function (d) {
        d3.selectAll(".avg_sales_line").style("stroke-width", 2);
        d3.select("#avg_text").text("");
      });
    d3.selectAll(".avg_length_line")
      .style("cursor", "pointer")
      .on("mouseover", function (d) {
        d3.selectAll(".avg_length_line").style("stroke-width", 3);
        d3.select("#avg_text")
          .style("fill", colorY1)
          .text("Average: " + mean_avg_length.toFixed(2) + " minutes");
      })
      .on("mouseleave", function (d) {
        d3.selectAll(".avg_length_line").style("stroke-width", 2);
        d3.select("#avg_text").text("");
      });

    //Add name for y-axis
    svg
      .append("text")
      .attr("x", -25)
      .attr("y", -17)
      .style("fill", colorY1)
      .text("Average Song Length per Album");
    svg
      .append("text")
      .attr("x", -15)
      .attr("y", -0)
      .style("fill", colorY1)
      .text("(in minutes)");

    //Add name for first y-axis
    svg
      .append("text")
      .attr("x", width - margin.left)
      .attr("y", -10)
      .style("fill", colorY2)
      .text("Worldwide Sales");
    svg
      .append("text")
      .attr("x", width - margin.left)
      .attr("y", 5)
      .style("fill", colorY2)
      .text("(in millions)");

    //Add name for x-axis
    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", height + margin.top / 2)
      .text("Year");

    //add legend
    legend = selected_ranking == 0 ? "all " : "number " + selected_ranking;
    svg
      .append("text")
      .attr("id", "legend")
      .attr("x", width / 1.9 + margin.left)
      .attr("y", (height - margin.top) / 6)
      .text(
        clicked.length !== 0 && selected_ranking === 0
          ? "for all ranks"
          : "for " + legend + " albums"
      );

    //add text for selected genres
    if (
      selected_ranking !== 0 ||
      (selected_ranking === 0 && clicked.length !== 0)
    ) {
      genreString = "";
      clicked.map((g) => {
        if (genreString.length === 0) {
          genreString += g;
        } else {
          genreString += ", " + g;
        }
      });
      genreText =
        clicked.length === 0
          ? "for all genres"
          : clicked.length < 2
          ? "for " + genreString + " albums"
          : clicked.length == 2
          ? "for " + clicked[0] + " and " + clicked[1]
          : "for " + clicked[0] + ", " + clicked[1] + "...";
    } else {
      genreText = "";
    }
    svg
      .append("text")
      .attr("id", "genre-text")
      .attr("x", width / 1.9 + margin.left)
      .attr("y", (height - margin.top) / 4)
      .text(genreText);

    d3.selectAll("text")
      .attr("text-anchor", "left")
      .style("font-size", "13px")
      .style("font-family", "Monaco");
  });
}
// Build color scale
function heatmapColor(albumLength) {
  const color = d3
    .scaleSequential()
    .interpolator(d3.interpolateGreens)
    .domain([1, 100])(albumLength);
  return color;
}

function createHeatmap(id) {
  const svg = d3
    .select(id)
    .attr("width", width + (margin.left + margin.right) * 2)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left / 2}, ${margin.top})`);

  //Read the data

  d3.csv("heatmap.csv").then(function (data) {
    const myGroups = Array.from(new Set(data.map((d) => d.Year)));
    const myVars = Array.from(new Set(data.map((d) => d.Ranking)));

    // Build X scales and axis:
    const x = d3
      .scaleBand()
      .range([0, width + (margin.left + margin.right) * 1.6])
      .domain(myGroups)
      .padding(0.01);
    svg
      .append("g")
      //.style("font-size", 13)
      .attr("id", "gXAxisH")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(x).tickSize(0))
      .select(".domain")
      .remove();

    d3.selectAll("#gXAxisH  .tick text").attr(
      "transform",
      "translate(5,-170) rotate(90)"
    );

    // Build Y scales and axis:
    const y = d3
      .scaleBand()
      .range([height * 0.35, 0])
      .domain(myVars)
      .padding(0.05);
    svg
      .append("g")
      .attr("id", "gYAxisH")
      .style("font-size", 15)
      .call(d3.axisLeft(y).tickSize(0))
      .select(".domain")
      .remove();

    // create a tooltip
    const tooltip = d3
      .select(id)
      .append("div")
      .style("opacity", 0)
      .attr("class", "tooltip")
      .style("background-color", "white")
      .style("border", "solid")
      .style("border-width", "2px")
      .style("border-radius", "5px")
      .style("padding", "5px");

    // Three function that change the tooltip when user hover / move / leave a cell
    function handleMouseover(item) {
      d3.selectAll(".itemvalue")
        .filter(function (d, i) {
          return d.AlbumLength == item.AlbumLength;
        })
        .style("opacity", 1);
      // tooltip
      //   .style("opacity", 1)
    }
    const mousemove = function (event, d) {
      // tooltip
      //   .html("Album length in minutes: " + d.AlbumLength)
      //   .style("left", (event.x)/2 + "px")
      //   .style("top", (event.y)/2 + "px")
    };
    const mouseleave = function (event, d) {
      // tooltip
      //   .style("opacity", 0)
    };

    const onclick = function (event, d) {
      updateRankSelected(d.Ranking);
    };

    svg
      .selectAll()
      .data(data, function (d) {
        return d.Year + ":" + d.Ranking;
      })
      .join("rect")
      .style("cursor", "pointer")
      .attr("x", function (d) {
        return x(d.Year);
      })
      .attr("y", function (d) {
        return y(d.Ranking);
      })
      .attr("class", function (d) {
        return "heatmap-" + d.Ranking;
      })
      .attr("id", function (d) {
        return "heatmap-" + d.Ranking + "-" + d.Year;
      })
      // .attr("class", "heatmap itemvalue")
      .attr("rx", 4)
      .attr("ry", 4)
      .attr("width", x.bandwidth())
      .attr("height", y.bandwidth())
      .style("fill", function (d) {
        return heatmapColor(d.AlbumLength);
      })
      .style("stroke-width", 2)
      .style("stroke", function (d) {
        return setHighlightRow(d.Ranking);
      })
      .style("background", function (d) {
        return "blue";
      })
      .style("opacity", 1)
      .on("mouseover", (d) => handleMouseover(d))
      .on("mousemove", mousemove)
      .on("mouseleave", mouseleave)
      .on("click", onclick);

    // Add subtitle to graph
    svg
      .append("text")
      .attr("x", -20)
      .attr("y", -10)
      .style("font-family", "Monaco")
      .style("font-size", "13px")

      .text("Rank");

    svg
      .append("text")
      .attr(
        "x",
        width + (margin.left + margin.right) * 1.25 - x.bandwidth() * 15 - 150
      )
      .attr("y", -10)
      .style("font-family", "Monaco")
      .style("font-size", "13px")
      .text("Length of album in min:");

    const scaleRange = Array.from(Array(10).keys());
    var colorScale = scaleRange.forEach((e) =>
      svg
        .append("rect")
        .attr(
          "x",
          width +
            (margin.left + margin.right) * 1.6 -
            x.bandwidth() * 15 +
            x.bandwidth() * 1.5 * e
        )
        .attr("y", -20)
        .attr("width", x.bandwidth() * 2)
        .attr("height", y.bandwidth() / 2)
        .style("fill", function (d) {
          return heatmapColor(10 * (e + 1));
        })
    );

    var colorScale = scaleRange.forEach((e) =>
      svg
        .append("text")
        .text(10 * (e + 1))
        .attr(
          "x",
          width +
            (margin.left + margin.right) * 1.6 -
            x.bandwidth() * 15 +
            x.bandwidth() * 1.5 * e +
            5
        )
        .attr("y", -25)
        .style("font-size", "10px")
    );

    svg
      .append("text")
      .attr("x", width / 2 + margin.left)
      .attr("y", height / 2 + margin.bottom / 3)
      // .attr("text-anchor", "left")
      .style("font-size", "13px")
      .text("Year");
  });
}

function createSankeyChart(decade, id) {
  d3.selectAll(".button").style("background-color", "#aaa");
  d3.selectAll(".link").remove();
  d3.selectAll(".node").remove();
  d3.selectAll(id).style("background-color", "#4caf50");

  var margin = { top: 20, right: 10, bottom: 30, left: 10 },
    width = 650 - margin.left - margin.right,
    height = 650 - margin.top - margin.bottom;

  const svg = d3
    .select("#sankey")
    .attr("width", width + 100 + "px")
    .attr("height", height - margin.top - margin.bottom + "px")
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var formatNumber = d3.format(",.0f"),
    format = function (d) {
      return formatNumber(d) + " " + units;
    };

  const rowDict = {
    Pop: [],
    Rock: [],
    RB: [],
    HipHop: [],
    Country: [],
    EDM: [],
    Blues: [],
    World: [],
    Classical: [],
    Jazz: [],
  };

  var sankey = d3.sankey().nodeWidth(36).nodePadding(40).size([width, height]);
  var path = sankey.link();

  graph = { nodes: [], links: [] };

  d3.csv("sankey_chart" + decade + ".csv").then(function (data, rows) {
    graph = { nodes: [], links: [] };
    data.forEach(function (d) {
      graph.nodes.push({ name: d.source });
      graph.nodes.push({ name: d.target });
      graph.links.push({
        source: d.source,
        target: d.target,
        value: +d.value,
        ranking: d.ranking,
        row: d.row,
      });
      label = reformatGenreName(d.source);
      if (Object.keys(rowDict).includes(label)) {
        rowDict[label].push(d.row);
      }
    });

    // return only distinct nodes
    graph.nodes = d3.group(graph.nodes, (d) => d.name);
    var nodesArray = [];
    for (let [key, value] of graph.nodes) {
      nodesArray.push(key);
    }
    graph.nodes = nodesArray;

    // loop through each link replacing the text with its index from node
    graph.links.forEach(function (d, i) {
      graph.links[i].source = graph.nodes.indexOf(graph.links[i].source);
      graph.links[i].target = graph.nodes.indexOf(graph.links[i].target);
    });

    // now loop through each nodes to make nodes an array of objects
    // rather than an array of strings
    graph.nodes.forEach(function (d, i) {
      graph.nodes[i] = { name: d };
    });

    sankey.nodes(graph.nodes).links(graph.links).layout(8);

    // add the links
    var link = svg
      .append("g")
      .selectAll(".link")
      .data(graph.links)
      .enter()
      .append("path")
      .attr("class", "link")
      .attr("d", path)
      .style("stroke-width", function (d) {
        return Math.max(1, d.dy * 0.85);
      })
      .style("stroke-opacity", function (d) {
        return "0";
      })
      .style("stroke", function (d) {
        rowNumber = d.row;
        genre = "";
        Object.keys(rowDict).forEach(function (key, index) {
          if (rowDict[key].includes(rowNumber)) {
            genre = key;
          }
        });
        if (color[genre] !== undefined) {
          return color[genre];
        }
        return "#000";
      })
      .sort(function (a, b) {
        return (b.dy - a.dy) * 0.85;
      });

    // add the link titles
    link.append("title").text(function (d) {
      return d.source.name + " → " + d.target.name + "\n" + format(d.value);
    });

    // add the nodes
    var node = svg
      .append("g")
      .selectAll(".node")
      .data(graph.nodes)
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", function (d) {
        return "translate(" + d.x + "," + d.y * 0.85 + ")";
      });
    /* .call(
        d3
          .drag()
          .subject(function (d) {
            return d;
          })
          .on("start", function () {
            this.parentNode.appendChild(this);
          })
          .on("drag", dragmove)
      ); */

    d3.selectAll(".node")
      .on("mouseover", function (event, data) {
        if (!rows) {
          rows = [];
        }
        clicked.length === 0 && highlightLinks(data, true);
      })
      .on("mouseleave", function (event, data) {
        clicked.length === 0 && highlightLinks(data, false);
      })
      .style("pointer-events", "visible")
      .on("click", function (event, data) {
        label = data.name;
        if (color[reformatGenreName(label)] !== undefined) {
          if (clicked.includes(label)) {
            index = clicked.indexOf(label);
            clicked.splice(index, 1);
            if (clicked.length === 0) {
              highlightLinks(data, false);
            } else {
              // handleCustomLineChartMouseLeave();
              handleCustomLineChartSelectMultipleGenres(clicked);
              source = data.name;
              link.style("stroke-opacity", function (d) {
                if (rows && source === d.source.name) {
                  i = rows.indexOf(d.row);
                  rows.splice(i, 1);
                }
                return rows && rows.includes(d.row) ? "0.45" : "0.05";
              });
            }
          } else {
            clicked.push(label);
            highlightLinks(data, true);
          }
          d3.select("#dualLineChart g").transition().duration(50).remove();
          createDualAxisLineChart("#dualLineChart");
        }
        updateAlbumHighlight();
      });

    function highlightLinks(data, highlighted) {
      if (highlighted) {
        clicked.length !== 0
          ? handleCustomLineChartSelectMultipleGenres(clicked)
          : handleCustomLineChartMouseOver(data.name);
        source = data.name;
        link.style("stroke-opacity", function (d) {
          if (rows && source === d.source.name) {
            if (!rows.includes(d.row)) rows.push(d.row);
          }
          return rows && rows.includes(d.row) ? "0.45" : "0.05";
        });
      } else {
        handleCustomLineChartMouseLeave();
        rows = [];
        source = null;
        link.style("stroke-opacity", function (d) {
          return "0.35";
        });
      }
    }

    // add rectangles for the nodes
    node
      .append("rect")
      .attr("height", function (d) {
        return d.dy > 10 ? d.dy : 10;
      })
      .attr("width", sankey.nodeWidth())
      .style("fill", function (d) {
        var name = reformatGenreName(d.name);
        if (Object.keys(color).includes(name)) {
          return (d.color = color[name]);
        }
        return (d.color = "#add8e6");
      })
      .style("stroke", function (d) {
        return d3.rgb(d.color).darker(2);
      })
      .append("title")
      .text(function (d) {
        return d.name + "\n" + format(d.value);
      });

    // add title for the nodes
    node
      .append("text")
      .attr("x", 40)
      .attr("y", function (d) {
        return d.dy / 2;
      })
      .attr("dy", ".35em")
      .attr("text-anchor", "end")
      .attr("transform", null)
      .text(function (d) {
        return d.name;
      })
      .filter(function (d) {
        return d.x < width / 2;
      })
      .attr("x", 6 + sankey.nodeWidth())
      .attr("text-anchor", "start");

    // add animations
    d3.selectAll(".link")
      .transition()
      .style("stroke-opacity", 0.35)
      .delay(1000)
      .duration(500);

    d3.selectAll(".node rect")
      .attr("x", -700)
      .transition()
      .duration(1000)
      .attr("x", 0);

    d3.selectAll(".node text")
      .attr("x", -700)
      .transition()
      .duration(1000)
      .attr("x", 45);

    // the function for moving the nodes
    function dragmove(d) {
      d3.select(this).attr(
        "transform",
        "translate(" +
          d.x +
          "," +
          (d.y = Math.max(0, Math.min(height - d.dy, d3.event.y))) +
          ")"
      );
      sankey.relayout();
      link.attr("d", path);
    }

    d3.selectAll("text")
      .attr("text-anchor", "left")
      .style("font-size", "13px")
      .style("font-family", "Monaco");
  });
}

function highlightAlbums(rank) {
  albums = [];
  d3.selectAll(".link").style("stroke-opacity", function (d) {
    if (rank !== 0) {
      if (albums && d.ranking === rank) {
        if (!albums.includes(d.row)) albums.push(d.row);
      }
      return albums && albums.includes(d.row) ? "0.45" : "0.05";
    } else {
      return "0.35";
    }
  });
}

function reformatGenreName(genre) {
  if (genre === "R&B") {
    return "RB";
  }
  if (genre === "Hip Hop") {
    return "HipHop";
  }
  return genre;
}

function reformatGenreNameBack(genre) {
  if (genre === "RB") {
    return "R&B";
  }
  if (genre === "HipHop") {
    return "Hip Hop";
  }
  return genre;
}

function separateLargeNumbers(val) {
  let num = val.toString().includes(".")
    ? val.toString().split(".")[0]
    : val.toString();
  let len = num.toString().length;
  let result = "";
  let count = 1;

  for (let i = len - 1; i >= 0; i--) {
    result = num.toString()[i] + result;
    if (count % 3 === 0 && count !== 0 && i !== 0) {
      result = " " + result;
    }
    count++;
  }

  if (val.toString().includes(".")) {
    result = result + "." + val.toString().split(".")[1];
  }
  return result;
}
