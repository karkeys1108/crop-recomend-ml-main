var location = ee.Geometry.Point([77.0606653 ,10.8266092]);
var buffer = location.buffer(100); 
Map.centerObject(buffer, 18);


var worldCover = ee.ImageCollection('ESA/WorldCover/v100').first();
var landCover = worldCover.clip(buffer);
var CROPLAND = 40;
var BUILTUP = 50;

var cropMask = landCover.eq(CROPLAND);
var builtupMask = landCover.eq(BUILTUP);

var cropLayer = cropMask.updateMask(cropMask).visualize({palette: ['#00ff00']});
var builtupLayer = builtupMask.updateMask(builtupMask).visualize({palette: ['#ff0000']});

Map.addLayer(landCover, {}, 'Original Landcover');
Map.addLayer(cropLayer, {}, 'Cropland (Green)');
Map.addLayer(builtupLayer, {}, 'Built-up Area (Red)');

//  Cropland Area Calculation
var cropArea = cropMask.multiply(ee.Image.pixelArea());
var totalCropArea = cropArea.reduceRegion({
  reducer: ee.Reducer.sum(),
  geometry: buffer,
  scale: 10,
  maxPixels: 1e9
});

totalCropArea.get('Map').evaluate(function(areaSqM) {
  if (areaSqM) {
    var areaAcres = areaSqM * 0.000247105;
    print('🌾 Agricultural area available (m²):', areaSqM.toFixed(2));
    print('🌾 Agricultural area available (acres):', areaAcres.toFixed(2));
  } else {
    print('No agricultural land detected in this buffer area.');
  }
});

// Soil pH
var phImage = ee.Image('OpenLandMap/SOL/SOL_PH-H2O_USDA-4C1A2A_M/v02');
var ph0cm = phImage.select('b0').multiply(0.1);
Map.addLayer(ph0cm.clip(buffer), {
  min: 4.2,
  max: 9.0,
  palette: ['#f44336', '#ffeb3b', '#4caf50']
}, 'Soil pH (Red = Acidic, Yellow = Neutral, Green = Alkaline)');

// Soil Texture Class
var textureImage = ee.Image('OpenLandMap/SOL/SOL_TEXTURE-CLASS_USDA-TT_M/v02');
var texture0cm = textureImage.select('b0');
Map.addLayer(texture0cm.clip(buffer), {
  min: 1,
  max: 12,
  palette: ['#d5c36b', '#b96947', '#9d3706', '#ae868f', '#f86714',
            '#46d143', '#368f20', '#3e5a14', '#ffd557', '#fff72e',
            '#ff5a9d', '#ff005b']
}, 'Soil Texture Class (varied colors per type)');

//  Organic Carbon (%)
var ocImage = ee.Image('OpenLandMap/SOL/SOL_ORGANIC-CARBON_USDA-6A1C_M/v02');
var oc0cm = ocImage.select('b0').multiply(0.1);
Map.addLayer(oc0cm.clip(buffer), {
  min: 0,
  max: 5,
  palette: ['#f5f5dc', '#8bc34a', '#4caf50', '#1b5e20']
}, 'Organic Carbon (%): Beige = Low, Dark Green = High');

var samplePH = ph0cm.reduceRegion({
  reducer: ee.Reducer.mean(),
  geometry: buffer,
  scale: 250,
  maxPixels: 1e8
});

var sampleTexture = texture0cm.reduceRegion({
  reducer: ee.Reducer.mode(),
  geometry: buffer,
  scale: 250,
  maxPixels: 1e8
});

var sampleOC = oc0cm.reduceRegion({
  reducer: ee.Reducer.mean(),
  geometry: buffer,
  scale: 250,
  maxPixels: 1e8
});

var textureClasses = {
  1: 'Clay', 2: 'Silty Clay', 3: 'Sandy Clay',
  4: 'Clay Loam', 5: 'Silty Clay Loam', 6: 'Sandy Clay Loam',
  7: 'Loam', 8: 'Silt Loam', 9: 'Silt',
  10: 'Sandy Loam', 11: 'Loamy Sand', 12: 'Sand'
};

// Geocoding to get District Name
var districts = ee.FeatureCollection("FAO/GAUL_SIMPLIFIED_500m/2015/level2");
var district = districts.filterBounds(location).first();
district.get('ADM2_NAME').evaluate(function(name) {
  print('📍 District Name:', name);
});

samplePH.get('b0').evaluate(function(phValRaw) {
  sampleTexture.get('b0').evaluate(function(texValRaw) {
    sampleOC.get('b0').evaluate(function(ocValRaw) {
      if (phValRaw !== null && texValRaw !== null && ocValRaw !== null) {
        var phVal = Number(phValRaw);
        var texVal = Number(texValRaw);
        var ocVal = Number(ocValRaw);
        
        var soilTexture = textureClasses[texVal] || 'Unknown';
        var npkEstimate = (ocVal * 10).toFixed(2);

        print('Average Soil pH:', phVal.toFixed(2));
        print('Soil Texture Class:', soilTexture + ' (Code ' + texVal + ')');
        print('Organic Carbon (%):', ocVal.toFixed(2));
        print('Estimated Fertility Index (proxy NPK in kg/ha):', npkEstimate);

        var finalSoilType;

        // Enhanced Soil Type Classification for Tamil Nadu
        var texValNum = Number(texVal); // ensure it's numeric

        if (phVal < 5.5 && ocVal < 1 && [11, 12].indexOf(texValNum) !== -1) {
          finalSoilType = 'Laterite Soil';
        } else if (phVal < 6.5 && ocVal < 1.5 && [10, 11, 12].indexOf(texValNum) !== -1) {
          finalSoilType = 'Red Sandy Soil';
        } else if (phVal >= 7 && ocVal >= 1.5 && [1, 4].indexOf(texValNum) !== -1) {
          finalSoilType = 'Black Cotton Soil';
        } else if (phVal >= 6.5 && phVal <= 7.5 && ocVal >= 0.5 && ocVal <= 2.5 &&
                   [7, 8, 9].indexOf(texValNum) !== -1) {
          finalSoilType = 'Alluvial Soil';
        } else if (phVal > 8.5 && ocVal < 1) {
          finalSoilType = 'Saline Soil';
        } else if (ocVal > 2.5 && phVal < 6) {
          finalSoilType = 'Peaty Soil';
        } else if (phVal < 6.5 && ocVal < 1.5 && [3, 6, 10].indexOf(texValNum) !== -1) {
          finalSoilType = 'Red Soil';
        } else {
          finalSoilType = soilTexture + ' (Texture-based type)';
        }

        print('📌 Inferred Soil Type:', finalSoilType);

      } else {
        print('⚠️ One or more soil data values are missing.');
      }
    });
  });
}); 