const margin = { top: 40, right: 60, bottom: 60, left: 60 };
const width = 550 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;

function init() {
    createCustomLineChart("#customLineChart")
    createDualAxisLineChart("#dualLineChart")
    createSankeyDiagram("#sankey")
    createHeatmap("#heatMap")
}
let selected_ranking = 0
let selected_decade = 1990

function updateRankSelected(row){
  if (selected_ranking == row) {
    selected_ranking = 0;
  }
  else selected_ranking = row;
  console.log(row)
  console.log(selected_ranking)

  update()
}

function updateDecadeSelected(decade){
  if (selected_decade == decade) {
    selected_decade = 0;
  }
  else selected_decade = decade;

  update()
}
function update() {
  d3.select("#length_line").remove()
  d3.select("#sales_line").remove()
  d3.select("#avg_length_line").remove()
  d3.select("#avg_sales_line").remove()

  createHeatmap("#heatMap")
  createDualAxisLineChart("#dualLineChart")
}

function createCustomLineChart(id){

    //create the svg
    const svg = d3
    .select(id)
    .attr("width", width + 2*(margin.left + margin.right) + 100)
    .attr("height", height + margin.top + margin.bottom + 20)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

    //open data and build the chart
    d3.csv("https://gist.githubusercontent.com/helenfs/c22b355263843bec54e90808ab594dd5/raw/482c6bdb4f4458518b4e67986015df9b32839eeb/final.csv").then(function(data){

        //build x-scale and x-axis
        const x = d3
            .scaleLinear()
            .domain([0,45])
            .range([0, width]);
        svg
            .append("g")
            .attr("id", "gXAxis")
            .attr("stroke-width", 1.5)
            .attr("transform", `translate(20, ${height + 20})`)
            .call(d3.axisBottom(x).tickFormat(function(d, i) {
                return d + "-" + (d + 5)
            }));

        //build y-scale and y-axis
        const y = d3
            .scaleLinear() 
            .domain([d3.max(data, d => parseInt(d.Sales.replace(/,/g, ''))) / 1.5,0])
            .range([0, height]);
        svg
            .append("g")
            .attr("id", "gYAxis")
            .attr("stroke-width", 1.5)
            .attr("transform", `translate(20,20)`)
            .call(d3.axisLeft(y).tickFormat(function(d, i) {return d / 1000000 }));

        //build the scale for the different colors
        var color = d3.scaleOrdinal().domain([0,5]).range(['#B22222','blue', '#FFD700','green', '#00BFFF', 'orange'])
    
        //List of genre and number of tracks that will be display on the chart  
        var list_of_genre = ["Pop", "Rock", "RB", "HipHop", "Country"]
        var list_of_Tracks = [0,5,10,15,20,25,30,35,40,45]

        var selected_data = []
        var new_data = new Map()

        //for each genre, build the path and the circles
        list_of_genre.forEach(elem => {
            selected_data = data.filter(d => d.Genre == elem).sort((a, b) => a.Tracks - b.Tracks)

            new_data = new Map()
            list_of_Tracks.forEach(e => {
                mean = d3.mean(selected_data.filter(d => Math.ceil(d.Tracks/5)*5 == e).map(z => parseInt(z.Sales.replace(/,/g, ''))))
                if(mean == undefined) mean = 0
                new_data.set(e, mean)
            })

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
                .attr("stroke", color(list_of_genre.indexOf(elem)))
                .attr("stroke-width", 2.5)
                .attr("transform", `translate(20,0)`)
                .attr("d", d3.line()
                    .x(function(d) { return x(d[0]) })
                    .y(function(d) { return y(d[1])}));

            //plot the circles
            circles = "circle" + new String(list_of_genre.indexOf(elem))
            svg
                .selectAll(circles)
                .append("g")
                .data(new_data)
                .enter()
                .append("circle")
                .attr("class", "customItemValue_" + elem + "_circle")
                .attr("stroke-width", 2)
                .attr("transform", `translate(20,0)`)
                .on("mouseover", (event, d) => handleCustomLineChartMouseOver(elem))
                .on("mouseleave", (event, d) => handleCustomLineChartMouseLeave())
                .attr("cx", (d) => x(d[0]))
                .attr("cy", (d) => y(d[1]))
                .attr("r", 4)
                .style("fill", color(list_of_genre.indexOf(elem)));

        });

        //Add name for y-axis
        svg.append("text")
          .attr("x", -20)
          .attr("y", -15)
          .text("Worldwide Sales");
        svg.append("text")
          .attr("x", -15)
          .attr("y", -0)
          .text("(in millions)");

        //Add name for x-axis
        svg.append("text")
          .attr("x", width/2)
          .attr("y", height + margin.top + 15)
          .text("Number of tracks");

        //Add legend
        list_of_genre.forEach(elem => {
          svg.append("text")
            .attr("class", "text_" + elem)
            .attr("x", width - margin.left/2)
            .attr("y", 20*list_of_genre.indexOf(elem) + margin.top)
            .style("fill", color(list_of_genre.indexOf(elem)))
            .text(elem);
        })

        //change font
        d3.selectAll("text")
          .attr("text-anchor", "left")
          //.style("font-size", "13px")
          .style("font-family", "Monaco");

    });
}

