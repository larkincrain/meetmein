angular.module('starter.controllers', ['ngLodash','angular-svg-round-progressbar'])

.controller('DashCtrl', function($scope, Flights, Destinations, lodash, $q, $timeout, Storage) {
  
  $scope.travelInfo = {
    country: 'Amsterdam',
    yourLocation: '',
    friendLocation: '',
    arrivalDate: '',
    flights: [],
    yourEligibleFlights: [],
    friendEligibleFlights: [],
    destinations: [],
    yourFilteredLocations: [],
    friendFilteredLocations: []
  };

  $scope.metaInfo = {
    destinations: {
      total: 0,
      fetched: 0
    },
    flights: {
      your: {
        total: 0,
        fetched: 0
      },
      friend: {
        total: 0,
        fetched: 0        
      }
    }
  };

  var currentDate = new Date();
  $scope.travelInfo.arrivalDate = currentDate.getYear() + '-' + (currentDate.getMonth() + 1) + '-' + currentDate.getDate();

  $scope.getDestinations = function() {
    Destinations.firstPage()
    .then(function(response){

      var links = response.headers('Link');

      if (links)
        links = links.split(',');

      var totalLinks = lodash.find(
        links,
        function(link) {
          if(link.indexOf('last') > -1 ) 
            return true;
          else
            return false;
        });

      //get the total number of pages
      $scope.metaInfo.destinations.total = parseInt(totalLinks.substring(totalLinks.indexOf('&page=') + 6, totalLinks.indexOf('>;')))

      var nextLinks = lodash.find(
        links,
        function(link) {
          if (link.indexOf('next') > -1 )
            return true;
          else
            return false;
        });

      if (nextLinks.length > 0) {
        $scope.metaInfo.destinations.fetched ++;
        getNextPageDestionations(
          nextLinks.substring(nextLinks.indexOf('<') + 1, nextLinks.indexOf('>')),
          response.data.destinations
          )
            .then(function(data) {
            });
      }        
    });
  }

  function getNextPageDestionations(link, destinations) {
    var deferred = $q.defer();

    //alert('destinations');
    //alert(destinations.length);
    //alert('update pls');
    $scope.travelInfo.destinations = destinations;
    Storage.save('destinations', destinations);
    //alert($scope.travelInfo.destinations.length);
                
    Destinations.fromLink(link)
      .then(function(response) {
        var links = response.headers('Link');

        if (links)
          links = links.split(',');

        var nextLinks = lodash.find(
        links,
        function(link) {
          if (link.indexOf('next') > -1 )
            return true;
          else
            return false;
        });

        if (nextLinks.length > 0) {
          $scope.metaInfo.destinations.fetched ++;
          getNextPageDestionations(
            nextLinks.substring(nextLinks.indexOf('<') + 1, nextLinks.indexOf('>')),
            lodash.concat(destinations, response.data.destinations)
            )
              .then(function(data) {                
                deferred.resolve(lodash.concat(destinations, response.data.destinations));                
              });
        } else {
          //we're at the last of the pages
          deferred.resolve(lodash.concat(destinations, response.data.destinations));

        }
      });

      return deferred;
  }

  $scope.getEligibleFlights = function() {

    alert('get flights');

    $q.all([
      $scope.getYourFlights(),
      $scope.getFriendFlights()])
      .then(function(data){
        alert('done!');
        
        //we have all the flights for you and the friend
        
        $scope.findBestMatch();
      });
  }

  $scope.findBestMatch = function() {
    //find which pair of flights yields the shortest wait time

    alert('matching the best flights together');
    //$scope.yourEligibleFlights.map(function())
  }

  $scope.getYourFlights = function() {
    var deferred = $q.defer();

    Flights.firstPage($scope.travelInfo.yourFilteredLocations.iata, $scope.travelInfo.arrivalDate)
    .then(function(response){
      var links = response.headers('Link');

      if (links)
        links = links.split(',');

      if (links) {
        var totalLinks = lodash.find(
          links,
          function(link) {
            if(link.indexOf('last') > -1 ) 
              return true;
            else
              return false;
          });

        //get the total number of pages
        $scope.metaInfo.flights.your.total = (parseInt(totalLinks.substring(totalLinks.indexOf('&page=') + 6, totalLinks.indexOf('>;'))) || 0)

        var nextLinks = lodash.find(
          links,
          function(link) {
            if (link.indexOf('next') > -1 )
              return true;
            else
              return false;
          });

        if (nextLinks.length > 0) {
          $scope.metaInfo.flights.your.fetched ++;
          getNextPageYourFlights(
            nextLinks.substring(nextLinks.indexOf('<') + 1, nextLinks.indexOf('>')),
            response.data.flights
            )
              .then(function(data) {
                alert('got second page of your flights');
                $scope.travelInfo.yourEligibleFlights = response.data.flights;
                //alert('your flight - resolving!');
                deferred.resolve(data);
              });
        }        
      } else {
        $scope.travelInfo.yourEligibleFlights = response.data.flights;
        //alert('your flight - resolving!');
        deferred.resolve(response.data.flights);
      }
    });

    return deferred.promise;
  }

  $scope.getFriendFlights = function() {
    var deferred = $q.defer();

    Flights.firstPage($scope.travelInfo.friendFilteredLocations.iata, $scope.travelInfo.arrivalDate)
    .then(function(response){

      var links = response.headers('Link');

      if (links)
        links = links.split(',');

      if (links) {
        var totalLinks = lodash.find(
          links,
          function(link) {
            if(link.indexOf('last') > -1 ) 
              return true;
            else
              return false;
          });

        //get the total number of pages
        $scope.metaInfo.flights.friend.total = (parseInt(totalLinks.substring(totalLinks.indexOf('&page=') + 6, totalLinks.indexOf('>;'))) || 0)

        var nextLinks = lodash.find(
          links,
          function(link) {
            if (link.indexOf('next') > -1 )
              return true;
            else
              return false;
          });

        if (nextLinks.length > 0) {
          $scope.metaInfo.flights.friend.fetched ++;
          getNextPageFriendFlights(
            nextLinks.substring(nextLinks.indexOf('<') + 1, nextLinks.indexOf('>')),
            response.data.flights
            )
              .then(function(data) {
                //alert('friend flight - resolving!');
                $scope.travelInfo.friendEligibleFlights = response.data.flights;
                deferred.resolve(data);
              });
        }        
      } else {
        //alert('friend flight - resolving!');
        $scope.travelInfo.friendEligibleFlights = response.data.flights;
        deferred.resolve(response.data.flights);
      }

    });

    return deferred.promise;
  }

  function getNextPageYourFlights(link, flights) {
    var deferred = $q.defer();

    //alert('destinations');
    //alert(destinations.length);
    //alert('update pls');
    $scope.travelInfo.yourEligibleFlights = flights;
    Storage.save('yourFlights', flights);
    //alert($scope.travelInfo.destinations.length);
                
    Destinations.fromLink(link)
      .then(function(response) {
        var links = response.headers('Link');

        if (links)
          links = links.split(',');

        if (links) {
        var nextLinks = lodash.find(
        links,
        function(link) {
          if (link.indexOf('next') > -1 )
            return true;
          else
            return false;
        });

        if (nextLinks.length > 0) {
          $scope.metaInfo.flights.your.fetched ++;
          getNextPageYourFlights(
            nextLinks.substring(nextLinks.indexOf('<') + 1, nextLinks.indexOf('>')),
            lodash.concat(flights, response.data.flights)
            )
              .then(function(data) {
                alert('getting deep');                
                deferred.resolve(lodash.concat(flights, response.data.flights));                
              });
        } else {
          //we're at the last of the pages
          alert('deferring - last page');
          deferred.resolve(lodash.concat(flights, response.data.flights));

        }
      } else {
        alert('deferring - no next link');
        deferred.resolve(lodash.concat(flights, response.data.flights));        
      }
      });

    return deferred;
  }

  function getNextPageFriendFlights(link, flights) {
    var deferred = $q.defer();

    //alert('destinations');
    //alert(destinations.length);
    //alert('update pls');
    $scope.travelInfo.friendEligibleFlights = flights;
    Storage.save('friendFlights', flights);
    //alert($scope.travelInfo.destinations.length);
                
    Destinations.fromLink(link)
      .then(function(response) {
        var links = response.headers('Link');

        if (links)
          links = links.split(',');

        if (links) {
        var nextLinks = lodash.find(
        links,
        function(link) {
          if (link.indexOf('next') > -1 )
            return true;
          else
            return false;
        });

        if (nextLinks.length > 0) {
          $scope.metaInfo.flights.friend.fetched ++;
          getNextPageFriendFlights(
            nextLinks.substring(nextLinks.indexOf('<') + 1, nextLinks.indexOf('>')),
            lodash.concat(flights, response.data.flights)
            )
              .then(function(data) {                
                deferred.resolve();                
              });
        } else {
          //we're at the last of the pages
          deferred.resolve();
        }
      } else {
        //we're at the last of the pages
        deferred.resolve();
      }

      });

    return deferred;
  }

  $scope.getAllFlights = function() {
    Flights.from()
      .then(function(data) {
        $scope.travelInfo.flights = data.data.flights;
        $scope.travelInfo.flights.forEach(function (flight) {
          flight.route.destinations.forEach(function(destination) {
            if (destination == $scope.travelInfo.yourLocation || destination == $scope.travelInfo.friendLocation) {
              $scope.travelInfo.eligibleFlights[$scope.travelInfo.eligibleFlights.length] = flight;
            }
          });
        });
      });
  }

  $scope.getAllDestinations = function() {
    Destinations.all()
      .then(function(data) {
        //alert('got data');
        $scope.travelInfo.destinations = data.data.destinations;
        //alert('got: ' + $scope.destinations.length + ' destinations!');
      });
  }

  $scope.autoCompleteYourLocation = function() {
    //return the airports that meet the criteria
    if ($scope.travelInfo.yourLocation.length <= 2) {
      $scope.travelInfo.yourFilteredLocations = [];
    }
    else if ($scope.travelInfo.yourLocation.length > 2){
      $scope.travelInfo.yourFilteredLocations = lodash.filter(
        $scope.travelInfo.destinations,
        function(destination) {
          if(destination.publicName.english.indexOf($scope.travelInfo.yourLocation) > -1)
            return true;
          else 
            return false;
        });

      // add in destinations that match the iata code
      // if ($scope.travelInfo.yourLocation.length == 3) {
      //   $scope.travelInfo.yourFilteredLocations = $scope.travelInfo.yourFilteredLocations.concat(
      //     lodash.filter(
      //       $scope.travelInfo.destinations,
      //       function(destination) {
      //         if(destination.iata.indexOf($scope.travelInfo.yourLocation) > -1)
      //           return true;
      //         else 
      //           return false;
      //       })
      //     );        
      // }
    }
  }

  $scope.autoCompleteFriendLocation = function() {
    //return the airports that meet the criteria
    if ($scope.travelInfo.friendLocation.length <= 2) {
      $scope.travelInfo.friendFilteredLocations = [];
    }
    else if ($scope.travelInfo.friendLocation.length > 2) {
      $scope.travelInfo.friendFilteredLocations = $scope.travelInfo.friendFilteredLocations.concat(
        lodash.filter(
          $scope.travelInfo.destinations,
          function(destination) {
            if(destination.publicName.english.indexOf($scope.travelInfo.friendLocation) > -1)
              return true;
            else 
              return false;
          })
        );

      // add in destinations that match the iata code
      // if ($scope.travelInfo.friendLocation.length == 3) {
      //   $scope.travelInfo.friendFilteredLocations += lodash.filter(
      //     $scope.travelInfo.destinations,
      //     function(destination) {
      //       if(destination.iata.indexOf($scope.travelInfo.friendLocation) > -1)
      //         return true;
      //       else 
      //         return false;
      //     });        
      // }
    }
  }

  $scope.saveYourLocation = function(destination) {
    $scope.travelInfo.yourFilteredLocations = destination;
    $scope.travelInfo.yourLocation = destination.publicName.english;
  }

  $scope.saveFriendLocation = function(destination) {
    $scope.travelInfo.friendFilteredLocations = destination;
    $scope.travelInfo.friendLocation = destination.publicName.english; 
  }

  if (!Storage.read('destinations')) {
    $scope.getDestinations();
  } else {
    $scope.travelInfo.destinations = Storage.read('destinations');
  }

})


.controller('AccountCtrl', function($scope) {
  $scope.user = {};


});
