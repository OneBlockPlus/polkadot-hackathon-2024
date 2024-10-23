<?php
if(!defined('INFTAPI')) exit('error');

$alink=$_F['request']['name'];
$result=array('success'=>FALSE);

$a->load("bounty");
$a=Bounty::getInstance();

$result['exsist']=$a->bountyExsist($alink);

$result["anchor"]=$alink;
$result["success"]=true;

$a=Config::getInstance();
$a->export($result);