const list_of_genre = ["Pop", "Rock", "RB", "HipHop", "Country"]

function handleCustomLineChartMouseOver(genre){
  list_of_genre.filter(e => e !== genre).forEach(genre => {
    d3.selectAll(".customItemValue_" + genre + "_path").attr("opacity", 0.35).attr("stroke", "gray");
    d3.selectAll(".customItemValue_" + genre + "_circle").attr("opacity", 0.35).style("fill", "gray");
    d3.selectAll(".text_" + genre ).style("fill", "gray");
  })
}

function handleCustomLineChartMouseLeave() {
  const color = d3.scaleOrdinal().domain([0,5]).range(['#B22222','blue', '#FFD700','green', '#00BFFF', 'orange'])
  list_of_genre.forEach(genre => {
    d3.selectAll(".customItemValue_" + genre + "_path").attr("opacity", 1).attr("stroke", color(list_of_genre.indexOf(genre)));
    d3.selectAll(".customItemValue_" + genre + "_circle").attr("opacity", 1).style("fill", color(list_of_genre.indexOf(genre)));
    d3.selectAll(".text_" + genre ).style("fill", color(list_of_genre.indexOf(genre)));
  })
}

function createDualAxisLineChart(id){

    //create the svg
    const svg = d3
        .select(id)
        .attr("width", (width + margin.left + margin.right + margin.right/2))
        .attr("height", (height + margin.top + margin.bottom ))
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    //retrieve data and build the chart
    d3.csv("https://gist.githubusercontent.com/helenfs/c22b355263843bec54e90808ab594dd5/raw/482c6bdb4f4458518b4e67986015df9b32839eeb/final.csv").then(function(data){

        //list of all years
        
        if(selected_decade != 0){
          var list_of_year = new Set(data.filter(d => d.Year >= selected_decade && d.Year < (selected_decade + 11)).map(d => d.Year))
        }
        else {
          var list_of_year = new Set(data.map(d => d.Year))
        }
           
        console.log(list_of_year)
        //build x-scale and x-axis
        const x = d3
            .scaleLinear()
            //.domain([d3.min(data, d => d.Year),d3.max(data, d => d.Year)])
            .domain([d3.min(list_of_year), d3.max(list_of_year)])
            .range([0, width]);
        svg
            .append("g")
            .attr("id", "gXAxis")
            .attr("stroke-width", 1.5)
            .attr("transform", `translate(25, ${height + 20})`)
            .call(d3.axisBottom(x).tickFormat(function(d, i) {return d }));
        
        //build the left y-scale and y-axis
        const y = d3
            .scaleLinear()
            .domain([8, 0])//TODO no hardcoding
            .range([0, height]);
        svg
            .append("g")
            .attr("id", "gYAxis1")
            .attr("stroke", "#c71585")
            .attr("stroke-width", 1.5)
            .attr("transform", `translate(25 ,20)`)
            .call(d3.axisLeft(y));

        //change color of the axis
        svg
            .select("#gYAxis1 path")
            .attr("stroke", "#c71585");
        svg
            .selectAll("#gYAxis1 line")
            .attr("stroke", "#c71585");

        //TODO change color axis

        //build the right y-scale and y-axis
        const y2 = d3
            .scaleLinear()
            .domain([d3.max(data, d => parseInt(d.Sales.replace(/,/g, ''))),0])
            .range([0, height]);
        svg
            .append("g")
            .attr("id", "gYAxis2")
            .attr("transform", `translate(${width + 25} ,20)`)
            .attr("stroke", "#008b8b")
            .attr("stroke-width", 1.5)
            .attr("fill", "red")
            .call(d3.axisRight(y2).tickFormat(function(d, i) {return d / 1000000}));

        //change color of the axis
        svg
            .select("#gYAxis2 path")
            .attr("stroke", "#008b8b");
        svg
            .selectAll("#gYAxis2 line")
            .attr("stroke", "#008b8b");
        
        d3.select("d").join((exit) => {
          exit.remove();
        })
        //create the new data to be plotted from the left axis
        var new_data1 = new Map()
        list_of_year.forEach(e => {
          if(selected_ranking == 0){
            mean = d3.mean(data.filter(d => d.Year == e).map(d => d.AvgSongLength))
          }
          else{
            mean = d3.mean(data.filter(d => d.Year == e && d.Ranking == selected_ranking).map(d => d.AvgSongLength))
          }
          new_data1.set(e, mean)
        })
        svg
            .append("path")
            .datum(new_data1)
            .attr("fill", "none")
            .attr("id", "length_line")
            .attr("stroke", "#c71585")
            .transition()
            .duration(1000)
            .attr("stroke-width", 2)
            .attr("transform", `translate(25, 20)`)
            .attr("d", d3.line()
                    .x(function(d) { return x(d[0])})
                    .y(function(d) { return y(d[1])}));

        //create the new data to be plotted from the right axis
        var new_data2 = new Map()
        selected_decades_data = data
        // if(selected_decade != 0) {
        //   selected_decades_data.filter(d => d.Year >= selected_decade && d.Year < (selected_decade + 10))
        //   list_of_year.filter(d => d.Year >= selected_decade && d.Year < (selected_decade + 10))
        // }
        list_of_year.forEach(e => {
            // (selected_ranking != 0 ? data.filter(d => d.Ranking == selected_ranking) : null)
            if(selected_ranking == 0){
              mean = d3.mean(data.filter(d => d.Year == e).map(d => parseInt(d.Sales.replace(/,/g, ''))))
            }
            else {
              mean = d3.mean(data.filter(d => d.Year == e && d.Ranking == selected_ranking).map(d => parseInt(d.Sales.replace(/,/g, ''))))
            }
            new_data2.set(e, mean)
        })
        svg
            .append("path")
            .datum(new_data2)
            .attr("fill", "none")
            .attr("id", "sales_line")
            .attr("stroke", "#008b8b")
            .transition()
            .duration(1000)
            .attr("stroke-width", 2)
            .attr("transform", `translate(25, 20)`)
            .attr("d", d3.line()
                    .x(function(d) { return x(d[0])})
                    .y(function(d) { return y2(d[1])}));

      var decades_avg_length = new Map()
      if (selected_ranking == 0) {
        mean_avg_length = d3.mean(data.filter(d => list_of_year.has(d.Year)).map(d => d.AvgSongLength))
      }
      else {
        mean_avg_length = d3.mean(data.filter(d => list_of_year.has(d.Year) && d.Ranking == selected_ranking).map(d => d.AvgSongLength))
      }
      list_of_year.forEach(e => {
      decades_avg_length.set(e, mean_avg_length)})

        console.log(decades_avg_length)
        svg
            .append("path")
            .datum(decades_avg_length)
            .attr("fill", "none")
            .attr("id", "avg_length_line")
            .attr("stroke", "#c71585")
            .attr("stroke-width", 1)
            .attr("stroke-dasharray", "5,5")
            .attr("transform", `translate(25, 20)`)
            .attr("d", d3.line()
                    .x(function(d) { return x(d[0])})
                    .y(function(d) { return y(d[1])}));
        
        var decades_avg_sales = new Map()
        if (selected_ranking == 0) {
          mean_avg_sales = d3.mean(data.filter(d => list_of_year.has(d.Year)).map(d => parseInt(d.Sales.replace(/,/g, ''))))
        }
        else {
          mean_avg_sales = d3.mean(data.filter(d => list_of_year.has(d.Year) && d.Ranking == selected_ranking).map(d => parseInt(d.Sales.replace(/,/g, ''))))
        }
        list_of_year.forEach(e => {
          decades_avg_sales.set(e, mean_avg_sales)})

        console.log(decades_avg_sales)
        svg
            .append("path")
            .datum(decades_avg_sales)
            .attr("fill", "none")
            .attr("id", "avg_sales_line")
            .attr("stroke", "#008b8b")
            .attr("stroke-width", 1)
            .attr("stroke-dasharray", "5,5")
            .attr("transform", `translate(25, 20)`)
            .attr("d", d3.line()
                    .x(function(d) { return x(d[0])})
                    .y(function(d) { return y2(d[1])}));
                //Add name for y-axis
                svg.append("text")
                .attr("x", -25)
                .attr("y", -17)
                .attr("text-anchor", "left")
                .style("font-size", "16px")
                .text("Average Song Length per Album");
              svg.append("text")
                .attr("x", -15)
                .attr("y", -0)
                .attr("text-anchor", "left")
                .style("font-size", "16px")
                .text("(in minutes)");
      
            //Add name for x-axis
            svg.append("text")
              .attr("x", width/2)
              .attr("y", height + margin.top + margin.bottom/4)
              .attr("text-anchor", "left")
              .style("font-size", "16px")
              .text("Year");
           });
        }

        

