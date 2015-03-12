'use strict';

/* Controllers */

var controllers = angular.module('myApp.controllers', []).run(function($rootScope){
    $rootScope.Loadd=false;
    console.log("$rootScope.Loadd="+$rootScope.Loadd);
})

controllers.controller('Controller1', ['$scope', '$timeout','$rootScope', function($scope, $timeout,$rootScope) {
$scope.PageLoaded=true;
    $timeout(function() {
        $scope.DataLoaded = true;
        $rootScope.Loadd=true;
        console.log("$rootScope.Loadd="+$rootScope.Loadd);
        console.log("Controller 1 Done");
    }, (Math.random()*10)*1000);
}]);


controllers.controller('Controller2', ['$scope', '$timeout', function($scope, $timeout){

    $scope.PageLoaded=true;

    $timeout(function() {
        $scope.DataLoaded=true;
        $scope.Products = { Names: ['Banana','Phone'], SaleType: 'TodayOnly' };
        console.log("Controller 2 Done");
    }, (Math.random()*10)*1000);


}]);




controllers.controller('Controller3', ['$scope', '$timeout', function($scope, $timeout){
    $scope.PageLoaded=true;
    var loaded = function() {
        if($scope.Object1 && $scope.Object2 && $scope.Object3){
            $scope.DataLoaded=true;
            console.log("Controller 3 Done");
            $scope.Status = { Complete: true }
        }
    }


    $timeout(function() {
        $scope.Object1 = {x:193};

        loaded();
    }, (Math.random()*10)*1000);


    $timeout(function() {
        $scope.Object2 = {y:293};

        loaded();
    }, (Math.random()*10)*1000);


    $timeout(function() {
        $scope.Object3 = {z:444};

        loaded();
    }, (Math.random()*10)*1000);

}]);
