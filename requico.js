var define, require;

var loadedModules = [];
var waitingToBeLoadedModules = [];
var notLoadedModules = [];
var automaticModuleCheck = automaticModuleCheck || true;

(function (global) {
    var toStringFunction = Object.prototype.toString;
    var anonimousModuleName = 'anonimous';

    function Module(name, dependencies, waitingDependencies, callBack, instance) {
        this.name = name;
        this.dependencies = dependencies;
        this.waitingDependencies = waitingDependencies;
        this.callBack = callBack;
        this.instance = instance;
    };

    //Exceptions
    function ModuleNameTypeException(functionName, moduleNameType) {
        this.message = 'Module argument of "' + functionName + '" function is module name which is of type "string" not "' + moduleNameType + '"';
        this.name = 'ModuleNameTypeException';

        this.toString = function () {
            return this.name + ': ' + this.message;
        }
    }

    function ModuleDependenciesTypeException(moduleName, functionName, moduleDependenciesType) {
        this.message = 'Module argument of "' + functionName + '" function is module dependencies which are of type "array" not "' + moduleDependenciesType + '" in module "' + moduleName + '"';
        this.name = 'ModuleDependenciesTypeException';

        this.toString = function () {
            return this.name + ': ' + this.message;
        }
    }

    function ModuleCallbackTypeException(moduleName, functionName, moduleCallbackType) {
        this.message = 'Module argument of "' + functionName + '" function is module callback which are of type "function" not "' + moduleCallbackType + '" in module "' + moduleName + '"';
        this.name = 'ModuleCallbackTypeException';

        this.toString = function () {
            return this.name + ': ' + this.message;
        }
    }

    function ModulesNotLoadedException() {
        var notLoadedWaitingModules = [];

        for (var i = 0; i < waitingToBeLoadedModules.length; i++) {
            var module = waitingToBeLoadedModules[i];

            if (module.name !== '') {
                if (inArrayIndex(module.name, notLoadedWaitingModules) === -1) {
                    notLoadedWaitingModules.push(module.name);
                }
            }

            for (var j = 0; j < module.waitingDependencies.length; j++) {
                var waitingModuleName = module.waitingDependencies[j];

                if (inArrayIndex(waitingModuleName, notLoadedWaitingModules) === -1) {
                    notLoadedWaitingModules.push(waitingModuleName);
                }
            }
        }

        this.message = 'Modules not loaded: ["' + notLoadedWaitingModules.join('", "') + '"]';
        this.name = 'ModulesNotLoadedException';

        this.toString = function () {
            return this.name + ': ' + this.message;
        }
    }

    //Array helpers
    function grep(array, callBack) {
        var returnArray = [];

        for (var i = 0; i < array.length; i++) {
            var result = callBack(array[i]);

            if (result) {
                returnArray.push(array[i]);
            }
        }

        return returnArray;
    }

    function inArrayIndex(value, array) {
        for (var i = 0; i < array.length; i++) {
            if (array[i] === value) {
                return i;
            }
        }

        return -1;
    }

    function isInModuleArray(moduleName, modulesArr) {
        for (var i = 0; i < modulesArr.length; i++) {
            if (modulesArr[i].name === moduleName) {
                return true;
            }
        }

        return false;
    }

    //Dependencies helpers
    function getModulesDependentOnThis(moduleName) {
        var modules = [];

        if (moduleName !== '') {
            for (var i = 0; i < waitingToBeLoadedModules.length; i++) {
                var index = inArrayIndex(moduleName, waitingToBeLoadedModules[i].waitingDependencies);

                if (index !== -1) {
                    modules.push(waitingToBeLoadedModules[i]);
                }
            }
        }

        return modules;
    }

    function tryResolveDependencies(moduleDependencies) {
        var shouldEnterDependency = true;
        var dependencies = [];
        var waitingDependencies = [];

        for (var i = 0; i < moduleDependencies.length; i++) {
            var moduleName = moduleDependencies[i];
            var indexOfLoadedModule = getLoadedModule(moduleName);

            if (indexOfLoadedModule !== -1) {
                if (shouldEnterDependency) {
                    dependencies.push(loadedModules[indexOfLoadedModule].instance);
                }
            } else {
                var isInWaiting = isInModuleArray(moduleName, waitingToBeLoadedModules);

                if (isInWaiting) {
                    shouldEnterDependency = false;
                    waitingDependencies.push(moduleName);
                } else {
                    var indexOfNotLoadedModule = getNotLoadedModule(moduleName);

                    if (indexOfNotLoadedModule !== -1) {
                        var module = notLoadedModules.splice(indexOfNotLoadedModule, 1)[0];

                        tryLoadModule(module, []);

                        if (module.instance !== null) {
                            if (shouldEnterDependency) {
                                dependencies.push(module.instance);
                            }
                        } else {
                            shouldEnterDependency = false;
                            waitingDependencies.push(moduleName);
                        }
                    } else {
                        shouldEnterDependency = false;
                        waitingDependencies.push(moduleName);
                    }
                }
            }
        }

        return {
            areLoaded: shouldEnterDependency,
            list: dependencies,
            waiting: waitingDependencies
        };
    }

    //Adding helpers
    function addToNotLoadedModules(module) {
        var found = [];

        if (module.name !== '') {
            found = grep(notLoadedModules, function (element) {
                return element.name === module.name;
            });
        }

        if (found.length === 0) {
            notLoadedModules.push(module);
        }
    }

    //Getting of modules
    function getModuleIndex(moduleName, modulesArr) {
        var index = -1;

        for (var i = 0; i < modulesArr.length; i++) {
            if (modulesArr[i].name === moduleName) {
                index = i;
                break;
            }
        }

        return index;
    }

    function getLoadedModule(moduleName) {
        return getModuleIndex(moduleName, loadedModules);
    }

    function getNotLoadedModule(moduleName) {
        return getModuleIndex(moduleName, notLoadedModules);
    }

    //Loading of modules
    function notifyDependentModules(moduleName, modulesDependentOnThis) {
        for (var i = 0; i < modulesDependentOnThis.length; i++) {
            var module = modulesDependentOnThis[i];
            var indexInWaiting = inArrayIndex(moduleName, module.waitingDependencies);

            module.waitingDependencies.splice(indexInWaiting, 1);

            if (module.waitingDependencies.length === 0) {
                var modulesDependentOnThisInner = getModulesDependentOnThis(module.name);

                loadModule(module, modulesDependentOnThisInner);

                waitingToBeLoadedModules = grep(waitingToBeLoadedModules, function (element) {
                    return element !== module;
                });
            }
        };
    }

    function loadModule(module, modulesDependentOnThis) {
        var dependencies = tryResolveDependencies(module.dependencies);

        module.instance = module.callBack.apply(global, dependencies.list);

        if (module.name !== '') {
            loadedModules.push(module);
            notifyDependentModules(module.name, modulesDependentOnThis);
        }
    }

    function tryLoadModule(module, modulesDependentOnThis) {
        var dependencies = tryResolveDependencies(module.dependencies);

        if (dependencies.areLoaded) {
            module.instance = module.callBack.apply(global, dependencies.list);

            if (module.name !== '') {
                loadedModules.push(module);
                notifyDependentModules(module.name, modulesDependentOnThis);
            }
        } else {
            module.waitingDependencies = dependencies.waiting;
            waitingToBeLoadedModules.push(module);
        }

        return module;
    }

    define = function (moduleName, moduleDependencies, moduleCallback) {
       

        var module = new Module(moduleName, moduleDependencies, [], moduleCallback, null);

        var isInLoaded = isInModuleArray(module.name, loadedModules);
        if (isInLoaded) {
            return;
        }

        var isInWaiting = isInModuleArray(module.name, waitingToBeLoadedModules);
        if (isInWaiting) {
            return;
        }

        var modulesDependentOnThis = getModulesDependentOnThis(module.name);

        if (modulesDependentOnThis.length === 0) {
            addToNotLoadedModules(module);
        } else {
            tryLoadModule(module, modulesDependentOnThis);
        }
    };

    require = function (moduleDependencies, moduleCallback) {
       
        var module = new Module('', moduleDependencies, [], moduleCallback, null);

        tryLoadModule(module, []);
    };

    //External helpers
    require.isRequired = function (moduleName) {
        var success = isInModuleArray(moduleName, loadedModules);
        if (success) {
            return true;
        }

        success = isInModuleArray(moduleName, waitingToBeLoadedModules);
        if (success) {
            return true;
        }

        return false;
    };

    require.finishedLoading = function () {
        if (waitingToBeLoadedModules.length !== 0) {
            var exception = new ModulesNotLoadedException();

            throw exception.toString();
        }
    };
})(this);

if (automaticModuleCheck) {
    require(['jquery'], function ($) {
        $(document).ready(function () {
            require.finishedLoading();
        });
    });
}