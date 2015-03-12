'use strict';


// Declare app level module which depends on filters, and services
angular.module('myApp', ['myApp.controllers', 'performance']).run(['performance-beacon',function(beacon){
    beacon.url('log/PerfLog');
}]);

