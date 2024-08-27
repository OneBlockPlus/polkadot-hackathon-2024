{%include file="{%DEF_VERSION%}/common/web_header.tpl" title=foo%}
<div class="block-center mt-xl wd-xl">
	<!-- START panel-->
	<div class="panel panel-dark panel-flat">
		<div class="panel-heading text-center">
			<a href="#">
				<!--<img class="block-center img-rounded" src="img/logo.png" alt="Image">-->
			</a>
		</div>
		<div class="panel-body">
			<p class="text-center pv">登陆 {%SYSTEM_NAME%}</p>
			<div id="info"></div>
			<form class="mb-lg" role="form" >
				<div class="form-group">
					<input class="form-control" id="login_name" type="text" placeholder="输入您的管理员用户名..." required>
				</div>
				<div class="form-group">
					<input class="form-control" id="login_pass" type="password" placeholder="输入您的管理员密码..." required>
				</div>
				
			</form>
			<button class="btn btn-block btn-primary mt-lg" id="btn-login">登陆</button>
		</div>
	</div>
</div>
<script src="{%$F.cdn%}/js/md5.js"></script>
<script type="text/javascript">
	var dsalt={%$F.dsalt%};
	
	$("#btn-login").on('click',function(){
		var name=$("#login_name").val(),pass=$("#login_pass").val()
		if(!name || !pass) return
		var cfg={mod:'admin',act:'login',param:{name:name,pass:pass}}
		FF.get(cfg,'http://localhost/system/u/api.php',function(res){
			if(!res.success){
				$("#info").html('登陆失败,请重新输入您的用户名和密码')
				$("#login_pass").val('')
			}
			
			var cfg = {mod:'login',act:'admin',param:{spam:res.spam}}
			FF.fn.ajax(cfg, false, function(data) {
				if(res.success) location.reload()
			})
		})
	})
	
	
	
</script>
{%include file="{%DEF_VERSION%}/common/web_footer.tpl" title=foo%}