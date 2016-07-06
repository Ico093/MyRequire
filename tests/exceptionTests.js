QUnit.module('Exceptions', function () {
    QUnit.test('Exception - Module not loaded', function (assert) {
        require(['module1', 'module2'], function () {
        });

        define('module1', ['module3'], function () {
            console.log('Module1 has been loaded.')
        });

        define('module3', ['module4'], function () {
            console.log('Module3 has been loaded.')
        });

        assert.throws(function () {
            require.finishedLoading();
        }, 'ModulesNotLoadedException: Modules not loaded: ["module1", "module2", "module3", "module4"]', 'Correct exception is thrown.')
    });

    QUnit.test('Exception - Require wrong 1st argument', function (assert) {
        assert.throws(function () {
            require('test', function () { });
        }, 'ModuleDependenciesTypeException: Module argument of "require" function is module dependencies which are of type "array" not "String" in module "anonimous"', 'Correct exception is thrown.')
    });

    QUnit.test('Exception - Require wrong 2nd argument', function (assert) {
        assert.throws(function () {
            require([], 'Test');
        }, 'ModuleCallbackTypeException: Module argument of "require" function is module callback which are of type "function" not "String" in module "anonimous"', 'Correct exception is thrown.')
    });

    QUnit.test('Exception - Define wrong 1st argument', function (assert) {
        assert.throws(function () {
            define([], [], function () { });
        }, 'ModuleNameTypeException: Module argument of "define" function is module name which is of type "string" not "Array"', 'Correct exception is thrown.')
    });

    QUnit.test('Exception - Require wrong 2nd argument', function (assert) {
        assert.throws(function () {
            define('module1', 'Test', function () { });
        }, 'ModuleDependenciesTypeException: Module argument of "define" function is module dependencies which are of type "array" not "String" in module "module1"', 'Correct exception is thrown.')
    });

    QUnit.test('Exception - Require wrong 3rd argument', function (assert) {
        assert.throws(function () {
            define('module1', [], 'Test');
        }, 'ModuleCallbackTypeException: Module argument of "define" function is module callback which are of type "function" not "String" in module "module1"', 'Correct exception is thrown.')
    });
});