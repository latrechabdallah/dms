// ========================================================================= //
// Projet
// ========================================================================= //

function Projet(nom, key)
{
	this.nom = nom;
	this.key = key;
	this.tableau = {};
	this.tableau.colonnes = [];
	this.tableau.donnees = [];
	this.tableau.poids = [];
	this.criteres_speciaux = [];
}

var projet;
var position_click;
var position_click_col;

// Fenetres modales
var confirmation;
var settings;
var key;
var confirm_reinit;
var confirm_del_crit;
var confirm_del_col;
var help;

// Chargement du projet enregistré en Local Storage
if (typeof(Storage) !== "undefined")
{
	var jsonProjet = localStorage.getItem('projetDMS');

	if (jsonProjet != 'undefined')
		projet = JSON.parse(jsonProjet);
	else
	{
		notification('error', "Erreur lors de l'ouverture du projet");
		localStorage.removeItem('projetDMS');
	}
}
else
	notification('error', 'Attention, votre navigateur ne supporte pas le stockage local');

if (projet != undefined)
{
	updateTitle();
	updateProject();
	updateTable();
}
else
{
	$("#btnExec").hide();
	$("#btnReinit").hide();
	$("#btnNouveauCritere").prop("disabled", true);
	$("#btnAjouterCol").prop("disabled", true);
	$("#btnDelCol").prop("disabled", true);
	$("#btnDelCrit").prop("disabled", true);
	$("#btn_open_csv").prop("disabled", true);
	$("#btn_exp_csv").prop("disabled", true);
	$("btn_exp_proj").addClass("disabled");
}

// Clic sur le bouton "Importer fichier CSV"
$("#btn_open_csv").click(function()
{
	$('#fileLoader').trigger('click');
});

