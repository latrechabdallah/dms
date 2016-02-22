<?php

define('ROOT', __DIR__);

switch ($_SERVER['REQUEST_URI'])
{
	case '/':
		echo 'Index';
		break;

	case '/electre1':
		require ROOT.'/electre/electre1.php';
		break;

	default:
		echo '404';
		break;
}
