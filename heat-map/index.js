const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const dataURL = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json";
const margin = { top: 20, right: 20, bottom: 20, left: 20 };
const fullHeight = 640;
const fullWidth = 960;
const width  = fullWidth - (margin.right + margin.left);
const height = fullHeight - (margin.top + margin.bottom);
const padding = margin.top;


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
  const baseTemp = data['aseTemperature'];
  const yearData = data['monthlyVariance'].map(d => d['year']);
  const minYear = d3.min(yearData);
  const maxYear = d3.max(yearData);
  svg.append('desc')
    .text(`${minYear} - ${maxYear}: base temperature ${baseTemp}℃`)
    .attr('id', 'description');

  const xScale = d3.scaleBand()
    .domain([...new Set(yearData)])
    .range([padding, width], 0, 0);

  const xAxis = d3.axisBottom(xScale)
    .tickValues(xScale.domain().filter(year => year%10 == 0));

  svg.append('g')
    .attr('id', 'x-axis')
    .attr('transform', `translate(${padding}, ${height})`)
    .call(xAxis);

  const yScale = d3.scaleOrdinal()
    .domain([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])
    .range([height, padding])

  const yAxis = d3.axisLeft(yScale)
    .tickValues(yScale.domain().map(m => months[m]));

  svg.append('g')
    .attr('id', 'y-axis')
    .attr('transform', `translate(${padding}, 0)`)
    .call(yAxis);
});
