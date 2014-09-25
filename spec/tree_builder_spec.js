describe('TreeBuilder', function () {
  var TreeBuilder;

  beforeEach(module('CucumberProTOC'));

  beforeEach(inject(function(_TreeBuilder_) {
    TreeBuilder = _TreeBuilder_;
  }));

  function tree(docs, root) {
    return new TreeBuilder(docs, root).tree();
  }

  it('builds a flat tree', function () {
    var docs = [
      { path: 'a.feature' },
      { path: 'b.feature' }
    ];
    var expected = [
      { path: 'a.feature' },
      { path: 'b.feature' }
    ];
    expect(tree(docs)).toEqual(expected);
  });

  it('builds a one-level nested tree, naming directories', function () {
    var docs = [
      { path: 'a.feature' },
      { path: 'b/c.feature' }
    ];
    var expected = [
      { path: 'a.feature' },
      { path: 'b', name: 'B', children: [
        { path: 'b/c.feature' }
      ]}
    ];
    expect(tree(docs)).toEqual(expected);
  });

  it('infers the directory name from the path', function () {
    var docs = [
      { path: 'a.feature' },
      { path: 'this_folder/b.feature' },
    ];
    var dir = _.find(tree(docs), function (node) { return node.path === 'this_folder'; });
    expect(dir.name).toEqual('This folder');
  });

  it('builds a two-level nested tree', function () {
    var docs = [
      { path: '1.feature' },
      { path: 'a/2.feature' },
      { path: 'a/b/3.feature' }
    ];
    var expected = [
      { path: '1.feature' },
      { path: 'a', name: 'A', children: [
        { path: 'a/2.feature' },
        { path: 'a/b', name: 'B', children: [
          { path: 'a/b/3.feature' }
        ] }
      ] }
    ];
    expect(tree(docs)).toEqual(expected);
  });

  describe('truncating', function () {
    it('truncates the root directory for a simple hierarchy', function () {
      var docs = [
        { path: 'features/1.feature' },
        { path: 'features/2.feature' }
      ];
      // note that there's no directory wrapping these docs
      var expected = [
        { path: 'features/1.feature' },
        { path: 'features/2.feature' }
      ]
      expect(tree(docs)).toEqual(expected);
    });

    it('truncates the ancestor directories for a deep hierarchy', function () {
      var docs = [
        { path: 'src/com/relish/features/a.feature' }
      ];

      var expected = [
        { path: 'src/com/relish/features/a.feature' }
      ]
      expect(tree(docs)).toEqual(expected);
    });

    it('truncates the common ancestor directories for a deep hierarchy', function () {
      var docs = [
        { path: 'src/com/relish/features/publishing/a.feature' },
        { path: 'src/com/relish/features/reading/a.feature' }
      ];

      var expected = [
        { path: 'src/com/relish/features/publishing', name: 'Publishing', children: [
          { path: 'src/com/relish/features/publishing/a.feature' }
        ]},
        { path: 'src/com/relish/features/reading', name: 'Reading', children: [
          { path: 'src/com/relish/features/reading/a.feature' }
        ]},
      ]
      expect(tree(docs)).toEqual(expected);
    });

    // I've decided to de-prioritise this for now, as implementation is complex --Matt
    xit('truncates the common ancestor directories for a deep uneven hierarchy', function () {
      var docs = [
        { path: 'features/publishing/a.feature' },
        { path: 'features/reading/docs/a.feature' }
      ];

      var expected = [
        { path: 'features/publishing', name: 'Publishing', children: [
          { path: 'features/publishing/a.feature' }
        ]},
        { path: 'features/reading', name: 'Reading', children: [
          { path: 'features/reading/docs', name: 'Docs', children: [
            { path: 'features/reading/docs/a.feature' }
          ]}
        ]},
      ]
      expect(tree(docs)).toEqual(expected);
    });

  });

  it('can start from a path below the root', function () {
    var docs = [
      { path: 'x.feature' },
      { path: 'a/y.feature' },
      { path: 'a/b/z.feature' }
    ];
    var expected = [
      { path: 'a/y.feature' },
      { path: 'a/b', name: 'B', children: [
        { path: 'a/b/z.feature' }
      ] }
    ];
    expect(tree(docs, 'a/')).toEqual(expected);
  });

  it('throws an error if given an invalid root', function () {
    var docs = [
      { path: 'a/b/c.feature' }
    ];
    expect(function () { tree(docs, 'a/')}).not.toThrow();
    expect(function () { tree(docs, 'a/b/')}).not.toThrow();
    expect(function () { tree(docs, 'a')}).toThrow();
    expect(function () { tree(docs, 'wat')}).toThrow();
    expect(function () { tree(docs, 'b/')}).toThrow();
  });

});
