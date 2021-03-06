starterControllers

.controller('HomeCtrl', ['$scope', '$rootScope', 'fireBaseData', '$ionicSlideBoxDelegate', 'utility', '$firebase',
  '$location', '$timeout', '$mdDialog', '$state', '$stateParams', 'homeSchema', function ($scope, $rootScope, fireBaseData,
   $ionicSlideBoxDelegate, utility, $firebase, $location, $timeout, $mdDialog, $state, $stateParams, homeSchema) {
    //bind model to scope; set valuation
    $scope.home = {};
    $scope.map = {};

    //test mode
    $scope.stopRecording = false;
    var homesDB = fireBaseData.refHomes();
    var houseIndexArr = [];
    $rootScope.$broadcast('loading:show');
    if (!$rootScope.houseIndexArr || $rootScope.houseIndexArr.length === 0) {
      houseIndexArr = Array.apply(null, {length: 13}).map(Number.call, Number);
      houseIndexArr = utility.shuffle(houseIndexArr);
      $rootScope.houseIndexArr = houseIndexArr;
    } else {
      houseIndexArr = $rootScope.houseIndexArr;
    }
    if ($stateParams.id) {
      $rootScope.singlehome = $firebase(fireBaseData.index($stateParams.id)).$asObject();
    } else {
      $rootScope.singlehome = $firebase(fireBaseData.index(houseIndexArr[0])).$asObject();
      $rootScope.houseIndexArr.splice(0, 1);
    }

    $rootScope.singlehome.$loaded().then(function () {
      //if user didn't specify a homeID
      if ($state.current.name === 'homeRandom') {
        houseIndexArr.splice(0, 1);
        $state.go('home', {'id': houseIndexArr[0]});
      }

      $timeout(function(){
        $rootScope.$broadcast('loading:hide');
      },100);

      if ($rootScope.authData && $rootScope.authData.admin) {
        $scope.AdminMode = $rootScope.authData.admin;
      }

      //We clone the object to prevent firebase's 3-way data binding. It messes up slidebox css and we don't need that feature.
      var clonedHome = angular.fromJson(angular.toJson($rootScope.singlehome));
      $scope.property = clonedHome;
      $scope.hideDetail = true;

      //TODO:refactor this
      if ($rootScope.authData && !$rootScope.authData.admin) {
        //User has valued this home before
        if ($state.current.name === 'home') {
          $scope.property.valuedThisHome = utility.hasValuedPropertyBefore($rootScope.authData.valuations, $scope.property.houseId/*.toString()*/);
        } else if ($state.current.name === 'bump') {
          $scope.property.valuedThisHome = utility.hasValuedPropertyBefore($rootScope.authData.bump, $scope.property.houseId/*.toString()*/);
        }
      }

      if ($rootScope.anonymousAuth) {
        if ($state.current.name === 'home') {
          $scope.property.valuedThisHome = utility.hasValuedPropertyBefore($rootScope.anonymousAuth.valuations, $scope.property.houseId.toString());
        } else if ($state.current.name === 'bump') {
          $scope.property.valuedThisHome = utility.hasValuedPropertyBefore($rootScope.anonymousAuth.bump, $scope.property.houseId.toString());
        }
      }

      $scope.valuation = {};
      //price slider
      $scope.home.minValuation = 100000;
      $scope.home.maxValuation = utility.maxCondoValue($rootScope.singlehome.size);

      // need to use this method and ng-init to bind the initial value. There's a bug in the range slider in ionic.
      $scope.getDefaultValue = function () {
        $scope.home.valuation = 100000;
      };
      $scope.getDefaultValue();

      //property naming handle here:
      //this won't work on IE8 or earlier version
      $scope.property.homeType = searchForObjName(homeSchema.homeTypes, $scope.property.homeType);

      var outdoorSpaceArr = [];
      if ($scope.property.outdoorSpace) {
        for (var j = 0; j < $scope.property.outdoorSpace.length; j++) {
          outdoorSpaceArr.push(searchForObjName(homeSchema.outdoorSpace, $scope.property.outdoorSpace[j]));
        }
      }
      $scope.property.outdoorSpace = outdoorSpaceArr;
      $scope.property.parkingType = searchForObjName(homeSchema.parkingType, $scope.property.parkingType);

      $scope.$broadcast('updateMap', $scope.property);
      $ionicSlideBoxDelegate.update();
      $scope.$broadcast('updateTabs');
      $scope.$broadcast('updateChart', $scope.map);

      $scope.saveCaption = function (data, imageIndex) {
        var house = homesDB.child($rootScope.singlehome.houseId);
        var captionRef = 'img/' + imageIndex + '/caption';
        house.child(captionRef).set(data);
        $timeout(function () {
          $ionicSlideBoxDelegate.update();
          return true;
        }, 100);
      };

      //post valuation modal popup
      var postValuationPopup = function () {
        if (!$scope.property.crowdvalue) {
          return;
        }
        $mdDialog.show({
          controller: 'ModalCtrl',
          templateUrl: 'src/display-home/modal-dialogs/post-valuation.html',
          locals: {
            valuation: $scope.valuation,
            houseId: $scope.property.houseId
          }
        }).then(function () {
          $scope.clickNext();
        }, function () {
          $scope.clickNext();
        });
      };
      //post valuation modal popup

      var postBumpPopup = function () {
        if (!$scope.property.crowdvalue) {
          return;
        }
        $mdDialog.show({
          controller: 'ModalCtrl',
          templateUrl: 'src/display-home/modal-dialogs/post-valuation-bump.html',
          locals: {
            valuation: $scope.valuation,
            houseId: $scope.property.houseId
          }
        }).then(function () {
          $scope.clickNext();
        }, function () {
          $scope.clickNext();
        });
      };
      //no more homes popup
      var noMoreHomesPopup = function () {
        $mdDialog.show({
          controller: 'ModalCtrl',
          templateUrl: 'src/display-home/modal-dialogs/no-more-homes.html',
          locals: {
            valuation: $scope.valuation
          }
        }).then(function () {
          //log something in user profile
          $scope.stopRecording = true;
        }, function () {
          $scope.stopRecording = true;
        });
      };

      $scope.submitScore = function () {
        $scope.valuation.crowdvalue = $scope.property.crowdvalue;
        $scope.valuation.accuracy = utility.getAccuracy($scope.home.valuation, $scope.property.crowdvalue);
        $scope.valuation.reputation = 'N/A';
        postValuationPopup();
        var auth = $scope.authData;
        if (!$scope.authData && $scope.anonymousAuth) {
          auth = $scope.anonymousAuth;
        }
        if (!$scope.stopRecording && auth) {
          if (!$scope.property.crowdvalue) {
            $rootScope.notify('This property has not been evaluated. Please continue to the next home.');
            return;
          }
          if (!auth.admin) {
            //User has valued this home before
            $scope.property.valuedThisHome = true;
          }
          var oldReputation = auth.reputation || 10;
          fireBaseData.saveValuation($scope.home.valuation, auth, $scope.property, $rootScope.analytics);
          var change = (auth.reputation - oldReputation).toFixed(1);
          $scope.valuation.reputation = auth.reputation.toFixed(1);
          $scope.valuation.reputationChange = (change < 0) ? '(' + change + ')' : '(+' + change + ')';
        }
        $rootScope.singlehome.valued += 1;
      };

      $scope.skip = function () {
        $ionicSlideBoxDelegate.slide(0);
        $ionicSlideBoxDelegate.update();
        $scope.clickNext();
        //mixpanel
        $rootScope.analytics.homeID = $scope.property.houseId;
        mixpanel.track("skipHome", $rootScope.analytics);
      };

      //mixpanel
      mixpanel.track("viewHome",{'homeID':$scope.property.houseId});

      $scope.clickNext = function () {
        var length = houseIndexArr.length;
        $scope.hideDetail = true;
        if ($rootScope.singlehome.valued >= length) {
          noMoreHomesPopup();
        }
        //if user already reached their trial or they just reached their trial
        if (($rootScope.reachedTrial === true && !$scope.authData) || ($rootScope.singlehome.valued % 4 === 3 && !$scope.authData)) {
          $rootScope.reachedTrial = true;
          $state.go('login');
          $rootScope.notify('Now that you are a pro at valuing homes, sign up to start tracking your reputation score!');
        } else {
          houseIndexArr.splice(0, 1);
          $state.go('home', {'id': houseIndexArr[0]});
        }
      };
    });

    var searchForObjName = function (arr, name) {
      var results = arr.filter(function (obj) {
        return obj.value === name;
      })[0];
      if (results) {
        return results.name;
      }
      return null
    }
  }]);

