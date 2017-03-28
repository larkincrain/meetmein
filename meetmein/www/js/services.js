angular.module('starter.services', [])

.factory('Chats', function() {
  // Might use a resource here that returns a JSON array

  // Some fake testing data
  var chats = [{
    id: 0,
    name: 'Ben Sparrow',
    lastText: 'You on your way?',
    face: 'img/ben.png'
  }, {
    id: 1,
    name: 'Max Lynx',
    lastText: 'Hey, it\'s me',
    face: 'img/max.png'
  }, {
    id: 2,
    name: 'Adam Bradleyson',
    lastText: 'I should buy a boat',
    face: 'img/adam.jpg'
  }, {
    id: 3,
    name: 'Perry Governor',
    lastText: 'Look at my mukluks!',
    face: 'img/perry.png'
  }, {
    id: 4,
    name: 'Mike Harrington',
    lastText: 'This is wicked good ice cream.',
    face: 'img/mike.png'
  }];

  return {
    all: function() {
      return chats;
    },
    remove: function(chat) {
      chats.splice(chats.indexOf(chat), 1);
    },
    get: function(chatId) {
      for (var i = 0; i < chats.length; i++) {
        if (chats[i].id === parseInt(chatId)) {
          return chats[i];
        }
      }
      return null;
    }
  };
})

.factory('Flights', ['$http', 'API', function($http, API){

  return {
    all: function() {
      // get all the flights ????

      var endpoint = 'public-flights/flights';
      var queryString = 'app_id=' + API.apiID + '&app_key=' + API.apiKey;

      return $http({
        headers: {
          'ResourceVersion': 'v3'
        },
        method: 'GET',
        url: API.url + endpoint,
        params: {
          app_id: API.apiID,
          app_key: API.apiKey
        }
        //url: "https://api.schiphol.nl/public-flights/flights?app_id=123c5986&app_key=783c7c4154bf520a36f111be058ceb10&includedelays=false&page=0&sort=%2Bscheduletime"
      });
    },

    from: function(departureLocation, date) {
      //returns all the flights leaving from a specific location, to a given location, arriving on a certain date
      var endpoint = 'public-flights/flights';
      var queryString = 
        'app_id=' + API.apiID + 
        '&app_key=' + API.apiKey + 
        '&route=' + departureLocation & 
        '&scheduledate=' + date + 
        '&flightdirection=' + 'A';

      return $http({
        headers: {
          'ResourceVersion': 'v3'
        },
        method: 'GET',
        url: API.url + endpoint,
        params: {
          app_id: API.apiID,
          app_key: API.apiKey
        }
        //url: "https://api.schiphol.nl/public-flights/flights?app_id=123c5986&app_key=783c7c4154bf520a36f111be058ceb10&includedelays=false&page=0&sort=%2Bscheduletime"
      });

      return;
    },

    firstPage: function(departureLocation, date) {
      //get all the destinations on the first page

      var formattedDate = 
        date.getFullYear() + '-' +
        (date.getMonth() + 1) + '-' +
        date.getDate();


      var endpoint = 'public-flights/flights';
      var queryString = 
        '?app_id=' + API.apiID + 
        '&app_key=' + API.apiKey + 
        '&route=' + departureLocation + 
        '&scheduledate=' + formattedDate + 
        '&flightdirection=' + 'A';

      return $http({
        headers: {
          'ResourceVersion': 'v3'
        },
        method: 'GET',
        url: API.url + endpoint + queryString,
        params: {
          app_id: API.apiID,
          app_key: API.apiKey
        }
      });
    },

    fromLink: function(link) {
      // provided a link to a given page, will return the flights on that page
      return $http({
        headers: {
          'ResourceVersion': 'v3'
        },
        method: 'GET',
        url: link
      });      
    }    
  };
}])

.factory('Destinations', ['$http', 'API', function($http, API){
  return {
    all: function() {
      // get all the locations
      //start with the original call, make a call until all locations have been gathered

      var endpoint = 'public-flights/destinations';
      var queryString = 'app_id=' + API.apiID + '&app_key=' + API.apiKey;

      return $http({
        headers: {
          'ResourceVersion': 'v1'
        },
        method: 'GET',
        url: API.url + endpoint,
        params: {
          app_id: API.apiID,
          app_key: API.apiKey
        }
        //url: "https://api.schiphol.nl/public-flights/flights?app_id=123c5986&app_key=783c7c4154bf520a36f111be058ceb10&includedelays=false&page=0&sort=%2Bscheduletime"
      });
    },

    firstPage: function() {
      //get all the destinations on the first page
      var endpoint = 'public-flights/destinations';
      var queryString = 'app_id=' + API.apiID + '&app_key=' + API.apiKey;

      return $http({
        headers: {
          'ResourceVersion': 'v1'
        },
        method: 'GET',
        url: API.url + endpoint,
        params: {
          app_id: API.apiID,
          app_key: API.apiKey
        }
      });
    },

    fromLink: function(link) {
      // provided a link to a given page, will return the destinations on that page
      return $http({
        headers: {
          'ResourceVersion': 'v1'
        },
        method: 'GET',
        url: link
      });      
    },

    one: function(name) {
    }
  };
}])

.factory('Storage', ['$http', 'API', function(){
  return {
    save: function(name, item) {
      try{
        window.localStorage.setItem(name, JSON.stringify(item));
      } catch (ex) {
        return ex;
      }

      return true;
    },
    read: function(name) {
      return JSON.parse( window.localStorage.getItem( name ));
    }
  };
}]);
