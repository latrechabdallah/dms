function Projet(nom)
{
  this.nom = nom;
  this.tableau = {};
  this.tableau.colonnes = [];
  this.tableau.donnees = [];
}

var projet = new Projet("Default project");
projet.tableau.colonnes = Array(
{ name: "Constructeur", type: "text" },
{ name: "Couleur", type: "text" },
{ name: "Puissance", type: "number" },
{ name: "Millesime", type: "number" },
{ name: "Nombre de portes", type: "number", valueField: "Id", textField: "Name" },
{ name: "Nombre de places", type: "number", sorting: true},
{ type: "control" });

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
  datatype: "json",
  controller: {
    loadData: $.noop,
    insertItem: $.noop,
    updateItem: $.noop,
    deleteItem: $.noop
  },
  fields: projet.tableau.colonnes,
  data: [
    {"Constructeur":"Renault", "Couleur":"Noir", "Puissance":"75", "Millesime":"2008", "Nombre de portes":"5", "Nombre de places":"5"},
    {"Constructeur":"Bugatti", "Couleur":"Noir", "Puissance":"1200", "Millesime":"2008", "Nombre de portes":"3", "Nombre de places":"2"}
  ]
});

$("#btn_open_csv").click(function() {
  $('#fileLoader').trigger('click');
});

$("#btn_exp_csv").click(function() {
  var entetes = projet.tableau.colonnes;
  var lignes = projet.tableau.donnees;

  /* merge defaults and options, without modifying defaults */
  var tab = $.extend({}, entetes, lignes);
  var csv = Papa.unparse(tab);
  var blob = new Blob([csv], {type: 'text/csv;charset=utf-8;'});
  if (navigator.msSaveBlob)
  { // IE 10+
    navigator.msSaveBlob(blob, 'dms_table.csv');
  }
  else
  {
    var link = document.createElement("a");
    if (link.download !== undefined)// feature detection Browsers that support HTML5 download attribute
    {
      var url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", 'dms_table.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
});

$("#btn_sav_critere").click(function() {
  if($("#nCritereNom").val() == "" || $("nCritereVar").val() == "" || $("nCritereVal").val() == "") // + Vérifier si la liste existe déja
  {
  }
  else
  {
    $("#specialCrit").append("<a href='#' class='list-group-item item_crit context-menu-one'>"+$("#nCritereNom").val()+"</a>");
  }
});

$("#btn_edit_list").click(function() {
  alert("Editer liste");
});

$("#btn_edit_col").click(function() {
  alert("Editer colonne");
});

$("#btn_open_proj").click(function() {
  $('#fileOpen').trigger('click');
});

$("#btnReinit").click(function() {
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
    datatype: "json",
    controller: {
      loadData: $.noop,
      insertItem: $.noop,
      updateItem: $.noop,
      deleteItem: $.noop
    },
    fields: projet.colonnes,
    data: []
  });
});

function updateTable()
{
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
    datatype: "json",
    controller: {
      loadData: $.noop,
      insertItem: $.noop,
      updateItem: $.noop,
      deleteItem: $.noop
    },
    fields: projet.colonnes,
    data: projet.donnees
  });
}

  $(document).on('click', '.item_crit', function(){
    $("#panel_edit").slideDown("slow");
  });

  $(".item_crit").click(function(){
    $("#panel_edit").slideDown("slow");
  });

  $("#close_edit_panel").click(function(){
    $("#panel_edit").slideUp("slow");
  });

  $(".colonne").click(function(){
    $("#panel_edit_col").slideDown("slow");
  });

  $("#close_edit_panel_col").click(function(){
    $("#panel_edit_col").slideUp("slow");
  });

  $("#btnAjouterCol").click(function(){
    $("#panel_ajouter_col").slideToggle("slow");
  });

  $("#close_ajouter_panel_col").click(function(){
    $("#panel_ajouter_col").slideUp("slow");
  });

  $("#btnNouveauCritere").click(function(){
    $("#panel_nouveau_critere").slideToggle("slow");
  });

  $("#close_nouveau_critere").click(function(){
    $("#panel_nouveau_critere").slideUp("slow");
  });

  $('#toggle-special').bootstrapToggle();
  $('#selectCrit').hide();

  $('#toggle-special').change(function() {
      if($(this).prop('checked'))
      {
        $('#nomCol').hide();
        $('#selectCrit').show();
      }
      else
      {
        $('#nomCol').show();
        $('#selectCrit').hide();
      }
    })

$( "#fileOpen" ).change(function() {
  var file = document.getElementById('fileOpen').files[0];
  if(file)
  {
    var reader = new FileReader();
    reader.readAsText(file);
    reader.onload = function(e) {
      temp =
      projet = JSON.parse(reader.result);

      console.log(JSON.stringify(projet));
      updateTable();
    }
  }

});

$.contextMenu({
            selector: '.context-menu-one',
            callback: function(key, options) {
                if(key == "edit")
                {
                  $('.item_crit').trigger('click');
                }
                else
                {

                }
            },
            items: {
                "edit": {name: "Modifier", icon: "edit"},
                "delete": {name: "Supprimer", icon: "delete"}
            }
        });

        $('.context-menu-one').on('click', function(e){
            console.log('clicked', this);
        })


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
