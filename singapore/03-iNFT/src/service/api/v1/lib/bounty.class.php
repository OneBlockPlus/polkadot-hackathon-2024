<?php
	class Bounty extends CORE{		
	    //必须，数据库加载启动 
	 	public function __construct(){CORE::dbStart();}
		public function __destruct(){CORE::dbClose();}
		public static function getInstance(){return CORE::init(get_class());}
		
		public function getStep(){
			return BOUNTY_PAGE_STEP;
		}

		public function bountyTarget($network){
			if(isset(BOUNTY_TARGET[$network])) return BOUNTY_TARGET[$network];
			return false;
		}
		
		public function bountyExsist($alink){
			$warr=array(
				"alink" => $alink,
			);
			$page=0;
			$arr=$this->bountyList($page,$warr);
			if(empty($arr)) return false;
			return true;
		}

		public function bountyShow($id){
			$table=PRE.'bounty';
			$where='id';
			$data=array();
			$data['mtime']=time();
			$data['status']=1;
			return $this->update($data, $table, $where, $id);	
		}
		
		public function bountyClose($id){
			$table=PRE.'bounty';
			$where='id';
			$data=array();
			$data['mtime']=time();
			$data['status']=0;
			return $this->update($data, $table, $where, $id);	
		}
		
		public function bountyAdd($data){
			$table=PRE.'bounty';
			$stamp=time();
			$data['mtime']=$stamp;
			$data['ctime']=$stamp;
			return $this->insert($data, $table);
		}
		
		public function bountyView($id){
			$table=PRE.'bounty';
			$where='id';
			$arr=$this->select($table,$where,$id);
			return empty($arr)?FALSE:$arr[0];
		}

		public function bountySearch($alink){
			$warr=array(
				'alink'=>$alink,
			);
			$arr=$this->bountyList(0,$warr);
			//echo json_encode($arr);
			return empty($arr)?FALSE:$arr[0];
		}

		public function bountyIds($ids,$order='id',$fields=array()){
			$table=PRE.'bounty';
			$where='id';
			return $this->ids($table,$where,$ids,$order,$fields);
		}
		
		public function bountyUpdate($data,$id){
			$table=PRE.'bounty';
			$where='id';
			$data['mtime']=time();
			return $this->update($data, $table, $where, $id);
		}
		
		public function bountyList($page=0,$warr=array(),$order='id',$desc=true,$count=BOUNTY_PAGE_COUNT){
			$table=PRE.'bounty';
			return $this->fuuList($table,$page,$count,$desc,$warr,$order);
		}

		
		public function bountyPages($warr=array(),$count=BOUNTY_PAGE_COUNT,$field='id'){
			$table=PRE.'bounty';
			return $this->pages($table,$field,$warr,$count);
		}
	}