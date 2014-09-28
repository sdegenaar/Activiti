angular.module('activitiApp').controller("TasksCtrl", function ($scope, $rootScope, $location, TasksService, FormDataService, moment, $modal, TasksModalService,ProcessDefinitionService) {
    if (typeof  $rootScope.loggedin == 'undefined' || $rootScope.loggedin == false) {
        $location.path('/login');
        return;
    }

    /**
     * involved
     * owned
     * assigned
     *
     * @type {string}
     */
    $scope.tasksType = "assigned";

    function getTasksQuery() {
        if ($scope.tasksType == "involved") {
            return {"size": 1000, "involvedUser": $rootScope.username};
        } else if ($scope.tasksType == "owned") {
            return {"size": 1000, "owner": $rootScope.username};
        } else if ($scope.tasksType == "unassigned") {
            return {"size": 1000, "unassigned": true};
        } else {//assigned
            return {"size": 1000, "assignee": $rootScope.username};
        }
    }


    /**
     * Performs the load of the tasks and sets the tasksType
     * @param tasksType
     */
    $scope.loadTasksType = function (tasksType) {
        $scope.tasksType = tasksType;
        $scope.loadTasks();
    }

    /**
     * Loads the tasks
     */
    $scope.loadTasks = function () {
        $scope.tasks = TasksService.get(getTasksQuery());
    }


    $scope.loadTask = function (task) {
        TasksModalService.loadTaskForm(task);
    };


    $rootScope.$on('refreshData', function (event, data) {
        $scope.loadTasks();

    });

    /**
     * Load definitions
     */
    $scope.loadDefinitions = function () {
        $scope.processes = ProcessDefinitionService.get({latest: "true"});
    }

    /**
     * starts the process
     * @param processDefinition
     */
    $scope.startTheProcess = function (processDefinition) {

        TasksModalService.loadProcessForm(processDefinition);

        var formService = new FormDataService({processDefinitionId: processDefinition.id});
        formService.$startTask(function (data) {
            console.log(data);
        });
    };


    $scope.loadTasks();
    $scope.loadDefinitions();

});