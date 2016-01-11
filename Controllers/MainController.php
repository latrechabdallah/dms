<?php

class MainController
{
	public static function index()
	{
		App::view('Header', 'Index', 'Footer');
	}
};
