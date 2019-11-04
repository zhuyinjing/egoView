export const increment = (state) => {
  state.count++
}

export const setusername =  (state, data) => {
  sessionStorage.setItem('username', data)
  state.username = data
}

export const d3saveSVG =  (state, data) => {
  var svg = document.getElementById('d3container');
  //you need to clone your SVG otherwise it will disappear after saving
  var clone = svg.cloneNode(true);
  var svgDocType = document.implementation.createDocumentType('svg', "-//W3C//DTD SVG 1.1//EN", "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd");
  var svgDoc = document.implementation.createDocument('http://www.w3.org/2000/svg', 'svg', svgDocType);

  svgDoc.replaceChild(clone, svgDoc.documentElement);
  var svgData = (new XMLSerializer()).serializeToString(svgDoc);
  var a = document.createElement('a');
  a.href = 'data:image/svg+xml; charset=utf8, ' + encodeURIComponent(svgData.replace(/></g, '>\n\r<'));
  a.download = data + '.svg';
  a.innerHTML = 'download the svg file';

  //Hack alert: create a temporary link to download the svg
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
