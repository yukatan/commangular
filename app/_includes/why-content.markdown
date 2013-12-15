
##AngularJS and MVW
***

AngularJS is declared as a MVW framework. MVW is Model-View-Whatever, "Whatever fits to you". Commangular lives in the whatever side. I define Commangular as a unified controller for AngularJS that aims to totally separate view layer and infrastructure layer in an AngularJS application.   

<br>
*You can see in the image below where commangular fits.*   
<br>
<div class="mvc-image text-center"><img src="/img/mvc.png" /></div>
<a class="mvc-image-link" href="/img/mvc.png">Click to see the image</a>

*	**View layer:** The view layer is composed by HTML and the presentation model. The presentation model is a concept that is going to be explained  below. There is no business logic here, just event dispatching. The angular controller is injected with the model and then the model is exposed to the scope.

*	**Model layer:** The model is the data and the state of your application. It has methods to manipulate that data as well. it acts as a glue between the view and the infrastructure layer usually through data binding. 

* 	**Infrastructure Layer:** It is composed by commands managed by commangular and regular angular services. As you can see in the above image, services don't have any dependency with the model and they should have just one responsability. Commands could be injected with model and services and each command resolve just one specific operation, so one responsability as well. Is in commands where the model is updated with service results.

Of course, this is not the only option you have to architect an angularJs application, is just one option that gives you powerfull things like interception, operation chaining and other planned concepts like commangular-spoof for backendless development and rapid prototyping. 



## Scope + Controller == Presentation Model.
***
In AngularJS the controller is tightly coupled to the view. A view change can produce easily a full controller rewrite, so the best way to follow seems to have the less possible code on controllers.
The controller is a function that decorate the scope, so the combination of scope and controller seems to be a presentation model. I don't feel confortable injecting services on controller in angular as I do in Java for example.. of course this is just my opinion. That's why I develop Commangular. I have been a Flex developer for years and I want apply some patterns I learnt to AngularJS.

## Code organization by example.
***
This is an example showing a simple "add item to cart" of a shopping cart application. Showing the different layer separation and using commangular.

*View Layer*

``` html
<div ng-controller="CartController">
	<!-- Some other content here-->
	<button ng-click="dispatch('AddItemToCartEvent')">Add item to the cart</button>
</div>
<div id="item-list">
	<ul><li ng-repeat="item in itemList">{{item.name}}</li></ul>
</div>
```
```javascript 

angular.module('CartShopping')
	.controller('CartController',function($scope,CartItemsList) {
		
		//As you can see the code in controller is really small
		$scope.itemList = CartItemsList.list;
	});
```
*Model Layer*

```javascript

angular.module('CartShopping')
	.service('CartItemsList',function(){

		//Items in the user cart
		this.list = [];

		//add an item to the cart
		this.addItem = function(item) {

			this.list.push(item);
		}
	});

angular.module('CartShopping')
	.service('CurrentSelectedItem',function(){

		this.item = null; // this item keep the current item that the user is viewing
	});	
```
*Infrastructure Layer*

```javascript

commangular.command('AddItemToCartCommand',function(CartItemList,CurrentSelectedItem,CartService) {
	
	return {

		execute : function() {

			//This is returning a promise.
			return CartService.addItem(CurrentSelectedItem.item); //We suposse the server knows where to add the item for simplicity;
		}
		onResult : function() {

			//We update the model to show it in the user list.	
			CartItemList.addItem(CurrentSelectedItem.item);
		}
	}
});

angular.module('CartShopping')
	.service('CartService',function($http){

		this.addItem()  = function(item) {

			return $http.put('some rest api url',item);
		}
	});

//We configure the commangular provider in a config block

$commangularProvider.mapTo('AddItemToCartEvent').asSequence().add(AddItemToCartCommand);	
```
Ok, you can think that this is a lot of code for a really simple thing.... yes it is. You can event inject $http in the controller directly and then expose the result to the scope, so you don't need a service,command or model, but when the application starts to grow, you will begin to cry. 