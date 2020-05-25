const KICKSTARTER_PLEDGES = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/kickstarter-funding-data.json';

const height = 500;
const width = 960;

const tooltip = d3.select('#main')
  .append('div')
  .attr('class', 'tooltip')
  .attr('id', 'tooltip')
  .style('opacity', 0);

const svg = d3.select('#chart')
  .append('svg')
  .attr('width', width)
  .attr('height', height);

const color = d3.scaleOrdinal(d3.schemeCategory10);

const treemap = d3.treemap()
  .size([width, height])
  .paddingInner(1);

d3.json(KICKSTARTER_PLEDGES)
  .then(function (data) {
    let root = d3.hierarchy(data)
      .eachBefore(function(d) {
        d.data.id = (d.parent ? d.parent.data.id + "." : "") + d.data.name;
      })
      .sum((d) => d.value)
      .sort((a, b) => b.height - a.height || b.value - a.value)

    treemap(root);

    let cell = svg.selectAll('g')
      .data(root.leaves())
      .enter()
        .append('g')
        .attr('class', 'group')
        .attr('transform', (d) => `translate(${d.x0}, ${d.y0})`);

    cell.append('rect')
      .attr('id', (d) => d.data.id)
      .attr('class', 'tile')
      .attr('width', (d) => d.x1 - d.x0)
      .attr('height', (d) => d.y1 - d.y0)
      .attr('data-name', (d) => d.data.name)
      .attr('data-category', (d) => d.data.category)
      .attr('data-value', (d) => d.data.value)
      .attr('fill', (d) => color(d.data.category))
      .on('mouseover', (d) => {
        html = `<div>Name: ${d.data.name}</div><div>Category: ${d.data.category}</div><div>Value: ${d.data.value}</div>`;
        tooltip
          .html(html)
          .attr('data-value', d.data.value)
          .style("left", (d3.event.pageX + 10) + "px")
          .style("top", (d3.event.pageY - 28) + "px")
          .style('opacity', 1);
      })
      .on('mouseout', () => tooltip.style('opacity', 0));

    cell.append('text')
      .attr('class', 'tile-text')
      .selectAll('tspan')
      .data((d) => d.data.name.split(/(?=[A-Z][^A-Z])/g))
      .enter().append('tspan')
      .attr('x', 4)
      .attr('y', (d, i) => 13 + (i * 10))
      .text((d) => d);


    let categories = root.leaves().map((nodes) => nodes.data.category);
    categories = categories.filter((category, index, self) => {
      return self.indexOf(category) === index;
    });

    let legend = d3.select("#chart")
      .append("svg")
      .attr('id', 'legend')
      .attr('width', 500)
      .style('margin', '24px');

    let legendElem = legend.append('g')
      .attr('transform', `translate(60, ${10})`)
      .selectAll('g')
      .data(categories)
      .enter()
      .append('g')
      .attr('transform', (d, i) => {
        let x = (i % 3) * 150;
        let y = (Math.floor(i/3)*15) + (10*(Math.floor(i/3)));
        return `translate(${x}, ${y})`;
      });

    legendElem.append('rect')
      .attr('width', 15)
      .attr('height', 15)
      .attr('class', 'legend-item')
      .attr('fill', (d) => color(d));

    legendElem.append('text')
      .attr('x', 15 + 3)
      .attr('y', 15 - 2)
      .text((d) => d);
  });