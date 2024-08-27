<?php
class CORE {
	private static $instanceMap = array();
	private $pdo,$cRedis;

	public function __clone() {trigger_error('[core]Clone is not allow!', E_USER_ERROR);}

	protected static function init($className) {
		if (!isset(self::$instanceMap[$className])){
			self::loadDefine(strtolower($className));		//加载组件配置的定义
			$object = new $className;
			if ($object instanceof CORE) self::$instanceMap[$className] = $object;
			else exit('[core]error,please check your code...');
			
			if(DEBUG) self::record('init', '['.microtime(true).']:'.$className.'[first]',true);
		}else{
			if(DEBUG) self::record('init', '['.microtime(true).']:'.$className.'[cached]',true);
		}
		return self::$instanceMap[$className];
	}

	public static function loadDefine($name){
		include_once API_VERSION.DS.DEF_PATH.DS.DEF_PRE.$name.DEF_SUFFIX;
	}
	
	public function load($class){
		include_once API_VERSION.DS.PATH_MODULE.DS.$class.SUFFIX_MODULE;
	}

	public function dbStart() {
		self::loadDefine('database');		//加载基础定义
		self::loadDefine('cache');			//加载全局定义
		$this -> pdoConnect();				//数据库连接
	}
	
	public function dbClose() {
		
	}
	
	public function loadController($mod,$act,$type=CON_AJAX){
		return PATH_CONTROLLER.DS.$mod.DS.$type.$mod.CONNECTOR.$act.SUFFIX_CONTROLLER;		
	}
	

	/******************/
	/****db 数据库操作****/
	/******************/
	
	public function getArray($sql) {
		$result = $this->query($sql);
		if ($result) {
			return $result->fetchAll(PDO::FETCH_ASSOC);
		} else {
			return FALSE;
		}
	}

	//获取一条记录
	public function getRow($sql) {
		$result = $this->query($sql);
		if ($result) {
			$arr=$result->fetchAll(PDO::FETCH_ASSOC);
			return $arr[0];
		} else {
			return FALSE;
		}
	}
	
	private function getKeys($arr){
		$rst=array();
		foreach($arr as $v){
			$rst[$v['Field']]=array(
				'empty'		=>	$v['Null']=='NO'?FALSE:TRUE,
				'primary'	=>	$v['Key']=='PRI'?TRUE:FALSE,
			);
		}
		return $rst;
	}
	
	public function multi($list,$table){
		$sql = 'DESC ' . $table;
		$arr = $this -> getArray($sql);
		if(empty($arr))return FALSE;
		$keys=$this->getKeys($arr);
		$cols = '`'.implode('`,`',$this -> getCol($arr)).'`';

		$vals='';
		
		foreach($list as $v){
			$single='(';
			foreach($keys as $kk=>$vv){
				if(isset($v[$kk])){
					$single.=($vv['primary']?'NULL,':"'".$v[$kk]."',");
				}else{
					$single.=($vv['primary']?'NULL,':'0,');
				}
			}
			$single=trim($single,',');
			$single.='),';
			$vals.=$single;
		}
		$vals=trim($vals,',');
		$sql='INSERT INTO `' .$table.'` ('.$cols.') VALUES '.$vals;
		return $this->query($sql)?$this->pdo->lastInsertId():FALSE;
	}
	
	public function insert($data, $table) {
		return $this->multi(array($data), $table);
	}

	public function update($data, $table, $where, $id) {
		if(empty($data)) return FALSE;

		$feild = '';
		foreach ($data as $k => $v) $feild .= "`$k` =  '$v',";
		$feild = trim($feild, ',');			
		$str=(gettype($id)=='string')?"'".$id."'":$id;
		$sql = "UPDATE  " . $table . " SET  " . $feild . " WHERE " . $where . "=" . $str;
		$rst=$this->query($sql);
		return $rst->rowCount();
	}

	public function select($table, $where = 0, $id = 0, $order = 0,$fields=array()) {
		$sql = 'DESC ' . $table;
		$arr = $this -> getArray($sql);
		if(empty($arr))return FALSE;
		
		$cols = '`'.implode('`,`',$this -> getCol($arr)).'`';
		$sql = "SELECT $cols FROM $table ";
		if($where) $sql .= is_string($id)?"WHERE `$where`='$id' ":"WHERE $where='$id' ";
		if($order) $sql .= $order;
		return $this -> getArray($sql);
	}
	
	public function ids($table,$where,$ids,$order = 0,$fields=array()){
		$sql = 'DESC ' . $table;
		$arr = $this -> getArray($sql);
		if(empty($arr))return FALSE;
		
		$cols = '`'.implode('`,`',$this -> getCol($arr)).'`';
		$sql = "SELECT $cols FROM $table ";
		$sql.=' WHERE '.$where.' in ('.implode($ids,',').')';
		if($order) $sql .= $order;
		return $this -> getArray($sql);
	}
	
