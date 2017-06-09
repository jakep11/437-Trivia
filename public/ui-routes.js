
app.config(['$stateProvider', '$urlRouterProvider', 
   function($stateProvider, $router) {

      //redirect to home if path is not matched
      $router.otherwise("/");

      $stateProvider
      .state('home',  {
         url: '/',
         templateUrl: 'Home/home.template.html',
         controller: 'homeController',
      })
      .state('login', {
         url: '/login',
         templateUrl: 'Login/login.template.html',
         controller: 'loginController',
      })
      .state('register', {
         url: '/register',
         templateUrl: 'Register/register.template.html',
         controller: 'registerController',
      })
      .state('categories', {
         url: '/category/',
         templateUrl: 'Category/categories.template.html',
         controller: 'categoriesController',
         resolve: {
            ctgs: ['$q', '$http', '$stateParams', function($q, $http, 
             $stateParams) {
               return $http.get('/Ctgs/')
               .then(function(response) {
                  return response.data;
               });
            }]
         }
      })
      .state('questions', {
         url: '/category/:ctgId',
         templateUrl: 'Category/questions.template.html',
         controller: 'questionController',
         resolve: {
            qsts: ['$q', '$http', '$stateParams', function($q, $http, $stateParams) {
               return $http.get('/Ctgs/' + $stateParams.ctgId)
               .then(function(response) {
                  return response.data;
               });
            }]
         }
      })
      .state('myQsts', {
         url: '/myQsts/:prsId',
         templateUrl: 'Question/myQsts.template.html',
         controller: 'myQstsController',
         resolve: {
            qsts: function() {
               return [{title: "My Qst title", answer: "answer"}];
            }
         }
         // resolve: {
         //    qsts: ['$q', '$http', function($q, $http) {
         //       return $http.get('/Qsts?owner=' + $stateParams.prsId)
         //       .then(function(response) {
         //          return response.data;
         //       });
         //    }]
         // }
      })
      .state('correct', {
         url: '/correct/',
         templateUrl: 'Correct/correct.template.html',
         controller: 'correctController',
         resolve: {
            anrs: ['$q', '$http', '$stateParams', function($q, $http) {
               return $http.get('/Qsts/Correct')
               .then(function(response) {
                  return response.data;
               });
            }]
         }
      });
   }]);
