var buildify = require('buildify');

// the main sources of the RDF Editor
var jsRdfe = [
  "js/rdfe/rdfnode.js",
  "js/rdfe/backbone-forms-rdfnode.js",
  "js/rdfe/ontology.js",
  "js/rdfe/editor.js",
  "js/rdfe/jquery.rdfnodeinput.js",
  "js/rdfe/io.js",
  "js/rdfe/jquery.ontobox.js",
  "js/rdfe/document_backbone_bridge.js",
  "js/rdfe/entityview.js",
  "js/rdfe/rdf_store_ext.js",
  "js/rdfe/config.js",
  "js/rdfe/editable-rdfnode.js",
  "js/rdfe/entityeditor.js",
  "js/rdfe/tripleview.js",
  "js/rdfe/document.js",
];

// Third-party libs which we modified in one way or another
var jsCustomDeps = [
  "js/val.js",
  "js/backbone-forms-list.js",
  "js/rdf_store.js",
  "js/rdfxml_parser.js"
];

// Vanialla Third-party dependencies
var jsDeps = [
  "js/jquery-1.11.1.min.js",
  "js/jstorage.js",
  "js/bootstrap.min.js",
  "js/bootstrap-table.js",
  "js/bootstrap-editable.js",
  "js/bootstrap-datetimepicker.min.js",
  "js/bootstrap-table.min.js",
  "js/bootstrap-table-editable.js",
  "js/bootstrap-toggle.min.js",
  "js/bootstrap-growl.min.js",
  "js/underscore-min.js",
  "js/backbone-min.js",
  "js/backbone-forms.js",
  "js/backbone-forms-bootstrap3.js",
  "js/spin.js",
  "js/jquery.spin.js",
  "js/jquery.cookie.js",
  "js/typeaheadjs.js",
  "js/typeahead.js",
  "js/bootbox.min.js",
  "js/selectize.min.js",
  "js/jquery-deparam.min.js",
  "js/n3-browser.min.js"
];

buildify()
  .concat(jsDeps)
  .concat(jsCustomDeps)
  .concat(jsRdfe)
  .save('distribution/rdfe-standalone.js')
  .uglify()
  .save('distribution/rdfe-standalone.min.js');
