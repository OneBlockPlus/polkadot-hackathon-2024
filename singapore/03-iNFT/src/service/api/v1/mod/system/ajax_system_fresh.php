<?php
if(!defined('INFTAPI')) exit('error');

$name=$_F['request']['name'];

$result=array('success'=>FALSE);


$a=Config::getInstance();
$a->export($result);

