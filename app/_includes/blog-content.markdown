
## The DashboardFlight Example
***

This is the first post and the blog programming is still not ready but I saw and example on github showing promise chaining and I want to demostrate how it looks like implemented with commangular.

You can see the sample [here](https://github.com/ThomasBurleson/angularjs-FlightDashboard)

I'm not going to write the FlightService because it is the same and I'm going to show two examples, one with a FlightData model and one without it.

#### Without FlightData

```javascript
 //We have 3 commands doing the stuff. It can be separated in multiple js files to keep the code organized
commangular.command('getUpcomingFlightCommand',function(user,FlightService) {
	
	return {
		execute :function() {

			return FlightService.getUpcomingFlight(user);
		}
	}
},{resultKey:'flight'});

commangular.command('getFlightDetailsCommand',function(flight,FlightService) {
	
	return {
		execute :function() {

			return FlightService.getFlightDetails(flight.id);
		}
	}
},{resultKey:'planeStatus'});

commangular.command('getForecastCommand',function(flight,WeatherService) {
	
	return {
		execute :function() {

			return WeatherService.getForecast(flight.departure);
		}
	}
},{resultKey:'forecast'});

//In a config block and with the provider
//I create a sequence with a parallel inside and map it to 'LoadFlightEvent'
$commangularProvider.mapTo('LoadFlightEvent').asSequence()
	.add('getUpcomingFlightCommand')
	.add($commangularProvider.asParallel()
		.add('getFlightdDetailsCommand')
		.add('getForecastCommand'));

//And the controler copy from the example and modified

var FlightDashboard = function( $scope,$log) {
	 
	$scope.dispatch('LoadFlightEvent').then(function(result){
		
		//We can access here all the resultKeys from the command group execution
		$scope.flight      = result.flight;                    
        $scope.planeStatus = result.planeStatus;              
        $scope.forecast    = result.forecast;  
	},function(fault){

		$log.error( String(fault) );
	});
}
```
This is ok.. but I think it can be improved using a model and some interception magic.

#### With FlightData

```javascript
 //FlightData injection and onResult Handler. As you can see we don't use the 'resultKey' because we have the model.
commangular.command('getUpcomingFlightCommand',function(user,FlightData,FlightService) {
	
	return {
		execute :function() {

			return FlightService.getUpcomingFlight(user);
		},
		onResult : function(flight) {

			FlightData.flight = flight;
		}
	}
});

commangular.command('getFlightDetailsCommand',function(FlightData,FlightService) {
	
	return {
		execute :function() {

			return FlightService.getFlightDetails(FlightData.flight.id);
		},
		onResult: function(flightStatus) {

			FlightData.flightStatus = flightStatus;
		}
	}
});

commangular.command('getForecastCommand',function(FlightData,WeatherService) {
	
	return {
		execute :function() {

			return WeatherService.getForecast(FlightData.flight.departure);
		},
		onResult : function(forecast) {

			FlightData.forecast = forecast;
		}
	}
});

//We are going to intercept all the command execution to control errors.
commangular.aspect('@AfterThrowing(/(.)/)',function(lastError,$log) {
	
	return {
		execute :function() {
			
			$log.error( String(lastError));
	}
});


//The same that before
$commangularProvider.mapTo('LoadFlightEvent').asSequence()
	.add('getUpcomingFlightCommand')
	.add($commangularProvider.asParallel()
		.add('getFlightdDetailsCommand')
		.add('getForecastCommand'));

//And the controler copy from the example and modified

var FlightDashboard = function($scope,FlighData) {
	 
	$scope.dispatch('LoadFlightEvent').then(function(){
		//We do it this here because we want the data when it is all load.
		$scope.flightData = FlightData;
	})
}
```
We end with organized and clean code and really easy to test and understand. Just looking at the config block you can see what happen. I have planned a chrome extension to do some introspection on config blocks. I think it will be a killer feature.

You can use any commangular flavour you like :). I show the two options just to demostrate how commangular works.

I have no comments available here so, comment your feedback on twitter, it will help me a lot. And sorry about my english problems. I hope everybody understand me.

