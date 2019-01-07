/**
 * Create and append the svg element
 */
const svg = d3
  .select('#chartContainer')
  .append('svg')
  .attr('id', 'chart')
  .attr('class', 'svg')
  // http://svg.tutorial.aptico.de/start3.php?knr=3&kname=Dokumentstruktur%20I&uknr=3.5&ukname=Das%20Attribut%20viewBox
  .attr('viewBox', `0 0 800 532`)
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
}
