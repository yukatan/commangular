
## Installation.
***
* Using bower : ```bower install commangular ```
* Download it and add commangular.js or commangular.min.js to your index.html.

Remember to add commangular.js after angular.js. Commangular only depends on angularJs, it is not using other libraries.

##Quick Guide.
***
*Add commangular to your app.*

``` javascript 
//Add as a module dependency
angular.module('YourApp',['commangular'])
```
*Create a command using de commangular namespace*

``` javascript 
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
*Create a config block and inject the commangular provider.*

``` javascript 
//Config block in commands-config.js for example
angular.module('YourApp')
  .config(function($commangularProvider) {
  
  // Commands configuration goes here.
  //Create your sequence or parallel command structure and map it to an event name string
  $commandgularProvider.mapTo('HelloEvent')
   .asSequence()
      .add('HelloWorldCommand');
   });
```
*Inject the commangular service in your controller.*

``` javascript 
//Regular angular controller
angular.module('YourApp')
  .controller('MyCtrl',['$commangular','$scope',function($commangular,$scope) {
  
    $scope.onButtonClick = function() {
      $commangular.dispatch('HelloEvent');
    }

   });
```
*You can dispatch directly from any scope as well*

``` javascript 
//Regular angular controller
angular.module('YourApp')
  .controller('MyCtrl',['$scope',function($scope) {
  
    $scope.onButtonClick = function() {
      $scope.dispatch('HelloEvent');
    }

   });
```
*Or you can dispatch directly from the view*

```html 
<div ng-controller="CommandCtrl">
   <button ng-click="dispatch('HelloEvent')">Click Me</button>
</div>
```
You will see the message "Hello from my first command" in the logs when the HelloEvent is dispatched, so the command has been executed.