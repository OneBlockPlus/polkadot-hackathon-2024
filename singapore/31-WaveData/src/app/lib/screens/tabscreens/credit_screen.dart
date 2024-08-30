// ignore_for_file: prefer_const_literals_to_create_immutables

import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:wavedata/components/data_edit_item.dart';
import 'package:jiffy/jiffy.dart';
import 'package:percent_indicator/circular_percent_indicator.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:http/http.dart' as http;
import 'package:wavedata/model/offer.dart';
import 'package:wavedata/screens/auth_screen.dart';
import 'package:flutter_staggered_grid_view/flutter_staggered_grid_view.dart';

class CreditScreen extends ConsumerStatefulWidget {
  const CreditScreen({Key? key}) : super(key: key);

  @override
  ConsumerState<ConsumerStatefulWidget> createState() => _CreditScreenState();
}

class _CreditScreenState extends ConsumerState<CreditScreen> {
  @override
  initState() {
    super.initState();
    GetAccountData();
  }

  var POSTheader = {
    "Accept": "application/json",
    "Content-Type": "application/x-www-form-urlencoded"
  };

  int userid = 0;
String domain = 'http://127.0.0.1:3000';

  var userDetails = {
    "userid": -1,
    "credits": 0,
    "ongoingcredit": null,
    "totalongoingcredit": null
  };


  Future<void> GetOngoingData() async {
    ongoingStudies = {
      "studyid": -1,
      "title": "",
      "description": "",
      "image": "",
      "startSurvey": 0,
      "totalprice": 0
    };

    var url = Uri.parse(
        '${domain}/api/GET/Study/GetOngoingStudy?userid=${userid}');
    var correctStatus = false;
    var response = null;
    while (correctStatus == false) {
      final response_draft = await http.get(url);
      if (response_draft.statusCode == 200) {
        correctStatus = true;
        response = response_draft;
      } else {
        await Future.delayed(Duration(seconds: 2));
      }
    }
    var responseData = json.decode(response.body);

    var data = (responseData['value']);

    if (data != "None") {
      setState(() {
        isOngoingStudy = true;
      });
      var decoded_data = json.decode(data);
      try {
        //Studies
        var element = decoded_data['Study'];
        setState(() {
          ongoingStudies['studyid'] = element['id'];
          ongoingStudies['title'] = element['title'];
          ongoingStudies['image'] = element['image'];
          ongoingStudies['description'] = element['description'];
          ongoingStudies['totalprice'] = element['budget'];
          userDetails['totalongoingcredit'] =
              element['budget'] != null ? element['budget'] : 0;
        });
      } catch (e) {}

      setState(() {
        //Surveys
        var SurveyAllElement = decoded_data['Survey'];
        var SurveyAllCompletedElement = decoded_data['Completed'];
        int totalcredit = 0;
        for (var i = 0; i < SurveyAllElement.length; i++) {
          var SurveyElement = SurveyAllElement[i];
          var completedSurvey = SurveyAllCompletedElement.where(
              (e) => e['survey_id'] == SurveyElement['id']);
          String timeToday = "Today";
          if (completedSurvey.length > 0) {
            var completedData = completedSurvey.toList()[0];
            String completedDate = completedData['date'];
            String timeToday =
                Jiffy(DateTime.parse(completedDate)).fromNow(); // a year ago

            totalcredit += int.parse(SurveyElement['reward'].toString());
          }
       
        }
        userDetails['ongoingcredit'] = totalcredit;
      });
    }
  }

  Future<void> GetUserData(int userid) async {
    var url = Uri.parse(
        '${domain}/api/GET/getUserDetails?userid=${userid}');
    var correctStatus = false;
    var response = null;
    while (correctStatus == false) {
      final response_draft = await http.get(url);
      if (response_draft.statusCode == 200) {
        correctStatus = true;
        response = response_draft;
      } else {
        await Future.delayed(Duration(seconds: 2));
      }
    }
    var responseData = json.decode(response.body);

    var dataUD = (responseData['value']);

    setState(() {
      userDetails["credits"] = dataUD['credits'] / 1e6;
    });

   
  }

