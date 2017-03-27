angular.module('starter.controllers', ['ngLodash','angular-svg-round-progressbar'])

.controller('DashCtrl', function($scope, Flights, Destinations, lodash, $q, $timeout) {
  
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
    }
  }

  var currentDate = new Date();
  $scope.travelInfo.arrivalDate = currentDate.getYear() + '-' + (currentDate.getMonth() + 1) + '-' + currentDate.getDate();

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

  function getNextPageDestionations(link, destinations) {
    var deferred = $q.defer();

    //alert('destinations');
    //alert(destinations.length);
    //alert('update pls');
    $scope.travelInfo.destinations = destinations;
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
          deferred.resolve(lodash.concat(destinations, response.data.destinations))
        }
      });

      return deferred;
  }

  $scope.getEligibleFlights = function() {

    //get your flights
    Flights.from($scope.travelInfo.yourLocation, $scope.travelInfo.arrivalDate)
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
    if ($scope.travelInfo.yourLocation.length < 1) {
      $scope.travelInfo.yourFilteredLocations = [];
    }
    else {
      $scope.travelInfo.yourFilteredLocations = lodash.filter(
        $scope.travelInfo.destinations,
        function(destination) {
          if(destination.publicName.english.indexOf($scope.travelInfo.yourLocation) > -1)
            return true;
          else 
            return false;
        });
    }
  }

  $scope.autoCompleteFriendLocation = function() {
    //return the airports that meet the criteria
    if ($scope.travelInfo.friendLocation.length < 1) {
      $scope.travelInfo.friendFilteredLocations = [];
    }
    else {
      $scope.travelInfo.friendFilteredLocations = lodash.filter(
        $scope.travelInfo.destinations,
        function(destination) {
          if(destination.publicName.english.indexOf($scope.travelInfo.friendLocation) > -1)
            return true;
          else 
            return false;
        });
    }
  }
})

.controller('ChatsCtrl', function($scope, Chats) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  $scope.chats = Chats.all();
  $scope.remove = function(chat) {
    Chats.remove(chat);
  };
})

.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
  $scope.chat = Chats.get($stateParams.chatId);
})

.controller('AccountCtrl', function($scope) {
  $scope.settings = {
    enableFriends: true
  };
});
