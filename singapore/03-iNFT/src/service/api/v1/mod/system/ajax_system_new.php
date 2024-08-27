<?php
if(!defined('INFTAPI')) exit('error');

$a->load('user');
$a=User::getInstance();

$og=isset($_F['request']['og'])?$_F['request']['og']:USER_ORIGIN_NORMAL;

//业务逻辑区域
$result=array(
    'success'=>false,
);

$rst=$a->userUUID($og);
if(!is_array($rst)){
	$a=Config::getInstance();
	$a->error($rst,ERROR_LEVEL_5);
}

$a->userCache($rst['uuid']);

$result['uuid']=$rst['uuid'];
$result['token']=$rst['token'];
$result['success']=true;


$a=Config::getInstance();
$a->export($result);

