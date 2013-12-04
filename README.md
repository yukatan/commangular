#Commangular        

[![Build Status](https://travis-ci.org/yukatan/commangular.png)](https://travis-ci.org/yukatan/commangular)

Command pattern implementation for AngularJS.

##Overview

Commangular is an abstraction that aims at simplifying the creation of operations in a clean self-contained unit and easily chain them together with a fluent API. It will allow you to maintain separate code units called commands with a single responsability.

###Main features :

* Chaining commands in command groups.
* Command execution in sequence or parallel.
* Nesting commands at any level.
* Dependency injection from angular.
* Preceding result injection.
* Cancelation and pause based on promises
* Command flows with decision points. 
* Command aspects (Interception of command execution).
* Custom result resolvers(on the way).


##Instalation

* Using bower : ``` bower install commangular ```
* Download it and add commangular.js or commangular.min.js to your index.html.

Remember to add commangular.js after angular.js. Commangular only depends on angularJs, it is not using other libraries.


##Table of Contents
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
* [Command execution](#command-execution)
   * [Dispatching events.](#dispatching-events)
   * [The command execution context.](#the-command-execution-context)
   * [Command livecycle.](#command-livecycle)
   * [Passing data to commands at dispatching time.](#passing-data-to-commands-at-dispatching-time)
   * [Injection from angular context.](#injection-from-angular-context)
   * [Returning promises from commands.](#returning-promises-from-commands)
* Command Aspects (Advanced interception).
   * Intercepting commands.
   * @Before.
   * @After.
   * @AfterThrowing.
   * @Around.
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
*Create a config block and inject the commangular provider.*
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
*You can dispatch directly from any scope as well*
```javascript 
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


##Creating commands
###Commangular namespace

All the commands created by commangular are saved in the "commangular" namespace.The "commangular" namespace is attached to the window object.
There is a function attached to this namespace called commangular.create(). With this function you will be able to add new commands to the namespace.

###How to create commands

The create() function has this parameters :


_commangular.create([CommandName],[CommandFunction],[CommandConfig])_

* _CommandName_ : It's the name of the command you are creating. It's useful to reference the command from the command provider.
* _CommandFunction_ : It's the function that will be executed when commangular runs this command. It can be a normal function or an array with parameters. Same as angular syntax
* _CommandConfig_ : It's and object with paramaters to configure the command execution.


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


##Building command flows

A command flow is a decision point inside the command group.You can have any number of flows inside a command group and nesting them how you perfer.

```javascript
$commangularProvider.mapTo('FlowsEvent')
   .add('Command1') // returns "result1"
   .add($commangularProvider.asFlow()
   // Command2 will be executed only if the value of the preceding "result1" is true.
      .resultLink('result1',true).to('Command2')
   // Command3 will be executed only if the value of the property "isAdmin" of "userModel" service is true.   
      .serviceLink('userModel','isAdmin',true).to('Command3')) 
```
You have two options to link on flows :

* resultLink : It links the command execution to the value of a preceding result. As you can see in the example, Command1 returns "result1" and then in the flow "resultLink" uses that value to decide wether 'Command2' should be executed.
* serviceLink : It links the command execution to the actual value of an angular service. As you can see in the example, if "userModel.isAdmin == true" then Command3 will be executed. The evaluation of the condition is done every time the FlowsEvent is dispatched, so if "userModel.isAdmin = false", The next time the FlowsEvent is dispatched 'Command3' won't be executed.

The link can be done to any kind of command group :

```javascript
var sequence = $commangularProvider.asSequence().add('Seq1Command').add('Seq2Command');
var parallel = $commangularProvider.asParallel().add('Par1Command').add('Par2Command');
var otherFlow = $commangularProvider.asFlow().serviceLink('userModel','logged',true).to('UserLoggedCommand');

$commangularProvider.mapTo('FlowsEvent')
   .add('Command1') // returns "result1"
   .add($commangularProvider.asFlow()
   // Link to sequence
      .resultLink('result1',true).to(sequence)
   // Link to parallel   
      .serviceLink('userModel','isAdmin',true).to(parallel)
      .resultLink('result1',false).to(otherFlow)); 
```

##Nesting commands

You can create any kind of commands nesting with commangular. You can create a sequence of parallel commands or sequences in parallel. It's better to show it in code :

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
## Command Execution
### Dispatching events

Events in commangular are just strings. When an event is dispatched, commangular executes the command group mapped to that string. There are three ways to dispatch an event in commangular :

*Dispatching from $commangular service*

```javascript
//You can inject $commangular in any controller or service
angular.module('YourApp')
  .controller('MyCtrl',['$commangular','$scope',function($commangular,$scope) {
  
    $scope.onButtonClick = function() {
      $commangular.dispatch('HelloEvent'); // Dispatching here
    }

   });
```

*Dispatching from any scope*

```javascript
//commangular attach a function 'dispatch' to the $rootScope
angular.module('YourApp')
  .controller('MyCtrl',['$scope',function($scope) {
  
    $scope.onButtonClick = function() {
      $scope.dispatch('HelloEvent'); // Dispatching here
    }

   });
```  
*Dispatching from the view*

```html
<!--There is a function 'dispatch' on every scope, so you can dispatch directly in your html code-->
<div ng-controller="CommandCtrl">
   <button ng-click="dispatch('HelloEvent')">Click Me</button>
</div>
```
Every event dispatched returns a promise, so you can control when a command group has completed the execution like that:

```javascript
//exactly what you'd do with any promise
$scope.dispatch('HelloEvent').then(function result(){},function error(){})});
```
### Passing data to commands at dispatching time

If you want to send some data to the command group at dispatching you can do it using the second param of the dispatch function.

```javascript
//commangular attach a function 'dispatch' to the $rootScope
angular.module('YourApp')
  .controller('MyCtrl',['$scope',function($scope) {
  
    $scope.onButtonClick = function() {
      $scope.dispatch('HelloEvent',{username:'mandril'}); // Dispatching with data 'username'
    }

   });
   
//Then you can inject 'username' on every command in that context.

commangular.create('HelloWorldCommand',['$log','username',function($log,username) {
  
  return {
     
        execute: function() {
        
          $log.log('Username is :' + username);
        }]
      }
  }
}]);

```  




### The command execution context

Every time an event is dispatched, a new command context is created. Every command context runs isolated from other command context.
The command context is responsible for execute the command group, organize the correct injections for every command and instatiate the commands before the execution using the angular injector.
You can launch 100 times the same event and all of them will be executed at the same time, but on diferents context, so you can't inject results from commands running in a diferent context.

### Command livecycle

Every command is instantitated before the execution using the angular injector and then the command execute function is invoked using the injector as well. The command is discarted after that. So don't think of command as a singleton. There is a new instance for every invocation. 

### Injection from angular context.

Commands are instantiated using the angular injector, so you can inject any angular service the same way you'd do in a service or controller.
You can inject on constructor or method (execute method) and thre is no diference, but the recomended way is to do it in constructor.

```javascript
commangular.create('HelloWorldCommand',['$log','$http','MyService',function($log,$http,MyService) {
  
  return {
     
        execute: function() {
        
          //Some code using the injected content here.
        }]
      }
  }
}]);
```

### Returning promises from commands.

All commands can return a promise. When a command return a promise commangular wait until the promise resolution.

on sequences :

```javascript

commangular.create('Command1',function($timeout) {
  
  return {
     
        execute: function() {
        
          var promise = $timeout(function(){
            return 'Result from promise';
          },2000);
          return promise;
        }
      }
},{resultKey:'result'}); //Keep the result in the command context in key 'result'

//This command won't be executed until the promise from Command1 is resolved.
commangular.create('Command2',function(,$log,result) { //Inject the key result
  
  return {
     
        execute: function() {
        
          $log.log(result); //This will log "Result from promise"  
        }
      }
  }
}]);

provider.mapTo('PromisesEvent').asSequece().add('Command1').add('Command2');

```
parallels work diferently with promises :

```javascript

commangular.create('Command1',function($timeout) {
  
  return {
     
        execute: function() {
        
          var promise = $timeout(function(){
            return 'Result from promise';
          },2000);
          return promise;
        }
      }
},{resultKey:'result'}); //Keep the result in the command context in key 'result'

//This command will be executed at the same time that Command1
commangular.create('Command2',function(,$log,result) { //This will throw an exception because result can't be injected
  
  return {
     
        execute: function() {
        
          $log.log(result); 
        }
      }
  }
}]);

provider.mapTo('PromisesEvent').asParallel().add('Command1').add('Command2');

```


##License

The MIT License

Copyright (c) 2013 Jesús Barquín Cheda

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.





