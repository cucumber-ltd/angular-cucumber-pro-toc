describe('TreeBuilder', function () {
  var TreeBuilder;

  beforeEach(module('CucumberProTOC'));

  beforeEach(inject(function(_TreeBuilder_) {
    TreeBuilder = _TreeBuilder_;
  }));

  it('builds a tree', function () {
    var docs = [
      { path: 'foo.feature', name: 'Foo' }
    ];
    var expected = [
      { path: 'foo.feature', name: 'Foo', docs: [] }
    ];
    var builder = new TreeBuilder(docs);
    expect(builder.tree()).toEqual(expected);
  });
});
