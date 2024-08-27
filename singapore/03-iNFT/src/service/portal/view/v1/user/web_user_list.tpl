{%include file="{%DEF_VERSION%}/common/web_header.tpl" title=foo%}
{%include file="{%DEF_VERSION%}/common/web_aside.tpl" title=foo%}
<section>
	<div class="content-wrapper">
		<ul class="nav navbar-nav controller">
			<li>
				<a class="hidden-xs" href="#" data-trigger-resize="" data-toggle-state="aside-collapsed"><em class="fa fa-navicon"></em></a>
				<a class="visible-xs sidebar-toggle" href="#" data-toggle-state="aside-toggled" data-no-persist="true"><em class="fa fa-navicon"></em></a>
			</li>
		</ul>
		<h3>Client Management
			<small>Basic user information.</small>
		</h3>
		
		<div class="row">
			<div class="col-lg-12 col-md-12">
				<div class="panel panel-default">
					<div class="panel-heading">
						用户列表
						<a class="pull-right" href="#" data-tool="panel-collapse" data-toggle="tooltip" title="点击收起操作面板">
							<em class="fa fa-minus"></em>
						</a>
						<a href="?mod=user&act=trash">垃圾桶</a>
						<button class="btn btn-xs btn-danger" style="margin-left: 10px;float:right" id="cache_clear" data="{%$F.row.id%}">清理缓存</button><span id="info_me" style="margin-left: 10px;"></span>
						<button class="btn btn-xs btn-primary" style="margin-left: 10px;float:right" id="cache_auto" data="{%$F.row.id%}">自动缓存</button><span id="info_me" style="margin-left: 10px;"></span>
					</div>
					<div class="panel-wrapper collapse in">
					<div class="panel-body">
						<table class="table table-hover">
							<tr>
								<th></th>
								<th><a href="?mod=user&act=list&od=id{%if $F.dec%}&dc=0{%/if%}">ID</a></th>
								<th>头像</th>
								<th><a href="?mod=user&act=list&od=name{%if $F.dec%}&dc=0{%/if%}">用户名</a></th>
								<th><a href="?mod=user&act=list&od=phone{%if $F.dec%}&dc=0{%/if%}">手机</a></th>
								<th>UUID</th>
								<th>性别</th>
								<th><a href="?mod=user&act=list&od=from{%if $F.dec%}&dc=0{%/if%}">来源</a></th>
								<th><a href="?mod=user&act=list&od=login{%if $F.dec%}&dc=0{%/if%}">最后登录</a></th>
								<th>操作</th>
							</tr>

							{%if count($F.list) neq 0%} {%foreach from=$F.list key=k item=v %}
							<tr class="text-left">
								<td><input type="checkbox" class="check_list" value="{%$v.uid%}" /></td>
								<td class="id">{%$v.uid%}</td>
								<td class="id"><a href="?mod=user&act=edit&id={%$v.uid%}"><img src="static/avatar.gif"/></a></td>
								<td class="nobreak"><a href="?mod=user&act=edit&id={%$v.uid%}">{%if $v.cached%}<img src="static/redis.png" style="width: 15px;height: 15px;margin-right: 5px;">{%/if%}{%$v.name%}</a></td>
								<td>{%$v.mobile%}</td>
								<td><a href="?mod=user&act=edit&id={%$v.uid%}">{%$v.uuid%}</a></td>
								<td>{%$v.sex%}</td>
								<td>{%$v.origin%}</td>
								<td>{%$v.last|date_format:'%H:%M:%S | %Y-%m-%d'%}</td>
								<td class="nobreak">
									
									<button class="btn btn-sm btn-default user_cache" data="{%$v.uid%}">缓存</button>
									{%if $v.status eq 0%}
									<button class="btn btn-sm btn-default status_show" data="{%$v.uid%}">开放</button> {%else%}
									<button class="btn btn-sm btn-danger status_close" data="{%$v.uid%}">禁用</button> {%/if%}
									<a href="?mod=user&act=edit&id={%$v.uid%}"><button class="btn btn-sm btn-primary">用户管理</button></a>
									<div class="btn-group">
										<button data-toggle="dropdown" class="btn btn-sm dropdown-toggle">其他操作 <span class="caret"></span></button>
										<ul class="dropdown-menu">
											<li>
												<a href="?mod=user&act=edit&id={%$v.uid%}"><em class="icon-note"></em><span> 编辑用户信息</span></a>
											</li>
										</ul>
									</div>
								</td>
							</tr>
							{%/foreach%} {%/if%}
							<tr class="row_selected">
								<td colspan="12">
									<div class="z">
										<button class="btn btn-sm btn-default" id="select_all">全选</button>
										<button class="btn btn-sm btn-default" id="close_all">关闭</button>
										<button class="btn btn-sm btn-default" id="show_all">开放</button>
									</div>
									<div class="y">
										<button class="btn btn-sm btn-primary" id="cache_all">更新缓存</button>
									</div>
								</td>
							</tr>
						</table>
					</div>
					</div>
					<div class="panel-footer">
						<div class="pagination-container text-right">
							{%$F.nav%}
						</div>
					</div>
				</div>
			</div>
			<!--<div class="col-lg-3 col-md-3">
				<h5>用户管理说明</h5>
				<p></p>
			</div>-->
		</div>
	</div>
