function Projet(nom)
{
  this.nom = nom;
  this.tableau = {};
  this.tableau.colonnes = [];
  this.tableau.donnees = [];
  this.criteres_speciaux = [];
}

var projet;
/*var projet = new Projet("Default project");
projet.tableau.colonnes = Array(
{ name: "Constructeur", type: "text" },
{ name: "Couleur", type: "text" },
{ name: "Puissance", type: "number" },
{ name: "Millesime", type: "number" },
{ name: "Nombre de portes", type: "number", valueField: "Id", textField: "Name" },
{ name: "Nombre de places", type: "number", sorting: true},
{ type: "control" });

projet.criteres_speciaux = Array(
{"nom":"Couleurs", "variables":["bleu", "vert", "rouge", "noir"], "valeurs":["2", "3", "4", "6"]},
{"nom":"Villes", "variables":["Lannion", "Plélo", "Saint-Brieuc"], "valeurs":["2", "5", "1"]},
{"nom":"Refroidissements", "variables":["air", "eau", "huile"], "valeurs":["2", "3", "4"]}
);*/
if (typeof projet !== 'undefined')
{
  updateProject();
}
else
{
  $("#btnExec").hide();
  $("#btnReinit").hide();
  $("#btnNouveauCritere").prop("disabled", true);
  $("#btnAjouterCol").prop("disabled", true);
  $("#btn_open_csv").prop("disabled", true);
  $("#btn_exp_csv").prop("disabled", true);
}

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
  if($("#nCritereNom").val() == "" || $("nCritereVar").val() == "" || $("nCritereVal").val() == "")
  {
    var n = noty({
      layout: 'bottomLeft',
      theme: 'relax',
      text: 'Tous les champs doivent être remplis',
      type: 'error',
      animation: {
        open: {height: 'toggle'}, // jQuery animate function property object
        close: {height: 'toggle'}, // jQuery animate function property object
        easing: 'swing', // easing
        speed: 500 // opening & closing animation speed
      }
    });
  }
  else if(projet.criteres_speciaux.indexOf($("#nCritereNom").val(), 0) != -1)
  {
    var n = noty({
      layout: 'bottomLeft',
      theme: 'relax',
      text: 'Il existe déjà un critère portant ce nom',
      type: 'error',
      animation: {
        open: {height: 'toggle'}, // jQuery animate function property object
        close: {height: 'toggle'}, // jQuery animate function property object
        easing: 'swing', // easing
        speed: 500 // opening & closing animation speed
      }
    });
  }
  else
  {
    $("#specialCrit").append("<a href='#' class='list-group-item item_crit context-menu-one'>"+$("#nCritereNom").val()+"</a>");
    projet.criteres_speciaux.push({'nom': $("#nCritereNom").val()}); // Ajouter aussi les variables et les scores $("#nCritereVar") et $("#nCritereVal")
    loadSpecialCrit();
    updateProject();
  }
});

$("#btn_edit_list").click(function() {
});

$("#btn_edit_col").click(function() {
});

$("#btn_nouveau_proj").click(function() {
  projet = new Projet("Projet");
  updateProject();
});

$("#btn_ouvrir_proj").click(function() {
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

function loadSpecialCrit()
{
  $("#selectCrit option").remove();
  $("#specialCrit a").remove();
  for(critere in projet.criteres_speciaux)
  {
    $("#selectCrit").append("<option>"+projet.criteres_speciaux[critere].nom+"</option>");
    $("#specialCrit").append("<a href='#' class='list-group-item item_crit context-menu-one' id='critere_"+critere+"'>"+projet.criteres_speciaux[critere].nom+"</a>");
  }
}

function loadCol()
{
  $("#colList a").remove();
  for(colonne in projet.tableau.colonnes)
  {
    $("#colList").append("<a href='#' class='list-group-item item_crit context-menu-one' id='colonne_"+colonne+"'>"+projet.tableau.colonnes[colonne].name+"</a>");
  }
}

function updateProject()
{
  if(projet.tableau.colonnes.length > 0 && projet.tableau.donnees.length > 0)
  {
    $("#btn_exp_csv").prop("disabled", false);
    $("#btnExec").show();
    $("#btnReinit").show();
  }
  if(projet.criteres_speciaux.length == 0)
  {
    $('#toggle-special').bootstrapToggle('disable');
  }
  else
  {
    $('#toggle-special').bootstrapToggle('enable');
  }

  $("#toggle-special").bootstrapToggle('off');
  $("#btn_open_csv").prop("disabled", false);
  $("#btnNouveauCritere").prop("disabled", false);
  $("#btnAjouterCol").prop("disabled", false);
  loadSpecialCrit();
  loadCol();
}

function saveProject()
{
  var projet_string = JSON.stringify(projet);
  localStorage.setItem("projetDMS", projet_string);
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

  $("#btn_sav_colonne").click(function() {
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
