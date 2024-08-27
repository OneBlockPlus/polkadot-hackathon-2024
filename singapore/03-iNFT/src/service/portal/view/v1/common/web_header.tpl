<!DOCTYPE html>

<head>
    <title>{%if isset($F.title)%}{%$F.title%}-{%/if%}{%SYSTEM_NAME%}[{%DEF_VERSION%}]</title>
	<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
	
	<link rel="stylesheet" href="{%$F.cdn%}/lib/fontawesome/css/font-awesome.min.css">
	<link rel="stylesheet" href="{%$F.cdn%}/lib/simple-line-icons/css/simple-line-icons.css">
	<link rel="stylesheet" href="{%$F.cdn%}/lib/animate.css/animate.min.css">
	<link rel="stylesheet" href="{%$F.cdn%}/lib/whirl/dist/whirl.css">
	<link rel="stylesheet" href="{%$F.cdn%}/lib/weather-icons/css/weather-icons.min.css">
	<link rel="stylesheet" href="{%$F.cdn%}/css/bootstrap.min.css" id="bscss">
	<link rel="stylesheet" href="{%$F.cdn%}/css/angle/app.css" id="maincss">
	<link rel="stylesheet" href="{%$F.cdn%}/css/angle/theme-a.css">
	<link rel="stylesheet" href="{%$F.cdn%}/css/admin.css">
	
	<script src="{%$F.cdn%}/js/echarts.min.js"></script>
	<script src="{%$F.cdn%}/lib/modernizr/modernizr.custom.js"></script>
	<script src="{%$F.cdn%}/lib/matchMedia/matchMedia.js"></script>
	
	<script src="{%$F.cdn%}/lib/jquery/dist/jquery.js"></script>
	<script src="{%$F.cdn%}/lib/bootstrap/dist/js/bootstrap.js"></script>
	<script src="{%$F.cdn%}/lib/jQuery-Storage-API/jquery.storageapi.js"></script>
	<script src="{%$F.cdn%}/lib/jquery.easing/js/jquery.easing.js"></script>
	<script src="{%$F.cdn%}/lib/animo.js/animo.js"></script>
	<script src="{%$F.cdn%}/lib/slimScroll/jquery.slimscroll.min.js"></script>
	<script src="{%$F.cdn%}/lib/screenfull/dist/screenfull.js"></script>
	<script src="{%$F.cdn%}/js/demo/demo-rtl.js"></script>
   
	<script src="{%$F.cdn%}/lib/sparkline/index.js"></script>
	
	<script src="{%$F.cdn%}/lib/flot/jquery.flot.js"></script>
	<script src="{%$F.cdn%}/lib/flot.tooltip/js/jquery.flot.tooltip.min.js"></script>
	<script src="{%$F.cdn%}/lib/flot/jquery.flot.resize.js"></script>
	<script src="{%$F.cdn%}/lib/flot/jquery.flot.pie.js"></script>
	<script src="{%$F.cdn%}/lib/flot/jquery.flot.time.js"></script>
	<script src="{%$F.cdn%}/lib/flot/jquery.flot.categories.js"></script>
	
	<script src="{%$F.cdn%}/lib/flot-spline/js/jquery.flot.spline.min.js"></script>
	<script src="{%$F.cdn%}/lib/jquery.easy-pie-chart/dist/jquery.easypiechart.js"></script>
	<script src="{%$F.cdn%}/lib/moment/min/moment-with-locales.min.js"></script>
	<script src="{%$F.cdn%}/js/demo/demo-flot.js"></script>
	
	<script src="{%$F.cdn%}/js/app.js"></script>
	
	<script src="{%$F.cdn%}/js/admin.js"></script>

	<script src="{%$F.cdn%}/web3/polkadot.min.js"></script>
	<script src="{%$F.cdn%}/web3/easy.min.js"></script>
	<script src="{%$F.cdn%}/web3/anchor.min.js"></script>
</head>
<body>
	<div class="wrapper">