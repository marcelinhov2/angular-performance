var perf = angular.module('performance', []);

perf.factory('performance-beacon', [function () {

    var beacon='';
    return {
        url:function(){
            if(arguments[0]) {
                beacon = arguments[0];
            }
            return beacon;

        }
    }
}]);

/**
 * Listens for performanceLoaded events and sends a message to the beacon
 *
 * @see performanceLoaded
 */
perf.directive('performance', ['performance-beacon',function (beacon) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {

            var startTime = (new Date).getTime();
            var divs = [];
            var divTime={};

            scope.$on(attrs.performance+'_PERF_DONE', function (event, args) {
                var index = divs.indexOf(args);
                if (index >= 0) {
                    divTime[args.split('_')[0]]=(new Date).getTime() - startTime;
                    divs.splice(index, 1);
                }

                //Call beacon when all emits have been received
                if (index >= 0 && divs.length == 0) {
                    var finishTime = (new Date).getTime() - startTime;
                    var initialLoad = 0;
                    if (window.performance) {
                        initialLoad = window.performance.timing.domComplete - window.performance.timing.fetchStart;
                    }

                    initialLoad = (!initialLoad || initialLoad<0) ? 0:initialLoad;
                    finishTime = (!finishTime || finishTime<0) ? 0:finishTime;
                    var checkPointsStr='';
                    for (var key in divTime) {
                        if (divTime.hasOwnProperty(key)) {
                            checkPointsStr=checkPointsStr+key + "-" + divTime[key]+";";
                        }
                    }
                    var i = new Image();
                    i.src = beacon.url() + '?'+
                        'name=' + attrs.performance +'&'+
                        'content=' + finishTime + '&'+
                        'initial=' + initialLoad + '&'+
                        'checkPoints=' + checkPointsStr;
                }
            });

            scope.$on(attrs.performance+'_PERF_REGISTER', function (event, args) {
                divs.push(args);
            });
        }
    };
}]);

/**
 * Registers itself and watches a scope variable for changes to indicate that it is done
 *
 */
perf.directive('performanceLoaded', ['$timeout','$rootScope', function ($timeout,$rootScope) {

    return {
        restrict: 'A',
        link: function (scope, element, attrs) {

            var parent=attrs.performanceLoaded.split(":")[0],
                child=attrs.performanceLoaded.split(":")[1]
            $timeout(function () {
                $rootScope.$broadcast(parent+'_PERF_REGISTER', child+'_'+scope.$id);
            }, 0);


            var unwatchLoaded = scope.$watch(child, function (newValue, oldValue) {
                if (newValue) {

                    $rootScope.$broadcast(parent+'_PERF_DONE', child+'_'+scope.$id);
                    //Unregisters the $watch
                    unwatchLoaded();
                }
            });
        }
    }
}]);



