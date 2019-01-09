/**
 * TBD:
 * - Text line breaks
 * - Remove Parent category from diagram (check on paddingOuter etc.)
 * - check on user stories
 * - add colors
 * - add legend
 *
 * Examples_1:
 * - https://codepen.io/carlchil/pen/QZvwvN?editors=0010
 * - https://codepen.io/HIC/pen/bxzpRR?editors=0010
 *
 *
 * Examples:
 * - https://d3indepth.com/layouts/
 * - https://beta.observablehq.com/@mbostock/d3-treemap
 * - https://d3-wiki.readthedocs.io/zh_CN/master/Treemap-Layout/
 * - http://bl.ocks.org/masakick/04ad1502068302abbbcb
 * - https://strongriley.github.io/d3/ex/treemap.html
 * - http://bl.ocks.org/ganeshv/6a8e9ada3ab7f2d88022
 */

const width = 800;
const height = 532;

/**
 * Create and append the svg element
 */
const svg = d3
  .select('#chartContainer')
  .append('svg')
  .attr('id', 'chart')
  .attr('class', 'svg')
  // http://svg.tutorial.aptico.de/start3.php?knr=3&kname=Dokumentstruktur%20I&uknr=3.5&ukname=Das%20Attribut%20viewBox
  .attr('viewBox', `0 0 ${width} ${height}`)
  .attr('preserveAspectRatio', 'xMidYMid meet');

/**
 * Async load the movies data
 */
d3.queue()
  .defer(
    d3.json,
    'https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/movie-data.json'
  )
  .await(drawChart);

/**
 * Main function triggered when data load is ready
 * Responsible to draw all data within the svg
 */
function drawChart(error, movie_sales) {
  if (error) {
    console.log(error);
  }
  console.log(movie_sales);

  /**
   * A d3.hierarchy object is a data structure that represents a hierarchy. It has a number of functions defined on it for retrieving things like ancestor, descendant and leaf nodes and for computing the path between nodes. It can be created from a nested JavaScript object.
   * --> https://d3indepth.com/layouts/
   */
  const root = d3.hierarchy(movie_sales);

  /**
   * Create and configure the treemap layout
   */
  const treemapLayout = d3
    .treemap()
    .size([width, height])
    .padding(3);

  /**
   * Before applying this layout to our hierarchy we must run .sum() on the hierarchy. This traverses the tree and sets .value on each node to the sum of its children. Note that we pass an accessor function into .sum() to specify which property to sum.
   */
  root.sum(d => d.value);

  /**
   * We can now call treemapLayout, passing in our hierarchy object:
   */
  const treeData = treemapLayout(root);

  // https://codepen.io/carlchil/pen/QZvwvN?editors=0010
  const categories = svg
    .selectAll('g')
    .data(treeData.children)
    .enter()
    .append('g');

  // https://codepen.io/carlchil/pen/QZvwvN?editors=0010
  const items = categories
    .selectAll('g')
    .data(d => d.children)
    .enter()
    .append('g')
    .attr('transform', d => `translate(${d.x0}, ${d.y0})`);

  items // https://codepen.io/carlchil/pen/QZvwvN?editors=0010
    .append('rect')
    .attr('class', 'tile')
    .attr('fill', '#a5d6a7') // green lighten-3 // .attr('fill', d => platformColors[d.data.category])
    .attr('stroke', 'none')
    .attr('width', d => d.x1 - d.x0)
    .attr('height', d => d.y1 - d.y0)
    .attr('data-name', d => d.data.name)
    .attr('data-category', d => d.data.category)
    .attr('data-value', d => d.data.value);

  items
    .append('text')
    .attr('dx', 4)
    .attr('dy', 14)
    .attr('class', 'inner-text')
    .attr('fill', 'black')
    .text(d => d.data.name);

  /* Line break after every word: https://codepen.io/HIC/pen/bxzpRR?editors=0010 */
  //.selectAll('tspan')
  //.data(d => d.data.name.split(/(?=[A-Z][^A-Z])/g))
  //.enter()
  //.append('tspan')
  //.attr('class', 'inner-text')
  //.attr('x', 4)
  //.attr('y', (d, i) => 13 + 10 * i)
  //.text(d => d);

  /**
   * Add the Tooltip
   * Thanks: http://bl.ocks.org/d3noob/a22c42db65eb00d4e369
   */
  const divTooltip = d3
    .select('body')
    .append('div')
    .attr('class', 'tooltip')
    .attr('id', 'tooltip')
    .style('opacity', 0);

  svg
    .selectAll('rect')
    .on('mouseover', d => {
      /* Show tooltip when hovering in */
      divTooltip
        .transition()
        .duration(200)
        .style('opacity', 0.9)
        .attr('data-value', d.data.value);

      divTooltip
        .html(
          `
          ${d.data.name}<br>
          - ${d.data.category} -`
        )
        .style('left', d3.event.pageX + 10 + 'px')
        .style('top', d3.event.pageY - 35 + 'px');
    })
    .on('mouseout', d => {
      /* Hide tooltip when hovering out */
      divTooltip
        .transition()
        .duration(500)
        .style('opacity', 0);
    });
}
