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
* Custom result resolvers(on the way).
* Flows of commands with decision points to select the next commands based on result values(on the way).





