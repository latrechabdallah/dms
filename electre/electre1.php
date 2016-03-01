<?php

/*
 * Applique la méthode Electre 1 sur des actions et critères passés en paramètres.
 *
 * Paramètres POST :
 *   - `criteres`: Chaine JSON contenant les noms des critères associés à leurs
 *                    poids. Exemple : `["Critère 1": 2, "Critère 2": 3]`.
 *   - `actions`: Chaine JSON contenant les noms des actions associés à leurs poids
 *                    pour chaque critère. Exemple : `["Critère 1": 2, "Critère 2": 3]`.
 *   - `debug` : si défini, le script retournera du contenu HTML lisible au lieu de JSON.
 *
 * Retourne une chaine JSON contenant les actions retenues par la méthode Electre 1.
 *
 * Exemple d'utilisation en Bash :
 * curl \
 *	--request POST \
 *	--data 'criteres={"Cr1":3,"Cr2":2,"Cr3":3,"Cr4":1,"Cr5":1}' \
 *	--data 'actions={"P1":{"Cr1":10,"Cr2":20,"Cr3":5,"Cr4":10,"Cr5":16},"P2":{"Cr1":0,"Cr2":5,"Cr3":5,"Cr4":16,"Cr5":10},"P3":{"Cr1":0,"Cr2":10,"Cr3":0,"Cr4":16,"Cr5":7},"P4":{"Cr1":20,"Cr2":5,"Cr3":10,"Cr4":10,"Cr5":13},"P5":{"Cr1":20,"Cr2":10,"Cr3":15,"Cr4":10,"Cr5":13},"P6":{"Cr1":20,"Cr2":10,"Cr3":20,"Cr4":13,"Cr5":13}}' \
 *	'http://localhost:8080/electre1'
 *
 * curl --request POST --form "criteres=@criteres.json" --form "actions=@actions.json" http://localhost:8080/electre1
 */




function electre1($criteres, $actions, $debug = FALSE)
{
	if ($debug)
	{
		echo 'Critères :<br /><pre>';
		print_r($criteres);
		echo '</pre><br /><br />Actions :<br /><pre>';
		print_r($actions);
		echo '</pre>';
	}

	$delta = 0.0;

	foreach ($actions as $action1)
		foreach ($actions as $action2)
			foreach ($criteres as $critere => $poids)
				$delta = max($delta, abs($action1[$critere] - $action2[$critere]));

	if ($debug)
		echo 'Delta : '.$delta.'<br /><br />';

	function concordance($action1, $action2, $criteres)
	{
		$num = 0.0;
		$den = 0.0;

		foreach ($criteres as $critere => $poids)
		{
			if ($action1[$critere] >= $action2[$critere])
				$num += $poids;

			$den += $poids;
		}

		return $num / $den;
	}

	function discordance($action1, $action2, $criteres, $delta)
	{
		$num = 0.0;

		foreach ($criteres as $critere => $poids)
			$num = max($num, $action2[$critere] - $action1[$critere]);

		return $num / $delta;
	}

	if ($debug)
	{
		echo 'Matrice de concordance :<br /><pre>';
		foreach($actions as $action1)
		{
			foreach ($actions as $action2)
			{
				if ($action1 != $action2)
					echo concordance($action1, $action2, $criteres).'	';
				else
					echo '---	';
			}
			echo "<br />";
		}
		echo "</pre><br />";

		echo 'Matrice de discordance :<br /><pre>';
		foreach($actions as $action1)
		{
			foreach ($actions as $action2)
			{
				if ($action1 != $action2)
					echo discordance($action1, $action2, $criteres, $delta).'	';
				else
					echo '---	';
			}
			echo "<br />";
		}
		echo "</pre><br />";
	}

	$seuilC = 0.9;
	$seuilD = 0.15;

	$candidates = $actions;

	foreach ($actions as $nom_action1 => $action1)
		foreach ($actions as $nom_action2 => $action2)
			if ($action1 != $action2)
				if (concordance($action1, $action2, $criteres) >= $seuilC && discordance($action1, $action2, $criteres, $delta) <= $seuilD)
					unset($candidates[$nom_action2]);

	if ($debug)
	{
		echo 'Candidates :<br /><pre>';
		print_r($candidates);
		echo '</pre>';
	}

	return array_keys($candidates);
}

function erreur($msg)
{
	echo 'Erreur : '.$msg;
	exit(-1);
}


$debug = isset($_POST['debug']);

$criteres = $actions = NULL;

if (!isset($_POST['criteres']) || !isset($_POST['actions']))
{
	if ($debug)
	{
		echo 'Pas de paramètres POST, utilisation de constantes.<br /><br />';

		$criteres = [
		//	'nom' => poids,
			'Cr1' => 3,
			'Cr2' => 2,
			'Cr3' => 3,
			'Cr4' => 1,
			'Cr5' => 1
		];
		echo json_encode($criteres);

		$actions = [
		//	'nom' => ['critere1' => poids, ..],
			'P1'=> [ 'Cr1' => 10, 'Cr2' => 20, 'Cr3' => 5, 'Cr4' => 10, 'Cr5' => 16 ],
			'P2'=> [ 'Cr1' => 0, 'Cr2' => 5, 'Cr3' => 5, 'Cr4' => 16, 'Cr5' => 10 ],
			'P3'=> [ 'Cr1' => 0, 'Cr2' => 10, 'Cr3' => 0, 'Cr4' => 16, 'Cr5' => 7 ],
			'P4'=> [ 'Cr1' => 20, 'Cr2' => 5, 'Cr3' => 10, 'Cr4' => 10, 'Cr5' => 13 ],
			'P5'=> [ 'Cr1' => 20, 'Cr2' => 10, 'Cr3' => 15, 'Cr4' => 10, 'Cr5' => 13 ],
			'P6'=> [ 'Cr1' => 20, 'Cr2' => 10, 'Cr3' => 20, 'Cr4' => 13, 'Cr5' => 13 ]
		];
		echo json_encode($actions);
	}
	else
		erreur('veuillez passer des chaines JSON `criteres` et `actions` en paramètre POST.');
}
else
{
	$criteres = json_decode($_POST['criteres'], TRUE);
	if ($criteres == NULL)
		erreur('chaine JSON `criteres` malformée.');

	$actions = json_decode($_POST['actions'], TRUE);
	if ($actions == NULL)
		erreur('chaine JSON `actions` malformée.');
}

if ($debug)
{
	electre1($criteres, $actions, TRUE);
}
else
{
	$result = json_encode(electre1($criteres, $actions));

	header('Content-Type: application/json');
	echo $result;
}
