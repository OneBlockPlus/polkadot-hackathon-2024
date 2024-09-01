// ignore_for_file: use_key_in_widget_constructors, non_constant_identifier_names, unnecessary_new, sized_box_for_whitespace, prefer_const_constructors

import 'dart:convert';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';

import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:http/http.dart' as http;
import 'dart:js' as js;

import 'package:syncfusion_flutter_charts/charts.dart';

class WearablesScreen extends ConsumerStatefulWidget {
  const WearablesScreen({Key? key}) : super(key: key);

  @override
  ConsumerState<ConsumerStatefulWidget> createState() =>
      _WearablesScreenState();
}

class _WearablesScreenState extends ConsumerState<WearablesScreen> {
  @override
  initState() {
    super.initState();
    GetAccountData();
  }

String domain = "http://localhost:3000";
  String userid = "";
  String AccountTokenAddress = "";
  bool hasDevice = false;
  var allDevices = "";
  List<ChartData> chartDataBlood = [
    ChartData("1/8/2024", 23),
    ChartData("2/8/2024", 55),
    ChartData("3/8/2024", 76),
    ChartData("4/8/2024", 33),
    ChartData("5/8/2024", 55),
    ChartData("6/8/2024", 99),
    ChartData("7/8/2024", 88),
    ChartData("8/8/2024", 87)
  ];
  List<ChartData> chartDataSleep = [
    ChartData("1/8/2024", 445),
    ChartData("2/8/2024", 656),
    ChartData("3/8/2024", 443),
    ChartData("4/8/2024", 787),
    ChartData("5/8/2024", 834),
    ChartData("6/8/2024", 590),
    ChartData("7/8/2024", 776),
    ChartData("8/8/2024", 589)
  ];
  List<ChartData> chartDataCalories = [
    ChartData("1/8/2024", 67),
    ChartData("2/8/2024", 78),
    ChartData("3/8/2024", 89),
    ChartData("4/8/2024", 98),
    ChartData("5/8/2024", 78),
    ChartData("6/8/2024", 90),
    ChartData("7/8/2024", 78),
    ChartData("8/8/2024", 89)
  ];
  List<ChartData> chartDataSteps = [
    ChartData("1/8/2024", 76),
    ChartData("2/8/2024", 54),
    ChartData("3/8/2024", 34),
    ChartData("4/8/2024", 90),
    ChartData("5/8/2024", 67),
    ChartData("6/8/2024", 54),
    ChartData("7/8/2024", 67),
    ChartData("8/8/2024", 45)
  ];
  String durationToString(int minutes) {
    var d = Duration(minutes: minutes);
    List<String> parts = d.toString().split(':');
    return '${parts[0]}h ${parts[1]}m';
  }