	public function search($table,$warr,$order=0){
		$sql = 'DESC ' . $table;
		$arr = $this -> getArray($sql);
		if(empty($arr))return FALSE;
		
		$cols = '`'.implode('`,`',$this -> getCol($arr)).'`';
		$sql = "SELECT $cols FROM $table ";
		
		if(!empty($warr)){
			$sql.="WHERE ";
			$wtxt='';
			foreach($warr as $k=>$v){
				$wtxt.="`$k` LIKE '%$v%' AND ";
			}
			$wtxt=trim($wtxt,' AND ');
			$sql.=$wtxt;
		}
		if($order) $sql .= $order;
		return $this -> getArray($sql);
	}
	
	public function fuuList($table,$start=0,$count,$desc=TRUE,$warr='',$order=''){
		$sql = 'DESC ' . $table;
		$arr = $this -> getArray($sql);
		if(empty($arr))return FALSE;

		$cols = '`'.implode($this -> getCol($arr), '`,`').'`';
		$sql = "SELECT $cols FROM `$table` ";
		
		if(is_array($warr) && !empty($warr)){
			$sql.=' WHERE ';
			foreach($warr as $k=>$v){
				if(is_array($v)) $sql.='`'.$v[0].'`'.$v[1].(is_numeric($v[2])?$v[2]:"'".$v[2]."'").' AND ';
				else $sql.='`'.$k.'`='.(is_numeric($v)?$v:"'".$v."'").' AND ';
			}
			$sql=trim($sql,' AND ');
		}else{
			if(!!$warr) $sql.=' WHERE '.$warr;
		}
		if($order)$sql.=' ORDER BY `'.$order.'`'.($desc?' DESC':' ASC');
		$sql.=' LIMIT '.$start*$count.','.$count;
		return $this -> getArray($sql);
	}
	
	public function pages($table,$col,$warr='',$count){
		$sql='SELECT count(`'.$col.'`) FROM `'.$table.'`';
		if(is_array($warr)){
			if(!empty($warr)){
				$sql.=' WHERE ';
				foreach($warr as $k=>$v){
					if(is_array($v)) $sql.='`'.$v[0].'`'.$v[1].(is_numeric($v[2])?$v[2]:"'".$v[2]."'").' AND ';
					else $sql.='`'.$k.'`='.(is_numeric($v)?$v:"'".$v."'").' AND ';
				}
				$sql=trim($sql,' AND ');
			}
		}else{
			if(!!$warr) $sql.=' WHERE '.$warr;
		}
		$arr=$this->getRow($sql);
		$k='count(`'.$col.'`)';
		$sum=(int)$arr[$k];
		return array('total'=>ceil($sum/$count),'count'=>$count,'sum'=>$sum);
	}
	
	private function pdoConnect(){
		$str='mysql:host='.HOST.';dbname='.DB.';port='.PORT;
		$this->pdo=new PDO($str,USER,PASS);
		$this->pdo->exec('set names '.CHARSET);
	}
	
	public function query($sql){
		if(DEBUG){
			global $yhf;
			$yhf['query']+=1;
			self::record('sql','['.microtime(true).']:'.$sql);
		}
		if(QUERY) echo '[core]:'.$sql.'<br>';
		return $this->pdo->query($sql);
	}
	
	//获取记录的字段
	private function getCol($arr) {
		$result = array();
		foreach ($arr as $k => $v) $result[] = $v['Field'];
		return $result;
	}
	
	/*debug调试方法,用于基础的输出显示*/	
	static function record($key,$val,$isArr=true){
		global $yhf;
		if($isArr) $yhf[$key][]=$val;
		else $yhf[$key]=$val;
	}
	
	private function redisCount(){
		global $yhf;
		$yhf['redis']+=1;
	}
	
	/*redis功能部分*/
	public function existsKey($key){
		if(!$this->cRedis)$this->redisLink();
		if(DEBUG)$this->redisCount();
		return $this->cRedis->exists($key);
	}
	
	public function expireKey($key,$time=TOKEN_TIME){
		if(!$this->cRedis)$this->redisLink();
		if(DEBUG)$this->redisCount();
		return $this->cRedis->expire($key,$time);
	}
	
	public function ttlKey($key){
		if(!$this->cRedis)$this->redisLink();
		if(DEBUG)$this->redisCount();
		return $this->cRedis->ttl($key);
	}

