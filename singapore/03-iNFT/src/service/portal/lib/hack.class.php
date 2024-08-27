<?php
	class Hack extends CORE{		
	    //必须，数据库加载启动 
	 	public function __construct(){CORE::dbStart();}
		public function __destruct(){CORE::dbClose();}
		public static function getInstance(){return CORE::init(get_class());}
		
		public function hackSummary($date,$n=7){
			
			$dec=24*3600;
			$ord=(int)date('d',$date);
			$year=date('Y',$date);
			$mon=date('m',$date);
			
			$rst=array();
			for($i=$n;$i>0;$i--){
				$k=date('Ymd',$date-($i-1)*$dec);
				$suffix=$year.CONNECTOR.($ord-$i>=0?$mon:$mon-1);
				if($i==1){
					$warr=array(
						array('ctime','>=',$date),
					);
				}else{
					$warr=array(
						array('ctime','>=',$date-($i-1)*$dec),
						array('ctime','<=',$date-($i-2)*$dec),
					);
				}
				$param=$this->hackPages($suffix,$warr);
				$rst[$k]=$param['sum'];
			}
			return $rst;
		}
		
		public function getStep(){
			return HACK_PAGE_STEP;
		}

		public function hackView($id,$date){
			$table=PRE.'hack'.CONNECTOR.$date;
			$where='id';
			$arr=$this->select($table,$where,$id);
			return empty($arr)?FALSE:$arr[0];
		}

		public function hackList($date,$page=0,$warr=array(),$order='id',$desc=true,$count=HACK_PAGE_COUNT){
			$table=PRE.'hack'.CONNECTOR.$date;
			return $this->fuuList($table,$page,$count,$desc,$warr,$order);
		}
		
		
		public function hackPages($date,$warr=array(),$count=HACK_PAGE_COUNT,$field='id'){
			$table=PRE.'hack'.CONNECTOR.$date;
			return $this->pages($table,$field,$warr,$count);
		}
	}