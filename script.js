/**
 * TBD:
 * - Text line breaks
 * - Remove Parent category from diagram (check on paddingOuter etc.)
 * - check on user stories
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
  const treemapLayout = d3.treemap().size([width, height]);

  /**
   * Before applying this layout to our hierarchy we must run .sum() on the hierarchy. This traverses the tree and sets .value on each node to the sum of its children. Note that we pass an accessor function into .sum() to specify which property to sum.
   */
  root.sum(d => d.value);

  /**
   * We can now call treemapLayout, passing in our hierarchy object:
   */
  treemapLayout(root);

  /**
   * The layout adds 4 properties x0, x1, y0 and y1 to each node which specify the dimensions of each rectangle in the treemap.
   * Now we can join our nodes to rect elements and update the x, y, width and height properties of each rect:
   */
  svg
    .append('g')
    .selectAll('rect')
    .data(root.descendants())
    .enter()
    .append('rect')
    .attr('class', 'tile')
    .attr('x', d => d.x0)
    .attr('y', d => d.y0)
    .attr('width', d => d.x1 - d.x0)
    .attr('height', d => d.y1 - d.y0)
    .attr('fill', 'white')
    .attr('stroke', 'black');

  /**
   * If we’d like labels in each rectangle we could join g elements to the array and add rect and text elements to each g:
   */
  const nodes = svg
    .selectAll('g')
    .data(root.descendants())
    .enter()
    .append('g')
    .attr('transform', d => 'translate(' + [d.x0, d.y0] + ')');

  nodes
    .append('rect')
    .attr('width', d => d.x1 - d.x0)
    .attr('height', d => d.y1 - d.y0)
    .attr('fill', 'none')
    .attr('stroke', 'none');

  nodes
    .append('text')
    .attr('dx', 4)
    .attr('dy', 14)
    .attr('class', 'inner-text')
    .text(d => d.data.name);
}