  Future<void> GetAccountData() async {
    // Obtain shared preferences.
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      userid = (prefs.getString("userid").toString());
    });
    await GetTokenAddress();
  }

  Future<void> GetTokenAddress() async {
    // var url = Uri.parse(
    //     domain +'/api/GET/getUserDetails?userid=1');
    // final response = await http.get(url);
    // var responseData = json.decode(response.body);

    // var dataUD = (responseData['value']);

    // setState(() {
    //   AccountTokenAddress = dataUD['accessToken'];
    //   print(AccountTokenAddress);
    // });
  }

  Future<void> generateLoginLink() async {
    var url = Uri.parse(
        domain + '/api/GET/Wearable/getSourceLink?userid=1');
    final response = await http.get(url);
    var responseData = json.decode(response.body);

    var sourceLink = (responseData['value']);

    js.context.callMethod('open', [sourceLink]);
  }

  Future<void> GetBloodRate() async {
    chartDataBlood = [];
    // 'http://localhost:8080/api/GET/Wearable/customAPI?userid=${userid}&url=https://api.und-gesund.de/v5/dailyDynamicValues&token=${this.AccountTokenAddress}&body_startDay=${(new DateTime(DateTime.now().year, DateTime.now().month, DateTime.now().day - 9)).toLocal()}&body_endDay=${(new DateTime(DateTime.now().year, DateTime.now().month, DateTime.now().day - 3)).toLocal()}&body_valueTypes=3001');

    var startDate = DateFormat('yyyy-MM-dd').format(new DateTime(
        DateTime.now().year, DateTime.now().month, DateTime.now().day - 7));
    var endDate = DateFormat('yyyy-MM-dd').format(new DateTime(
        DateTime.now().year, DateTime.now().month, DateTime.now().day - 1));

    var url = Uri.parse(
        domain + '/api/GET/Wearable/customAPI?userid=${userid}&url=https://api.und-gesund.de/v5/dailyDynamicValues&token=${this.AccountTokenAddress}&body_startDay=${startDate}&body_endDay=${endDate}&body_valueTypes=3001');
    final response = await http.get(url);
    var responseData = json.decode(response.body);
    var parsed = json.decode(responseData['value']);
    var onedate = 0;
    var lastdate = "";
    for (var i = 0; i < parsed[0]['dataSources'][0]['data'].length; i++) {
      var element = parsed[0]['dataSources'][0]['data'][i];
      var createdDate = element["day"];
      var datePoint = int.parse(element['value']);
      if (lastdate == createdDate) {
        onedate += (datePoint);
      } else {
        if (lastdate != "") {
          setState(() {
            chartDataBlood.add(
                ChartData(lastdate, double.parse(onedate.floor().toString())));
          });
        }
        onedate = 0;
        onedate += datePoint;
        lastdate = createdDate;
      }
    }
  }

  Future<void> GetSleepData() async {
    setState(() {
      chartDataSleep = [];
    });
    var startDate = DateFormat('yyyy-MM-dd').format(new DateTime(
        DateTime.now().year, DateTime.now().month, DateTime.now().day - 7));
    var endDate = DateFormat('yyyy-MM-dd').format(new DateTime(
        DateTime.now().year, DateTime.now().month, DateTime.now().day - 1));
    // var startDate = DateFormat('yyyy-MM-dd').format(new DateTime(2023, 01, 11));
    // var endDate = DateFormat('yyyy-MM-dd').format(new DateTime(2023,01, 17));
    // var url = Uri.parse(
    //      domain + '/api/GET/Wearable/customAPI?userid=${userid}&url=https://api.und-gesund.de/v5/dailyDynamicValues&token=${this.AccountTokenAddress}&body_startDay=${startDate}&body_endDay=${endDate}&body_valueTypes=2002,2003,2005');
    var url = Uri.parse(
         domain + '/api/GET/Wearable/customAPI?userid=${userid}&url=https://api.und-gesund.de/v5/dailyDynamicValues&token=${this.AccountTokenAddress}&body_startDay=${startDate}&body_endDay=${endDate}&body_valueTypes=2001');
    final response = await http.get(url);
    var responseData = json.decode(response.body);
    var parsed = json.decode(responseData['value']);
    var onedate = 0;
    var lastdate = "";
    for (var i = 0; i < parsed[0]['dataSources'][0]['data'].length; i++) {
      var element = parsed[0]['dataSources'][0]['data'][i];
      var createdDate = element["day"];
      var datePoint = int.parse(element['value']);
      if (lastdate == createdDate) {
        onedate += datePoint;
      } else {
        if (lastdate != "") {
          setState(() {
            chartDataSleep.add(
                ChartData(lastdate, double.parse(onedate.floor().toString())));
          });
        }
        onedate = 0;
        onedate += datePoint;
        lastdate = createdDate;
      }
    }
    if (lastdate != "") {
      setState(() {
        chartDataSleep
            .add(ChartData(lastdate, double.parse(onedate.floor().toString())));
      });
    }
  }

  Future<void> GetStepsData() async {
    setState(() {
      chartDataSteps = [];
    });
    var startDate = DateFormat('yyyy-MM-dd').format(new DateTime(
        DateTime.now().year, DateTime.now().month, DateTime.now().day - 7));
    var endDate = DateFormat('yyyy-MM-dd').format(new DateTime(
        DateTime.now().year, DateTime.now().month, DateTime.now().day - 1));
    // var startDate = DateFormat('yyyy-MM-dd').format(new DateTime(2023, 01, 11));
    // var endDate = DateFormat('yyyy-MM-dd').format(new DateTime(2023,01,17));
    var url = Uri.parse(
         domain + '/api/GET/Wearable/customAPI?userid=${userid}&url=https://api.und-gesund.de/v5/dailyDynamicValues&token=${this.AccountTokenAddress}&body_startDay=${startDate}&body_endDay=${endDate}&body_valueTypes=1000');
    final response = await http.get(url);
    var responseData = json.decode(response.body);
    var parsed = json.decode(responseData['value']);
    for (var i = 0; i < parsed[0]['dataSources'][0]['data'].length; i++) {
      var element = parsed[0]['dataSources'][0]['data'][i];
      var createdDate = element["day"];
      var datePoint = int.parse(element['value']);
      setState(() {
        chartDataSteps.add(
            ChartData(createdDate, double.parse(datePoint.floor().toString())));
      });
    }
  }

  Future<void> GetCaloriesData() async {
    setState(() {
      chartDataCalories = [];
    });
    var startDate = DateFormat('yyyy-MM-dd').format(new DateTime(
        DateTime.now().year, DateTime.now().month, DateTime.now().day - 7));
    var endDate = DateFormat('yyyy-MM-dd').format(new DateTime(
        DateTime.now().year, DateTime.now().month, DateTime.now().day - 1));
    // var startDate = DateFormat('yyyy-MM-dd').format(new DateTime(2023, 01,11));
    // var endDate = DateFormat('yyyy-MM-dd').format(new DateTime(2023,01,17));
    var url = Uri.parse(
         domain + '/api/GET/Wearable/customAPI?userid=${userid}&url=https://api.und-gesund.de/v5/dailyDynamicValues&token=${this.AccountTokenAddress}&body_startDay=${startDate}&body_endDay=${endDate}&body_valueTypes=1010');
    final response = await http.get(url);
    var responseData = json.decode(response.body);
    var parsed = json.decode(responseData['value']);
    for (var i = 0; i < parsed[0]['dataSources'][0]['data'].length; i++) {
      var element = parsed[0]['dataSources'][0]['data'][i];
      var createdDate = element["day"];
      var datePoint = int.parse(element['value']);
      setState(() {
        chartDataCalories.add(
            ChartData(createdDate, double.parse(datePoint.floor().toString())));
      });
    }
  }

  Future<dynamic> GetDevices() async {
    // var url = Uri.parse(
    //      domain + '/api/GET/Wearable/customAPI?userid=${userid}&url=https://api.und-gesund.de/v5/userInformation&token=${this.AccountTokenAddress}');
    // final response = await http.get(url);
    // var responseData = json.decode(response.body);
    setState(() {
      // if (json.decode(responseData['value'])[0]['devices'].length > 0) {
      //   hasDevice = true;
      //   GetBloodRate();
      //   GetSleepData();
      //   GetStepsData();
      //   GetCaloriesData();
      // } else {
      //   hasDevice = false;
      // }
      //Hard Coded
      hasDevice = true;
    });

      return "Sense 2";
    // return json.decode(responseData['value'])[0]['devices'];
  }

  @override
  Widget build(BuildContext context) {
    var size = MediaQuery.of(context).size;

    return Scaffold(
      appBar: AppBar(
          automaticallyImplyLeading: false,
          toolbarHeight: 80,
          backgroundColor: Color(0xFFF06129),
          title: Container(
              height: 80,
              child: Row(
                mainAxisAlignment: MainAxisAlignment.start,
                crossAxisAlignment: CrossAxisAlignment.end,
                children: <Widget>[
                  IconButton(
                    iconSize: 20,
                    onPressed: () {
                      Navigator.pop(context);
                    },
                    icon: Icon(Icons.arrow_back, color: Colors.white),
                  ),
                  Container(
                    height: 45,
                    width: 200,
                    child: Align(
                        alignment: AlignmentDirectional(0, 0),
                        child: Text('Wearables',
                            style: GoogleFonts.getFont(
                              'Lexend Deca',
                              fontSize: 24,
                              fontWeight: FontWeight.w300,
                              color: Colors.white,
                            ))),
                  )
                ],
              ))),
      backgroundColor:Colors.white,
      body: SingleChildScrollView(
          child: Padding(
        padding: EdgeInsetsDirectional.fromSTEB(20, 20, 20, 0),
        child: Container(
            width: size.width,
            child: Column(children: [
              Padding(
                padding: EdgeInsetsDirectional.fromSTEB(0, 0, 0, 10),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      child: Container(
                          child: MouseRegion(
                        cursor: SystemMouseCursors.click,
                        child: GestureDetector(
                          onTap: () async {
                            await generateLoginLink();
                          },
                          child: Material(
                            borderRadius: BorderRadius.circular(8),
                            elevation: 2,
                            child: Container(
                              height: 40,
                              decoration: BoxDecoration(
                                borderRadius: BorderRadius.circular(8),
                                color: Color(0xFFF06129),
                              ),
                              child: Center(
                                child: Text("Connect To a Wearable",
                                    style: GoogleFonts.getFont('Lexend Deca',
                                        fontSize: 16, color: Colors.white)),
                              ),
                            ),
                          ),
                        ),
                      )),
                    ),
                    Container(
                        child: IconButton(
                            onPressed: () {
                              setState(() async {
                                this.allDevices = await GetDevices();
                              });
                            },
                            icon: Icon(
                              Icons.refresh_rounded,
                            )))
                  ],
                ),
              ),
              Container(
                width: double.infinity,
                height: 42,
                decoration: BoxDecoration(
                  color: Color(0xFF4735EF),
                  shape: BoxShape.rectangle,
                ),
                child: Align(
                  alignment: AlignmentDirectional(0, 0),
                  child: !allDevices.isEmpty 
                      ? Text(
                          allDevices,
                          textAlign: TextAlign.center,
                          style: TextStyle(color: Colors.white),
                        )
                      : Text(
                          'No device found',
                          textAlign: TextAlign.center,
                          style: TextStyle(color: Colors.white),
                        ),
                ),
              ),
              hasDevice
                  ? Column(children: [
                      SfCartesianChart(
                        primaryXAxis: CategoryAxis(
                          axisLabelFormatter: (AxisLabelRenderDetails args) {
                            // late String text;
                            // text = DateFormat('E')
                            //     .format(DateTime.parse(args.text.toString()));
                            // return ChartAxisLabel(text, args.textStyle);
                            return ChartAxisLabel(args.text.toString(),
                                args.textStyle); //Hard Coded
                          },
                        ),
                        series: <ChartSeries>[
                          // Renders line chart
                          LineSeries<ChartData, String>(
                              color: Color.fromARGB(255, 63, 221, 253),
                              dataSource: chartDataBlood,
                              xValueMapper: (ChartData data, _) =>
                                  data.x as String,
                              yValueMapper: (ChartData data, _) => data.y,
                              dataLabelSettings:
                                  DataLabelSettings(isVisible: true),
                              markerSettings: MarkerSettings(isVisible: true))
                        ],
                        title: ChartTitle(text: "Weekly Heart Rate"),
                        tooltipBehavior: TooltipBehavior(enable: true),
                        onTooltipRender: (TooltipArgs args) {
                          //Hard Coded
                          args.header =
                              (args.dataPoints![args.pointIndex!.toInt()].x);
                          args.text =
                              '${args.dataPoints![args.pointIndex!.toInt()].x} : ${args.dataPoints![args.pointIndex!.toInt()].y}';

                          // args.header = DateFormat('yMMMEd').format(
                          //     DateTime.parse(args
                          //         .dataPoints![args.pointIndex!.toInt()].x));
                          // args.text =
                          //     '${DateFormat('EEEE').format(DateTime.parse(args.dataPoints![args.pointIndex!.toInt()].x))} : ${args.dataPoints![args.pointIndex!.toInt()].y}';
                        },
                      ),
                      SfCartesianChart(
                        primaryXAxis: CategoryAxis(
                          axisLabelFormatter: (AxisLabelRenderDetails args) {
                            // late String text;
                            // text = DateFormat('E')
                            //     .format(DateTime.parse(args.text.toString()));
                            // return ChartAxisLabel(text, args.textStyle);

                            return ChartAxisLabel(args.text.toString(),
                                args.textStyle); //Hard Coded
                          },
                        ),
                        primaryYAxis: NumericAxis(
                            axisLabelFormatter: (AxisLabelRenderDetails args) {
                              late String text;
                              text = durationToString(args.value.toInt());
                              return ChartAxisLabel(text, args.textStyle);
                            },
                            name: 'primaryYAxis'),
                        series: <ChartSeries>[
                          // Renders line chart
                          ColumnSeries<ChartData, String>(
                              dataSource: chartDataSleep,
                              color: Color.fromARGB(255, 63, 221, 253),
                              xValueMapper: (ChartData data, _) =>
                                  data.x as String,
                              yValueMapper: (ChartData data, _) {
                                return data.y;
                              },
                              dataLabelSettings: const DataLabelSettings(
                                  isVisible: true,
                                  textStyle: TextStyle(fontSize: 10)),
                              name: 'Weekly Sleep Duration',
                              markerSettings: MarkerSettings(isVisible: true))
                        ],
                        title: ChartTitle(text: "Weekly Sleep Duration"),
                        tooltipBehavior: TooltipBehavior(enable: true),
                        onTooltipRender: (TooltipArgs args) {
                          //Hard Coded
                          args.header =
                              (args.dataPoints![args.pointIndex!.toInt()].x);
                          args.text =
                              '${args.dataPoints![args.pointIndex!.toInt()].x} : ${args.dataPoints![args.pointIndex!.toInt()].y}';

                          // args.header = DateFormat('yMMMEd').format(
                          //     DateTime.parse(args
                          //         .dataPoints![args.pointIndex!.toInt()].x));
                          // args.text =
                          //     '${DateFormat('EEEE').format(DateTime.parse(args.dataPoints![args.pointIndex!.toInt()].x))} : ${args.dataPoints![args.pointIndex!.toInt()].y}';
                        },
                        onDataLabelRender: (args) {
                          args.text = durationToString(int.parse(args.text));
                        },
                      ),
                      SfCartesianChart(
                        primaryXAxis: CategoryAxis(
                          axisLabelFormatter: (AxisLabelRenderDetails args) {
                            // late String text;
                            // text = DateFormat('E')
                            //     .format(DateTime.parse(args.text.toString()));
                            // return ChartAxisLabel(text, args.textStyle);

                            return ChartAxisLabel(args.text.toString(),
                                args.textStyle); //Hard Coded
                          },
                        ),
                        primaryYAxis: NumericAxis(),
                        series: <ChartSeries>[
                          // Renders line chart
                          ColumnSeries<ChartData, String>(
                              color: Color.fromARGB(255, 63, 221, 253),
                              dataSource: chartDataSteps,
                              xValueMapper: (ChartData data, _) =>
                                  data.x as String,
                              yValueMapper: (ChartData data, _) {
                                return data.y;
                              },
                              dataLabelSettings: const DataLabelSettings(
                                  isVisible: true,
                                  textStyle: TextStyle(fontSize: 10)),
                              name: 'Weekly Steps',
                              markerSettings: MarkerSettings(isVisible: true))
                        ],
                        title: ChartTitle(text: "Weekly Steps"),
                        tooltipBehavior: TooltipBehavior(enable: true),
                        onTooltipRender: (TooltipArgs args) {
                          //Hard Coded
                          args.header =
                              (args.dataPoints![args.pointIndex!.toInt()].x);
                          args.text =
                              '${args.dataPoints![args.pointIndex!.toInt()].x} : ${args.dataPoints![args.pointIndex!.toInt()].y}';

                          // args.header = DateFormat('yMMMEd').format(
                          //     DateTime.parse(args
                          //         .dataPoints![args.pointIndex!.toInt()].x));
                          // args.text =
                          //     '${DateFormat('EEEE').format(DateTime.parse(args.dataPoints![args.pointIndex!.toInt()].x))} : ${args.dataPoints![args.pointIndex!.toInt()].y}';
                        },
                      ),
                    ])
                  : Text("")
            ])),
      )),
    );
  }
}

class ChartData {
  ChartData(this.x, this.y);
  final String x;
  final double y;
}
