function Projet(nom, key)
{
  this.nom = nom;
  this.key = key;
  this.tableau = {};
  this.tableau.colonnes = [];
  this.tableau.donnees = [];
  this.criteres_speciaux = [];
}

var projet;

// Fenetres modales
var confirmation;
var settings;
var key;

if(typeof(Storage) !== "undefined") {
    projet = JSON.parse(localStorage.getItem("projetDMS")) || undefined;
} else {
  notification('error', 'Attention, votre navigateur ne supporte pas le stockage local')
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
  var format_correct = true;
  var nb_egaux = true;
  if($("#nCritereNom").val() == "" || $("#nCritereVar").val() == "" || $("#nCritereVal").val() == "")
  {
    notification('error', 'Tous les champs doivent être remplis');
    vide = true;
  }
  if(!vide)
  {
    var i = 0;
    var trouve = false;
    var reg1 = new RegExp("^((([A-z]|[0-9])+;)*)[^;]+$");
    var reg2 = new RegExp("^(([0-9]+;)*)[0-9]+$");

    if(!(reg1.test($("#nCritereVar").val())))
    {
      format_correct = false;
      notification('error', "Le format des variables est incorrect (Vérifiez qu'elles sont bien toutes séparées par des ; et qu'il n'y a pas de ; a la fin)");
    }
    else if(!(reg2.test($("#nCritereVal").val())))
    {
      format_correct = false;
      notification('error', "Le format des valeurs est incorrect (Vérifiez qu'elles sont bien toutes séparées par des ; et qu'il n'y a pas de ; a la fin)");
    }
    if(format_correct)
    {
      if($("#nCritereVar").val().split(";").length != $("#nCritereVal").val().split(";").length)
      {
        nb_egaux = false;
        notification('error', "Il n'y a pas le même nombre de variables et de valeurs");
      }
    }
    while(i < projet.criteres_speciaux.length && !trouve && format_correct && nb_egaux)
    {
      if(projet.criteres_speciaux[i].nom == $("#nCritereNom").val()) trouve = true;
      i += 1;
    }
    if(trouve)
    {
      notification('error', 'Il existe déjà un critère portant ce nom');
    }
  }
  if(!vide && !trouve && format_correct && nb_egaux)
  {
    $("#specialCrit").append("<a href='#' class='list-group-item item_crit context-menu-criteres'>"+$("#nCritereNom").val()+"</a>");
    var variables = $("#nCritereVar").val().split(";");
    var valeurs = $("#nCritereVal").val().split(";");
    projet.criteres_speciaux.push({'nom': $("#nCritereNom").val(), 'variables': variables, 'valeurs': valeurs});
    $("#nCritereNom").val("");
    $("#nCritereVar").val("");
    $("#nCritereVal").val("");
    loadSpecialCrit();
    updateProject();
  }
});

$("#btn_edit_crit").click(function() {
  notification('information', "ne fonctionne pas pour l'instant");
});

$("#btn_edit_col").click(function() {
});

$("#btn_nouveau_proj").click(function() {
  if(projet != undefined)
  {
      $("#btn_confirm_key_del").hide();
      $("#btn_confirm_key_new").show();
      confirmKey();
  }
  else
  {
    $("#toggle-special").bootstrapToggle('off');
    new_project = $('[data-remodal-id=modal-new-project]').remodal();
    new_project.open();
  }
});

$("#btn_confirm_key_new").click(function() {
  if($("#project_key").val() == projet.key)
  {
    $("#project_key").val("");
    key.close();
    confirmation = $('[data-remodal-id=modal]').remodal();
    confirmation.open();
  }
  else
  {
    notification('error', 'La clé entrée est incorrecte');
  }
});

$("#btn_new_project").click(function() {
  if($("#project_name_new").val() == "" || $("#project_key_new").val() == "")
  {
    notification('error', 'Tous les champs doivent être remplis');
  }
  else if($("#project_key_new").val().length < 4)
  {
    notification('error', 'La clé doit faire au moins 4 caractères');
  }
  else
  {
    projet = new Projet($("#project_name_new").val(), $("#project_key_new").val());
    new_project.close();
    updateProject();
    changeTitle($("#project_name_new").val());
    $("#project_name_new").val("");
    $("#project_key_new").val("");
    if(projet != undefined)
    {
      notification('success', 'Le projet '+projet.nom+' a bien été créé');
    }
  }
});

$("#btn_ouvrir_proj").click(function() {
  $('#fileOpen').trigger('click');
});

$("#btn_cancel_new_proj").click(function() {
  confirmation.close();
});

$("#btn_val_new_proj").click(function() {
  confirmation.close();
  new_project = $('[data-remodal-id=modal-new-project]').remodal();
  new_project.open();
  $("#toggle-special").bootstrapToggle('off');
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
    $("#toggle-special").bootstrapToggle('off');
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

function changeTitle(newTitle) {
  projet.nom = newTitle;
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

function notification(type, message)
{
  var n = noty({
    layout: 'bottomLeft',
    theme: 'relax',
    text: message,
    type: type,
    animation: {
      open: {height: 'toggle'}, // jQuery animate function property object
      close: {height: 'toggle'}, // jQuery animate function property object
      easing: 'swing', // easing
      speed: 500 // opening & closing animation speed
    }
  });
}

$("#btn_confirm_key_del").click(function(){
  if($("#project_key").val() == projet.key)
  {
    localStorage.removeItem("projetDMS");
    $("#project_key").val("");
    key.close();
    location.reload();
  }
  else
  {
    notification('error', 'La clé entrée est incorrecte');
  }
});

$(document).on('click', '.item_crit', function(){
  editCritere($(this));
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
  if($("#nom_projet").val() != projet.nom) changeTitle($("#nom_projet").val());
  settings.close();
  saveProject();
  notification('success', 'Les paramètres ont bien été enregistrés');
});

$("#del_local").click(function() {
  $("#btn_confirm_key_del").show();
  $("#btn_confirm_key_new").hide();
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

function editCritere(element)
{
  var id_sub = element.attr("id").split("_");
  var position = id_sub[1];
  var critere_special = projet.criteres_speciaux[position];
  var variables = critere_special.variables.join(";");
  var valeurs = critere_special.valeurs.join(";");
  $("#mCritereNom").val(critere_special.nom);
  $("#mCritereVar").val(variables);
  $("#mCritereVal").val(valeurs);
}

$.contextMenu({
            selector: '.context-menu-criteres',
            callback: function(key, options) {
                var id_sub = $(this).attr("id").split("_");
                var position = id_sub[1];
                if(key == "edit")
                {
                  editCritere($(this));
                  $("#panel_edit").slideDown("slow");
                }
                else if(key == "delete")
                {
                  projet.criteres_speciaux.splice(position, 1);
                  $(this).remove();
                  $("#close_edit_panel").trigger('click');
                  updateProject();
                  saveProject();
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

                }
                else if(key == "delete")
                {
                  $(this).remove();
                  $("#close_edit_panel_col").trigger('click');
                  updateProject();
                  updateTable();
                  saveProject();
                }
              },
              items: {
                "edit": {name: "Modifier", icon: "edit"},
                "delete": {name: "Supprimer", icon: "delete"}
              }
            });
