<?php

class App
{
	const CONFIGURATION_FILE = ROOT.'/Config/Config.php';

	private static $config;
	private static $requestProtocol;
	private static $baseUrl;
	private static $viewData = [];

	public static function init()
	{
		if (!isset(self::$config))
		{
			self::loadConfig();
			self::loadSystemFiles();
			self::setBaseUrl();
		}
	}

	private static function setBaseUrl()
	{
		$url = self::config('app', 'base_url');

		if (!$url)
		{
			$url .= $_SERVER['SERVER_NAME'];

			if ($_SERVER['SERVER_PORT'] != 80)
			 	$url .= ':'.$_SERVER['SERVER_PORT'];
		}

		self::$baseUrl = $url;
		self::$requestProtocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] != 'off' ? 'https' : 'http';
	}

	public static function getBaseUrl($includeProtocol = true)
	{
		return ($includeProtocol ? self::$requestProtocol.'://' : '//').self::$baseUrl;
	}

	private static function loadConfig()
	{
		self::$config = require(ROOT.'/System/DefaultConfig.php');
		if (file_exists(self::CONFIGURATION_FILE))
			self::$config += include(self::CONFIGURATION_FILE);
	}

	public static function loadModule($module)
	{
		require_once ROOT.'/System/Modules/'.$module.'Module.php';
	}

	public static function loadHelper($helper)
	{
		require_once ROOT.'/System/Helpers/'.$helper.'Helper.php';
	}

	private static function loadSystemFiles()
	{
		require_once ROOT.'/System/Router.php';
		require_once ROOT.'/System/Functions.php';
	}

	public static function callController($controller, $controllerMethod, $arguments)
	{
		$controllerClass = $controller.'Controller';
		$controllerFile = ROOT.'/Controllers/'.$controllerClass.'.php';

		require_once $controllerFile;

		if (!method_exists($controllerClass, $controllerMethod))
			App::showError('Controller "'.$controller.'" does not contain the static method "'.$controllerMethod.'".');

		call_user_func_array([$controllerClass, $controllerMethod], $arguments);
	}

	public static function viewData($data)
	{
		self::$viewData = array_merge(self::$viewData, $data);
	}

	public static function view(...$views)
	{
		extract(self::$viewData);
		foreach ($views as $view)
			require ROOT.'/Views/'.$view.'.php';
	}

	public static function config(...$path)
	{
		$var = self::$config;

		foreach ($path as $index)
		{
			if (!isset($var[$index]))
				self::showError('Undefined config variable: '.implode('->', $path));

			$var = $var[$index];
		}

		return $var;
	}

	public static function redirect($url)
	{
		ob_end_clean();

		header('Location: '.$url);

		exit('You have been redirected but your browser does not seem to understand redirections. Please follow <a href="'.$url.'">this link</a>.');
	}

	public static function showError($error, $errorCode = 500)
	{
		ob_end_clean();

		http_response_code($errorCode);

		exit('ERROR '.$errorCode.'<br>'."\n".(DEBUG ? 'Error: '.$error : 'Internal server error.'));
	}

	public static function run()
	{
		ob_start();
		Router::go($_SERVER['REQUEST_URI']);
		ob_end_flush();
	}
};
