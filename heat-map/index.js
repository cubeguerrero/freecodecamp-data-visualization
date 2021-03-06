const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const dataURL = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json';
const colors = ['#313695', '#4575B4', '#74add1', '#abd9e9', '#e0f3f8', '#ffffbf', '#fee190', '#feae61', '#f46c43', '#d73027', '#a50026'];
const paddings = { top: 20, right: 20, bottom: 60, left: 20 };
const fullHeight = 640;
const fullWidth = 960;
const width  = fullWidth - (paddings.right + paddings.left);
const height = fullHeight - (paddings.top + paddings.bottom);
const padding = paddings.top;
const legendWidth = 300;
const legendHeight = 30;

const tooltip = d3.select("#chart")
                  .append("div")
                  .attr("class", "tooltip")
                  .attr("id", "tooltip")
                  .style("opacity", 0)
                  .style("z-index", 1);

function tooltipMouseover(d) {
  const year = d['year'];
  const month = months[d['month'] - 1];
  const temp = d['variance'];
  const p = `<p><span>${year}: ${month}<span><br />${temp}</p>`;

  tooltip.attr("data-year", year);

  tooltip.html(p)
         .style("left", (d3.event.pageX + 15) + "px")
         .style("top", (d3.event.pageY - 28) + "px")
         .transition()
         .duration(200) // ms
         .style("opacity", .9) // started as 0!
}

function tooltipMouseout(d) {
  tooltip.transition()
        .duration(300) // ms
        .style("opacity", 0); // don't care about position!
}

const title = 'Monthly Global Land-Surface Temperature';
const container = d3.select('#main');
const svg = d3.select('#chart')
              .append('svg')
              .attr('width', fullWidth)
              .attr('height', fullHeight);

container.insert('h1', ':first-child')
  .text(title);

svg.append('svg:title')
  .text(title)
  .attr('id', 'title');

d3.json(dataURL).then((data) => {
  const baseTemp = data['baseTemperature'];
  const dataset = data['monthlyVariance'];
  const yearData = dataset.map(d => d['year']);
  const tempData = dataset.map(d => baseTemp + d['variance']);
  const minTemp = d3.min(tempData);
  const maxTemp = d3.max(tempData);
  const minYear = d3.min(yearData);
  const maxYear = d3.max(yearData);
  svg.append('desc')
    .text(`${minYear} - ${maxYear}: base temperature ${baseTemp}℃`)
    .attr('id', 'description');

  const legendThreshold = d3.scaleThreshold()
    .domain((function(min, max, count) {
      let array = [];
      let step = (max - min) / count;
      let base = min;
      let i;
      for (i = 1; i < count; i++) {
        array.push(base + i * step);
      }
      return array
    })(minTemp, maxTemp, colors.length))
    .range(colors)

  const legendXScale = d3.scaleLinear()
    .domain([minTemp, maxTemp])
    .range([0, legendWidth]);

  const legendXAxis = d3.axisTop(legendXScale)
    .tickValues(legendThreshold.domain())
    .tickFormat(d3.format(".1f"));

  const legend = svg.append('g')
    .attr('id', 'legend')
    .attr("transform", `translate(${paddings.left * 3}, ${fullHeight - legendHeight})`);

  legend.selectAll('rect')
    .data(legendThreshold.range().map((color) => {
      var d = legendThreshold.invertExtent(color);
      if (d[0] === null) d[0] = legendXAxis.domain()[0];
      if (d[1] === null) d[1] = legendXAxis.domain()[1];
      return d;
    }))
    .enter()
    .append("rect")
    .style("fill", (d) => legendThreshold(d[0]))
    .attr('x', (d) => legendXScale(d[0]))
    .attr('y', 0)
    .attr('width', (d) => legendXScale(d[1]) - legendXScale(d[0]))
    .attr('height', legendHeight);

  legend.append('g')
    .call(legendXAxis);

  // rects
  const xScale = d3.scaleBand()
    .domain([...new Set(yearData)])
    .range([padding * 3, width], 0, 0);

  const xAxis = d3.axisBottom(xScale)
    .tickValues(xScale.domain().filter(year => year%10 == 0));

  svg.append('g')
    .attr('id', 'x-axis')
    .attr('transform', `translate(0, ${height})`)
    .call(xAxis);

  const yScale = d3.scaleBand()
    .domain(months)
    .range([30 * 2, height]);

  const yAxis = d3.axisLeft(yScale)
    .tickSizeOuter(0);

  svg.append('g')
    .attr('id', 'y-axis')
    .attr('transform', `translate(${padding * 3}, 0)`)
    .call(yAxis);

  svg.selectAll('rect')
    .data(dataset)
    .enter()
    .append('rect')
    .attr('class', 'cell')
    .attr('data-month', d => d['month'] - 1)
    .attr('data-year', d => d['year'])
    .attr('data-temp', d => d['variance'])
    .attr('x', d => xScale(d['year']))
    .attr('y', d => {
      let month = months[d['month'] - 1];
      let a = yScale(month);
      return a;
    })
    .attr('fill', d => legendThreshold(baseTemp + d['variance']))
    .attr('width', () => {
      return (width - padding*2) / (maxYear - minYear);
    })
    .attr('height', (height - 30*2)/ 12)
    .on('mouseover', tooltipMouseover)
    .on('mouseout', tooltipMouseout);
});
