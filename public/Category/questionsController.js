app.controller('questionController',
 ['$scope', '$state', '$http', 'qsts',
 function($scope, $state, $http, qsts) {
    $scope.qsts = qsts;
    $scope.guess = null;

    $scope.submitGuess = function(guess, qstId) {
       console.log(guess + " " + qstId);
       $http.post("Qsts/" + qstId + "/Answers", guess)
        .then(function() {
           return $http.get("Qsts/Correct/" + qstId);
        }).then(function (isCorrect) {
          if(isCorrect.correct) {
             // Do something cool
             console.log("You are right!");
          } else {
             // Turn it red or something
             console.log("You are wrong!")
          }
       });
    }
}]);
