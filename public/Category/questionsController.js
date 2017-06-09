app.controller('categoryController',
 ['$scope', '$state', '$http', 'qsts',
 function($scope, $state, $http, qsts) {
    $scope.qsts = qsts;
    $scope.guess = null;

    $scope.submitGuess = function(guess, qstId) {
       console.log(guess + " " + qstId);
       $http.post("Qsts/" + qstId + "/Answers", guess);
    }
}]);
