/**
 * Created by Ico on 11-Jun-16.
 */

var define, require;

var loadedModules = [];
var waitingToBeLoadedModules = [];
var notLoadedModules = [];

(function (global) {

    //Array helpers
    function isInArray(moduleName, modulesArr) {
        for (var i = 0; i < modulesArr.length; i++) {
            if (modulesArr[i].name == moduleName) {
                return true;
            }
        }

        return false;
    }

    //Dependencies helpers
    function getModulesDependentOnThis(moduleName) {
        if(moduleName===''){
            return [];
        }else{
            return waitingToBeLoadedModules.reduce(function (previousValue, currentValue) {
                var index = $.inArray(moduleName, currentValue.waitingDependencies);

                if (index !== -1) {
                    return previousValue.concat(currentValue);
                }

                return previousValue;
            }, []);
        }
    }

    function tryResolveDependencies(moduleDependencies) {
        var shouldEnterDependency = true;
        var dependencies = [];
        var waitingDependencies = [];

        for (var i = 0; i < moduleDependencies.length; i++) {
            var moduleName = moduleDependencies[i];
            var item = getLoadedModule(moduleName);

            if (item.index !== -1) {
                if (shouldEnterDependency) {
                    dependencies.push(item.module.instance);
                }
            } else {
                var isInWaiting = isInArray(moduleName, waitingToBeLoadedModules);

                if (isInWaiting) {
                    shouldEnterDependency = false;
                    waitingDependencies.push(moduleName);
                } else {
                    item = getNotLoadedModule(moduleName);

                    if (item.index !== -1) {
                        notLoadedModules = $.grep(notLoadedModules, function (element) {
                            return element !== item.module;
                        });

                        var module = tryLoadModule(item.module.name, item.module.dependencies, item.module.callBack, []);

                        if (module !== null) {
                            if(shouldEnterDependency){
                                dependencies.push(module)
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
    function addToLoadedModules(moduleName, instance) {
        loadedModules.push({
            name: moduleName,
            instance: instance
        });
    }

    function addToWaitingToBeLoadedModules(moduleName, moduleDependencies, waitingModuleDependencies, moduleCallBack) {
        waitingToBeLoadedModules.push({
            name: moduleName,
            dependencies: moduleDependencies,
            waitingDependencies: waitingModuleDependencies,
            callBack: moduleCallBack
        });
    }

    function addToNotLoadedModules(moduleName, moduleDependencies, moduleCallBack) {
        var found = false;

        if (moduleName !== '') {
            found = $.grep(notLoadedModules, function (element) {
                return element.name === moduleName;
            });
        }

        if (found.length === 0) {
            notLoadedModules.push({
                name: moduleName,
                dependencies: moduleDependencies,
                callBack: moduleCallBack
            });
        }
    }

    //Getting of modules
    function getModule(moduleName, modulesArr) {
        var index = -1;
        var module = null;

        for (var i = 0; i < modulesArr.length; i++) {
            if (modulesArr[i].name == moduleName) {
                index = i;
                module = modulesArr[i];
                break;
            }
        }

        return {
            index: index,
            module: module
        };
    }

    function getLoadedModule(moduleName) {
        return getModule(moduleName, loadedModules);
    }

    function getNotLoadedModule(moduleName) {
        return getModule(moduleName, notLoadedModules);
    }

    //Loading of modules
    function notifyDependentModules(moduleName, modulesDependentOnThis) {
        $.each(modulesDependentOnThis, function (index, module) {
            var indexInWaiting = $.inArray(moduleName, module.waitingDependencies);

            module.waitingDependencies.splice(indexInWaiting, 1);

            if (module.waitingDependencies.length === 0) {
                var modulesDependentOnThis = getModulesDependentOnThis(module.name);

                loadModule(module.name, module.dependencies, module.callBack, modulesDependentOnThis);

                waitingToBeLoadedModules = $.grep(waitingToBeLoadedModules, function (element) {
                    return element !== module;
                });
            }
        });
    }

    function loadModule(moduleName, moduleDependencies, moduleCallback, modulesDependentOnThis) {
        var dependencies = tryResolveDependencies(moduleDependencies);

        var instance = moduleCallback.apply(global, dependencies.list);

        if (moduleName !== '') {
            addToLoadedModules(moduleName, instance);
            notifyDependentModules(moduleName, modulesDependentOnThis);
        }
    }

    function tryLoadModule(moduleName, moduleDependencies, moduleCallback, modulesDependentOnThis) {
        var dependencies = tryResolveDependencies(moduleDependencies);

        if (dependencies.areLoaded) {
            var instance = moduleCallback.apply(global, dependencies.list);

            if (moduleName !== '') {
                addToLoadedModules(moduleName, instance);
                notifyDependentModules(moduleName, modulesDependentOnThis);

                return instance;
            }
        } else {
            addToWaitingToBeLoadedModules(moduleName, moduleDependencies, dependencies.waiting, moduleCallback)
        }

        return null;
    }

    define = function (moduleName, moduleDependencies, moduleCallback) {
        var isInLoaded = isInArray(moduleName, loadedModules);
        if (isInLoaded) {
            return;
        }

        var isInWaiting = isInArray(moduleName, waitingToBeLoadedModules);
        if (isInWaiting) {
            return;
        }

        var modulesDependentOnThis = getModulesDependentOnThis(moduleName);

        if (modulesDependentOnThis.length === 0) {
            addToNotLoadedModules(moduleName, moduleDependencies, moduleCallback);
        } else {
            tryLoadModule(moduleName, moduleDependencies, moduleCallback, modulesDependentOnThis);
        }
    };

    require = function (moduleDependencies, moduleCallback) {
        tryLoadModule('', moduleDependencies, moduleCallback, []);
    };

    loadedModules.push({
        name: 'jquery',
        instance: $
    });
})(this);