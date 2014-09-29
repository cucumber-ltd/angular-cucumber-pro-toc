describe('toc', function () {
  var element, scope, compile, $q

  beforeEach(module('CucumberProTOC'));

  beforeEach(inject(function($rootScope, $compile, _$q_) {
    element = $('<div><cp-toc docs="docs"></cp-toc></div>');
    scope = $rootScope.$new();
    compile = $compile;
    $q = _$q_;
  }));

  it('renders a single doc', function () {
    renderDocs([
      { path: 'foo.feature', name: 'Foo' },
    ]);
    expect(element.find('li').length).toBe(1);
  });

  it('handles undefined docs', function () {
    renderDocs();
    expect(element.find('li').length).toBe(0);
  });

  it('handles promises (e.g. an angular resource)', function () {
    var docs = [
      { path: 'foo.feature', name: 'Foo' },
    ];
    var deferred = $q.defer();
    renderDocs({ $promise: deferred.promise });

    expect(element.find('li').length).toBe(0);
    deferred.resolve(docs);
    scope.$apply();
    expect(element.find('li').length).toBe(1);
  });

  it('renders one <li> per doc', function () {
    renderDocs([
      { path: 'foo.feature', name: 'Foo' },
      { path: 'bar.feature', name: 'Bar' }
    ]);

    expect(element.find('li').length).toBe(2);
  });

  xit('renders nested lists', function ()  {
    renderDocs([
      { path: 'one.feature', name: 'One' },
      { path: 'two/three.feature', name: 'Three' },
      { path: 'two/four.feature', name: 'Four' }
    ]);

    var links = element.find('nav ol li a').toArray();
    names = links.map(function (a) { return a.text; });
    expect(names).toEqual(["One", "Two"]);

    var links = element.find('nav ol li ol li a').toArray();
    names = links.map(function (a) { return a.text; });
    expect(names).toEqual(["Three", "Four"]);
  });

  it('updates when the docs attribute is mutated', function () {
    renderDocs([
      { path: 'foo.feature', name: 'Foo' }
    ]);

    expect(element.find('li').length).toBe(1);
    scope.docs.push({ path: 'bar.feature', name: 'Bar' });
    scope.$digest();
    expect(element.find('li').length).toBe(2);
  });

  // TODO - consider getting the client to do this
  it('renders with an `open` class if the doc is open', function () {
    element = $('<div><cp-toc docs="docs" current-doc-path="\'open.feature\'"></cp-toc></div>');
    renderDocs([
      { path: 'not_open.feature', name: 'Not open' },
      { path: 'open.feature', name: 'Open' }
    ]);

    var listItems = element.find('li');
    expect($(listItems[0]).hasClass('open')).toBeFalsy();
    expect($(listItems[1]).hasClass('open')).toBeTruthy();
  });

  it("hides directories' children if not on the path to the current doc", function () {
    element = $('<div><cp-toc docs="docs" current-doc-path="\'a/2.feature\'"></cp-toc></div>');
    renderDocs([
      { path: '1.feature', name: 'Open' },
      { path: 'a/2.feature', name: 'Open' },
      { path: 'b/3.feature', name: 'Not open' }
    ]);
    /* should render as:
       - 1
       - A
       -   2
       - B
       */
    function isHidden(element) {
      return $(element).attr('class').match(/ng-hide/); 
    }
    var listItems = _.reject(element.find('li'), isHidden);
    expect(listItems.length).toBe(4);
  });

  it('renders li elements with the dynamic class specified li-class', function () {
    element = $('<div><cp-toc docs="docs" li-class="{ crazy: node.isCrazy() }"></cp-toc></div>');
    renderDocs([
      { path: 'crazy.feature', name: 'Crazy', isCrazy: function () { return true; } },
      { path: 'sleepy.feature', name: 'Sleepy', isCrazy: function () { return false; } }
    ]);

    var listItems = element.find('li');
    expect($(listItems[0]).hasClass('crazy')).toBeTruthy();
    expect($(listItems[1]).hasClass('crazy')).toBeFalsy();
  });

  // TODO: work out how to test this - it works, but I can't test it!
  xit('fires the onclick function when clicked', function (callback) {
    scope.$apply(function () {
      scope.onClickFn = jasmine.createSpy('on-click callback');
    });
    element = $('<div><cp-toc docs="docs" on-click="onClickFn(doc)"></cp-toc></div>');
    var docs = [
      { path: 'clicked.feature', name: 'Clicked' },
      { path: 'not_clicked.feature', name: 'Not clicked' }
    ];
    renderDocs(docs);

    var link = element.find('li').eq(0).find('a');
    link.click();
    expect(scope.onClickFn).toHaveBeenCalledWith(docs[0]);
  });

  function renderDocs(docs) {
    scope.docs = docs;
    compile(element)(scope);
    scope.$digest();
  }
});
