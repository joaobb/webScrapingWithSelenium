var webdriver = require('selenium-webdriver');  //Including the selenium webDriver
var chrome = require('chromedriver');
var driver = null;
const delayFactor = 1;
const travelInsurance = 'CircleCover';          //Insurance company name
var site = require ('./' + travelInsurance + "/Index.js");        //Get the code for scrapping the exact website
var params = require('./' + travelInsurance + '/Data.js').data;   //Get test cases as JSONs
var currentParams = undefined;

var fs = require('fs');                                           //Allows the code to use os file system
const filePath = travelInsurance + '.csv';                        //File path for the CSV file, which data will be stores

driver = new webdriver.Builder()                                  //Builds selenium webdriver using chrome driver
.forBrowser('chrome')
.build();

driver.manage().window().maximize()                               //Maximize the window, since some websites have different input types depending on the window size
driver.get(site.url)                                              //Access the website

fs.writeFileSync(filePath, "Trip type,Destination,Group type,Days of trip,Ages,Package name,Package price\n\n")
console.log("Starting the CSV file");

LoopingParams();

console.log('Data scraping: ' + travelInsurance);

function LoopingParams(){
  console.log('Looping Params');
  if(params.length < 1){                                          //Parsed the whole JSON file
    console.log("Done");
    driver.quit()
    return;
  }
   currentParams = params.shift();

   ExecuteTestCases();
}

function ExecuteTestCases(){
      
  console.log('Running on: '+ JSON.stringify(currentParams));
  
  var groupType = currentParams.ages.length === 1 ? 'individual'
                : currentParams.ages.length === 2? 'couple'
                :'family';
      
  site.Run(
    currentParams.tripType,
    currentParams.location,
    groupType,
    currentParams.tripDays,
    currentParams.ages,
    delayFactor,
    driver,
    
    function(results){
      console.log("Results from the run: " + JSON.stringify(results));
      results.forEach(result => {
        AppendResultsToCSVFILE(result)  
      });
      driver.navigate().back();
      LoopingParams();
    });
};

function AppendResultsToCSVFILE(result){
  fs.appendFileSync(filePath,
    result.tripType + ','
  + result.location + ','
  + result.groupType + ','
  + result.tripDays + ','
  + result.ages.join(' & ') + ','
  + result.Name + ','
  + result.Price + ', \n'
  );
}