function createHeatmap(id){

    const svg = d3.select(id)
            .attr("width", 2*(width + margin.left + margin.right) + 75)
            .attr("height", 2*height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left}, ${margin.top})`);
  
  //Read the data
  d3.csv("https://gist.githubusercontent.com/helenfs/f9aa9a8f4b4b035fc95d4cf5113150f2/raw/728f581ce7fd9af1b5b0e5f6c3f4a6999cddbdba/test.csv").then(function(data) {
    // Labels of row and columns -> unique identifier of the column called 'group' and 'variable'
    const myGroups = Array.from(new Set(data.map(d => d.Year)))
    const myVars = Array.from(new Set(data.map(d => d.Ranking)))
  
    // Build X scales and axis:
    const x = d3.scaleBand()
      .range([ 0, 2*(width + margin.left + margin.right)  ])
      .domain(myGroups)
      .padding(0.05);
    svg.append("g")
      .style("font-size", 13)
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(x).tickSize(0))
      .select(".domain").remove()
  
    // Build Y scales and axis:
    const y = d3.scaleBand()
      .range([ height, 0 ])
      .domain(myVars)
      .padding(0.05);
    svg.append("g")
      .style("font-size", 15)
      .call(d3.axisLeft(y).tickSize(0))
      .select(".domain").remove()
    
    
    // Build color scale
    const myColor = d3.scaleSequential()
      .interpolator(d3.interpolateGreens)
      .domain([1,100])
  
    // create a tooltip
    const tooltip = d3.select(id)
      .append("div")
      .style("opacity", 0)
      .attr("class", "tooltip")
      .style("background-color", "white")
      .style("border", "solid")
      .style("border-width", "2px")
      .style("border-radius", "5px")
      .style("padding", "5px")
  
    // Three function that change the tooltip when user hover / move / leave a cell
    function handleMouseover(item) {
      d3.selectAll(".itemvalue")
        .filter(function(d, i){
          return d.AvgSongLength == item.AvgSongLength
        })
        .style("opacity", 1)
      // tooltip
      //   .style("opacity", 1)
    }
    const mousemove = function(event,d) {
      // tooltip
      //   .html("Album length in minutes: " + d.AlbumLength)
      //   .style("left", (event.x)/2 + "px")
      //   .style("top", (event.y)/2 + "px")
    }
    const mouseleave = function(event,d) {
      // tooltip
      //   .style("opacity", 0)
    }
    function setHighlightRow(row) {
      if (row == selected_ranking) {
        return "yellow"
      }
      return "white"
    } 

    const onclick = function(event,d) {
      updateRankSelected(this.id)
        
      }

    svg.selectAll()
      .data(data, function(d) {return d.Year+':'+d.Ranking;})
      .join("rect")
        .attr("x", function(d) { return x(d.Year) })
        .attr("y", function(d) { return y(d.Ranking) })
        .attr("id", function(d) { return d.Ranking })
        .attr("class", "heatmap itemvalue")
        .attr("rx", 4)
        .attr("ry", 4)
        .attr("width", x.bandwidth() )
        .attr("height", y.bandwidth() )
        .style("fill", function(d) { return myColor(d.AlbumLength)} )
        .style("stroke-width", 4)
        .style("stroke", function(d) { return setHighlightRow(d.Ranking)})
        .style("opacity", 1)
      .on("mouseover", (d) => handleMouseover(d))
      .on("mousemove", mousemove)
      .on("mouseleave", mouseleave)
      .on("click", onclick)

      // Add title to graph
    svg.append("text")
        .attr("x", width)
        .attr("y", -20)
        // .attr("text-anchor", "left")
        .style("font-size", "18px")
        .text("Heatmap");
  
  // Add subtitle to graph
    svg.append("text")
        .attr("x", -20)
        .attr("y", -10)
        .style("font-family", "Monaco")
        // .attr("text-anchor", "left")
        .style("font-size", "18px")
        //.style("fill", "grey")
        //.style("max-width", 400)
        .text("Album rank");

    svg.append("text")
        .attr("x", width + margin.left)
        .attr("y", height + margin.bottom/2)
        // .attr("text-anchor", "left")
        .style("font-size", "18px")
        .text("Year");
    }
  )  
}

function createSankeyDiagram(id){
    const svg = d3
    .select(id)
    .attr("width", width)
    .attr("height", 2*(height + margin.top + margin.bottom));
}