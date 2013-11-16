#Commangular  (work in progress)           

[![Build Status](https://travis-ci.org/yukatan/commangular.png)](https://travis-ci.org/yukatan/commangular)

A command pattern implementation for AngularJS.

##Overview

Commangular is an abstraction that aims at simplifying the creation of operations in a clean self-contained unit and easily chain them together with a fluent API. It will allow you to maintain separate code units called commands with a single responsability.

###Main features :

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

##Instalation

* Using bower : ``` bower install commangular ```
* Download it and add commangular.js or commangular.min.js to your index.html.

Remember to add commangular.js after angular.js. Commangular only depends on angularJs, it is not using other libraries.

##Quick Guide
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
You will see the message "Hello from my first command" in the logs when the onButtonClick function is executed, so the command has been executed.

##Table of Contents (Extended guide)
* Creating commands
    * Commandgular namespace
    * The angular syntax
    * Returning results from commands

* [Using the provider](#using-the-provider)
    * [Building command sequences.](#building-command-sequences)
    * Building parallel commands.
    * Nesting commands.
    * Mapping commands to events
* Command execution
    * Dispatching an Event
    * Passing data to commands at dispatching time
    * Injection from angular context
    * Injection of preceding results
    * Returning promises from commands
    
##Using The Provider.

All the commands configuration of your application is done in a angular config block and with the $commangularProvider. The provider is responsible to build the command strutures and map it to the desired event names. You can create multiple configs blocks in angular, so you can have multiple commands config blocks to separate functional parts of your application.

###Building command sequences.
A command sequence is a group of commands where the execution of the next command doesn't happen until the preceding command completes it's execution and the result value has been resolved.

Example :

```javascript
commangular.create('Command1',['$log',function($log) {
  
  return {
        
        execute: function() {
        
          $log.log('Command1 executed');
        }]
      }
  }
}]);
commangular.create('Command2',['$log',function($log) {
  
  return {
        
        execute: function() {
        
          $log.log('Command2 executed');
        }]
      }
  }
}]);
commangular.create('Command3',['$log',function($log) {
  
  return {
        
        execute: function() {
        
          $log.log('Command3 executed');
        }]
      }
  }
}]);

//We create the sequence in a config block as follows

$commangularProvider.asSequence()
  .add('Command1')
  .add('Command2')
  .add('Command3')
  .mapTo('MyEvent');
  
```
When you dispatch 'MyEvent' from the commangular service the Command1 is going to be executed. After completion then the Command2 will be executed and then the Command3.

This is happening in a synchronous execution but what happen if some command has a asynchronous execution???  The result resolution will be explained below in the documentation but if Command1 is using $http and getting a promise, you can return that promise from the Command1 execute function and Command2 will not be executed until that promise has been resolved.

###Building parallel commands.

The main diference with sequeces is that the commands running in a parallel group dont wait for the execution of the others commands in the group.

Suppose this :

```javascript
commangular.create('Command1',['$http',function($http) {
  
  return {
        
        execute: function() {
          
          var promise = http.get('/user/list.json');
          return {result1:promise};
        }]
      }
  }
}]);
commangular.create('Command2',['$log',function($log) {
  
  return {
        
        execute: function() {
        
          $log.log('Command2 executed');
        }]
      }
  }
}]);

$commangularProvider.asParallel()
  .add('Command1')
  .add('Command2')
  .mapTo('ParallelExampleEvent');
  
```
The execution of Command1 is getting and returning a promise. Command2 wont wait for this promise resolution. So in this example Command2 will complete the execution before Command1.



  

##License

The MIT License

Copyright (c) 2013 Jesús Barquín Cheda

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.





