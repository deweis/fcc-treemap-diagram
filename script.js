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

const width = 1000;
const height = 570;

const colors = {
  // Thank you:  https://codepen.io/carlchil/pen/QZvwvN?editors=0010
  Action: '#ffcc80' /* orange lighten-3 */,
  Drama: '#e6ee9c' /* lime lighten-3 */,
  Adventure: ' #81d4fa' /* light-blue lighten-3 */,
  Family: '#ce93d8' /* purple lighten-3 */,
  Animation: '#80deea' /* cyan lighten-3 */,
  Comedy: '#ffab91' /* deep-orange lighten-3 */,
  Biography: '#80cbc4' /* teal lighten-3 */
};

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
   *
   * Then sort the category sums
   */
  root.sum(d => d.value).sort((a, b) => b.value - a.value);

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
    .attr('fill', d => colors[d.data.category])
    .attr('data-name', d => d.data.name)
    .attr('data-category', d => d.data.category)
    .attr('data-value', d => d.data.value);

  // Add the labels
  items // thanks to https://codepen.io/HIC/pen/bxzpRR?editors=0010 for getting me to know about the tspans..
    .append('text')
    .attr('class', 'inner-text')
    .selectAll('tspan')
    .data(d => {
      // split the labels according the width of the rect
      const label = d.data.name.trim();
      const arrWords = label.split(' ');
      let arrWordsNew = [];

      // Split Words that include a '-'
      for (let i = 0; i < arrWords.length; i++) {
        if (arrWords[i].includes('-')) {
          const tmpStr = arrWords[i].split('-');
          arrWordsNew.push(tmpStr[0] + '-');
          arrWordsNew.push(tmpStr[1]);
        } else {
          arrWordsNew.push(arrWords[i]);
        }
      }

      const width = Math.round((d.x1 - d.x0) / 4) - 2; // approximate calculation of pixels to letter width
      let arrWordsTmp = [];

      // Split Words greater than width
      for (let i = 0; i < arrWordsNew.length; i++) {
        if (arrWordsNew[i].length > width) {
          arrWordsTmp.push(arrWordsNew[i].substr(0, 8));
          arrWordsTmp.push(arrWordsNew[i].substring(8));
        } else {
          arrWordsTmp.push(arrWordsNew[i]);
        }
      }
      arrWordsNew = arrWordsTmp;

      const arrLengths = arrWordsNew.map(x => (x = x.length + 1));
      let tmpString = '';
      let arrResult = [];

      // join as many words as fit into one line of width
      arrLengths.forEach((x, i, arr) => {
        if (tmpString.length + x - 1 < width) {
          tmpString = tmpString + ' ' + arrWordsNew[i];
        } else {
          arrResult.push(tmpString.trim());
          tmpString = arrWordsNew[i];
        }

        if (i === arr.length - 1) {
          arrResult.push(tmpString);
        }
      });
      arrResult = arrResult.filter(x => x.length >= 1);
      arrResult = arrResult.map(x => (x = x.trim()));

      return arrResult;
    })
    .enter()
    .append('tspan')
    .attr('class', 'inner-text')
    .attr('x', 4)
    .attr('y', (d, i) => 11 + 10 * i)
    .text(d => d);

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
