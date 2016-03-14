function Projet(nom)
{
  this.nom = nom;
  this.key = "";
  this.tableau = {};
  this.tableau.colonnes = [];
  this.tableau.donnees = [];
  this.criteres_speciaux = [];
}

var projet;
var settings;
var key;

if(typeof(Storage) !== "undefined") {
    projet = JSON.parse(localStorage.getItem("projetDMS")) || undefined;
} else {
  var n = noty({
    layout: 'bottomLeft',
    theme: 'relax',
    text: 'Attention, votre navigateur ne supporte pas le stockage local',
    type: 'error',
    animation: {
      open: {height: 'toggle'}, // jQuery animate function property object
      close: {height: 'toggle'}, // jQuery animate function property object
      easing: 'swing', // easing
      speed: 500 // opening & closing animation speed
    }
  });
}

if (typeof projet !== 'undefined')
{
  updateTitle();
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
  $("btn_exp_proj").addClass("disabled");
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
  var vide = false;
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
    vide = true;
  }
  if(!vide)
  {
    var i = 0;
    var trouve = false;
    while(i < projet.criteres_speciaux.length && !trouve)
    {
      if(projet.criteres_speciaux[i].nom == $("#nCritereNom").val()) trouve = true;
      i += 1;
    }
    if(trouve)
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
  }
  if(!vide && !trouve)
  {
    $("#specialCrit").append("<a href='#' class='list-group-item item_crit context-menu-criteres'>"+$("#nCritereNom").val()+"</a>");
    projet.criteres_speciaux.push({'nom': $("#nCritereNom").val()}); // Ajouter aussi les variables et les scores $("#nCritereVar") et $("#nCritereVal")
    loadSpecialCrit();
    updateProject();
  }
});

$("#btn_edit_crit").click(function() {
});

$("#btn_edit_col").click(function() {
});

$("#btn_nouveau_proj").click(function() {
  if(projet != undefined)
  {
      var confirmation = $('[data-remodal-id=modal]').remodal();
      confirmation.open();
  }
  else
  {
    projet = new Projet("Projet");
    $("#toggle-special").bootstrapToggle('off');
    updateProject();
  }
});

$(document).on('confirmation', '.remodal', function () {
  projet = new Projet("Projet");
  $("#toggle-special").bootstrapToggle('off');
  updateProject();
});

$("#btn_ouvrir_proj").click(function() {
  $('#fileOpen').trigger('click');
});

$("#btn_settings").click(function() {
  if(projet != undefined)
  {
    $("#nom_projet").val(projet.nom);
    settings = $('[data-remodal-id=modal-settings]').remodal();
    settings.open();
  }
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
    $("#specialCrit").append("<a href='#' class='list-group-item item_crit context-menu-criteres' id='critere_"+critere+"'>"+projet.criteres_speciaux[critere].nom+"</a>");
  }
}

function loadCol()
{
  $("#colList a").remove();
  for(colonne in projet.tableau.colonnes)
  {
    $("#colList").append("<a href='#' class='list-group-item item_crit context-menu-colonnes' id='colonne_"+colonne+"'>"+projet.tableau.colonnes[colonne].name+"</a>");
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
  else
  {
    $("#btnExec").hide();
    $("#btnReinit").hide();
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
  saveProject();
}

function saveProject()
{
  var projet_string = JSON.stringify(projet);
  localStorage.setItem("projetDMS", projet_string);
}

function changeTitle() {
  console.log("Updating project name");
  setTimeout(changeTitle, 3000);
  projet.nom = $("#nom_projet").val();
  updateTitle();
}

function updateTitle()
{
  document.title = "DMS - "+projet.nom;
}

function confirmKey()
{
  key = $('[data-remodal-id=modal-key]').remodal();
  key.open();
}

$("#btn_confirm_key").click(function(){
  if($("project_key").val() == projet.key)
  {
    localStorage.removeItem("projetDMS");
  }
  else
  {
    var n = noty({
      layout: 'bottomLeft',
      theme: 'relax',
      text: 'La clé entrée est incorrecte',
      type: 'error',
      animation: {
        open: {height: 'toggle'}, // jQuery animate function property object
        close: {height: 'toggle'}, // jQuery animate function property object
        easing: 'swing', // easing
        speed: 500 // opening & closing animation speed
      }
    });
  }
});

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

$("#btnNouveauCritere").click(function() {
  $("#panel_nouveau_critere").slideToggle("slow");
});

$("#close_nouveau_critere").click(function(){
  $("#panel_nouveau_critere").slideUp("slow");
});

$("#btn_sav_settings").click(function() {
  console.log("Saving settings");
  if($("#nom_projet").val() != projet.nom) changeTitle();
  settings.close();
  saveProject();
  var n = noty({
    layout: 'bottomLeft',
    theme: 'relax',
    text: 'Les paramètres ont bien été enregistrés',
    type: 'success',
    animation: {
      open: {height: 'toggle'}, // jQuery animate function property object
      close: {height: 'toggle'}, // jQuery animate function property object
      easing: 'swing', // easing
      speed: 500 // opening & closing animation speed
    }
  });
});

$("#del_local").click(function() {
  confirmKey();
  key.close();
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
            selector: '.context-menu-criteres',
            callback: function(key, options) {
                if(key == "edit")
                {
                  $('.item_crit').trigger('click');
                }
                else if(key == "delete")
                {
                  var position = projet.criteres_speciaux.map(function(e) { return e.nom; }).indexOf($(this).val());
                  projet.criteres_speciaux.splice(position, 1);
                  $(this).remove();
                }
            },
            items: {
                "edit": {name: "Modifier", icon: "edit"},
                "delete": {name: "Supprimer", icon: "delete"}
            }
        });

$.contextMenu({
            selector: '.context-menu-colonnes',
            callback: function(key, options) {
                if(key == "edit")
                {
                  $('.item_crit').trigger('click');
                }
                else if(key == "delete")
                {
                  $(this).remove();
                }
              },
              items: {
                "edit": {name: "Modifier", icon: "edit"},
                "delete": {name: "Supprimer", icon: "delete"}
              }
            });
