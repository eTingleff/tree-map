'use strict';

import * as d3 from 'https://cdn.skypack.dev/d3@7';

const dataUrl = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/movie-data.json';

const getData = async () => {
  return d3.json(dataUrl);
}

const width = 1500;
const height = 600;
const margin = {
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
};

const legendWidth = 700;
const legendHeight = 50;
const legendMargin = {
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
};

let data = await getData();
data.children.forEach((genre) => {
  genre.children.sort((a, b) => b.value - a.value);
});

const svg = d3.select('#map-container')
  .append('svg')
  .attr('width', `${width - margin.left - margin.right}`)
  .attr('height', `${height - margin.top - margin.bottom}`)
  .attr('transform', `translate(${margin.left}, ${margin.top})`);

const tooltip = d3.select('#map-container')
  .append('div')
  .attr('id', 'tooltip')
  .style('position', 'absolute')
  .style('background-color', 'black')
  .style('opacity', '0.85')
  .style('color', 'white')
  .style('font-size', '12px')
  .style('padding-left', '10px')
  .style('padding-right', '10px')
  .style('border-radius', '5px')
  .style('visibility', 'hidden');

const getTooltipHtml = (d) => {
  const {
    name,
    category,
    value,
  } = d.data;
  return `<p>Name: ${name}<br>Category: ${category}<br>Value: ${value}</p>`;
}

const onMouseMove = (e, d) => {
  const tooltipWidth = document.getElementById('tooltip').offsetWidth;
  tooltip
    .style('top', `${e.pageY - 75}px`)
    .style('left', `${e.pageX - (tooltipWidth / 2)}px`);
}

const onMouseOver = (e, d) => {
  tooltip
    .attr('data-name', d.data.name)
    .attr('data-category', d.data.category)
    .attr('data-value', d.data.value)
    .html(getTooltipHtml(d))
    .style('visibility', 'visible');
}

const onMouseLeave = (e, d) => {
  tooltip.style('visibility', 'hidden');
}

const hierarchy = d3.hierarchy(data)
  .sum((d) => d.value);

const treemap = d3.treemap()
  .size([width, height]);

const genres = data.children.map((child) => child.name);
const colorPalette = d3.schemeDark2.slice(0, 7);
const color = d3.scaleOrdinal(genres, colorPalette);
const wordWrapRegex = /(?=[A-Z][^A-Z:\s\-\.])/g;

svg.selectAll('g')
  .data(treemap(hierarchy).leaves())
  .join('g')
  .attr('transform', (d) => `translate(${d.x0}, ${d.y0})`)
  .style('cursor', 'default')
  .on('mousemove', onMouseMove)
  .on('mouseover', onMouseOver)
  .on('mouseleave', onMouseLeave)
  .append('rect')
  .attr('class', 'tile')
  .attr('data-name', (d) => d.data.name)
  .attr('data-category', (d) => d.data.category)
  .attr('data-value', (d) => d.data.value)
  .attr('width', (d) => `${d.x1 - d.x0}`)
  .attr('height', (d) => `${d.y1 - d.y0}`)
  .attr('stroke', 'white')
  .attr('fill', (d) => color(d.data.category))

svg.selectAll('g')
  .append('text')
  .selectAll('tspan')
  .data((d) => d.data.name.trim().split(wordWrapRegex))
  .join('tspan')
  .attr('x', 2)
  .attr('y', (d, i) => `${10 + (i * 12)}`)
  .attr('font-size', '11px')
  .attr('fill', 'white')
  .text((d) => d);

const legendSvg = d3.select('#legend-container')
  .append('svg')
  .attr('id', 'legend')
  .attr('width', legendWidth)
  .attr('height', legendHeight);

legendSvg.selectAll('g')
  .data(genres)
  .join('g')
  .attr('transform', (d, i) => `translate(${i * 100}, 15)`)
  .append('rect')
  .attr('class', 'legend-item')
  .attr('width', '25')
  .attr('height', '25')
  .attr('fill', color)

legendSvg.selectAll('g')
  .append('text')
  .attr('x', '30')
  .attr('y', '17')
  .attr('font-size', '12px')
  .attr('fill', 'black')
  .text((d) => d);

