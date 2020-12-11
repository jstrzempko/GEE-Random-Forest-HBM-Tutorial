# Tutorial: Habitat Suitability Modeling using Random Forest Classification in Google Earth Engine

## Introduction

This tutorial was created on May 1st, 2020 as a final project for GEOG 296 Advanced Raster GIS at Clark University taught by Professor Florencia Sangermano. 

In recent decades, machine learning models have emerged as a prevalent mode of inductive modeling in the GIS community. Inductive or empirical models are ones in which known information is collected, observed for patterns, and applied to develop new theoretical frameworks. They are often defined in opposition to deductive models in which a hypothesis is formulated based on accepted paradigms and is tested using observable data to see if this information follows the general theory. In the field of habitat biodiversity or suitability modeling, a specific application of empirical modeling, data can be in the form of species observations/sightings which are then related to environmental variables to produce potential species range maps. 

The technique this tutorial will use is a form of supervised classification called Random Forest where the model is trained using species observations to generate an output map of potential species presence (Komodo, 2018). Random decision forests are an extension of Classification Tree Analysis (CTA) which are most often applied to remotely sensed data for land cover classification purposes. In a single classification tree, the input data (in this case pixels) is partitioned into increasingly homogeneous groups (classes) based on their relation to a set of predictor variables (spectral bands). While this method is robust to outliers, carries no assumptions, and is simple to understand, it is very unstable with small changes in the input producing very different decision trees. 

In response, random forest classification was developed as an extension of CTA where multiple decision trees are generated using random, but equally sized subsets of the data (with replacement) with majority voting often deciding the final class of a pixel (Brieman, 2011). In Google Earth Engine, various parameters of the Random Forest classifier can be modified to alter output. Several of these include the number of decision trees to create, the fraction of the input to “bag” per tree (the random subset selected), and the maximum number of lead nodes (classes) in each tree. With the ability to easily invoke and run classification algorithms across large, openly sourced datasets, Earth Engine presents ample geoprocessing opportunities to explore. 

# Objectives

-	Familiarize users with Google Earth Engine modeling applications
-	Walk users through a simple application of the Random Forest machine learning algorithm to habitat biodiversity modeling (HBM)
-	Highlight opportunities for users to explore beyond the scope of the tutorial by building off existing scripts

# Study Area

In this tutorial, the distribution of the Vicugna vicugna (vicuña) will be modeled.  The vicugna is a member of the camel family with relation to alpacas, llamas, and guanacos (Encyclopædia Britannica). They are found in South America in the Andes mountain range of southern Peru, western Bolivia, northwestern Argentina, and northern Chile. Though the vicugna has been hunted for centuries primarily for its fur, recent conservation efforts and a listing as vulnerable on the International Union for Conservation of Nature’s (IUCN) Red List have resulted in recovering population size. Through the use of observation points and environmental variables, we will create a potential species range map for the vicugna. 

# Data

Data for this tutorial is sourced from class resources (TerrSet tutorial data) as well as datasets readily available through Google Earth Engine. The first dataset to import is a point shapefile of observations of vicugna in South America. These were originally part of Exercise 6-3 HBM: Maxent in Chapter 6 of the TerrSet Tutorial. In order for Google Earth Engine to read these files, they need to be run through SHAPEIDR in TerrSet to convert from a .vct to a .shp file type. At this stage, “absence” points were added to the dataset in regions where it would be extremely unlikely to find vicugna (e.g. Amazon rainforest, lake, or coast) using ArcMap. In future applications, the location of these points should be based off expert or field-based recommendations. These points were given a presence value of 0 while original observation points were given a presence value of 1. Next, this shapefile was sent to a zipped folder so that Google Earth Engine could read it as a single file. This zipped folder is provided with this final project for ease of access. 

The analysis will also be based off open source environmental variables gathered from the Google Earth Engine search bar. Users should first search for WorldClim BIO Variables V1, a set of 19 global “bioclimatic” variables, compiled by University of California, Berkeley (Fick & Hijmans, 2017). They represent average values of various climatic variables for the years 1970-2000 and are available at a 1-kilometer spatial resolution. In the tutorial, users will learn how to select bands corresponding to annual mean temperature and annual precipitation. 

Additionally, users will search for and import USGS Landsat 8 Surface Reflectance Tier 1 data (USGS EROS, 2013). From these bands of atmospherically corrected surface reflectance, users will select the visible, near-infrared, short-wave infrared, and thermal infrared bands (effectively excluding the aerosol attributes, pixel quality attributes, and radiometric saturation quality assessment bands). Landsat 8 data is available at 30-meters spatial resolution and will be filtered for low cloud cover across 2019 to create composite bands.

Lastly, for visualization purposes, the LSIB: Large Scale International Boundary Polygons, Detailed dataset will be used to select a region of interest and visualize country boundaries in relation to the analysis outputs (US Dept of State, 2017). 

# Methodology

It is recommended that users have a working knowledge of JavaScript for Earth Engine before starting this tutorial. Sample code (that can be cut and pasted into the code editor) will be provided to guide the user along, but previous exposure to this mode of analysis and relevant syntax will enhance learning. Provided below are several introductory sites to get started.

Introduction to JavaScript for Earth Engine: https://developers.google.com/earth-engine/tutorial_js_01
(good overview of commonly used statements and basic data types)
Get Started with Earth Engine: https://developers.google.com/earth-engine/getstarted#the-code-editor
(helpful in exploring/locating parts of the Google Earth Engine Application Programming Interface (API))

Additionally, users will need an Earth Engine account. It is easiest if you have an existing google account. Google “Sign up for Google Earth Engine” or visit https://signup.earthengine.google.com and an email will be sent to your inbox when you are approved. Visit code.earthengine.google.com to get started. 

# Results

Link to final code: https://code.earthengine.google.com/10a6b8ef6aca75843c27ec161cf16a92