</section>

<script type="text/javascript">
	$("#cache_auto").on('click',function(){
		
	});
	
	$(".user_cache").on('click',function(){
		var uid=parseInt($(this).attr('data'));
		var cfg = {mod:'user',act:'cache',param:{ids:JSON.stringify([uid])}}
		FF.fn.ajax(cfg, false, function(data) {
			location.reload()
		})
	});
	
	$("#select_all").on('click', function() {
		FF.fn.selectList('.check_list', 'row_selected')
	})
	$("#cache_all").on('click', function() {
		var ids = FF.fn.getCheckBoxlist('.check_list')
		if(ids) {
			var cfg = {mod:'user',act:'cache',param:{ids:JSON.stringify(ids)}}
			FF.fn.ajax(cfg, false, function(data) {
				location.reload()
			})
		}
	})
	
	$("#close_all").on('click', function() {
		var ids = FF.fn.getCheckBoxlist('.check_list')
		if(ids) {
			var cfg = {mod:'user',act:'close',param:{ids:JSON.stringify(ids)}}
			FF.fn.ajax(cfg, false, function(data) {
				location.reload()
			})
		}
	})

	$("#show_all").on('click', function() {
		var ids = FF.fn.getCheckBoxlist('.check_list')
		if(ids) {
			var cfg = {mod:'user',act:'show',param:{ids:JSON.stringify(ids)}}
			FF.fn.ajax(cfg, false, function(data) {
				location.reload()
			})
		}
	})

	$(".table tr").on('click', function() {
		var sel = $(this).find('.check_list')
		if(sel.is(':checked')) {
			$(this).removeClass('row_selected')
		} else {
			$(this).addClass('row_selected')
		}
		sel.prop("checked", sel.is(':checked') ? false : true)
	})

	$(".status_close").on('click', close_me)
	$(".status_show").on('click', show_me)

	function close_me() {
		var me = $(this)
		var did = me.attr('data')
		var cfg = {mod:'user',act:'close',param:{ids:'[' + did + ']'}}
		FF.fn.ajax(cfg, false, function(data) {
			if(data['success']) {
				me.html('开放').removeClass('btn btn-sm btn-danger status_close').addClass('btn btn-sm btn-default status_show')
				$(".status_close").off('click').on('click', close_me)
				$(".status_show").off('click').on('click', show_me)
			}
		})
	}

	function show_me() {
		var me = $(this)
		var did = me.attr('data')
		var cfg = {mod:'user',act:'show',param:{ids:'[' + did + ']'}}
		FF.fn.ajax(cfg, false, function(data) {
			if(data['success']) {
				me.html('关闭').removeClass('btn btn-sm btn-default status_show').addClass('btn btn-sm btn-danger status_close')
				$(".status_close").off('click').on('click', close_me)
				$(".status_show").off('click').on('click', show_me)
			}
		})
	}
</script>

{%include file="{%DEF_VERSION%}/common/web_footer.tpl" title=foo%}