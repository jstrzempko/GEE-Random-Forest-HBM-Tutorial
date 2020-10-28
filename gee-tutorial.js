//Advanced Raster Final Project Spring 2020
//Jess Strzempko

//HBM using Random Forest in GEE Tutorial

//A. Import Vicugna Data

//import vicugna shapefile as an asset and display
Map.addLayer(vicugna, {}, 'Vicugna Data');
//use the inspector tool to investigate the data
//create a variable called label that contains the class 'presence'
//there is a column called presence which = 0 for absence points & 1 for presence points
var label = 'presence';

//B. Decide on a Region of Interest

//for this exercise, we will set the roi to be Peru for simplicity
//to do so, filter the world layer by selecting the feature where 'COUNTRY_NA' = 'Peru'
var roi = world.filter(ee.Filter.eq('COUNTRY_NA', 'Peru'));
//can also try out the analysis using a larger region later
//var roi = vicugna_region;
//center the map on the roi, at a zoom level of 4
Map.centerObject(roi, 5);
//visualize the roi by uncommenting this statement
//Map.addLayer(roi, {}, 'Region of Interest');

//C. Import Environmental Variables

//import the WorldClim BIO Variables V1
//create a new variable called temp from the mean annual temperature band
var temp_bioclim = bioclim.select('bio01');
//create visualization parameters to explore your data
var temp_vis = {min: -230.0, max: 300.0,
  palette: ['blue', 'purple', 'cyan', 'green', 'yellow', 'red']};
var temp = temp_bioclim.clip(roi);
//go through a similar process to select and visualize annual precipitation
var precip_bioclim = bioclim.select('bio12');
var precip_vis = {min: 0, max: 10000,
  palette: ['white', '00008B', 'black']};
var precip = precip_bioclim.clip(roi);
//Map.addLayer(temp, temp_vis, 'Annual Mean Temperature');
//Map.addLayer(precip, precip_vis, 'Annual Precipitation');

//C. (optional) Use Surface Reflectance data

//load Landsat 8 surface reflectance data for 2019 over the roi
var L8_filter = ee.ImageCollection('LANDSAT/LC08/C01/T1_SR')
  .filterBounds(roi)
  .filterDate('2019-01-01', '2019-12-31');
//use a function to cloud mask the Landsat 8 SR data
//use bits 3 (cloud shadow) and 5 (cloud) & pixel QA band to filter
//flags in qa image should be equal to 0 meaning no cloud cover
//then return the masked image, scaled to [0,1]
function maskL8(image) {
  var cloudShadowBitMask = ee.Number(2).pow(3).int();
  var cloudsBitMask = ee.Number(2).pow(5).int();
  var qa = image.select('pixel_qa');
  var mask = qa.bitwiseAnd(cloudShadowBitMask).eq(0)
      .and(qa.bitwiseAnd(cloudsBitMask).eq(0));
  return image.updateMask(mask).divide(10000);}
//map the function over the 2019 data, take the median, and clip to the roi
var L8_median = L8_filter.map(maskL8)
                    .reduce(ee.Reducer.median())
                    .clip(roi);
//create a true color composite of the median bands to visualize
//Map.addLayer(L8_median, 
//  {bands: ['B4_median', 'B3_median', 'B2_median'], min: 0, max: 0.2},
//  'Landsat 8 Composite');
  
//D. Create a Composite of the Layers

//choose one option or the other below - you can only define variables once!
//first option only uses temperature and precipitation data
//create a new variable that adds the 2 bands together
//var enviro = temp.addBands(precip);
//var bands = enviro.bandNames();
//second option uses temperature, precipitation, and surface reflectance
var L8_bands = L8_median
  .select('B1_median', 'B2_median', 'B3_median', 'B4_median',
  'B5_median', 'B6_median', 'B7_median', 'B10_median', 'B11_median');
var enviro = L8_bands.addBands(temp).addBands(precip); 
var bands = enviro.bandNames();

//E. Sample the Input Imagery to get Training Data

//sample the values of the environmental bands at the species observation points
//to get a FeatureCollection of training data
var training = enviro.select(bands).sampleRegions({
  collection: vicugna,
  properties: [label],
  scale: 30});

//F. Train and Run a Discrete Classifier

//in GEE, the classifier is called smileRandomForest
//20 indicates the number of decision trees created
//all other parameters will be set to the default
var classifier_disc = ee.Classifier.smileRandomForest(20)
  .train({
  features: training,
  classProperty: label,
  inputProperties: bands});
//use the classifier and training points to classify the image
var classified_disc = enviro.select(bands).classify(classifier_disc);
Map.addLayer(classified_disc, 
  {min: 0, max: 1, palette: ['FFFFFF','031A00']}, 
  'Random Forest Discrete');

//G. Train and Run a Soft Classifier (probabilities)

//similar method as before, but add in probability mode
var classifier_prob = ee.Classifier.smileRandomForest(20).
setOutputMode('PROBABILITY')
.train({
  features: training,
  classProperty: label,
  inputProperties: bands});
//multiply by 100 to get values between 0 and 100
var classified_prob = enviro.select(bands).classify(classifier_prob).multiply(100);
Map.addLayer(classified_prob,
  {min:0, max:100, palette: ['FFFFFF','C6AC94','8D8846','395315','031A00']},
  "Random Forest Probability");

//H. Confusion Matrix representing Re-substitution Accuracy

//re-substitution accuracy can only be calculated on hard classifiers
//additionally, all it is telling us is with what frequency
//the actual class (training sites) agreed with the prediction (classified_disc)
var trainAccuracy = classifier_disc.confusionMatrix();
print('RF Resubstitution error matrix: ', trainAccuracy);
print('RF Training overall accuracy: ', trainAccuracy.accuracy());

//I. Additional Step

//Create an empty image to paint the roi features into
//This will allow us to see country boundaries as outlines
//(which will be less disruptive to the analysis)
Map.addLayer(ee.Image().paint(roi, 1, 2), {}, 'Region of Interest');

//J. Export Image

//export the image to your drive
//look to your task bar once the script has run to run the export
Export.image.toDrive({
  image: classified_prob,
  description: 'Random Forest Probability',
  maxPixels: 1e20,
  scale: 500,
  region: roi,
  folder: 'Advanced_Raster'});
