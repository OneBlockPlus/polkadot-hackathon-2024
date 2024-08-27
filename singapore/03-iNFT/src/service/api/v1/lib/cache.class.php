<?php
	class Cache extends CORE{
		
	    //必须，数据库加载启动 
	 	public function __construct(){CORE::dbStart();}
		public function __destruct(){CORE::dbClose();}
		public static function getInstance(){return CORE::init(get_class());}

		public function templateList($page=0){

		}

		public function accountList($page=0){
			
		}

		public function sellingList($page=0){
			
		}

		public function blockList($page=0){
			
		}

		public function anchorHistory($page=0){
			
		}
	}

