<?php
	class Template extends CORE{		
	    //必须，数据库加载启动 
	 	public function __construct(){CORE::dbStart();}
		public function __destruct(){CORE::dbClose();}
		public static function getInstance(){return CORE::init(get_class());}
		
		public function getStep(){
			return TEMPLATE_PAGE_STEP;
		}
		
		public function templateRemove($index,$main=TEMPLATE_QUEUE_NAME){

		}
		
		public function templateAdd($hash,$data,$main=TEMPLATE_QUEUE_NAME){
			$key=TEMPLATE_PREFIX.$hash;
			if($this->existsKey($key)) return false;

			if($this->pushList($main,$hash)){
				return $this->setKey($key,$data);
			}
		}
		
		public function templateView($hash,$main=TEMPLATE_QUEUE_NAME){

		}

		public function templateList($page=0,$step=TEMPLATE_PAGE_STEP,$main=TEMPLATE_QUEUE_NAME){
			$start=$page*$step;
			$end=$start+$step;
			$arr=$this->rangeList($main,$start,$end);
			if(empty($arr)) return false;

			$map=array();
			foreach($arr as $tpl){
				$key=TEMPLATE_PREFIX.$tpl;
				$raw=$this->getKey($key);
				$json=json_decode($raw,true);
				$json["hash"]=$tpl;
				array_push($map,$json);
			}
			return $map;
		}

		public function templatePages($step=TEMPLATE_PAGE_STEP,$main=TEMPLATE_QUEUE_NAME){
			$sum=10;
			return array(
				'total'=>ceil($sum/$step),
				'count'=>$step,
				'sum'=>$sum
			);
		}	
	}