mapboxgl.accessToken = "pk.eyJ1Ijoidmlwc2hlaGJheiIsImEiOiJjbWt1eDYzcWQwMGtzM2NxeDN1Z2NuMzZrIn0.UtNx0noYlyAJPAkP1g6x1g";

// ---------- MAP 1: COVID-19 CASES ----------
if (document.getElementById("map-cases")) {
  const mapCases = new mapboxgl.Map({
    container: "map-cases",
    style: "mapbox://styles/mapbox/light-v11",
    center: [-98, 39],
    zoom: 3.5,
    projection: "albers",
  });

  mapCases.addControl(new mapboxgl.NavigationControl());

  mapCases.on("load", () => {
    mapCases.addSource("covid-counts", {
      type: "geojson",
      data: "assets/us-covid-2020-counts.geojson",
    });

    mapCases.addLayer({
      id: "covid-circles",
      type: "circle",
      source: "covid-counts",
      paint: {
        "circle-radius": ["interpolate", ["linear"], ["sqrt", ["get", "cases"]], 0, 2, 200, 30],
        "circle-color": ["interpolate", ["linear"], ["get", "cases"], 0, "#FFDDDD", 5000, "#FF4136", 20000, "#800000"],
        "circle-stroke-color": "#800000",
        "circle-stroke-width": 0.5,
        "circle-opacity": 0.8,
      },
    });

    mapCases.on("click", "covid-circles", (e) => {
      const props = e.features[0].properties;
      new mapboxgl.Popup()
        .setLngLat(e.features[0].geometry.coordinates)
        .setHTML(`<strong>County:</strong> ${props.county}, ${props.state}<br><strong>Total Cases:</strong> ${props.cases.toLocaleString()}`)
        .addTo(mapCases);
    });

    mapCases.on("mouseenter", "covid-circles", () => mapCases.getCanvas().style.cursor = "pointer");
    mapCases.on("mouseleave", "covid-circles", () => mapCases.getCanvas().style.cursor = "");

    const legendCases = document.getElementById("legend-cases");
    const caseBreaks = [1000, 5000, 10000, 20000];
    const radii = caseBreaks.map(c => Math.sqrt(c) * 0.05);

    let labelsCases = ["<h4>Total COVID-19 Cases</h4>"];
    for (let i = 0; i < caseBreaks.length; i++) {
      const diameter = radii[i] * 2;
      labelsCases.push(`<div class="legend-item"><span class="legend-circle" style="width:${diameter}px; height:${diameter}px;"></span><span class="legend-label">${caseBreaks[i].toLocaleString()} cases</span></div>`);
    }
    labelsCases.push('<div class="source">Source: <a href="https://www.nytimes.com/interactive/2021/us/covid-cases.html" target="_blank">NY Times</a></div>');
    legendCases.innerHTML = labelsCases.join("");
  });
}

// ---------- MAP 2: COVID-19 RATES ----------
if (document.getElementById("map-rates")) {
  const mapRates = new mapboxgl.Map({
    container: "map-rates",
    style: "mapbox://styles/mapbox/light-v11",
    center: [-98, 39],
    zoom: 3.5,
    projection: "albers",
  });

  mapRates.addControl(new mapboxgl.NavigationControl());

  mapRates.on("load", () => {
    mapRates.addSource("covid-rates", {
      type: "geojson",
      data: "assets/us-covid-2020-rates.geojson",
    });

    mapRates.addLayer({
      id: "covid-rates-fill",
      type: "fill",
      source: "covid-rates",
      paint: {
        "fill-color": [
          "interpolate",
          ["linear"],
          ["get", "rates"],
          0, "#DDFFDD",
          5, "#A2ECA7",
          10, "#2ECC40",
          20, "#006400"
        ],
        "fill-opacity": 0.7
      }
    });

    mapRates.addLayer({
      id: "covid-rates-borders",
      type: "line",
      source: "covid-rates",
      paint: {
        "line-color": "#666",
        "line-width": 0.5
      }
    });

    mapRates.on("click", "covid-rates-fill", (e) => {
      const props = e.features[0].properties;
      new mapboxgl.Popup()
        .setLngLat(e.lngLat)
        .setHTML(
          `<strong>County:</strong> ${props.county}, ${props.state}<br>
           <strong>Case Rate:</strong> ${props.rates.toLocaleString()} per 1000`
        )
        .addTo(mapRates);
    });

    mapRates.on("mouseenter", "covid-rates-fill", () => mapRates.getCanvas().style.cursor = "pointer");
    mapRates.on("mouseleave", "covid-rates-fill", () => mapRates.getCanvas().style.cursor = "");

    const legendRates = document.getElementById("legend-rates");
    const rateBreaks = [0, 5, 10, 20];
    const colors = ["#DDFFDD", "#A2ECA7", "#2ECC40", "#006400"];

    let labelsRates = ["<h4>COVID-19 Case Rates</h4>"];
    for (let i = 0; i < rateBreaks.length; i++) {
      labelsRates.push(`
        <div class="legend-item">
          <span class="legend-color" style="background-color:${colors[i]};"></span>
          <span class="legend-label">${rateBreaks[i]}${i < rateBreaks.length - 1 ? " – " + rateBreaks[i+1] : "+"} per 1000</span>
        </div>
      `);
    }
    labelsRates.push('<div class="source">Source: <a href="https://www.nytimes.com/interactive/2021/us/covid-cases.html" target="_blank">NY Times</a></div>');
    legendRates.innerHTML = labelsRates.join("");
  });
}
