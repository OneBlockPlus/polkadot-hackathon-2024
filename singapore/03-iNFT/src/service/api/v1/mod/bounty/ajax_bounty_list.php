<?php
if(!defined('INFTAPI')) exit('error');
$page=isset($_F['request']['p'])?(int)$_F['request']['p']-1:0;

$result=array('success'=>FALSE);



$a->load("bounty");
$a=Bounty::getInstance();

$warr=array(
    "applied"    =>  1,
);

$arr=$a->bountyList($page,$warr);
foreach($arr as $k=>$v){
    $arr[$k]['detail']=json_decode(htmlspecialchars_decode($v["detail"]),true);
    $arr[$k]['template']=json_decode(htmlspecialchars_decode($v["template"]),true);
    $arr[$k]['apply']=json_decode(htmlspecialchars_decode($v["apply"]),true);
}

$result['data']=$arr;
$result['success']=true;

$a=Config::getInstance();
$a->export($result);

