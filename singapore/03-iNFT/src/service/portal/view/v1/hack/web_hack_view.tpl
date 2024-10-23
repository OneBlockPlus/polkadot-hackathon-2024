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
		
		<h3>黑客攻击行为
			<small>系统记录的异常请求，用于人工判断是否为黑客行为</small>
		</h3>
		<div class="row">
			<div class="col-lg-12 col-md-12">
				<div class="panel panel-default">
					<div class="panel-heading">
						异常访问列表
						<a class="pull-right" href="#" data-tool="panel-collapse" data-toggle="tooltip" title="点击收起操作面板">
							<em class="fa fa-minus"></em>
						</a>
					</div>
					<div class="panel-wrapper collapse in">
					<div class="panel-body">
						<table class="table table-hover">
							<tr>
								<th>ID</th>
								<th>级别</th>
								<th>数据</th>
								<th>访问时间</th>
								<th>操作</th>
							</tr>

							{%if count($F.list) neq 0%}{%foreach from=$F.list key=k item=v %}
							<tr class="text-left">
								<td class="id">{%$v.id%}</td>
								<td class="id">{%$v.code%}</td>
								<td class="">{%$v.json|truncate:100%}</td>
								<td>{%$v.ctime|date_format:'%H:%M:%S'%}</td>
								<td class="nobreak">
									<button class="btn btn-sm btn-primary" data="{%$v.id%}">分析</button>
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