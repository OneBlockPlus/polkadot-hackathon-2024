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

		<h3>iNFT Cache Management
			<small>Template for iNFT market</small>
		</h3>
		<div class="row">
			<div class="col-lg-8">
				<div class="row">
					<div class="col-lg-4">
						<input id="account_val" class="form-control" value="" placeholder="Address to search iNFT." />
					</div>
					<div class="col-lg-3 text-right">
						<button class="btn btn-md btn-primary" id="account_search">Search</button>
					</div>
					<div class="col-lg-5"></div>
					<div class="col-lg-12" id="account_result">
						<h4>iNFT list of account</h4>
					</div>
				</div>
			</div>
			<div class="col-lg-4">
				<h4>Caching Robot Status</h4>
				<p>The status of the caching status is used to monitor the caching status.</p>
				<table class="table table-hover">
					<thead>
						<tr>
							<th>Description</th>
							<th>Value</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td>Total Accounts</td>
							<td>{%$F.sum%} </td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>
	</div>
</section>

<script type="text/javascript">
	var self={
		nav:function(nav){
			return JSON.stringify(nav);
		},
		fill:function(arr,id,more){
			var dom=`<table class="table table-hover">
					<thead>
						<tr>
							<th>Name</th>
							<th>Block</th>
						</tr>
					</thead>`
			for(var i=0;i<arr.length;i++){
				var row=arr[i];
				dom+=`<tr>
					<td>${row.name}</td>
					<td>${row.block}</td>
				</tr>`;
			}
			if(more!==undefined) dom+=more;
			$("#"+id).html(dom);
		},
	}

	$("#account_search").on('click',function(){
		var acc=$("#account_val").val();
		if(!acc) return false;

		var cfg = {mod:'inft',act:'account',param:{address:acc}}
		FF.fn.ajax(cfg, false, function(res) {
			console.log(res);
			var more=self.nav(res.nav);
			self.fill(res.data,"account_result",more);
		})
	});
</script>

{%include file="{%DEF_VERSION%}/common/web_footer.tpl" title=foo%}