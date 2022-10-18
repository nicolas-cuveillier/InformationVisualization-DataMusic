const margin = { top: 40, right: 40, bottom: 40, left: 40 };
const width = 550 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;

function init() {
    createCustomLineChart("#customLineChart")
    createDualAxisLineChart("#dualLineChart")
    createSankeyDiagram("#sankey")
    createHeatmap("#heatMap")
}

function createCustomLineChart(id){

    //create the svg
    const svg = d3
    .select(id)
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

    //open data and build the chart
    d3.json("final.json").then(function(data){

        //build x-scale and x-axis
        const x = d3
            .scaleLinear()
            .domain([0,45])
            .range([0, width]);
        svg
            .append("g")
            .attr("id", "gXAxis")
            .attr("stroke-width", 1.25)
            .attr("transform", `translate(20, ${height + 20})`)
            .call(d3.axisBottom(x).tickFormat(function(d, i) {
                return d + " - " + (d + 5)
            }));

        //build y-scale and y-axis
        const y = d3
            .scaleLinear() 
            .domain([d3.max(data, d => parseInt(d.Sales.replace(/,/g, ''))),0])
            .range([0, height]);
        svg
            .append("g")
            .attr("id", "gYAxis")
            .attr("stroke-width", 1.25)
            .attr("transform", `translate(20,20)`)
            .call(d3.axisLeft(y).tickFormat(function(d, i) {return d / 1000000 }));

        //build the scale for the different colors
        var color = d3.scaleOrdinal().domain([0,5]).range(['red','blue', 'yellow','green', 'black', 'orange'])
    
        //List of genre and number of tracks that will be display on the chart  
        var list_of_genre = ["Pop", "Rock", "R&B", "Hip Hop", "Country"]
        var list_of_Tracks = [0,5,10,15,20,25,30,35,40,45]

        //TODO no hardcoding
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
                .attr("fill", "none")
                .attr("stroke", color(list_of_genre.indexOf(elem)))
                .attr("stroke-width", 1.5)
                .attr("transform", `translate(20,0)`)
                .attr("d", d3.line()
                    .x(function(d) { return x(d[0]) })
                    .y(function(d) { return y(d[1])}));

            //plot the circles
            svg
                .selectAll("circle")
                .append("g")
                .data(new_data)
                .enter()
                .append("circle")
                .attr("stroke-width", 1.5)
                .attr("transform", `translate(20,0)`)
                .attr("cx", (d) => x(d[0]))
                .attr("cy", (d) => y(d[1]))
                .attr("r", 4)
                .style("fill", color(list_of_genre.indexOf(elem))); //TODO arrange colors fo circles + plot every circle

        });

    });
}

function createDualAxisLineChart(id){

    //create the svg
    const svg = d3
        .select(id)
        .attr("width", (width + margin.left + margin.right + margin.right/2))
        .attr("height", (height + margin.top + margin.bottom))
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    //retrieve data and build the chart
    d3.json("final.json").then(function(data){

        //build x-scale and x-axis
        const x = d3
            .scaleLinear()
            .domain([d3.min(data, d => d.Year),d3.max(data, d => d.Year)])
            .range([0, width]);
        svg
            .append("g")
            .attr("id", "gXAxis")
            .attr("stroke-width", 1.25)
            .attr("transform", `translate(25, ${height + 20})`)
            .call(d3.axisBottom(x).tickFormat(function(d, i) {return d }));
        
        //build the left y-scale and y-axis
        const y = d3
            .scaleLinear()
            .domain([8, 0])//TODO no hardcoding
            .range([0, height]);
        svg
            .append("g")
            .attr("id", "gYAxis")
            .attr("stroke", "#c71585")
            .attr("stroke-width", 1.25)
            .attr("transform", `translate(25 ,20)`)
            .call(d3.axisLeft(y));

        //TODO change color axis

        //build the right y-scale and y-axis
        const y2 = d3
            .scaleLinear()
            .domain([d3.max(data, d => parseInt(d.Sales.replace(/,/g, ''))),0])
            .range([0, height]);
        svg
            .append("g")
            .attr("id", "gYAxis")
            .attr("transform", `translate(${width + 25} ,20)`)
            .attr("stroke", "#008b8b")
            .attr("stroke-width", 1.25)
            .attr("fill", "red")
            .call(d3.axisRight(y2).tickFormat(function(d, i) {return d / 1000000}));
        
        //list of all years
        var list_of_year = new Set(data.map(d => d.Year))

        //create the new data to be plotted from the left axis
        var new_data1 = new Map()
        list_of_year.forEach(e => {
            mean = d3.mean(data.filter(d => d.Year == e).map(d => d.AvgSongLength))
            new_data1.set(e, mean)
        })
        svg
            .append("path")
            .datum(new_data1)
            .attr("fill", "none")
            .attr("stroke", "#c71585")
            .attr("stroke-width", 2)
            .attr("transform", `translate(25, 0)`)
            .attr("d", d3.line()
                    .x(function(d) { return x(d[0])})
                    .y(function(d) { return y(d[1])}));

        //create the new data to be plotted from the right axis
        var new_data2 = new Map()
        list_of_year.forEach(e => {
            mean = d3.mean(data.filter(d => d.Year == e).map(d => parseInt(d.Sales.replace(/,/g, ''))))
            new_data2.set(e, mean)
        })
        svg
            .append("path")
            .datum(new_data2)
            .attr("fill", "none")
            .attr("stroke", "#008b8b")
            .attr("stroke-width", 2)
            .attr("transform", `translate(25, 0)`)
            .attr("d", d3.line()
                    .x(function(d) { return x(d[0])})
                    .y(function(d) { return y2(d[1])}));
    });

}

function createHeatmap(id){
    const svg = d3
    .select(id)
    .attr("width", 2*(width + margin.left + margin.right))
    .attr("height", height + margin.top + margin.bottom);
}

function createSankeyDiagram(id){
    const svg = d3
    .select(id)
    .attr("width", width)
    .attr("height", 2*height + margin.top + margin.bottom);
}