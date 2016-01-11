<?php

// ============================================================================
//  Custom routes
// ============================================================================

Router::addRoute('/')->controller('Main', 'index');

// ============================================================================
//  Built-in routes
// ============================================================================

if (DEBUG)
{
	Router::addRoute('/install')->action(function()
	{
		include ROOT.'/Framework/Install/Install.php';
	});
}

Router::addRoute('/css/{file:.+}')->action(function ($file)
{
	$fileName = ROOT.'/App/Static/Css/'.$file;

	if (!file_exists($fileName))
		App::showError('File not found', 404);

	header('Content-type: text/css');
	readfile($fileName);
});

Router::addRoute('/js/{file:.+}')->action(function ($file)
{
	$fileName = ROOT.'/App/Static/Js/'.$file;

	if (!file_exists($fileName))
		App::showError('File not found', 404);

	header('Content-Type: application/javascript');
	readfile($fileName);
});
