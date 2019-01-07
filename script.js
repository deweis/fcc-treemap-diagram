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
