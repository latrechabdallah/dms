<?php

$Criteres = [ 'Cr1', 'Cr2', 'Cr3', 'Cr4', 'Cr5' ]; #nom des critères
$Poids = [ 'Cr1'=>3, 'Cr2'=>2, 'Cr3'=>3, 'Cr4'=>1, 'Cr5'=>1 ]; #poids des critères

$Actions = [ 'P1', 'P2', 'P3', 'P4', 'P5', 'P6' ]; #nom des solutions

$Performances = [
    'P1'=> [ 'Cr1'=>10, 'Cr2'=>20, 'Cr3'=> 5, 'Cr4'=>10, 'Cr5'=>16 ],
    'P2'=> [ 'Cr1'=> 0, 'Cr2'=> 5, 'Cr3'=> 5, 'Cr4'=>16, 'Cr5'=>10 ],
    'P3'=> [ 'Cr1'=> 0, 'Cr2'=>10, 'Cr3'=> 0, 'Cr4'=>16, 'Cr5'=> 7 ],
    'P4'=> [ 'Cr1'=>20, 'Cr2'=> 5, 'Cr3'=>10, 'Cr4'=>10, 'Cr5'=>13 ],
    'P5'=> [ 'Cr1'=>20, 'Cr2'=>10, 'Cr3'=>15, 'Cr4'=>10, 'Cr5'=>13 ],
    'P6'=> [ 'Cr1'=>20, 'Cr2'=>10, 'Cr3'=>20, 'Cr4'=>13, 'Cr5'=>13 ] ]; #performance des solutions pour chaque critère

# calculer l'écart maximal entre deux performances sur le même attribut

$Delta = 0.0;

foreach($Actions as $a1){
    $p1 = $Performances[$a1];
    foreach ($Actions as $a2){
        $p2 = $Performances[$a2];
        foreach($Criteres as $critere){
            $g1 = $p1[$critere];
            $g2 = $p2[$critere];
            $Delta = max($Delta, abs($g1-$g2));
         }
     }
}

print_r($Delta);
echo "<br/>";


function Concordance($a1, $a2){
	global $Performances, $Criteres, $Poids;
    $p1 = $Performances[$a1];
    $p2 = $Performances[$a2];
    $num = 0.0;
    $den = 0.0;
    foreach($Criteres as $critere){
        $g1 = $p1[$critere];
        $g2 = $p2[$critere];
        $pds = $Poids[$critere];
        if ($g1 >= $g2){
            $num += $pds;
        }
        $den += $pds;
    }
    return $num/$den;
}

function Discordance($a1, $a2){
    global $Performances, $Criteres, $Delta;
    $p1 = $Performances[$a1];
    $p2 = $Performances[$a2];
    $num = 0.0;
    foreach($Criteres as $critere){
        $g1 = $p1[$critere];
        $g2 = $p2[$critere];
        $num = max($g2 - $g1, $num);
	}
    return $num/$Delta;
}

echo 'Matrice de concordance :';
foreach($Actions as $a1){
    foreach ($Actions as $a2){
        if ($a1 != $a2){
            echo Concordance($a1, $a2);
        }else{
            echo " -- ";
        }
    }
    echo "<br/>";
}
echo "<br/>";
echo 'Matrice de discordance :';
foreach($Actions as $a1){
    foreach ($Actions as $a2){
        if ($a1 != $a2){
            echo Discordance($a1, $a2);
        }else{
            echo " -- ";
		}
	}
    echo "<br/>";
}
echo "<br/>";

# seuils

$SeuilC = 0.9;
$SeuilD = 0.15;

$candidates = $Actions;
foreach($Actions as $a1){
    foreach ($Actions as $a2){
        if ($a1 != $a2){
            if (Concordance($a1, $a2) >= $SeuilC and Discordance($a1, $a2) <= $SeuilD){
                echo $a1." S ".$a2."<br/>";
                if (in_array($a2, $candidates)){
                    unset($candidates[array_search($a2,$candidates)]);
                }
            }
		}
	}
}
echo "<br/>Candidates = ";
print_r($candidates);

?>
