var webdriver = require('selenium-webdriver')
var By = webdriver.By

var tripTypes = {
  singletrip: 2,
  annualtrip: 3,
  cruisetrip: 4
}

var destination = {
  singletrip: {
    europe: 2,
    australia: 3,
    worldwideExclude: 4,
    worldwideInclude: 5,
    uk: 6
  },
  annualtrip: {
    europe: 2,
    worldwideInclude: 3
  },
  cruisetrip: {
    europe: 2,
    australia: 3,
    worldwideExclude: 4,
    worldwideInclude: 5,
    uk: 6
  }
}

module.exports = {
  url: 'https://www.circlecover.com',

  Run: function Run (tripType, location, groupType, tripDays, ages, delayFactor, driver, callbackResults) {
    var FinalResults = {
      PackageName: [],
      PackagePrice: []
    }

    Pause(5, setTripType)

    function setTripType () {
      var id = tripTypes[tripType]
      driver.findElement(By.xpath('// select [@id="ddPolicyType"]/option[' + id + ']')).click().then(setDestination())
    }

    function setDestination () {
      var id = destination[tripType][location]
      Pause(2, function() {
          driver.findElement(By.xpath('// select [@id="ddDestination"]/option[' + id + ']')).click().then(setTripDutation())
      })
    }

    function setTripDutation () {
      var dates = getDates(tripDays)
      driver.findElement(By.id('txtCoverStartDate')).sendKeys(dates[0])
      if (tripDays < 365) {
        driver.findElement(By.id('txtCoverEndDate')).click().then(function () {
          driver.findElement(By.id('txtCoverEndDate')).clear()
        }).then(function () {
          driver.findElement(By.id('txtCoverEndDate')).sendKeys(dates[1])
        })
      }
      setAges()
    }

    function getDates (tripDays) {
      let tomorrow = new Date()
      tomorrow.setTime(tomorrow.getTime() + 86400000)
      let finalDay = new Date()
      finalDay.setTime(tomorrow.getTime() + (tripDays * 86400000))

      return [(nF(tomorrow.getDate()) + '/' + nF(tomorrow.getMonth() + 1) + '/' + tomorrow.getFullYear()),
        (nF(finalDay.getDate()) + '/' + nF(finalDay.getMonth() + 1) + '/' + finalDay.getFullYear())]
    }

    function nF (numb) {
      return numb > 9 ? numb : '0' + numb
    }

    function setAges () {
      driver.findElement(By.xpath('// select [@id="ddlNoOfTravellers"]/option[' + ages.length + ']')).click()
      Pause(2, function () {
        for (let i = 0; i < ages.length; i++) {
          driver.findElement(By.id('tb_travellerAge_' + (i + 1))).clear().then(function () {
            driver.findElement(By.id('tb_travellerAge_' + (i + 1))).sendKeys(ages[i])
          })
        }
      })
      Pause(3, GoToPricePage)
    }

    function GoToPricePage () {
      driver.executeScript('document.getElementById("btnNext").click()')
      Pause(4, getPackageName)
    }

    function getPackageName () {
      driver.findElements(By.className('productheadings')).then(function (head) {
        for (let i = 0; i < head.length; i++) {
          head[i].getText().then(function (headText) {
            FinalResults.PackageName.push(headText)
          })
        }
      }).then(getPackagePrice())
    }

    function getPackagePrice () {
      driver.findElements(By.className('comparePriceJustPrice')).then(function (prices) {
        for (let i = 0; i < prices.length; i++) {
          prices[i].getText().then(function (price) {
            FinalResults.PackagePrice.push(price)
          })
        }
      })
      Pause(3, CompileResults)
    }

    function CompileResults () {
      var toReturn = []
      console.log('Raw results: ' + JSON.stringify(FinalResults))

      for (let i = 0; i < FinalResults.PackageName.length; i++) {
        toReturn.push({
          tripType: tripType,
          location: location,
          groupType: groupType,
          tripDays: tripDays,
          ages: ages,
          Name: FinalResults.PackageName[i],
          Price: FinalResults.PackagePrice[i]
        })
      }
      callbackResults(toReturn)
    }

    function Pause (Time, FuncName) {
      setTimeout(FuncName, Time * 1000)
    }
  }
}