// Click sur le bouton "Exporter fichier CSV"
$("#btn_exp_csv").click(function()
{
	var entetes = projet.tableau.colonnes;
	var lignes = projet.tableau.donnees;
	var output = "";

	if (entetes.length > 0)
	{
		output += entetes[0].name;
		for (var i = 1; i < entetes.length; i++)
			output += ";" + entetes[i].name;

		output += "\n";

		for (var i = 0; i < lignes.length; i++)
		{
			output += lignes[i][entetes[0].name];
			for (var j = 1; j < entetes.length; j++)
			{
				if (entetes[j].type == "number")
					output += ";" + lignes[i][entetes[j].name];
				else
				{
					var nomCritere = entetes[j].name;
					var index = projet.criteres_speciaux.findIndex(function (el, index, array)
					{
						return el.nom == nomCritere;
					});

					output += ";" + projet.criteres_speciaux[index].valeurs[projet.tableau.donnees[i][entetes[j].name]];
				}
			}
			output += "\n";
		}
	}

	output += "\n";

	var blob = new Blob([output], {type: 'text/csv;charset=utf-8;'});

	if (navigator.msSaveBlob) // IE 10+
		navigator.msSaveBlob(blob, 'dms_table.csv');
	else
	{
		var link = document.createElement("a");
		if (link.download !== undefined) // feature detection Browsers that support HTML5 download attribute
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

// Vérification de la validité d'un nouveau critère spécial
function checkValidityNewCritere()
{
	var valid = false;
	var vide = false;
	var index = -1;
	var format_correct = true;
	var nb_egaux = true;
	var nom_crit = $("#nCritereNom").val();
	var variables = $("#nCritereVar").val();
	var valeurs = $("#nCritereVal").val();


	if (nom_crit == "" || variables == "" || valeurs == "")
	{
		notification('error', 'Tous les champs doivent être remplis');
		vide = true;
	}
	if (!vide)
	{
		var i = 0;
		var trouve = false;
		var reg1 = new RegExp("^((([A-z]|[0-9])+;)*)[^;]+$");
		var reg2 = new RegExp("^(([0-9]+;)*)[0-9]+$");

		if (!(reg1.test(variables)))
		{
			format_correct = false;
			notification('error', "Le format des variables est incorrect (Vérifiez qu'elles sont bien toutes séparées par des ; et qu'il n'y a pas de ; a la fin)");
		}
		else if (!(reg2.test(valeurs)))
		{
			format_correct = false;
			notification('error', "Le format des valeurs est incorrect (Vérifiez qu'elles sont bien toutes séparées par des ; et qu'il n'y a pas de ; a la fin)");
		}

		if (format_correct && variables.split(";").length != valeurs.split(";").length)
		{
			nb_egaux = false;
			notification('error', "Il n'y a pas le même nombre de variables et de valeurs");
		}

		while (i < projet.criteres_speciaux.length && !trouve && format_correct && nb_egaux)
		{
			if (projet.criteres_speciaux[i].nom == nom_crit)
				trouve = true;

			i++;
		}

		if (trouve)
			notification('error', 'Il existe déjà un critère portant ce nom');
	}

	if (!vide && !trouve && format_correct && nb_egaux)
		valid = true;

	return valid;
}

// Vérification de la validité d'un critère spécial après modification
function checkValidityEditCritere()
{
	var valid = false;
	var vide = false;
	var format_correct = true;
	var nb_egaux = true;
	var nom_crit = $("#mCritereNom").val();
	var variables = $("#mCritereVar").val();
	var valeurs = $("#mCritereVal").val();


	if (nom_crit == "" || variables == "" || valeurs == "")
	{
		notification('error', 'Tous les champs doivent être remplis');
		vide = true;
	}

	if (!vide)
	{
		var i = 0;
		var trouve = false;
		var reg1 = new RegExp("^((([A-z]|[0-9])+;)*)[^;]+$");
		var reg2 = new RegExp("^(([0-9]+;)*)[0-9]+$");

		if (!(reg1.test(variables)))
		{
			format_correct = false;
			notification('error', "Le format des variables est incorrect (Vérifiez qu'elles sont bien toutes séparées par des ; et qu'il n'y a pas de ; a la fin)");
		}
		else if (!(reg2.test(valeurs)))
		{
			format_correct = false;
			notification('error', "Le format des valeurs est incorrect (Vérifiez qu'elles sont bien toutes séparées par des ; et qu'il n'y a pas de ; a la fin)");
		}

		if (format_correct && variables.split(";").length != valeurs.split(";").length)
		{
			nb_egaux = false;
			notification('error', "Il n'y a pas le même nombre de variables et de valeurs");
		}

		while (i < projet.criteres_speciaux.length && !trouve && format_correct && nb_egaux)
		{
			if(projet.criteres_speciaux[i].nom == nom_crit && nom_crit != projet.criteres_speciaux[position_click].nom)
				trouve = true;

			i++;
		}

		if (trouve)
			notification('error', 'Le critère doit soit porter le même nom, soit un nouveau nom');
	}

	if (!vide && !trouve && format_correct && nb_egaux)
		valid = true;

	return valid;
}

// Clic sur le bouton "Enregistrer" après édition d'un critère spécial
$("#btn_sav_critere").click(function()
{
	if (checkValidityNewCritere())
	{
		var variables = $("#nCritereVar").val().split(";");
		var valeurs = $("#nCritereVal").val().split(";").map(function (i) { return parseInt(i, 10); });

		projet.criteres_speciaux.push({
			'nom': $("#nCritereNom").val(),
			'variables': variables,
			'valeurs': valeurs
		});

		$("#nCritereNom").val("");
		$("#nCritereVar").val("");
		$("#nCritereVal").val("");

		updateProject();
	}
});

// Clic sur le bouton de modification d'un critère spécial
$("#btn_edit_crit").click(function()
{
	if (checkValidityEditCritere())
	{
		var variables = $("#mCritereVar").val().split(";");
		var valeurs = $("#mCritereVal").val().split(";").map(function (i) { return parseInt(i, 10); });

		projet.criteres_speciaux[position_click] = {
			'nom': $("#mCritereNom").val(),
			'variables': variables,
			'valeurs': valeurs
		};

		var col_exists = false;
		var i = 0;
		while (i < projet.tableau.colonnes.length && !col_exists)
		{
			if(projet.tableau.colonnes[i].name == $("#mCritereNom").val())
			{
				col_exists = true;
				var index = i;
			}

			i++;
		}

		// Si le critère que l'on modifie correspond à une colonne déjà créée
		if (col_exists)
		{
			projet.tableau.colonnes[index].items = variables;
		}

		$("#mCritereNom").val("");
		$("#mCritereVar").val("");
		$("#mCritereVal").val("");
		$("#close_edit_panel").trigger('click');

		updateProject();
		updateTable();
	}
});

// Vérification de la validité d'une colonne
function checkValidityCol()
{
	var valid = false;
	var vide = false;
	var number = true;
	var trouve = false;
	var nom_col_edit = $("#mColName").val();
	var poids_edit = parseInt($("#mColPoids").val());

	if (!Number.isInteger(poids_edit))
		number = false;

	if (!number)
		notification('error', 'Le poids doit être un nombre entier');

	if (number)
	{
		if (specialChecked())
			nom_col_edit = $("#selectCrit option:selected").text();
		else if (nom_col_edit == "")
			vide = true;

		if (!vide)
		{
			var i = 0;

			while(i < projet.tableau.colonnes.length)
			{
				if (nom_col_edit == projet.tableau.colonnes[i].name && nom_col_edit != projet.tableau.colonnes[position_click_col].name)
					trouve = true;

				i++;
			}

			if (trouve)
				notification('error', 'Une autre colonne porte déjà ce nom');
			else
				valid = true;
		}
		else
			notification('error', 'Tous les champs doivent être remplis');
	}

	return valid;
}

// Clic sur le bouton de modification d'une colonne
$("#btn_edit_col").click(function()
{
	if (checkValidityCol())
	{
		var nom_col_edit;

		if (specialChecked())
		{
			nom_col_edit = $("#selectCrit option:selected").text();
			var trouve = false;
			var i = 0;
		}
		else
			nom_col_edit = $("#mColName").val();

		var poids_edit = $("#mColPoids").val();

		projet.tableau.colonnes[position_click_col].name = nom_col_edit;
		projet.tableau.poids[position_click_col] = poids_edit;

		$("#mColName").val("");
		$("#mColPoids").val("");
		$("#close_edit_panel_col").trigger('click');

		updateProject();
		updateTable();
	}
});

// Clic sur le bouton "Nouveau"
$("#btn_nouveau_proj").click(function()
{
	if (projet != undefined)
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

// Clic sur le bouton de validation du formulaire demandant la clé du projet
$("#btn_confirm_key_new").click(function()
{
	if ($("#project_key").val() == projet.key)
	{
		$("#project_key").val("");
		key.close();
		confirmation = $('[data-remodal-id=modal]').remodal();
		confirmation.open();
	}
	else
		notification('error', 'La clé entrée est incorrecte');
});

// Clic sur le bouton "Créer" après avoir rempli le formulaire de création de projet
$("#btn_new_project").click(function()
{
	if ($("#project_name_new").val() == "" || $("#project_key_new").val() == "")
		notification('error', 'Tous les champs doivent être remplis');
	else if ($("#project_key_new").val().length < 4)
		notification('error', 'La clé doit faire au moins 4 caractères');
	else
	{
		projet = new Projet($("#project_name_new").val(), $("#project_key_new").val());
		new_project.close();
		updateProject();
		updateTable();
		changeTitle($("#project_name_new").val());

		$("#project_name_new").val("");
		$("#project_key_new").val("");

		if (projet != undefined)
			notification('success', 'Le projet '+projet.nom+' a bien été créé');
	}
});

// Clic sur le bouton "Ouvrir"
$("#btn_ouvrir_proj").click(function()
{
	$('#fileOpen').trigger('click');
});

// Clic sur le bouton "Non" lors de la demande de confirmation de création de nouveau projet
$("#btn_cancel_new_proj").click(function()
{
	confirmation.close();
});

// Clic sur le bouton "Oui" lors de la demande de confirmation de création de nouveau projet
$("#btn_val_new_proj").click(function()
{
	confirmation.close();
	new_project = $('[data-remodal-id=modal-new-project]').remodal();
	new_project.open();
	$("#toggle-special").bootstrapToggle('off');
});

// Clic sur le bouton "Paramètres"
$("#btn_settings").click(function()
{
	if (projet != undefined)
	{
		$("#nom_projet").val(projet.nom);
		settings = $('[data-remodal-id=modal-settings]').remodal();
		settings.open();
	}
});

// Afficher / cacher les boutons qui dépendent du contenu du tableau
function updateTableDependentButtons()
{
	if (projet.tableau.colonnes.length > 0 && projet.tableau.donnees.length > 0)
	{
		$("#btn_exp_csv").prop("disabled", false);
		$("#btnExec").show();
		$("#btnReinit").show();
	}
	else
	{
		$("#btn_exp_csv").prop("disabled", true);
		$("#btnExec").hide();
		$("#btnReinit").hide();
	}
}

// Fonction appellée lorsqu'une ligne est ajoutée au tableau
function onItemInserted(args)
{
	updateTableDependentButtons();
}

// Fonction appellée lorsqu'une ligne est supprimée du tableau
function onItemDeleted(args)
{
	updateTableDependentButtons();
}

// Clic sur le bouton "Réinitialiser"
$("#btnReinit").click(function()
{
	confirm_reinit = $('[data-remodal-id="modal-reinit"]').remodal();
	confirm_reinit.open();

	$('#btn_val_reinit').click(function ()
	{
		projet.tableau.donnees = [];
		updateProject();
		updateTable();
		confirm_reinit.close();
	});

	$('#btn_cancel_reinit').click(function ()
	{
		confirm_reinit.close();
	});
});

// Mise à jour du tableau jsGrid
function updateTable()
{
	if (projet.tableau.colonnes.length > 0)
	{
		projet.tableau.colonnes.push(
			{
			'type': 'control',
				'modeSwitchButton': true,
				'searchModeButtonTooltip': "Passer en mode recherche", // tooltip of switching filtering/inserting button in inserting mode
				'insertModeButtonTooltip': "Passer en mode insertion", // tooltip of switching filtering/inserting button in filtering mode
				'editButtonTooltip': "Éditer",                      // tooltip of edit item button
				'deleteButtonTooltip': "Supprimer",                  // tooltip of delete item button
				'searchButtonTooltip': "Recherche",                  // tooltip of search button
				'clearFilterButtonTooltip': "Enlever les filtres",       // tooltip of clear filter button
				'insertButtonTooltip': "Insérer",                  // tooltip of insert button
				'updateButtonTooltip': "Mettre à jour",                  // tooltip of update item button
				'cancelEditButtonTooltip': "Annuler l'édition",         // tooltip of cancel editing button
			});

		$("#jsGrid").jsGrid({
			height: "70%",
			width: "100%",
			filtering: true,
			editing: true,
			inserting: true,
			sorting: true,
			paging: true,
			autoload: false,
			pageSize: 15,
			pageButtonCount: 5,
			noDataContent: "Aucune donnée",
			loadMessage: "Veuillez patienter...",
			deleteConfirm: "Etes-vous certain de vouloir supprimer cette ligne ?",
			datatype: 'json',
			controller: {
				loadData: $.noop,
				insertItem: $.noop,
				updateItem: $.noop,
				deleteItem: $.noop
			},
			onItemInserted: onItemInserted,
			onItemDeleted: onItemDeleted,
			fields: projet.tableau.colonnes,
			data: projet.tableau.donnees
		});

		projet.tableau.colonnes.pop();
		deleteControls();

		updateTableDependentButtons();
	}
	else
	{
		$("#jsGrid").empty();
	}
}

// Clic sur le bouton de calcul
$('#btnExec').on('click', function ()
{
	var criteres = {};

	for (var i = 0; i < projet.tableau.colonnes.length; i++)
		criteres[projet.tableau.colonnes[i].name] = projet.tableau.poids[i];

	var jsonCriteres = JSON.stringify(criteres);

	var actions = [];

	for (var i = 0; i < projet.tableau.donnees.length; i++)
	{
		var action = {};

		for (var j = 0; j < projet.tableau.colonnes.length; j++)
		{
			if (projet.tableau.colonnes[j].type == "number")
				action[projet.tableau.colonnes[j].name] = projet.tableau.donnees[i][projet.tableau.colonnes[j].name];
			else
			{
				var nomCritere = projet.tableau.colonnes[j].name;
				var index = projet.criteres_speciaux.findIndex(function (el, index, array)
				{
					return el.nom == nomCritere;
				});

				action[projet.tableau.colonnes[j].name] = projet.criteres_speciaux[index].valeurs[projet.tableau.donnees[i][projet.tableau.colonnes[j].name]]; // Damn
			}
		}

		actions.push(action);
	}

	var jsonActions = JSON.stringify(actions);

	console.log(jsonCriteres);
	console.log(jsonActions);

	$.post('electre1', { criteres: jsonCriteres, actions: jsonActions }, function (data)
	{
		console.log(data);
		notification('success', "Les actions intéressantes sont : " + data.map(function (i) { return parseInt(i, 10) + 1; }).join(', '));
	});
});

window.onunload = function (e)
{
	saveProject();
};

function deleteControls()
{
	var finish = false;
	var i = 0;

	while (i < projet.tableau.colonnes.length && !finish)
	{
		if(projet.tableau.colonnes[i].type == 'control')
			projet.tableau.colonnes = projet.tableau.colonnes.splice(i, 1);

		i++;
	}
}

// Initialisation du tableau avec des données d'exemple
function createDefaultTable()
{
	$("#jsGrid").jsGrid({
		height: "70%",
		width: "100%",
		filtering: true,
		editing: true,
		inserting: true,
		sorting: true,
		paging: true,
		autoload: true,
		pageSize: 15,
		pageButtonCount: 5,
		noDataContent: "Aucune donnée",
		loadMessage: "Veuillez patienter...",
		deleteConfirm: "Etes-vous certain de vouloir supprimer cette ligne ?",
		controller: {
			loadData: $.noop,
			insertItem: $.noop,
			updateItem: $.noop,
			deleteItem: $.noop
		},
		onItemInserted: onItemInserted,
		onItemDeleted: onItemDeleted,
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
}

// Ajout des critères spéciaux à la liste déroulante dans le panel de création de colonne
function loadSpecialCrit()
{
	$("#selectCrit option").remove();
	$("#specialCrit a").remove();

	for (critere in projet.criteres_speciaux)
	{
		$("#selectCrit").append("<option>" + projet.criteres_speciaux[critere].nom + "</option>");
		$("#specialCrit").append("<a href='#' class='list-group-item item_crit context-menu-criteres' id='critere_" + critere + "'>" + projet.criteres_speciaux[critere].nom + "</a>");
	}
}

// Ajout des colonnes à la liste des colonnes existentes
function loadCol()
{
	$("#colList a").remove();

	for (colonne in projet.tableau.colonnes)
		$("#colList").append("<a href='#' class='list-group-item item_col context-menu-colonnes' id='colonne_" + colonne + "'>" + projet.tableau.colonnes[colonne].name + "</a>");
}

// Mise à jour de l'interface en fonction de l'état du projet
function updateProject()
{
	if (projet.tableau.colonnes.length > 0 && projet.tableau.donnees.length > 0)
	{
		$("#btn_exp_csv").prop("disabled", false);
		$("#btnDelCol").prop("disabled", false);
		$("#btnExec").show();
		$("#btnReinit").show();
	}
	else
	{
		$("#btn_exp_csv").prop("disabled", true);
		$("#btnDelCol").prop("disabled", true);
		$("#btnExec").hide();
		$("#btnReinit").hide();
	}

	if(projet.tableau.colonnes.length > 0)
	{
		$("#btn_exp_csv").prop("disabled", false);
		$("#btnDelCol").prop("disabled", false);
	}
	else
	{
		$("#btn_exp_csv").prop("disabled", true);
		$("#btnDelCol").prop("disabled", true);
	}

	if (projet.criteres_speciaux.length == 0)
	{
		$("#btnDelCrit").prop("disabled", true);
		$("#toggle-special").bootstrapToggle('off');
		$('#toggle-special').bootstrapToggle('disable');
	}
	else
	{
		$("#btnDelCrit").prop("disabled", false);
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

// Retourne le type de critère sélectionné dans le panel de création de colonne
function specialChecked()
{
	return $("#toggle-special").prop('checked');
}

// Sauve le projet dans le Local Storage
function saveProject()
{
	if (projet != undefined)
	{
		var projet_string = JSON.stringify(projet);
		localStorage.setItem("projetDMS", projet_string);
	}
}

// Change le titre du projet
function changeTitle(newTitle)
{
	projet.nom = newTitle;
	updateTitle();
}

// Change le titre de la page
function updateTitle()
{
	document.title = "DMS - "+projet.nom;
}

// Affiche la fenetre de saisie de la clé
function confirmKey()
{
	key = $('[data-remodal-id=modal-key]').remodal();
	$("#project_key").val("");
	key.open();
}

// Affiche une notification
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

// Clic sur le bouton de confirmation de suppression du projet dans le panel de saisie de la clé
$("#btn_confirm_key_del").click(function()
{
	if ($("#project_key").val() == projet.key)
	{
		localStorage.removeItem("projetDMS");
		$("#project_key").val("");
		key.close();
		projet = undefined;
		location.reload();
	}
	else
		notification('error', 'La clé entrée est incorrecte');
});

// Clic sur un critère spécial dans la liste des critères spéciaux
$(document).on('click', '.item_crit', function(e)
{
	e.preventDefault();
	editCritere($(this));
	$("#panel_edit").slideDown("slow");
});

// Clic sur une colonne dans la liste des colonnes
$(document).on('click', '.item_col', function(e)
{
	e.preventDefault();
	editCol($(this));
	$("#panel_edit_col").slideDown("slow");
});

// Clic sur le bouton de fermeture du panel de modification de critère spécial
$("#close_edit_panel").click(function()
{
	$("#panel_edit").slideUp("slow");
});

$(".colonne").click(function()
{
	$("#panel_edit_col").slideDown("slow");
});

// Clic sur le bouton de fermeture du panel de modification de colonne
$("#close_edit_panel_col").click(function()
{
	$("#panel_edit_col").slideUp("slow");
});

// Clic sur le bouton d'ajout d'une nouvelle colonne
$("#btnAjouterCol").click(function()
{
	$("#panel_ajouter_col").slideToggle("slow");
});

// Clic sur le bouton de fermeture du panel de création de colonne
$("#close_ajouter_panel_col").click(function()
{
	$("#panel_ajouter_col").slideUp("slow");
});

// Clic sur le bouton de validation après modification d'une colonne
$("#btn_sav_colonne").click(function()
{
	var trouve = false;
	var poids_entier = true;
	var col_poids = parseInt($("#nColPoids").val());
	var nom_col;

	if (!Number.isInteger(col_poids))
	{
		poids_entier = false;
		notification('error', 'Le poids doit être un entier');
	}

	if ($("#toggle-special").prop('checked'))
	{
		nom_col = $("#selectCrit option:selected").text();
		var i = 0;

		while (i < projet.tableau.colonnes.length && !trouve && poids_entier)
		{
			if(nom_col == projet.tableau.colonnes[i].name)
				trouve = true;

			i++;
		}

		if (trouve)
			notification('error', 'Cette colonne existe déjà');

		if (!trouve && poids_entier)
		{
			var j = 0;
			var trouve2 = false;
			var index;

			while (!trouve2)
			{
				if (projet.criteres_speciaux[j].nom == nom_col)
				{
					trouve2 = true;
					index = j;
				}

				j++;
			}

			projet.tableau.colonnes.push({'name': nom_col, 'type': 'select', 'items': projet.criteres_speciaux[index].variables});
			projet.tableau.poids.push(col_poids);

			updateProject();
			updateTable();
		}
	}
	else
	{
		nom_col = $("#nColName").val();
		var vide = false;

		if (nom_col == "" || col_poids == "")
			vide = true;

		if (!vide)
		{
			var k = 0;

			while (k < projet.tableau.colonnes.length && !trouve && poids_entier)
			{
				if (nom_col == projet.tableau.colonnes[k].name)
					trouve = true;

				k++;
			}

			if (trouve)
				notification('error', 'Cette colonne existe déjà');

			if (!trouve && poids_entier)
			{
				projet.tableau.colonnes.push({'name': nom_col, 'type': 'number'});
				projet.tableau.poids.push(col_poids);

				updateProject();
				updateTable();
			}
		}
	}
});

// Clic sur le bouton d'ajout de critère spécial
$("#btnNouveauCritere").click(function()
{
	$("#panel_nouveau_critere").slideToggle("slow");
});

$("#btnDelCrit").click(function()
{
	confirm_del_crit = $('[data-remodal-id=modal-del-crit]').remodal();
	confirm_del_crit.open();
});

$("#btn_cancel_del_crit").click(function()
{
	confirm_del_crit.close();
});

$("#btn_val_del_crit").click(function()
{
	projet.criteres_speciaux = [];
	confirm_del_crit.close();
	updateProject();
});

$("#btnDelCol").click(function()
{
	confirm_del_col = $('[data-remodal-id=modal-del-col]').remodal();
	confirm_del_col.open();
});

$("#btn_cancel_del_col").click(function()
{
	confirm_del_col.close();
});

$("#btn_val_del_col").click(function()
{
	projet.tableau.colonnes = [];
	projet.tableau.poids = [];
	confirm_del_col.close();
	updateProject();
	updateTable();
});

// Clic sur le bouton de fermeture du panel de création de nouveau critère spécial
$("#close_nouveau_critere").click(function()
{
	$("#panel_nouveau_critere").slideUp("slow");
});

// Clic sur le bouton de bouton de sauvegarde après modification des paramètres
$("#btn_sav_settings").click(function()
{
	if ($("#nom_projet").val() != projet.nom)
		changeTitle($("#nom_projet").val());

	settings.close();
	saveProject();

	notification('success', 'Les paramètres ont bien été enregistrés');
});

// Clic sur le bouton de suppression des données enregistrées
$("#del_local").click(function()
{
	$("#btn_confirm_key_del").show();
	$("#btn_confirm_key_new").hide();

	confirmKey();
	key.close();
});

$('#toggle-special').bootstrapToggle();
$('#selectCrit').hide();

// Clic sur le bouton de changement du type de critère
$('#toggle-special').change(function()
{
	if ($(this).prop('checked'))
	{
		$('#nomCol').hide();
		$('#selectCrit').show();
	}
	else
	{
		$('#nomCol').show();
		$('#selectCrit').hide();
	}
});

$("#btn_exp_proj").click(function()
{
	if (projet != undefined)
	{
		var res = JSON.stringify(projet);
		var blob = new Blob([res], { type: 'text/json;charset=utf-8;' });
		var link = document.createElement("a");

		if (link.download !== undefined)
		{
			var url = URL.createObjectURL(blob);
			link.setAttribute("href", url);
			link.setAttribute("download", projet.nom + '.json');
			link.style.visibility = 'hidden';
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
		}
	}
});

// Aide
$("#btn_help").click(function()
{
	help = $('[data-remodal-id=modal-help]').remodal();
	help.open();
});


// Sélection d'un fichier à ouvrir
$("#fileOpen").change(function()
{
	var file = document.getElementById('fileOpen').files[0];

	if (file)
	{
		var reader = new FileReader();
		reader.readAsText(file);

		reader.onload = function(e)
		{
			projet = JSON.parse(reader.result);

			updateProject();
			updateTable();
		}
	}
});

function editCritere(element)
{
	var id_sub = element.attr("id").split("_");
	position_click = id_sub[1];
	var critere_special = projet.criteres_speciaux[position_click];
	var variables = critere_special.variables.join(";");
	var valeurs = critere_special.valeurs.join(";");

	$("#mCritereNom").val(critere_special.nom);
	$("#mCritereVar").val(variables);
	$("#mCritereVal").val(valeurs);
}

function editCol(element)
{
	var id_sub = element.attr("id").split("_");
	position_click_col = id_sub[1];
	var colonne = projet.tableau.colonnes[position_click_col];
	var nom_col = colonne.name;
	var poids = projet.tableau.poids[position_click_col];

	$("#mColName").val(nom_col);
	$("#mColPoids").val(poids);
}

$.contextMenu({
	selector: '.context-menu-criteres',
	callback: function(key, options) {
		var id_sub = $(this).attr("id").split("_");
		var position = id_sub[1];

		if (key == "edit")
		{
			editCritere($(this));
			$("#panel_edit").slideDown("slow");
		}
		else if (key == "delete")
		{
			projet.criteres_speciaux.splice(position, 1);
			$(this).remove();
			$("#close_edit_panel").trigger('click');

			updateProject();
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
		var id_sub_col = $(this).attr("id").split("_");
		var position_col = id_sub_col[1];

		if (key == "edit")
		{
			editCol($(this));
			$("#panel_edit_col").slideDown("slow");
		}
		else if (key == "delete")
		{
			projet.tableau.colonnes.splice(position_col, 1);
			projet.tableau.poids.splice(position_col, 1);
			$("#close_edit_panel_col").trigger('click');

			updateProject();
			updateTable();
		}
	},
	items: {
		"edit": {name: "Modifier", icon: "edit"},
		"delete": {name: "Supprimer", icon: "delete"}
	}
});
