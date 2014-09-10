describe('TreeBuilder', function () {
  var TreeBuilder;

  beforeEach(module('CucumberProTOC'));

  beforeEach(inject(function(_TreeBuilder_) {
    TreeBuilder = _TreeBuilder_;
  }));

  it('builds a flat tree', function () {
    var docs = [
      { path: 'foo.feature', name: 'Foo' },
      { path: 'bar.feature', name: 'Bar' }
    ];
    var expected = [
      { path: 'foo.feature', name: 'Foo', children: [] },
      { path: 'bar.feature', name: 'Bar', children: [] }
    ];
    var builder = new TreeBuilder(docs);
    expect(builder.tree()).toEqual(expected);
  });

  it('builds a nested tree', function () {
    var docs = [
      { path: 'a.feature', name: 'A' },
      { path: 'b/c.feature', name: 'C' }
    ];
    var expected = [
      { path: 'a.feature', name: 'A', children: [] },
      { path: 'b', name: 'B', children: [
        { path: 'b/c.feature', name: 'C', children: [] }
      ]}
    ];
    var builder = new TreeBuilder(docs);
    expect(builder.tree()).toEqual(expected);
  });

});
