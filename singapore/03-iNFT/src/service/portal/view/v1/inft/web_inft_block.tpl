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

		<h3>iNFT Cache Overview
			<small>Template for iNFT market</small>
		</h3>
		<div class="row">
			<div class="col-lg-8">
				<div class="row">
					<div class="col-lg-4">
						<input class="form-control" id="inft_block" value="" placeholder="input block to search" />
					</div>
					<div class="col-lg-3 text-right">
						<button class="btn btn-md btn-primary" id="search_block">Search</button>
					</div>
					<div class="col-lg-5"></div>
					<div class="col-lg-12" id="block_result">
						<h4>iNFT list on single block.</h4>
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
							<td>Total blocks</td>
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
		fill:function(arr,id){
			var dom=`<table class="table table-hover">
					<thead>
						<tr>
							<th>Order</th>
							<th>Name</th>
							<th>Action</th>
							<th>Owner</th>
						</tr>
					</thead>`
			for(var i=0;i<arr.length;i++){
				var row=arr[i];
				dom+=`<tr>
					<td>${row[0]}</td>
					<td>${row[1]}</td>
					<td>${row[2]}</td>
					<td>${row[3]}</td>
				</tr>`;
			}
			$("#"+id).html(dom);
		},
	}

	$("#search_block").on('click',function(){
		var block=$("#inft_block").val();
		if(!block) return false;

		var cfg = {mod:'inft',act:'block',param:{block:block}}
		FF.fn.ajax(cfg, false, function(res) {
			console.log(res);
			self.fill(res.data,"block_result")
		})
	});
</script>

{%include file="{%DEF_VERSION%}/common/web_footer.tpl" title=foo%}