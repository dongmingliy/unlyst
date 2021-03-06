angular.module('starter.routes', [])

.config(function ($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider
    // Each tab has its own nav history stack:
  .state('homeRandom', {
    url: '/home',
    templateUrl: 'src/display-home/home.html',
    controller: 'HomeCtrl'
  })
  .state('home', {
    url: '/home/:id',
    templateUrl: 'src/display-home/home.html',
    controller: 'HomeCtrl'
  })
  .state('bump', {
    url: '/bump/:id',
    templateUrl: 'src/display-home/home-bump.html',
    controller: 'HomeCtrl'
  })
  .state('login', {
    url: '/login',
    templateUrl: 'src/auth/login.html',
    controller: 'LoginCtrl'
  })
  .state('register', {
    url: '/register',
    templateUrl: 'src/auth/register.html',
    controller: 'RegisterCtrl'
  })
  .state('myprofile', {
    url: '/myprofile',
    templateUrl: 'src/auth/user-profile.html',
    controller: 'LoginCtrl'
  })
  .state('myhome', {
    url: '/myhome',
    templateUrl: 'src/auth/home-profile.html',
    controller: 'LoginCtrl'
  })
  .state('messages', {
    url: '/messages',
    templateUrl: 'src/auth/user-messages.html',
    controller: 'LoginCtrl'
  })
  .state('addHome', {
    url: '/addHome',
    templateUrl: 'src/add-home/addhome1.html',
    controller: 'AddHomeCtrl'
  })

  .state('addHome2', {
    url: '/addHome2',
    templateUrl: 'src/add-home/addhome2.html',
    controller: 'AddHomeCtrl'
  })

  .state('addHome3', {
    url: '/addHome3',
    templateUrl: 'src/add-home/addhome3.html',
    controller: 'AddHomeCtrl'
  })
  .state('addHome4', {
    url: '/addHome4',
    templateUrl: 'src/add-home/addhome4.html',
    controller: 'AddHomeCtrl'
  })
  .state('addHomeSuccess', {
    url: '/success',
    templateUrl: 'src/add-home/success.html',
    controller: 'AddHomeCtrl'
    })
  .state('search', {
    url: '/search',
    templateUrl: 'src/search/search.html',
    controller: 'SearchCtrl'
  })
  .state('searchResult', {
    url: '/search?location&maxPrice&squarefoot&bedrooms&bathrooms',
    templateUrl: 'src/display-home/list.html',
    controller: 'searchResultCtrl'
  })
  .state('valuedHomes', {
    url: '/valuedHomes',
    templateUrl: 'src/display-home/list.html',
    controller: 'ValuedHomesCtrl'
  })
  .state('homeMapView', {
    url: '/mapview',
    templateUrl: 'src/display-home/map-view/map.html',
    controller: 'MapViewCtrl'
  })
  .state('likedHomes', {
    url: '/likedHomes',
    templateUrl: 'src/display-home/list.html',
    controller: 'LikedHomesCtrl'
  });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/home');
  //remove # from url
  //had to comment this out because ionic server does not supply html5mode. We'll need to use our custom node server to do this.
  //$locationProvider.html5Mode(true).hashPrefix('!');

});