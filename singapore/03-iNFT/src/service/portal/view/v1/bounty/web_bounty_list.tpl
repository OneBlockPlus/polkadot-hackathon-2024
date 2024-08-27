{%include file="{%DEF_VERSION%}/common/web_header.tpl" title=foo%}
{%include file="{%DEF_VERSION%}/common/web_aside.tpl" title=foo%}
<section>
	<div class="content-wrapper">
		<ul class="nav navbar-nav controller">
			<li>
				<a class="hidden-xs" href="#" data-trigger-resize="" data-toggle-state="aside-collapsed"><em
						class="fa fa-navicon"></em></a>
				<a class="visible-xs sidebar-toggle" href="#" data-toggle-state="aside-toggled"
					data-no-persist="true"><em class="fa fa-navicon"></em></a>
			</li>
		</ul>

		<h3>Bounty List
			<small>Bounty of template mining.</small>
		</h3>
		<div class="row">
			<div class="col-lg-12">
				<div class="panel panel-default">
					<div class="panel-heading">
						<h5>Bounty List</h5>
					</div>
					<div class="panel-wrapper collapse in">
						<div class="panel-body">
							<table class="table table-hover">
								<tr>
									<th></th>
									<th>ID</th>
									<th>Alink</th>
									<th>Description</th>
									<th>Coin</th>
									<th>Apply</th>
									<th>Start(block)</th>
									<th>End(block)</th>
									<th>Status</th>
									<th>Applied</th>
								</tr>

								{%if count($F.list) neq 0%} {%foreach from=$F.list key=k item=v %}
								<tr class="text-left">
									<td><input type="checkbox" class="check_list" value="{%$v.id%}" /></td>
									<td class="id">{%$v.id%}</td>
									<td><a href="?mod=bounty&act=edit&id={%$v.id%}">{%$v.alink%}</a></td>
									<td>{%$v.detail.desc%}</td>
									<td>{%$v.coin%}</td>
									<td>{%count($v.apply)%}</td>
									<td>{%$v.start%}</td>
									<td>{%$v.end%}</td>
									<td>{%$v.status%}</td>
									<td>
										{%if $v.applied eq 1%}
										<button class="btn btn-sm btn-warning bounty_offline"
											data="{%$v.id%}">OFF</button>
										{%else%}
										<button class="btn btn-sm btn-primary bounty_applied"
											data="{%$v.id%}">ON</button>
										{%/if%}
									</td>
								</tr>
								{%/foreach%} {%/if%}
							</table>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>

<script type="text/javascript">
	$(".bounty_applied").off("click").on("click", function() {
		$(this).prop("disabled",true);
		const id = parseInt($(this).attr("data"));
		const param={id:id};
		const cfg = {mod:'bounty',act:'applied',param:param}
		FF.fn.ajax(cfg, false, function(dt) {
			if (dt.success)  location.reload();
		})
	});

	$(".bounty_offline").off("click").on("click", function(){
		$(this).prop("disabled",true);
		const id = parseInt($(this).attr("data"));
		const param={id:id};
		const cfg = {mod:'bounty',act:'offline',param:param}
		FF.fn.ajax(cfg, false, function(dt) {
			if (dt.success)  location.reload();
		})
	});
</script>

{%include file="{%DEF_VERSION%}/common/web_footer.tpl" title=foo%}