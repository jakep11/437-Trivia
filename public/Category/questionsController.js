app.controller('questionController',
 ['$scope', '$state', '$http', 'qsts',
 function($scope, $state, $http, qsts) {
    $scope.qsts = qsts;
    $scope.guess = null;

    $scope.submitGuess = function(guess, qstId, $event) {
       var answerDiv = $event.target.parentElement;
       var children = answerDiv.children;
       $http.post("Qsts/" + qstId + "/Answers", {guess : guess})
        .then(function() {
           return $http.get("Qsts/Correct/" + qstId);
        }).then(function (isCorrect) {
           if(isCorrect.data.correct) {
              for(var child = 0; child < children.length; child ++) {
                 children[child].style.backgroundColor = "green";
              }
           } else {
              for(var child = 0; child < children.length; child ++) {
                 children[child].style.backgroundColor = "red";
              }
           }
       });
    }
}]);
