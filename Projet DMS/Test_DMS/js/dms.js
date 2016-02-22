$("#jsGrid").jsGrid({
  height: "auto",
  width: "auto",
  autowidth: true,
  filtering: true,
  editing: true,
  inserting: true,
  sorting: true,
  paging: true,
  autoload: true,
  pageSize: 15,
  pageButtonCount: 5,
  noDataContent: "Aucune donn&eacute;e",
  loadMessage: "Veuillez patienter...",
  deleteConfirm: "Etes-vous certain de vouloir supprimer cette ligne ?",
  controller: {
    loadData: $.noop,
    insertItem: $.noop,
    updateItem: $.noop,
    deleteItem: $.noop
  },
  fields: [
    { name: "Name", type: "text", width: 150 },
    { name: "Age", type: "number", width: 50 },
    { name: "Address", type: "text", width: 200 },
    { name: "Country", type: "text", valueField: "Id", textField: "Name" },
    { name: "Married", type: "checkbox", title: "Is Married", sorting: false },
    { type: "control" }
  ],
  data: [
    //{"Pierre Nerzic", "82", "Ici", "Chine", true}
  ]
});



/*function requiredFieldValidator(value) {
if (value == null || value == undefined || !value.length) {
  return {valid: false, msg: "This is a required field"};
} else {
  return {valid: true, msg: null};
}
}

var grid;
var dataView;
var data = [];
var columns = [
{id: "title", name: "Title", field: "title", width: 120, cssClass: "cell-title", editor: Slick.Editors.Text, validator: requiredFieldValidator},
{id: "desc", name: "Description", field: "description", width: 100, editor: Slick.Editors.LongText},
{id: "duration", name: "Duration", field: "duration", editor: Slick.Editors.Text},
{id: "%", name: "% Complete", field: "percentComplete", width: 80, resizable: false, formatter: Slick.Formatters.PercentCompleteBar, editor: Slick.Editors.PercentComplete},
{id: "start", name: "Start", field: "start", minWidth: 60, editor: Slick.Editors.Date},
{id: "finish", name: "Finish", field: "finish", minWidth: 60, editor: Slick.Editors.Date},
{id: "effort-driven", name: "Effort Driven", width: 80, minWidth: 20, maxWidth: 80, cssClass: "cell-effort-driven", field: "effortDriven", editor: Slick.Editors.Text},
{id: "delete", name: "Action", width: 40, cssClass: "cell-title", formatter: Slick.Formatters.Link }
];
var options = {
editable: true,
enableAddRow: true,
enableCellNavigation: true,
asyncEditorLoading: false,
autoEdit: false
};

$(function () {
for (var i = 0; i < 20; i++) {
  var d = (data[i] = {});

  d["id"] = i;
  d["title"] = "Task " + i;
  d["description"] = "This is a sample task description.\n  It can be multiline";
  d["duration"] = "5 days";
  d["percentComplete"] = Math.round(Math.random() * 100);
  d["start"] = "01/01/2009";
  d["finish"] = "01/05/2009";
  d["effortDriven"] = (i % 5 == 0);
}
dataView = new Slick.Data.DataView();
dataView.setItems(data);
grid = new Slick.Grid("#myGrid", dataView, columns, options);

grid.setSelectionModel(new Slick.CellSelectionModel());

dataView.onRowCountChanged.subscribe(function (e, args) {
  grid.updateRowCount();
  grid.render();
});

grid.onAddNewRow.subscribe(function (e, args) {
  var item = args.item;
  grid.invalidateRow(data.length);
  data.push(item);
  grid.updateRowCount();
  grid.render();
});
});

function DeleteData(id, rowId) {
    var result = confirm("Etes-vous sur de vouloir supprimer definitivement cette ligne ?");
    if (result == true) {
      dataView.deleteItem(id);
      dataView.refresh();
    }
}*/

$("#btn_open_csv").click(function() {
  $('#fileLoader').trigger('click');
});

$("#btn_exp_csv").click(function() {
  alert("Exporter CSV");
});

$("#btn_sav_list").click(function() {
  alert("Enregistrer liste");
});

$("#btn_open_proj").click(function() {
  $('#fileOpen').trigger('click');
});

$("#btn_add_row").click(function() {
  //alert("Ce bouton doit \"normalement\" ajouter une ligne");
  dataView.addItem({'id': '500'});
  grid.updateRowCount();
  grid.render();
});