  Future<void> GetAccountData() async {
    // Obtain shared preferences.
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      userid = int.parse(prefs.getString("userid").toString());
    });

    GetUserData(userid);
    GetOngoingData();
  }


  var ongoingStudies = {
    "studyid": -1,
    "title": "",
    "description": "",
    "image": "",
    "startSurvey": 0
  };
  bool isOngoingStudy = false;


  var dummyOffers = [
    Offer(
        title: "30% cashback",
        store: "Amazon",
        period: "May 1 - May 28",
        image: "assets/images/amazon.png"),
    Offer(
        title: "10% off - Fitbit Sense",
        store: "Fitbit",
        period: "May 1 - May 28",
        image: "assets/images/fitbit.png"),
    Offer(
        title: "40% off (6 months)",
        store: "Calm",
        period: "May 1 - May 28",
        image: "assets/images/calm.png"),
    Offer(
        title: "10% off monthly",
        store: "Spotify",
        period: "May 1 - May 28",
        image: "assets/images/spotify.png"),
  ];

  @override
  Widget build(BuildContext context) {
    var size = MediaQuery.of(context).size;
    
     Future<void> Logout() async {
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove("userid");
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(
          builder: (context) => AuthScreen(),
        ),
      );
    }

    double percentagecompleted() {
      int total = int.parse(userDetails['totalongoingcredit'].toString());
      int price = int.parse(userDetails['ongoingcredit'].toString());

      var t = (1 / (total / price));
  
      return t.toDouble();
    }


    Future<void> WithdrawAmount(Amount) async {
      final prefs = await SharedPreferences.getInstance();
      int userid = int.parse(prefs.getString("userid").toString());

      var url = Uri.parse(
          '${domain}/api/POST/Study/Survey/WithdrawAmount');
      await http.post(url,
          headers: POSTheader,
          body: {'userid': userid.toString(), 'amount': Amount});
      await GetAccountData();
      Navigator.pop(context);
    }

    Future StartWithdrawDialog() => showDialog(
        context: context, builder: (context) => WithdrawDialog(WithdrawAmount));



    return RefreshIndicator(
        child: Container(
          height: size.height,
          width: size.width,
          decoration: BoxDecoration(),
          child: SingleChildScrollView(
            child: Container(
              width: size.width,
              height: size.height - 60,
              child: Stack(
                children: [
                  Container(
                    child: Container(
                      width: size.width,
                      decoration: const BoxDecoration(
                        color: Colors.white,
                      ),
                      child: Column(
                        children: [
                          Container(
                            margin: const EdgeInsets.only(
                                top: 32, left: 32, right: 32),
                            child: Material(
                              elevation: 5,
                              borderRadius: BorderRadius.circular(8),
                              child: Container(
                                height: 70,
                                padding:
                                    const EdgeInsets.only(left: 20, right: 20),
                                decoration: BoxDecoration(
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: Row(
                                  mainAxisAlignment:
                                      MainAxisAlignment.spaceBetween,
                                  children: [
                                    Column(
                                      mainAxisSize: MainAxisSize.min,
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        Text("Total build credits",
                                            style: GoogleFonts.getFont(
                                                'Lexend Deca',
                                                fontSize: 14,
                                                fontWeight: FontWeight.w700)),
                                        Text(
                                            userDetails['credits'].toString() +
                                                " TRX",
                                            style: GoogleFonts.getFont(
                                                'Lexend Deca',
                                                color: Color(0xFFF06129),
                                                fontSize: 25,
                                                fontWeight: FontWeight.w700))
                                      ],
                                    ),
                                    Container(
                                        padding: const EdgeInsets.only(
                                            left: 12,
                                            right: 12,
                                            top: 10,
                                            bottom: 10),
                                        decoration: BoxDecoration(
                                          color: const Color(0xFFF06129),
                                          borderRadius:
                                              BorderRadius.circular(4),
                                        ),
                                        child: GestureDetector(
                                            onTap: (() async {
                                              await StartWithdrawDialog();
                                            }),
                                            behavior: HitTestBehavior.opaque,
                                            child: Text("Cash out",
                                                style: GoogleFonts.getFont(
                                                    'Lexend Deca',
                                                    color: Colors.white,
                                                    fontSize: 16,
                                                    fontWeight:
                                                        FontWeight.bold)))),
                                  ],
                                ),
                              ),
                            ),
                          ),
                          Container(
                            width: size.width,
                            margin: const EdgeInsets.only(
                              top: 24,
                            ),
                            child: Text(ongoingStudies['title'].toString(),
                                textAlign: TextAlign.center,
                                style: GoogleFonts.getFont('Lexend Deca',
                                    fontSize: 14, fontWeight: FontWeight.w700)),
                          ),
                          Container(
                            width: size.width,
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                              children: [
                                Container(
                                  child: Container(
                                      margin: const EdgeInsets.only(
                                          top: 120, right: 0),
                                      height: size.width / 8,
                                      width: size.width / 8,
                                      decoration: BoxDecoration(
                                        borderRadius:
                                            BorderRadius.circular(128),
                                        color: const Color.fromRGBO(
                                            124, 209, 227, 1),
                                      ),
                                      child: Text("")),
                                ),
                                Container(
                                  child: Container(
                                      margin: EdgeInsets.only(top: 30),
                                      height: size.width / 5,
                                      width: size.width / 5,
                                      decoration: BoxDecoration(
                                        borderRadius:
                                            BorderRadius.circular(128),
                                        color: Color.fromRGBO(124, 209, 227, 1),
                                      ),
                                      child: Text("")),
                                ),
                                Column(
                                  children: [
                                    CircularPercentIndicator(
                                      radius: 58.0,
                                      lineWidth: 8.0,
                                      percent: userDetails[
                                                      'totalongoingcredit'] ==
                                                  null ||
                                              userDetails['ongoingcredit'] ==
                                                  null
                                          ? 0
                                          : percentagecompleted(),
                                      circularStrokeCap:
                                          CircularStrokeCap.round,
                                      progressColor: Color(0xFFf06129),
                                      backgroundColor: Color(0xFF7CD1E3),
                                      center: SizedBox(
                                        width: 550,
                                        child: Container(
                                          decoration: BoxDecoration(
                                            borderRadius:
                                                BorderRadius.circular(128),
                                          ),
                                          child: Container(
                                            margin: EdgeInsets.only(top: 8),
                                            child: Column(
                                              mainAxisSize: MainAxisSize.min,
                                              mainAxisAlignment:
                                                  MainAxisAlignment.center,
                                              children: [
                                                Text(
                                                  "Total credits",
                                                  style: GoogleFonts.getFont(
                                                      'Lexend Deca',
                                                      fontSize: 14,
                                                      fontWeight:
                                                          FontWeight.w700),
                                                ),
                                                Text(
                                                    ((userDetails['ongoingcredit'] !=
                                                                    null)
                                                                ? userDetails[
                                                                    'ongoingcredit']
                                                                : 0)
                                                            .toString() +
                                                        " TRX",
                                                    style: GoogleFonts.getFont(
                                                        'Lexend Deca',
                                                        color:
                                                            Color(0xFFF06129),
                                                        fontSize: 20,
                                                        fontWeight:
                                                            FontWeight.w700))
                                              ],
                                            ),
                                          ),
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                                Container(
                                  child: Container(
                                    clipBehavior: Clip.none,
                                    margin: EdgeInsets.only(top: 30),
                                    child: Container(
                                        clipBehavior: Clip.hardEdge,
                                        height: size.width / 5,
                                        width: size.width / 5,
                                        decoration: BoxDecoration(
                                          borderRadius:
                                              BorderRadius.circular(128),
                                          color:
                                              Color.fromRGBO(124, 209, 227, 1),
                                        ),
                                        child: ongoingStudies['image'] != ""
                                            ? Image.network(
                                                ongoingStudies['image']
                                                    .toString(),
                                                fit: BoxFit.cover,
                                              )
                                            : Text("")),
                                  ),
                                ),
                                Container(
                                  child: Container(
                                      margin:
                                          EdgeInsets.only(top: 120, right: 0),
                                      height: size.width / 8,
                                      width: size.width / 8,
                                      decoration: BoxDecoration(
                                        borderRadius:
                                            BorderRadius.circular(128),
                                        color: Color.fromRGBO(124, 209, 227, 1),
                                      ),
                                      child: Text("")),
                                ),
                              ],
                            ),
                          ),
                          Expanded(
                            child: Container(
                              height: size.height,
                              margin: EdgeInsets.only(top: 0),
                              child: Stack(
                                children: [
                                  SizedBox(
                                    width: size.width,
                                    child: Container(
                                      padding: EdgeInsets.only(
                                          top: 64, left: 20, right: 20),
                                      decoration: BoxDecoration(
                                        borderRadius: BorderRadius.vertical(
                                          top: Radius.elliptical(
                                            size.width * 0.5,
                                            25.0,
                                          ),
                                        ),
                                        image: DecorationImage(
                                          fit: BoxFit.cover,
                                          image: Image.asset(
                                                  "assets/images/bg.png")
                                              .image,
                                        ),
                                      ),
                                      child: MasonryGridView.count(
                                        crossAxisCount: 2,
                                        crossAxisSpacing: 30,
                                        mainAxisSpacing: 12,
                                        itemCount: dummyOffers.length,
                                        padding:
                                            const EdgeInsets.only(bottom: 40),
                                        itemBuilder: (context, index) {
                                          return Container(
                                            decoration: BoxDecoration(
                                                color: Colors.white,
                                                borderRadius:
                                                    BorderRadius.circular(15)),
                                            child: Column(
                                              mainAxisAlignment:
                                                  MainAxisAlignment.start,
                                              crossAxisAlignment:
                                                  CrossAxisAlignment.start,
                                              children: [
                                                Row(
                                                  mainAxisAlignment:
                                                      MainAxisAlignment.center,
                                                  children: [
                                                    Container(
                                                        margin: const EdgeInsets
                                                                .only(
                                                            top: 24,
                                                            bottom: 24),
                                                        child: Image.asset(
                                                            dummyOffers[index]
                                                                .image)),
                                                  ],
                                                ),
                                                Container(
                                                    padding: EdgeInsets.only(
                                                        left: 12),
                                                    margin: EdgeInsets.only(
                                                        bottom: 12),
                                                    child: Text(
                                                        dummyOffers[index]
                                                            .title,
                                                        style:
                                                            GoogleFonts.getFont(
                                                                'Lexend Deca',
                                                                fontSize: 14,
                                                                fontWeight:
                                                                    FontWeight
                                                                        .bold))),
                                                Container(
                                                  padding:
                                                      const EdgeInsets.only(
                                                          left: 12,
                                                          right: 12,
                                                          bottom: 16),
                                                  child: Row(
                                                    mainAxisAlignment:
                                                        MainAxisAlignment
                                                            .spaceBetween,
                                                    children: [
                                                      Text(
                                                          dummyOffers[index]
                                                              .store,
                                                          style: GoogleFonts
                                                              .getFont(
                                                                  'Lexend Deca',
                                                                  color: Color(
                                                                      0xFF7CD1E3),
                                                                  fontSize: 14,
                                                                  fontWeight:
                                                                      FontWeight
                                                                          .bold)),
                                                      Text(
                                                          dummyOffers[index]
                                                              .period,
                                                          style: GoogleFonts
                                                              .getFont(
                                                                  'Lexend Deca',
                                                                  color: Color(
                                                                      0xFFA0A1A8),
                                                                  fontSize: 10,
                                                                  fontWeight:
                                                                      FontWeight
                                                                          .bold)),
                                                    ],
                                                  ),
                                                )
                                              ],
                                            ),
                                          );
                                        },
                                      ),
                                    ),
                                  ),
                                  Positioned(
                                    top: 24,
                                    child: SizedBox(
                                      width: size.width,
                                      child: Row(
                                        mainAxisAlignment:
                                            MainAxisAlignment.center,
                                        children: [
                                          Text("Extra credits",
                                              style: GoogleFonts.getFont(
                                                  'Lexend Deca',
                                                  color: Color(0xFF08323A),
                                                  fontSize: 15,
                                                  fontWeight: FontWeight.bold)),
                                        ],
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          )
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
        onRefresh: () {
          return Future<void>(() async {
            await GetAccountData();
          });
        });
  }
}

class WithdrawDialog extends StatefulWidget {
  final Function WithdrawAmount;
  WithdrawDialog(this.WithdrawAmount);

  @override
  _WithdrawDialogState createState() => _WithdrawDialogState();
}

class _WithdrawDialogState extends State<WithdrawDialog> {
  TextEditingController AmountTXT = new TextEditingController();

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: Text("Withdraw Credits"),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        mainAxisAlignment: MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Padding(
            padding: EdgeInsetsDirectional.fromSTEB(8, 8, 8, 8),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Padding(
                  padding: EdgeInsetsDirectional.fromSTEB(0, 0, 0, 5),
                  child: DataEditItem(label: "Amount", controller: AmountTXT),
                )
              ],
            ),
          )
        ],
      ),
      actions: [
        TextButton(
            onPressed: (() async {
              await widget.WithdrawAmount(AmountTXT.text);
            }),
            child: Text("Accept"))
      ],
    );
  }
}