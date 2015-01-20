if (typeof String.prototype.startsWith != 'function') {
  // see below for better implementation!
  String.prototype.startsWith = function(str) {
    return this.indexOf(str) == 0;
  };
}

if(!window.RDFE)
  window.RDFE = {};

RDFE.Editor = function(ontoMan, params) {
  var self = this;

  // empty default doc
  this.doc = new RDFE.Document();
  this.ontologyManager = ontoMan;
};

RDFE.Editor.io_strip_URL_quoting = function(str) {
  return (str.replace(RegExp('^<(.*)>$'), '$1'));
};

RDFE.Editor.prototype.makeTriple = function(s, p, o) {
  ss = this.doc.store.rdf.createNamedNode(RDFE.Editor.io_strip_URL_quoting(s));
  pp = this.doc.store.rdf.createNamedNode(RDFE.Editor.io_strip_URL_quoting(p));
  // let's be dumb about this for now
  o = RDFE.Editor.io_strip_URL_quoting(o);
  if (o.startsWith("http") || o.startsWith("urn")) {
    oo = this.doc.store.rdf.createNamedNode(o);
  } else {
    oo = this.doc.store.rdf.createLiteral(o, null, null);
  }
  return (this.doc.store.rdf.createTriple(ss, pp, oo));
};

RDFE.Editor.prototype.createTripleList = function(doc, container, callback) {
  var self = this;
  this.doc = doc;

  this.tripleView = new RDFE.TripleView(doc);
  this.tripleView.render(container, callback);
};

RDFE.Editor.prototype.createNewStatementEditor = function(container) {
  var self = this;

  if (!this.doc)
    return false;

  container.html(' \
      <div class="panel panel-default"> \
      <div class="panel-heading"><h3 class="panel-title">Add New Triple</h3></div> \
      <div class="panel-body"> \
      <div class="form-horizontal"> \
      <div class="form-group"><label for="subject" class="col-sm-2 control-label">Subject</label> \
      <div class="col-sm-10"><input name="subject" class="form-control" /></div></div> \
      <div class="form-group"><label for="predicate" class="col-sm-2 control-label">Predicate</label> \
      <div class="col-sm-10"><input name="predicate" class="form-control" /></div></div> \
      <div class="form-group"><label for="object" class="col-sm-2 control-label">Object</label> \
      <div class="col-sm-10"><input name="object" class="form-control" /></div></div> \
      <div class="form-group"><div class="col-sm-10 col-sm-offset-2"><a href="#" class="btn btn-default triple-action triple-action-new-cancel">Cancel</a> \
        <a href="#" class="btn btn-primary triple-action triple-action-new-save">Save</a></div></div> \
      </div></div> \
      </form>\n');

  container.find('a.triple-action-new-cancel').click(function(e) {
    container.empty();
  });

  container.find('a.triple-action-new-save').click(function(e) {
    // FIXME: use the same editors we use in the tables
    // FIXME: get the range of the property and convert the object accordingly
    var s = container.find('input[name="subject"]').val();
    var p = container.find('input[name="predicate"]').val();
    var o = container.find('input[name="object"]').val();
    var t = self.makeTriple(s, p, o);
    self.doc.addTriple(t, function() {
      container.empty();

      if (self.tripleTable) {
        var i = self.tripleTable.data('maxindex');
        i += 1;
        self.tripleTable.bootstrapTable('append', $.extend(t, {
          id: i
        }));
        self.tripleTable.data('maxindex', i);
      }
    }, function() {
      $(self).trigger('rdf-editor-error', {
        "type": 'triple-insert-failed',
        "message": "Failed to add new triple to store."
      });
    });
  });
};

RDFE.Editor.prototype.createNewEntityEditor = function(container, manager) {
  var self = this;
  var $classesSelect, classesSelect;

  if (!this.doc) {
    return false;
  }

  container.html(
    '<div class="panel panel-default">' +
    '<div class="panel-heading"><h3 class="panel-title">Add New Entity</h3></div>' +
    '<div class="panel-body">' +
    '<div class="form-horizontal"> ' +
    '  <div class="form-group"> ' +
    '    <label for="ontology" class="col-sm-2 control-label">Ontology</label> ' +
    '    <div class="col-sm-10"> ' +
    '      <select name="ontology" id="ontology" class="form-control" /> ' +
    '    </div> ' +
    '  </div> ' +
    '  <div class="form-group"> ' +
    '    <label for="class" class="col-sm-2 control-label">Type</label> ' +
    '    <div class="col-sm-10"> ' +
    '      <select name="class" id="class" class="form-control" /> ' +
    '    </div> ' +
    '  </div> ' +
    '  <div class="form-group"> ' +
    '     <label for="subject" class="col-sm-2 control-label">Entity URI</label> ' +
    '     <div class="col-sm-10"> ' +
    '       <input name="subject" id="subject" class="form-control" /> ' +
    '     </div> ' +
    '  </div> ' +
    '  <div class="form-group"> ' +
    '    <div class="col-sm-10 col-sm-offset-2"> ' +
    '      <a href="#" class="btn btn-default triple-action triple-action-new-cancel">Cancel</a> ' +
    '      <a href="#" class="btn btn-primary triple-action triple-action-new-save">Save</a> ' +
    '    </div> ' +
    '  </div> ' +
    '</div></div></div>\n');

  $('#ontology').ontoBox({
    ontoManager: manager
  }).on('changed', function(e, ontology) {
    classesSelect.clearOptions();
    if(ontology)
      classesSelect.addOption(ontology.classes);
  });

  $classesSelect = $('#class').selectize({
    create: function(input, cb) {
      cb({ URI: input });
    },
    valueField: 'URI',
    sortField: [ 'label', 'URI' ],
    searchField: [ 'label', 'URI' ],
    options: [],
    render: {
      item: function(item, escape) {
        return '<div>' + escape(item.label || item.title || item.URI) + '</div>';
      },
      option: function(item, escape) {
        return '<div>' + escape(item.label || item.title || item.URI) + '<br/><small>(' + escape(item.URI) + ')</small></div>';
      }
    }
  });
  classesSelect = $classesSelect[0].selectize;

  container.find('a.triple-action-new-cancel').click(function(e) {
    container.empty();
  });

  container.find('a.triple-action-new-save').click(function(e) {
    var c = $('#class')[0].selectize.getValue();
    var s = container.find('input[name="subject"]').val();
    var t = self.makeTriple(s, RDFE.uriDenormalize('rdf:type'), c);
    self.doc.addTriple(t, function() {
      container.empty();

      if (self.entityTable) {
        var i = self.entityTable.data('maxindex');
        self.entityTable.bootstrapTable('append', {"uri": s, "label": s, "id": i});
        self.entityTable.data('maxindex', i+1);
      }
    }, function() {
      $(self).trigger('rdf-editor-error', {
        "type": 'triple-insert-failed',
        "message": "Failed to add new triple to store."
      });
    });
  });
};

RDFE.Editor.prototype.createEntityList = function(doc, container, callback) {
  var el = new RDFE.EntityView(doc, this.ontologyManager);
  el.render(container, callback);
};
