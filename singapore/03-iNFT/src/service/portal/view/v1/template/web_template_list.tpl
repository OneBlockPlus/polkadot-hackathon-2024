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
		
		<h3>Template List
			<small>Template for iNFT market</small>
		</h3>
		<div class="row">
			<div class="panel-heading">
				<div class="row">
					<div class="col-lg-6">
						<div class="form-group">
							<input class="form-control" type="text" id="tpl_hash" placeholder="Input the IPFS file hash" value="" required>
						</div>
					</div>
					<div class="col-lg-3 pt-2">
						<button class="btn btn-sm btn-primary" id="btn_tpl_check">Check</button>
						<button class="btn btn-sm btn-primary" id="btn_tpl_add" style="display:none;">Add To Market</button>
					</div>
					<div class="col-lg-3"></div>
					<div class="col-lg-12" id="info_con"></div>
				</div>
			</div>
			<div class="col-lg-12">
				<div class="panel panel-default">
					<div class="panel-heading">
						Template List
						<a class="pull-right" href="#" data-tool="panel-collapse" data-toggle="tooltip" title="click">
							<em class="fa fa-minus"></em>
						</a>
					</div>
					<div class="panel-wrapper collapse in">
					<div class="panel-body">
						<table class="table table-hover">
							<tr>
								<th>Hash</th>
							</tr>

							{%if count($F.list) neq 0%}{%foreach from=$F.list key=k item=v %}
							<tr class="text-left">
								<td>{%$v.hash%}</td>
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
	//bafkreibtt7ciqypa3vogodmdmvyd3trwajv3l7cqi43yk4hrtgpyopn2e4

	var template_data = null;
	var getData=async function(url,ck){
		const response = await fetch(url);
		if (!response.ok) {
        	return ck && ck({error:"Failed to get IPFS data."});
        }
        const ctx = await response.text();
		return ck && ck(ctx);
	}
	$("#btn_tpl_check").off("click").on("click",function(){
		var hash=$("#tpl_hash").val();
		var url=`https://${hash}.ipfs.w3s.link`;
		getData(url,function(res){
			if(res.error) return console.log(res.error);
			var info=`Get data from ${url} successful. Total ${res.length.toLocaleString()} bytes.`
			template_data=res;
			$("#info_con").html(info);

			$("#btn_tpl_check").hide();
			$("#btn_tpl_add").show();

		});
	});

	$("#btn_tpl_add").off("click").on("click",function(){
		var hash=$("#tpl_hash").val();
		var cfg = {mod:'template',act:'add',param:{hash:hash}}
		FF.fn.ajax(cfg, false, function(data) {
			console.log(data)
		})
	});
</script>

{%include file="{%DEF_VERSION%}/common/web_footer.tpl" title=foo%}