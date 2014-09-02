angular.module('activitiApp').controller("TasksCtrl", function ($scope, $rootScope, $location, TasksService, FormDataService, moment) {
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
    $scope.tasksType = "assignee";

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


    $scope.loadTasksType = function (tasksType) {
        $scope.tasksType = tasksType;
        $scope.loadTasks();
    }

    $scope.loadTasks = function () {
        $scope.tasks = TasksService.get(getTasksQuery());
    }

    $scope.assignMe = function (detailedTask) {
        var taskToEdit = new TasksService({"assignee": $rootScope.username});
        taskToEdit.$update({"taskId": detailedTask.id}, function () {
            $scope.loadTasks();
        });

    }

    $scope.takeOwnerShip = function (detailedTask) {
        var taskToEdit = new TasksService({"owner": $rootScope.username});
        taskToEdit.$update({"taskId": detailedTask.id}, function () {
            $scope.loadTasks();
        });
    }



    $scope.loadTask = function (task) {
        var form = null;
        FormDataService.get({"taskId": task.id}, function (data) {

            var propertyForSaving = {};

            for (var i = 0; i < data.formProperties.length; i++) {
                var elem = data.formProperties[i];
                propertyForSaving[elem.id] = {
                    "value": elem.value,
                    "id": elem.id,
                    "writable": elem.writable
                };

                if (elem.datePattern != null) {//if date
                    propertyForSaving[elem.id].opened = false; //for date picker
                    propertyForSaving[elem.id].datePattern = elem.datePattern;
                }

                if (elem.required == true && elem.type == "boolean") {
                    if (elem.value == null) {
                        propertyForSaving[elem.id].value = false;
                    }
                }
            }

            task.form = data;
            task.propertyForSaving = propertyForSaving;

            if (getTaskFromDetails(task) == null) {
                $scope.detailedTasks.push(task);
            }

        }, function (data) {

            if (data.data.statusCode == 404) {
                $scope.detailedTasks.push(task);
            }

        });
    };

    $scope.open = function (obj, $event) {
        $event.preventDefault();
        $event.stopPropagation();

        obj.opened = true;
    };

    $scope.setFormEnum = function (enumm, item) {
        item.value = enumm.id;
        item.name = enumm.name;
    }

    $scope.cancel = function (task) {
        removeTaskFromDetails(task);
    }

    /**
     * Finish Tas
     * @param detailedTask
     */
    $scope.finish = function (detailedTask) {

        var objectToSave = {
            "taskId": detailedTask.id,
            properties: []
        }


        if (typeof detailedTask.propertyForSaving != "undefined") {
            for (var key in detailedTask.propertyForSaving) {
                var forObject = detailedTask.propertyForSaving[key];

                if (!forObject.writable) {//if this is not writeable property do not use it
                    continue;
                }

                if (forObject.value != null) {
                    var elem = {
                        "id": forObject.id,
                        "value": forObject.value
                    };
                    if (typeof forObject.datePattern != 'undefined') {//format
                        var date = new Date(forObject.value);
                        elem.value = moment(date).format(forObject.datePattern.toUpperCase());
                    }
                    objectToSave.properties.push(elem);
                }
            }

            var saveForm = new FormDataService(objectToSave);
            saveForm.$save(function () {
                $scope.loadTasks();
            });
        } else {
            var action = new TasksService();
            action.action = "complete";
            action.$save({"taskId": detailedTask.id}, function () {
                $scope.loadTasks();
                removeTaskFromDetails(detailedTask);
            });
        }

    }

    $scope.loadTasks();

    $scope.detailedTasks = new Array();


    function removeTaskFromDetails(task) {
        removeTask($scope.detailedTasks, task);
    }

    /**
     * Remove task from tasks array
     * @param tasks
     * @param task
     */
    function removeTask(tasks, task) {
        for (var i = 0; i < tasks.length; i++) {
            if (tasks[i].id == task.id) {
                tasks.splice(i, 1);
            }
        }
    }

    /**
     * returns task from detailed tasks
     * @param task
     * @returns {*}
     */
    function getTaskFromDetails(task) {
        for (var i = 0; i < $scope.detailedTasks.length; i++) {
            if ($scope.detailedTasks[i].id == task.id) {
                return $scope.detailedTasks[i];
            }
        }

        return null;
    }




});