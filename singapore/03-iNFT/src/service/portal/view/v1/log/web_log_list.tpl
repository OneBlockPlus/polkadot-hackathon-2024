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
		
		<h3>Client Access Log
			<small>Normal request from API</small>
		</h3>
		<div class="row">
			<div class="col-lg-12">
				<div class="panel panel-default">
					<div class="panel-heading">
						{%$F.date%}周用户访问记录[共{%$F.pagination.total%}页,每页{%$F.pagination.count%}条记录,共{%$F.pagination.sum%}条记录]
						<a href="?mod=log&act=list&date={%$F.preWeek%}"><button class="btn btn-md btn-info">上周</button></a>
						{%if $F.nextWeek >=0%}<a href="?mod=log&act=list&date={%$F.nextWeek%}"><button class="btn btn-md btn-info">下周</button></a>{%/if%}
						<a class="pull-right" href="#" data-tool="panel-collapse" data-toggle="tooltip" title="点击收起操作面板">
							<em class="fa fa-minus"></em>
						</a>
					</div>
					<div class="panel-wrapper collapse in">
					<div class="panel-body">
						<table class="table table-hover">
							<tr>
								<th>ID</th>
								<th>UID</th>
								<th>IP</th>
								<th>Mod</th>
								<th>Act</th>
								<th>数据</th>
								<th>创建时间</th>
								<th>操作</th>
							</tr>

							{%if count($F.list) neq 0%}{%foreach from=$F.list key=k item=v %}
							<tr class="text-left">
								<td class="id">{%$v.id%}</td>
								<td>{%$v.uid%}</td>
								<td>{%$v.ip%}</td>
								<td>{%$v.m%}</td>
								<td>{%$v.a%}</td>
								<td>
									{%foreach from=$v.json key=kk item=vv %}
										{%$kk%}:{%json_encode($vv)|truncate:60%}<br>
									{%/foreach%}
								</td>
								<td>{%$v.ctime|date_format:'%H:%M:%S'%}</td>
								<td class="nobreak">
									<button class="btn btn-sm btn-primary" data="{%$v.id%}">查看详情</button>
								</td>
							</tr>
							{%/foreach%} {%/if%}
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
		</div>
	</div>
</section>

<script type="text/javascript">

</script>

{%include file="{%DEF_VERSION%}/common/web_footer.tpl" title=foo%}