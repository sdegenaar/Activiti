angular.module('activitiApp').factory('ProcessInstanceService', function ($resource) {
    var data = $resource('service/runtime/process-instances/:processInstance', {processInstance: "@processInstance"});
    return data;
});
