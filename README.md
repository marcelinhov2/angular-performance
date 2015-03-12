
##Page Load vs Perceived Page Load


In a traditional page, measuring the page performance is quite easy; a request is made, the server responds with some HTML and the browser renders it.  Done.

![Traditional](http://farm3.staticflickr.com/2852/9727108341_c6081f9fb3_o.png)

A lot of the rendering logic is taken care of as part of the server processing and so looking at `Window Load` and `DOMContentReady` are good indicators of page performance.

In a Single Page Application, things get trickier.  The `Window Load` is only the beginning - that's when the JavaScript has been delivered to the browser, at which point the client-side logic - all the real work - kicks in and begins rendering the page, making API calls and setting up listeners, events, etc.

![SPA](http://farm8.staticflickr.com/7393/9727108327_91103f0d03_o.png)

The DOM is then continuously manipulated as part of user interaction or monitoring, polling and other events. As you can see, the traditional definition of a page being 'done' doesn't apply here.

The *perceived* page performance is how long the user thinks the major elements of the page took to load. By definition it is highly subjective - some users may think that the page is loaded just because the initial furniture appears.  But for most users this will be the parts of the page they consider most important.  

##So how do we measure perceived page performance?

The *perceived* page load is when all of the important dynamic parts of the page have been filled.  This requires the developers to agree upon what the most important parts are, and to programmatically indicate when the specific portions are done.  It's an inexact science and the results will vary from user to user due to machine specs, network latency and other environmental factors, but you get a good idea of the timings involved and what users are actually experiencing.  

Because this is a client side operation, a few components are required:

1. An indicator placed on various parts of the page to watch that specific portion of the page (eg. article body, top articles, but not header or featured stories).
2. A listener which waits to be informed by all of the indicators; internally the listener can set up various timers as necessary.
3. A beacon which the listener can send the aggregate information to once it is satisfied that all of the indicators have reported to it.  This beacon usually takes the form of an empty image, with timings passed in the querystring.

        /log/PerfLog?name=First&content=1853&initial=2746&checkPoints=DataLoaded-1853;

    The above means it took the ArticleView page 1011 milliseconds for its *initial* load and 3913 milliseconds to load the actual *content* (the perceived load time).

    If Multiple check points are added data can drilled down from the url shown below

        /log/PerfLog?name=Third&content=9444&initial=2746&checkPoints=Object2-1803;Object3-8554;Object1-9444;Status.Complete-9444;


4. The beacon requests will be stored in your web server logs, and a log parsing application (eg. logster) can retrospectively process it, grab the information and store it your aggregating service (eg. graphite).


![components](http://farm8.staticflickr.com/7417/9758863125_b186c911d3_o.png)


##Using the performance directives

The listener shown above is the `performance` directive.  Place this attribute at the beginning of your angular view.  

    <div performance="PageName">
    
The `performance-beacon` service indicates where the HTTP request should go when perceived page load is complete.

    angular.module('myApp', ['myApp.controllers', 'performance']).run(['performance-beacon',function(beacon){
        beacon.url('log/PerfLog');
    }]);

The watchers above are the `performance-loaded` directives.  Place these attributes anywhere within the view and set its value to an object on the `$scope`. Prepend each scope variable with its parentListener name seperated by ':'  For example, you can do this

    performance-loaded="Third:Object1"
    
This directive will watch the `$scope.Object1` object and mark loading as done when this object contains a value.  You can control this further by using an object just for this directive:

    performance-loaded="Third:Object2"
    performance-loaded="Third:Object3"
    
If multiple check points are required, use the same directive like above and this directive will watch the objects `$scope.Object2` and `$scope.Object3` and mark loading as done when this object contains a value. And in your controller, only set `$scope.Status.Complete = true` when you feel that all the processing is complete.  This is useful when your controller makes multiple API calls and you need to wait for all of them to complete before indicating that loading is complete.

 
Ensure that the `performance loaded` directives sit within the scope of the `performance` directive.  In other words, the `performance-loaded` directives should be in the same controller as `performance` or in a 'sub-controller' inside it.  

**Correct:**

    <div ng-controller="MyController" performance="PageName">
        <div performance-loaded="ProductsFromAPI">
    </div>
    
**Correct:**

    <div ng-controller="MyController" performance="PageName">
        <div ng-controller="SomeOtherController" performance-loaded="ProductsFromAPI">
    </div>

**Incorrect:**

    <div ng-controller="MyController" performance="PageName">
        ....
    </div>
    <div performance-loaded="ProductsFromAPI">

**Incorrect:**

    <div ng-controller="MyController" performance="PageName">
        ....
    </div>
    <div ng-controller="SomeOtherController" performance-loaded="ProductsFromAPI">



## Demo/Code

Look at [index.html](https://github.com/sandeeptharayilGit/angular-performance/blob/master/sample/index.html) and [controllers.js](https://github.com/sandeeptharayilGit/angular-performance/blob/master/sample/js/controllers.js) to see how it's done.

You can use [angular-performance.js](https://raw.github.com/sandeeptharayilGit/angular-performance/master/src/angular-performance.js) or its [minified version](https://raw.github.com/sandeeptharayilGit/angular-performance/master/build/angular-performance.min.js).


## Other methods
Understandably, this may not always be the best approach for you. Projects differ in structure as well as the benefit of effort. You may find that simply using a stopwatch and visually sighting the page is a good enough approach. It sounds crude and unscientific, but can still be considered a legitimate indicator of what users are experiencing. The best approach here is to spin up a few cloud instances in different geographies and navigate to the site several times, taking the average. It's manual and it works.

Another possible avenue to explore is the upcoming [User Timing Marks](http://www.w3.org/TR/user-timing/) specified in the W3C draft. This works by having your code emit marks

    performance.mark("Loaded product detail");

And having a listener such as WebPageTest record them. This allows for automation and indication as well as recording of important points of the page's lifecycle.

## License

[MIT License](https://github.com/sandeeptharayilGit/angular-performance/blob/master/LICENSE)
