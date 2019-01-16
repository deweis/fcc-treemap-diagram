const width = 1040;
const height = 570;

/**
 * Define the color scale
 * https://bl.ocks.org/pstuffa/3393ff2711a53975040077b7453781a9
 */
const colors = [
  '#ffcc80' /* orange lighten-3 */,
  '#e6ee9c' /* lime lighten-3 */,
  '#81d4fa' /* light-blue lighten-3 */,
  '#ce93d8' /* purple lighten-3 */,
  '#80deea' /* cyan lighten-3 */,
  '#ffab91' /* deep-orange lighten-3 */,
  '#80cbc4' /* teal lighten-3 */
];

const colorScale = d3.scaleOrdinal(colors);

/**
 * Create and append the svg element
 */
const svg = d3
  .select('#chartContainer')
  .append('svg')
  .attr('id', 'chart')
  .attr('class', 'svg')
  // http://svg.tutorial.aptico.de/start3.php?knr=3&kname=Dokumentstruktur%20I&uknr=3.5&ukname=Das%20Attribut%20viewBox
  .attr('viewBox', `0 53 ${width} ${height}`)
  .attr('preserveAspectRatio', 'xMidYMid meet');

/**
 * Async load the movies data
 */
d3.queue()
  .defer(
    d3.json, // movies
    'https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/movie-data.json'
  )
  // .defer(
  //   d3.json, // videogames
  //   'https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/video-game-sales-data.json'
  // )
  // .defer(
  //   d3.json, // kickstarter-funding-data
  //   'https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/kickstarter-funding-data.json'
  // )
  .await(drawChart);

/**
 * Main function triggered when data load is ready
 * Responsible to draw all data within the svg
 */
function drawChart(error, movie_sales) {
  if (error) {
    console.log(error);
  }

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
    .attr('stroke', 'none')
    .attr('width', d => d.x1 - d.x0)
    .attr('height', d => d.y1 - d.y0)
    .attr('fill', function(d, i) {
      return colorScale(d.data.category);
    })
    .attr('data-name', d => d.data.name)
    .attr('data-category', d => d.data.category)
    .attr('data-value', d => d.data.value);

  // Add the labels
  items // thanks to https://codepen.io/HIC/pen/bxzpRR?editors=0010 for getting me to know about the tspans..
    .append('text')
    .attr('class', 'inner-text')
    .selectAll('tspan')
    .data(d => {
      /**
       * split the labels according the width of the rect
       **/
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

      const itemWidth = Math.round((d.x1 - d.x0) / 6); // approximate calculation of pixels to letter width
      const itemHeight = Math.round((d.y1 - d.y0) / 11); // approximate calculation of pixels to letter height

      let arrWordsTmp = [];

      // Split Words greater than width
      for (let i = 0; i < arrWordsNew.length; i++) {
        if (arrWordsNew[i].length > itemWidth) {
          arrWordsTmp.push(arrWordsNew[i].substr(0, itemWidth - 1));
          arrWordsTmp.push(arrWordsNew[i].substring(itemWidth - 1));
        } else {
          arrWordsTmp.push(arrWordsNew[i]);
        }
      }
      arrWordsNew = arrWordsTmp;

      const arrLengths = arrWordsNew.map(x => (x = x.length + 1));
      let tmpString = '';
      let arrResult = [];

      // join as many words as fit into one line of itemWidth
      arrLengths.forEach((x, i, arr) => {
        if (tmpString.length + x - 1 < itemWidth) {
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

      if (arrResult.length > itemHeight) {
        const items = itemHeight <= 2 ? 1 : 2;
        const itemsToRemove = arrResult.length - itemHeight + items;
        arrResult.splice(itemHeight - items, itemsToRemove, '***');
      }

      return arrResult;
    })
    .enter()
    .append('tspan')
    .attr('class', 'inner-text')
    .attr('x', 4)
    .attr('y', (d, i) => 12 + 11 * i)
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

  /**
   * Add the Legend
   * Thank you: https://codepen.io/carlchil/pen/QZvwvN?editors=0010
   */
  const containerWidth = document.getElementById('chartContainer').clientWidth;
  const catNameLengths = treeData.children.map(x => x.data.name.length);
  const legendBoxSize = 20;
  const legendEntryPadding = 3;
  const legendEntryWidth =
    Math.max(...catNameLengths) * 8 + legendBoxSize + legendEntryPadding;
  const itemsPerRow = Math.floor(containerWidth / legendEntryWidth);
  const legendRows = Math.ceil(catNameLengths.length / itemsPerRow);
  const legendTopMargin = 10;
  const legendLeftPadding = 15;

  const legend = svg
    .append('g')
    .attr('id', 'legend')
    .attr('class', 'legend')
    .attr(
      'transform',
      `translate(${legendLeftPadding}, ${height + legendTopMargin})`
    );

  const legendEntries = legend
    .selectAll('g')
    .data(treeData.children)
    .enter()
    .append('g')
    .attr('width', legendEntryWidth)
    .attr(
      'transform',
      (d, i) =>
        `translate(${legendEntryWidth *
          Math.floor(i / legendRows)}, ${(legendBoxSize + legendEntryPadding) *
          (i % legendRows)})`
    );

  legendEntries
    .append('rect')
    .attr('class', 'legend-item')
    .attr('width', legendBoxSize)
    .attr('height', legendBoxSize)
    .attr('fill', d => colorScale(d.data.name));

  legendEntries
    .append('text')
    .attr('class', 'legend-text')
    .attr('x', legendBoxSize + legendEntryPadding)
    .attr('y', 15)
    .html(d => d.data.name);
}
