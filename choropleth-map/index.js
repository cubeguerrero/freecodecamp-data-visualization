const EDUCATION_DATA = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json';
const COUNTY_DATA = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json'

let width = 960;
let height = 600;
let svg = d3.select('#chart')
  .append('svg')
  .attr('width', width)
  .attr('height', height);

let tooltip = d3.select('#main')
  .append('div')
  .attr('class', 'tooltip')
  .attr('id', 'tooltip')
  .style('opacity', 0);

let path = d3.geoPath();
let color = d3.scaleThreshold()
  .domain(d3.range(2.6, 75.1, (75.1-2.6)/8))
  .range(d3.schemeGreens[9]);

let x = d3.scaleLinear()
  .domain([2.6, 75.1])
  .rangeRound([600, 860]);

let legend = svg.append('g')
  .attr('class', 'key')
  .attr('id', 'legend')
  .attr('transform', 'translate(0, 40)');

legend.selectAll('rect')
  .data(color.range().map((d) => {
    d = color.invertExtent(d);
    if (d[0] == null) d[0] = x.domain()[0];
    if (d[1] == null) d[1] = x.domain()[1];
    return d;
  }))
  .enter()
  .append('rect')
  .attr('height', 8)
  .attr('x', d => x(d[0]))
  .attr('width', d => x(d[1]) - x(d[0]))
  .attr('fill', d => color(d[0]));

legend.append("text")
  .attr("class", "caption")
  .attr("x", x.range()[0])
  .attr("y", -6)
  .attr("fill", "#000")
  .attr("text-anchor", "start")
  .attr("font-weight", "bold");

legend.call(d3.axisBottom(x)
  .tickSize(13)
  .tickFormat((x) => Math.round(x) + '%')
  .tickValues(color.domain()))
  .select(".domain")
  .remove();

let promises = [];
promises.push(d3.json(EDUCATION_DATA))
promises.push(d3.json(COUNTY_DATA))

Promise.all(promises).then(function(values) {
  const education_data = values[0];
  const county_data = values[1];

  svg.append('g')
    .attr('class', 'counties')
    .selectAll('path')
    .data(topojson.feature(county_data, county_data.objects.counties).features)
    .enter()
    .append('path')
    .attr('class', 'county')
    .attr('data-fips', (d) => d.id)
    .attr('data-education', (d) => {
      let result = education_data.filter(ed => ed.fips === d.id);
      if (result[0]) {
        return result[0].bachelorsOrHigher;
      }
      console.log('Could not find data for: ', d.id);
      return 0;
    })
    .attr('fill', (d) => {
      let result = education_data.filter(ed => ed.fips === d.id);
      if (result[0]) {
        return color(result[0].bachelorsOrHigher);
      }
      return color(0);
    })
    .attr('d', path)
    .on('mouseover', (d) => {
      tooltip.style('opacity', 1);
      tooltip.html(() => {
        let result = education_data.filter(ed => ed.fips === d.id);
        if (result[0]) {
          return result[0]['area_name'] + ', ' + result[0]['state'] + ': ' + result[0].bachelorsOrHigher + '%';
        }
        return 0;
      })
      .attr('data-education', () => {
        let result = education_data.filter(ed => ed.fips === d.id);
        if (result[0]) {
          return result[0].bachelorsOrHigher;
        }
        console.log('Could not find data for: ', d.id);
        return 0;
      })
      .style("left", (d3.event.pageX + 10) + "px")
      .style("top", (d3.event.pageY - 28) + "px");
    })
    .on('mouseout', () => {
      tooltip.style('opacity', 0);
    });
});