#Commangular        

[![Build Status](https://travis-ci.org/yukatan/commangular.svg?branch=master)](https://travis-ci.org/yukatan/commangular)
Command framework for AngularJS.

* Website  : [http://commangular.org](http://commangular.org)
* Quick Guide : [http://commangular.org/get-started/](http://commangular.org/get-started)
* Documentation : [http://commangular.org/docs/](http://commangular.org/docs/)

##Overview

Commangular is a concept on top of angularJS that aims at simplifying the creation and organization of operations in a self-contained code units and chain them together with an easy and fluent API.That code units are called 'commands'

Commands can be easily tested, reused, and developed in isolation.

It is inspired by [Parsley 3 Framework](https://github.com/spicefactory) and [Jens Halm](https://github.com/jenshalm) command concept. 


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


##Installation

* Using bower : ``` bower install commangular ```
* Download it and add commangular.js or commangular.min.js to your index.html.

Remember to add commangular.js after angular.js. Commangular only depends on angularJs, it is not using other libraries.



##License

The MIT License

Copyright (c) 2013 Jesús Barquín Cheda

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

[![githalytics.com alpha](https://cruel-carlota.gopagoda.com/4e4c83003a160db1279836eedc98f99a "githalytics.com")](http://githalytics.com/yukatan/commangular)

[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/yukatan/commangular/trend.png)](https://bitdeli.com/free "Bitdeli Badge")

