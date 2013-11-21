#Commangular  (docs in progress)           

[![Build Status](https://travis-ci.org/yukatan/commangular.png)](https://travis-ci.org/yukatan/commangular)

A command pattern implementation for AngularJS.

##Overview

Commangular is an abstraction that aims at simplifying the creation of operations in a clean self-contained unit and easily chain them together with a fluent API. It will allow you to maintain separate code units called commands with a single responsability.

###Main features :

* Chaining of commands in command groups.
* Execution of commands in sequence or in parallel.
* Any level of nesting in groups.
* Dependency injection from angular.
* Injection of precending results on the next command execution.
* Automatic promise resolution before next execution.
* Flows of commands with decision points to select the next commands based on result or service values.
* Interception of command execution (on the way).
* Command cancelation(on the way).
* Custom result resolvers(on the way).
* 

##Instalation

* Using bower : ``` bower install commangular ```
* Download it and add commangular.js or commangular.min.js to your index.html.

Remember to add commangular.js after angular.js. Commangular only depends on angularJs, it is not using other libraries.


##Table of Contents (Extended guide)
* [Quick guide](#quick-guide)
* [Creating commands](#creating-commands)
    * [Commangular namespace](#commangular-namespace)
    * [How to create commands](#how-to-create-commands)
    * [The command config object](#the-command-config-object)
    * [Returning results from commands](#returning-result-from-commands)
* [Using the provider](#using-the-provider)
    * [Building command sequences.](#building-command-sequences)
    * [Building parallel commands.](#building-parallel-commands)
    * [Building command flows.](#building-command-flows)
    * [Nesting commands.](#nesting-commands)
    * [Mapping commands to events](#mapping-commands-to-events)
* Command execution
    * Dispatching an Event
    * Passing data to commands at dispatching time
    * Injection from angular context
    * Injection of preceding results
    * Returning promises from commands
* Unit testing commands


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
  $commandgularProvider.mapTo('HelloEvent')
   .asSequence()
      .add('HelloWorldCommand');
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


##Creating commands
###Commangular namespace

All the commands created by commangular are saved in the "commangular" namespace.The "commangular" namespace is attached to the window object.
There is a function attached to this namespace called commangular.create(). With this function you will be able to add new commands to the namespace.

###How to create commands

The create() function has this parameters :


_commangular.create([TheCommandName],[TheCommandFunction],[TheCommandConfig])_

* _TheCommandName_ : It's the name of the command you are creating. It's useful to reference the command from the command provider.
* _TheCommandFunction_ : It's the function that will be executed when commangular runs this command. It can be a normal function or an array with parameters. Same as angular syntax
* _TheCommandConfig_ : It's and object with paramaters to configure the command execution.


You can invoke the create function like this :

```javascript
//Command with the $log injected from angular
commangular.create('Command1',['$log',function($log) {
  
  return {
        
        execute: function() {
        
          $log.log('Command1 executed');
        }
      }
  }
}]);

//Command with the $log injected in the execute method
commangular.create('Command1',function() {
  
  return {
        
        execute:['$log',function() {
        
          $log.log('Command1 executed');
        }]
      }
  }
});

//Command telling commangular to keep the result in the result1 key in the execution context where Command1 is running using a command config object
commangular.create('Command1',['$log',function($log) {
  
  return {
        
        execute: function() {
        
          $log.log('Command1 executed');
          return "This is going to be available on result1 key";
        }
      }
  }
}],{resultKey:'result1'});
```

###The command config object

To setup the command execution, you can send to the create function an object with some properties inside. At this moment there is just one property you can set in the config object, but there will be more properties in the future.

Available properties :

* 'resultKey' : This property instruct commangular to keep the value returned by the command in the value key passed in 'resultKey'. It has to be a string. It means that after the execution of this commands you will be able to inject on the next command using that key and the result of the command will be injected.

###Returning result from commands

There are two main concepts you have to think when you return a value from a command.
* You always can inject that result on the next command using the property key lastResult like this :

```javascript
//Suppose this commands are executed on sequence

//Command that returns the result
commangular.create('Command1',function() {
  
  return {
        
        execute: function() {
            return "This will be injected on the next command"        
        }]
      }
  }
}]);
//Command that get the lastResult injected
commangular.create('Command2',['$log','lastResult',function($log,lastResult) {
  
  return {
        
        execute: function() {
            //this will print "This will be injected on the next command"
            $log.log(lastResult); 
        }]
      }
  }
}]);
```

* If you want the result of that command to be available for injection for all the execution context you have to use the command config like that :

```javascript
//Suppose this commands are executed on sequence

//Command that returns the result
commangular.create('Command1',function() {
  
  return {
        
        execute: function() {
            return "This will be injected on the next command"        
        }]
      }
  }
}],{resultKey:'theResult'}); //instructing commangular to keep that result.

//Command that get the result injected
commangular.create('Command2',['$log','theResult',function($log,theResult) {
  
  return {
        
        execute: function() {
            //this will print "This will be injected on the next command"
            $log.log(theResult); 
        }]
      }
  }
}]);
//This command will get the result from the Command1 as well.
commangular.create('Command3',['$log','theResult',function($log,theResult) {
  
  return {
        
        execute: function() {
            //this will print "This will be injected on the next command"
            $log.log(theResult); 
        }]
      }
  }
}]);
``` 
If the command is asynchronous it should return a promise. At the moment, all the promises are managed by commangular, so if you make an http call and you get a promise as a result you can return that promise. Commangular will wait until the promise is resolved or rejected. If the promise is resolved, the result will be available to the next command. if the promise is rejected all the command context execution is cancelled.

In the future you will be able to instruct commangular to use the promise as a result value and not to wait to promise resolution. 
    
##Using The Provider.

All the command configuration of your application is done in an angular config block and with the $commangularProvider. The provider is responsible to build the command strutures and map them to the desired event names. You can create multiple configs blocks in angular, so you can have multiple command config blocks to separate functional parts of your application.

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

$commangularProvider.mapTo('MyEvent')
   .asSequence()
      .add('Command1')
      .add('Command2')
      .add('Command3');

```
When you dispatch 'MyEvent' from the commangular service, the Command1 is going to be executed. After completion, the Command2 will be executed and then the Command3.

This happens in a synchronous execution, but what happen if some command has an asynchronous execution???. The result resolution will be explained below in the documentation, but if Command1 is using $http and getting a promise, you can return that promise from the Command1 execute function and Command2 will not be executed until that promise has been resolved.

###Building parallel commands.

The main diference with sequeces is that the commands running in a parallel group don't wait for the execution of the others commands in the group.

It has not sense to use parallel commands, if these commands are not returning a promise. Javascript has just one thread of execution so it is not posible to run synchronous commands at the same time.
It's a perfect fit for http request. While the http request is waiting the response other commands can be executed.

Suppose this :

```javascript
commangular.create('Command1',['$http',function($http) {
  
  return {
        
        execute: function() {
          
          var promise = $http.get('/user/list.json');
          return promise;
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

$commangularProvider.mapTo('ParallelExampleEvent')
   .asParallel()
      .add('Command1')
      .add('Command2');
  
  
```
The execution of Command1 returns a promise. Command2 won't wait for this promise resolution. So, in this example, Command2 will complete the execution before Command1.

##Nesting commands

Yuo can create any kind of commands nesting with commangular. You can create a sequence of parallel commands or sequences in parallel. It's better to show it in code :

```javascript

//You can user vars
var parallel1 = $commangularProvider.asParallel().add('Command3').add('Command4').create();

$commangularProvider.mapTo('ParallelExampleEvent')
   .asSequence()
      .add('Command1')
      .add('Command2')
      .add(parrallel);

//You can use inline

$commangularProvider.mapTo('ParallelExampleEvent')
   .asSequence()
      .add('Command1')
      .add('Command2')
      .add($commangularProvider.asParallel()
         .add('Command3')
         .add('Command4'));

//Any level of nesting is allowed and all commands are executed in the same comand context
//You can reuse commands in the same or others command groups
$commangularProvider.mapTo('ParallelExampleEvent')
   .asSequence()
     .add('Command1')
     .add('Command2')
     .add($commangularProvider.asParallel()
            .add($commandgularProvider.asParrallel()
                  .add('Command7')
                  .add('Command1'))
            .add('Command4'));
            
//Nesting with flows

$commangularProvider.mapTo('ParallelExampleEvent')
   .asSequence()
      .add('Command1')
      .add($commangularProvider.asFlow()
         .resultLink('result1','isAdmin').to('Command4')
         .serviceLink('userProfile','isAdmin',false).to('Command4'))
      .add($commangularProvider.asParallel()
         .add('Command3')
         .add('Command4'));


```


  

##License

The MIT License

Copyright (c) 2013 Jesús Barquín Cheda

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.





