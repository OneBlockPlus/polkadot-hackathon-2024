<?php
	class Board extends CORE{		
	    //必须，数据库加载启动 
	 	public function __construct(){CORE::dbStart();}
		public function __destruct(){CORE::dbClose();}
		public static function getInstance(){return CORE::init(get_class());}
		
		private $suffix=array('3ds','fxb','mmd');
		private $order=array(		//对排序进行转义，防止字符串直接传导给
			'default'	=>	'id',
			'id'			=>	'id',			//按id进行
			'user'		=>	'uid',
			'birth'		=>	'ctime',
		);
		
		public function getStep(){
			return BOARD_PAGE_STEP;
		}
		
		public function transOrder($ord){
			if(!$ord) return $this->order['default'];
			if(isset($this->order[$ord])) return $this->order[$ord];
			return 'id';
		}
		
		public function boardTrend($date,$days=7){
			$table=PRE.'board';
			$rst=array();
			$dec=24*3600;
			$count=10;
			for($i=$days;$i>0;$i--){
				$d=$date-($i-2)*$dec;
				$k=date('Ymd',$d);
				$warr=array(
					array('ctime','<',$d),
				);
				$p=$this->pages($table,'id',$warr,$count);
				
				$rst[$k]=$p['sum'];
			}
			return $rst;
		}
		
		public function boardCat($name,$ord='ord'){
			$arr=$this->getGlobalHash($name);
			
			$sarr=array();
			foreach($arr as $k=>$v){
				$json=json_decode($v,true);
				$arr[$k]=$json;
				$sarr[$k]=$json[$ord];
			}
			arsort($sarr);
			$rst=array();
			foreach($sarr as $k=>$v){
				$rst[$k]=$arr[$k];
			}

			return $rst;
		}
		
		public function boardShow($id){
			$table=PRE.'board';
			$where='id';
			$data=array();
			$data['mtime']=time();
			$data['status']=1;
			return $this->update($data, $table, $where, $id);	
		}
		
		public function boardClose($id){
			$table=PRE.'board';
			$where='id';
			$data=array();
			$data['mtime']=time();
			$data['status']=0;
			return $this->update($data, $table, $where, $id);	
		}
		
		public function boardAdd($data){
			$table=PRE.'board';
			$stamp=time();
			$data['mtime']=$stamp;
			$data['ctime']=$stamp;
			return $this->insert($data, $table);
		}
		
		public function boardView($id){
			$table=PRE.'board';
			$where='id';
			$arr=$this->select($table,$where,$id);
			return empty($arr)?FALSE:$arr[0];
		}
		
		public function boardIds($ids,$order='id',$fields=array()){
			$table=PRE.'board';
			$where='id';
			return $this->ids($table,$where,$ids,$order,$fields);
		}
		
		public function boardUpload($stamp,$key,$id){
			$path=$this->modulePath($stamp,true);
			$name=$this->encryName();
			$this->createFolder($path);
			
			$info=pathinfo($_FILES[$key]['name']);
			$suffix=strtolower($info['extension']);
			
			$target=$path.$name.'.'.$suffix;
			$source=$_FILES[$key]['tmp_name'];
			
			
			
			if(!empty($source) && copy($source,$target)){
				$data=array();
				$data['source']=$name;
				$data['suffix']=$suffix;
				$data['size']=$_FILES[$key]['size'];
				return $this->moduleUpdate($data,$id)?TRUE:FALSE;
			}
			return FALSE;
		}
		
		/*材质文件保存路径
		 * @param	$ctime	integer	//时间戳
		 * @param	$local	bool		//是否为本地读取
		 * 
		 * */
		public function boardPath($ctime,$local=false){
			$year=date('Y',$ctime);
			$month=date('m',$ctime);
			$day=date('d',$ctime);
			if($local){
				$file='..'.DS.BOARD_BASIC_PATH.DS.BOARD_FOLDER.DS.$year.DS.$month.DS.$day.DS;
			}else{
				$file=BOARD_BASIC_DOMIAN.'/'.BOARD_BASIC_PATH.'/'.BOARD_FOLDER.'/'.$year.'/'.$month.'/'.$day.'/';
			}
			return $file;
		}
		
		
		public function boardUpdate($data,$id){
			$table=PRE.'board';
			$where='id';
			$data['mtime']=time();
			return $this->update($data, $table, $where, $id);
		}
		
		public function boardList($page=0,$warr=array(),$order='id',$desc=true,$count=BOARD_PAGE_COUNT){
			$table=PRE.'board';
			return $this->fuuList($table,$page,$count,$desc,$warr,$order);
		}

		
		public function boardPages($warr=array(),$count=BOARD_PAGE_COUNT,$field='id'){
			$table=PRE.'board';
			return $this->pages($table,$field,$warr,$count);
		}
		
		public function boardKeys(){
			return array('id','name','intro','x','y','z','type','url','size','ctime','status');	
		}
		
		public function boardExport($mod){
			$url=$this->modulePath($mod['ctime'],FALSE).$mod['source'].'.'.$mod['suffix'];
			return array(
				(int)$mod['id'],
				$mod['name'],
				$mod['intro'],
				(float)$mod['x'],(float)$mod['y'],(float)$mod['z'],
				(int)$mod['type'],$url,(int)$mod['size'],(int)$mod['ctime'],(int)$mod['status'],
			);
		}
		
		private function encryName($len=BOARD_FILE_HASH){
			return substr(md5(microtime().uniqid()), 0,$len-1);
		}
	}