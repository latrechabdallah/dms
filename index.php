<?php

define('DEBUG', true);

define('ROOT', __DIR__);

require_once ROOT.'/System/App.php';

App::init();
App::run();