	/*string的redis部分*/
	public function getKey($key){
		if(!$this->cRedis)$this->redisLink();
		if(DEBUG)$this->redisCount();
		return $this->cRedis->get($key);
	}
		
	public function setKey($key,$val) {
		if(!$this->cRedis)$this->redisLink();
		if(DEBUG)$this->redisCount();
		return $this->cRedis->set($key,$val);
	}
	
	public function delKey($key){
		if(!$this->cRedis) $this->redisLink();
		if(DEBUG)$this->redisCount();
		return $this->cRedis->del($key);
	}
	
	public function incKey($key){
		if(!$this->cRedis)$this->redisLink();
		if(DEBUG)$this->redisCount();
		$this->cRedis->incr($key);
		return $this->cRedis->get($key);
	}
	
	public function keys($prefix){
		if(!$this->cRedis)$this->redisLink();
		if(DEBUG)$this->redisCount();
		return $this->cRedis->keys($prefix.'*');
	}

	/*hash的redis部分*/
	public function getHash($main,$keys=array()){
		if(!$this->cRedis)$this->redisLink();
		if(DEBUG)$this->redisCount();
		if(empty($keys)) return $this->cRedis->hgetall($main);
		return $this->cRedis->hmget($main,$keys);
	}
		
	public function setHash($main,$key,$val){
		if(!$this->cRedis)$this->redisLink();
		if(DEBUG)$this->redisCount();
		return $this->cRedis->hset($main,$key,$val);
	}
	
	public function autosetHash($main,$arr){
		if(!$this->cRedis) $this->redisLink();
		if(DEBUG)$this->redisCount();
		foreach($arr as $k=>$v){
			$this->cRedis->hset($main,$k,is_array($v)?json_encode($v):$v);
		}
		return true;
	}
	
	public function incHash($main,$key){
		if(!$this->cRedis) $this->redisLink();
		if(DEBUG)$this->redisCount();
		$this->cRedis->hincrby($main,$key,1);
		return $this->cRedis->hget($main,$key);
	}

	public function rangeList($main,$start,$end){
		if(!$this->cRedis) $this->redisLink();
		if(DEBUG)$this->redisCount();
		return $this->cRedis->lrange($main,$start,$end);
	}

	public function lenList($main){
		if(!$this->cRedis) $this->redisLink();
		if(DEBUG)$this->redisCount();
		return $this->cRedis->llen($main);
	}
		
	/*redis服务器的连接*/
	private function redisLink(){
		if(!class_exists('Redis')){exit('no redis support');}
		if(!$this->cRedis){
			$redis=new Redis();
			if($redis->connect(CACHE_REIDS_HOST,CACHE_REIDS_PORT)){
				$redis->auth(CACHE_REIDS_AUTH);
				$this->cRedis=$redis;
				return true;
			}else{
				return false;
			}
		}
		return true;
	}
	
	/***文件处理基础函数***/
	public function createFolder($path) {
		if (!file_exists($path)) {
			$this -> createFolder(dirname($path));
			mkdir($path, 0777);
			return true;
		}
		return true;
	}
	
	/*编码处理，需要*/
	public function decodeUnicode($str){
		$reg='/\\\\u([0-9a-f]{4})/i';
		return preg_replace_callback($reg,
        create_function(
            '$matches',
            'return mb_convert_encoding(pack("H*", $matches[1]), "UTF-8", "UCS-2BE");'
        ),
        $str);
	}
	
	public function cnJsonEncode($arr){
		foreach($arr as $k=>$v) $arr[$k]=urlencode($v);
		return json_encode($arr);
	}
	
	public function cnJsonDecode($str){
		$arr=json_decode($str,true);
		foreach($arr as $k=>$v) $arr[$k]=urldecode($v);
		return $arr;
	}
	
	//整形转换成'#EEFFBB'形式的值
	public function INTtoRGB($num){
		return '#'.dechex($num);
	}
	
	//'#EEFFBB'转换成整数形式的值
	public function RGBtoINT($str){
		return hexdec(str_replace('#', '', $str));
	}
	
	public function isFloat($val){ 
		/*$pattern = '/^[-+]?(((\\\\d+)\\\\.?(\\\\d+)?)|\\\\.\\\\d+)([eE]?[+-]?\\\\d+)?$/'; 
		return (!is_bool($val) && (is_float($val) || preg_match($pattern, trim($val))));*/ 
		if (!is_scalar($val))return false;
        $type = gettype($val);
        if ($type === "float") return true;
		return preg_match("/^\\d+\\.\\d+$/", $val) === 1;
	}
	
	public function char($len=7,$res=''){
		for($i=0;$i<$len;$i++)$res.=chr($i%2?rand(65, 90):rand(97,122));
		return $res;
	}
}