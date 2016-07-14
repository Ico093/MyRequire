QUnit.test('Normal workflow', function (assert) {
    define('module1', [], function () {
        return 'module1';
    });

    require(['module1'], function (module1) {
        var fixture = $('#qunit-fixture');

        fixture.append('<div>' + module1 + '</div>');
    });

    var divs = $('#qunit-fixture > div');

    assert.equal($(divs[0]).text(), 'module1', 'Passed!');
});

QUnit.test('define called first', function (assert) {
    define('module1', [], function () {
        var fixture = $('#qunit-fixture');

        fixture.append('<div>hello!</div>');
    });


    assert.equal(notLoadedModules[0].name, 'module1', 'Passed!');
});

QUnit.test('define called after require', function (assert) {
    require(['module1'], function (module1) {
        var fixture = $('#qunit-fixture');

        fixture.append('<div>' + module1 + '</div>');
    });

    define('module1', [], function () {
        return 'module1';
    });

    assert.equal($('#qunit-fixture > div').text(), 'module1', 'Module is executed when defined!');
});

QUnit.test('define with dependency called after require', function (assert) {
    require(['module1'], function (module1) {
        var fixture = $('#qunit-fixture');

        fixture.append('<div>' + module1 + '</div>');
    });

    define('module1', ['module2'], function (module2) {
        var fixture = $('#qunit-fixture');

        fixture.append('<div>' + module2 + '</div>');

        return 'module1';
    });

    define('module2', [], function () {
        return 'module2';
    });

    var divs = $('#qunit-fixture > div');

    assert.equal($(divs[0]).text(), 'module2', 'Module is executed when defined!');
    assert.equal($(divs[1]).text(), 'module1', 'Module is executed when defined!');
});

QUnit.test('require 2 dependency one of which is a dependency for 2 modules', function (assert) {
    require(['module1', 'module2'], function (module1, module2) {
        var fixture = $('#qunit-fixture');

        fixture.append('<div>' + module1 + '</div>');
        fixture.append('<div>' + module2 + '</div>');
    });

    define('module1', ['module2'], function (module2) {
        var fixture = $('#qunit-fixture');

        fixture.append('<div>' + module2 + '</div>');

        return 'module1';
    });

    define('module2', ['module3'], function (module3) {
        var fixture = $('#qunit-fixture');

        fixture.append('<div>' + module3 + '</div>');

        return 'module2';
    });

    define('module3', [], function () {
        return 'module3';
    });

    var divs = $('#qunit-fixture > div');

    assert.equal($(divs[0]).text(), 'module3', 'Module is executed when defined!');
    assert.equal($(divs[1]).text(), 'module2', 'Module is executed when defined!');
    assert.equal($(divs[2]).text(), 'module1', 'Module is executed when defined!');
    assert.equal($(divs[3]).text(), 'module2', 'Module is executed when defined!');
});

QUnit.test('Try to define module twice', function (assert) {
    define('module1', ['module2'], function (module2) {
        var fixture = $('#qunit-fixture');

        fixture.append('<div>' + module2 + '</div>');

        return 'module1';
    });

    define('module1', [], function (module2) {
        var fixture = $('#qunit-fixture');

        fixture.append('<div>module1</div>');

        return 'moduleShouldBeSkipped';
    });

    require(['module1'], function (module1) {
        var fixture = $('#qunit-fixture');

        fixture.append('<div>' + module1 + '</div>');
    });

    define('module2', [], function () {
        return 'module2';
    });

    var divs = $('#qunit-fixture > div');

    assert.equal($(divs[0]).text(), 'module2', 'Module is executed when defined!');
    assert.equal($(divs[1]).text(), 'module1', 'Module is executed when defined!');
});

QUnit.test('Try to define module twice while first is waiting to be executed', function (assert) {
    require(['module1'], function (module1) {
        var fixture = $('#qunit-fixture');

        fixture.append('<div>' + module1 + '</div>');
    });

    define('module1', ['module2'], function (module2) {
        var fixture = $('#qunit-fixture');

        fixture.append('<div>' + module2 + '</div>');

        return 'module1';
    });

    define('module1', [], function (module2) {
        var fixture = $('#qunit-fixture');

        fixture.append('<div>module1</div>');

        return 'moduleShouldBeSkipped';
    });

    define('module2', [], function () {
        return 'module2';
    });

    var divs = $('#qunit-fixture > div');

    assert.equal($(divs[0]).text(), 'module2', 'Module is executed when defined!');
    assert.equal($(divs[1]).text(), 'module1', 'Module is executed when defined!');
});

QUnit.test('Try to require module twice while it is waiting to be executed', function (assert) {
    require(['module1'], function (module1) {
        var fixture = $('#qunit-fixture');

        fixture.append('<div>' + module1 + '1</div>');
    });

    define('module1', ['module2'], function (module2) {
        var fixture = $('#qunit-fixture');

        fixture.append('<div>' + module2 + '</div>');

        return 'module1';
    });

    require(['module1'], function (module1) {
        var fixture = $('#qunit-fixture');

        fixture.append('<div>' + module1 + '2</div>');
    });

    define('module2', [], function () {
        return 'module2';
    });

    var divs = $('#qunit-fixture > div');

    assert.equal($(divs[0]).text(), 'module2', 'Module is executed when defined!');
    assert.equal($(divs[1]).text(), 'module11', 'Module is executed when defined!');
    assert.equal($(divs[2]).text(), 'module12', 'Module is executed when defined!');
});

QUnit.test('Try to define already loaded module', function (assert) {
    require(['module1'], function (module1) {
        var fixture = $('#qunit-fixture');

        fixture.append('<div>' + module1 + '</div>');
    });

    define('module1', ['module2'], function (module2) {
        var fixture = $('#qunit-fixture');

        fixture.append('<div>' + module2 + '</div>');

        return 'module1';
    });

    define('module2', [], function () {
        return 'module2';
    });

    define('module1', [], function () {
        return 'moduleShouldNotBeLoaded';
    });

    var divs = $('#qunit-fixture > div');

    assert.equal($(divs[0]).text(), 'module2', 'Module is executed when defined!');
    assert.equal($(divs[1]).text(), 'module1', 'Module is executed when defined!');
    assert.equal(loadedModules[1].instance, 'module1', 'Module has correct instance');
});

QUnit.test('Try to get if module is defined', function (assert) {
    define('module3', [], function () {
        return 'module3';
    });

    require(['module1'], function (module1) {
    });

    define('module1', ['module2', 'module3'], function (module2, module3) {
        var fixture = $('#qunit-fixture');

        fixture.append('<div>' + module2 + '</div>');

        return 'module1';
    });



    var isDefinedModule1 = require.isRequired('module1');
    var isDefinedModule2 = require.isRequired('module2');

    assert.equal(isDefinedModule1, true, 'Module1 is required');
    assert.equal(isDefinedModule2, false, 'Module2 is not required');

    define('module2', [], function () {
        return 'module2';
    });

    isDefinedModule2 = require.isRequired('module2');

    assert.equal(isDefinedModule2, true, 'Module2 is required');
});