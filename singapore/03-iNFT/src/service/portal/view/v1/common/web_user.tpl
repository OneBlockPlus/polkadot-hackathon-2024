<li class="has-user-block">
	<div class="collapse" id="user-block">
		<div class="item user-block">
			<div class="user-block-picture" style="margin-top: 10px;">
				<div class="user-block-status">
					<img class="img-thumbnail img-circle" src="static/vbw.png" alt="Avatar" width="60" height="60">
				</div>
			</div>
			<div class="user-block-info">
				<span class="user-block-name">{%$F.name%}</span>
				<span class="user-block-role">Administrator</span>
			</div>
		</div>
		<div class="row" style="margin-bottom: 10px;">
			<div class="col-lg-12 text-center">
				<button class="btn btn-xs btn-danger" style="width: 80%;" id="log_out" data="{%$F.uid%}">Logout</button>
			</div>
		</div>
	</div
</li>
<script type="text/javascript">
	$("#log_out").on('click',function(){
		var cfg={mod:'admin',act:'logout',param:{d:'ajax'}}
		FF.fn.ajax(cfg,false,function(res){
			if(res.success) location.reload();
		});
	});
</script>