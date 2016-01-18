<?php

class Router
{
	private static $routes = [
		'GET' => [],
		'POST' => [],
		'PUT' => [],
		'DELETE' => []
	];

	public static function addRoute($uriFormat, $methods = ['GET', 'POST', 'PUT', 'DELETE'])
	{
		$route = new Route($uriFormat);

		foreach ($methods as $method)
			self::$routes[$method][] = $route;

		return $route;
	}

	public static function go($uri)
	{
		foreach (self::$routes[$_SERVER['REQUEST_METHOD']] as $route)
			if ($route->call($uri))
				return true;

		App::showError('Route not found (request method: '.$_SERVER['REQUEST_METHOD'].')', 404);
	}
};

class Route
{
	const REGEX_DELIMITER = '`';
	const PARAMETER_FORMAT = self::REGEX_DELIMITER.'{[a-zA-Z0-9]+(:((?![*+?])(?:[^\\r\\n\\[/\\\\]|\\\\.|\\[(?:[^\\r\\n\\]\\\\]|\\\\.)*\\])+))?}'.self::REGEX_DELIMITER; // Terrifying: can match another regex! Old: '#{{([a-zA-Z0-9]+)(:(.*))?}}#U'
	const PARAMETER_REGEX_INDEX = 2;

	private $regex;
	private $action;

	public function __construct($uri)
	{
		$uri = preg_replace(self::PARAMETER_FORMAT, '($'.self::PARAMETER_REGEX_INDEX.')', trim($uri, '/'));

		$this->regex = self::REGEX_DELIMITER.'^/'.$uri.'$'.self::REGEX_DELIMITER;
	}

	public function action($action)
	{
		$this->action = $action;

		return $this;
	}

	public function controller($controllerName, $controllerMethod)
	{
		return $this->action(function () use ($controllerName, $controllerMethod)
		{
			App::callController($controllerName, $controllerMethod, func_get_args());
		});
	}

	public function call($uri)
	{
		$match = preg_match($this->regex, $uri, $args) === 1;
		array_shift($args);

		if ($match)
		{
			if (isset($this->action))
				call_user_func_array($this->action, $args);
			else
				App::showError('No action defined for route '.$this->regex);
		}

		return $match;
	}
};

require_once ROOT.'/Config/Routes.php';
