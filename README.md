#Commangular             

[![Build Status](https://travis-ci.org/yukatan/commangular.png)](https://travis-ci.org/yukatan/commangular)

A command pattern implementation for AngularJS.

#Overview

Commangular is an abstraction that aims at simplifying the creation of operations in a clean self-contained unit and easily chain them together with a fluent API. It will allow you to maintain separate code units called commands with a single responsability.

Main features :

* Chaining of command in command groups.
* Execution of commands in sequence or in parallel.
* Any level of nesting in groups.
* Injection of an object from the angular context with the same syntax.
* Injection of precending results on the next command execution.
* Automatic promise resolution before next execution.
* Interception of command execution (on the way).
* Command cancelation(on the way).
* Custom result resolvers(on the way).
* Flows of commands with decision points to select the next commands based on result values(on the way).

#Instalation

* Using bower : ``` bower install commangular ```
* Download it and add commangular.js or commangular.min.js to your index.html.

Remember to add commangular.js after angular.js. Commangular only depends on angularJs, it is not using other libraries.

#Quick Guide
*Add commangular to your app.*
```javascript 
//Add as a module dependency
angular.module('YourApp',['commangular'])
```
*Create a command using de commangular namespace*
```javascript 
//hello-world-command.js
//You can inject the same that you inject in services or controllers
commangular.create('HelloWorldCommand',['$log',function($log) {
  
  return {
      //You can inject at method as well and remember that the name of the method must be "execute"
      //$http is not going to be used, is just to demostrate the injection on method
        execute: ['$http',function($http) {
        
          $log.log('Hello from my first command');
        }]
      }
  }
}]);
```
*Create a config block and inject de commangular provider.*
```javascript 
//Config block in commands-config.js for example
angular.module('YourApp')
  .config(function($commangularProvider) {
  
  // Commands configuration goes here.
  //Create your sequence or parallel command structure and map it to an event name string
  $commandgularProvider.asSequence()
    .add('HelloWorldCommand')
    .mapTo('HelloEvent');
    
   });
```
*Inject the commangular service in your controller.*
```javascript 
//Regular angular controller
angular.module('YourApp')
  .controller('MyCtrl',['$commangular','$scope',function($commangular,$scope) {
  
    $scope.onButtonClick = function() {
      $commangular.dispatch('HelloEvent');
    }

   });
```
You will see the message "Hello from my first command" in the logs so the command has been executed.






