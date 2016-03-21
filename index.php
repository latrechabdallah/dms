<?php

define('ROOT', __DIR__);

$uri = $_SERVER['REQUEST_URI'];

if (preg_match('/.*\\.(css|js|png|jpg|jpeg|mp3|ogg|woff|woff2|ttf)$/i', $uri) === 1)
{
	header('Content-Type: text/css');
	readfile(preg_replace('#^/#', '', $uri), true);
}
else
	switch ($uri)
	{
		case '/':
			echo 'Index';
			break;

		case '/electre1':
			require ROOT.'/electre/electre1.php';
			break;

		case '/application':
			require ROOT.'/application.html';
			break;

		default:
			http_response_code(404);
			echo $uri.': 404 not found';
			break;
	}
