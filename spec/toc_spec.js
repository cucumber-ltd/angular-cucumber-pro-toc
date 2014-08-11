describe('toc', function () {
  var element, scope, compile;

  beforeEach(module('CucumberProTOC'));

  beforeEach(inject(function($rootScope, $compile) {
    element = $('<div><cp-toc docs="docs"></cp-toc></div>');
    scope = $rootScope.$new();
    compile = $compile;
  }));

  it('renders one <li> per doc', function (callback) {
    renderDocs([
      { path: 'foo.feature', name: 'Foo' },
      { path: 'foo/bar/baz.feature', name: 'Baz' },
    ]);

    var listItems = element.find('li');
    expect(listItems.length).toBe(2);
  });

  it('updates when the docs attribute changes', function (callback) {
    renderDocs([
      { path: 'foo.feature', name: 'Foo' },
    ]);

    var listItems = element.find('li');
    expect(listItems.length).toBe(1);

    scope.docs.push({ path: 'bar.feature', name: 'Bar' });
    scope.$digest();
    var listItems = element.find('li');
    expect(listItems.length).toBe(2);
  });

  it('renders with a `dirty` class if the doc is dirty', function (callback) {
    renderDocs([
      { path: 'clean.feature', name: 'Clean', isDirty: function () { return false; } },
      { path: 'dirty.feature', name: 'Dirty', isDirty: function () { return true; } },
    ]);

    var listItems = element.find('li');
    expect($(listItems[0]).hasClass('dirty')).toBeFalsy();
    expect($(listItems[1]).hasClass('dirty')).toBeTruthy();
  });

  it('renders with an `open` class if the doc is open', function (callback) {
    element = $('<div><cp-toc docs="docs" current-doc-path="\'open.feature\'"></cp-toc></div>');
    renderDocs([
      { path: 'not_open.feature', name: 'Not open' },
      { path: 'open.feature', name: 'Open' },
    ]);

    var listItems = element.find('li');
    expect($(listItems[0]).hasClass('open')).toBeFalsy();
    expect($(listItems[1]).hasClass('open')).toBeTruthy();
  });

  it('renders with an `outdated` class if the doc is outdated', function (callback) {
    element = $('<div><cp-toc docs="docs"></cp-toc></div>');
    renderDocs([
      { path: 'outdated.feature', name: 'Outdated', isOutdated: function () { return true; } },
      { path: 'pristine.feature', name: 'Pristine', isOutdated: function () { return false; } }
    ]);

    var listItems = element.find('li');
    expect($(listItems[0]).hasClass('outdated')).toBeTruthy();
    expect($(listItems[1]).hasClass('outdated')).toBeFalsy();
  });

  xit('fires the onclick function when clicked', function (callback) {
    scope.$apply(function () {
      scope.onClickFn = jasmine.createSpy('on-click callback');
    });
    element = $('<div><cp-toc docs="docs" on-click="onClickFn(doc)"></cp-toc></div>');
    var docs = [
      { path: 'clicked.feature', name: 'Clicked' },
      { path: 'not_clicked.feature', name: 'Not clicked' },
    ];
    var expectedDoc = docs[1];
    renderDocs(docs);

    var link = element.find('li').eq(0).find('a');
    link.click();
    expect(scope.onClickFn).toHaveBeenCalledWith(expectedDoc);
  });

  function renderDocs(docs) {
    scope.docs = docs;
    compile(element)(scope);
    scope.$digest();
  }
});
