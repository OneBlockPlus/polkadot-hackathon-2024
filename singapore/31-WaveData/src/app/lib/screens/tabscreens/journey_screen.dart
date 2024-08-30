// ignore_for_file: prefer_const_literals_to_create_immutables

import 'dart:convert';

import 'package:flutter_svg/svg.dart';
import 'package:http/http.dart' as http;

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:wavedata/model/airtable_api.dart';
import 'package:percent_indicator/circular_percent_indicator.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:wavedata/screens/auth_screen.dart';

class JourneyScreen extends ConsumerStatefulWidget {
  const JourneyScreen({Key? key}) : super(key: key);

  @override
  ConsumerState<ConsumerStatefulWidget> createState() => _JourneyScreenState();
}

class _JourneyScreenState extends ConsumerState<JourneyScreen> {
  @override
  initState() {
    super.initState();
    GetAccountData();
  }

  var POSTheader = {
    "Accept": "application/json",
    "Content-Type": "application/x-www-form-urlencoded"
  };

  var FHIRheader = {
    "accept": "application/fhir+json",
    "x-api-key": "Qi8TXQVe1C2zxiYOdKKm7RQk6qz0h7n19zu1RMg5"
  };
String domain = 'http://127.0.0.1:3000';
  var supportStatus = {"level1": false, "level2": false};

  String userid = "";
  String StudyId = "";

  bool isloading = true;

  void UpdateLoading(bool status) {
    isloading = status;
  }


  Future<void> GetOngoingData() async {
    UpdateLoading(true);
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
      var decoded_data = json.decode(data);

      setState(() {
        if (decoded_data['CompletedInformed'] != "False"){
            supportStatus['level1'] = true;
        }

        //Surveys
        var SurveyAllElement = decoded_data['Survey'];
        var SurveyAllCompletedElement = decoded_data['Completed'];

        for (var i = 0; i < SurveyAllElement.length; i++) {
          var SurveyElement = SurveyAllElement[i];
          var completedSurvey = SurveyAllCompletedElement.where(
              (e) => e['survey_id'] == SurveyElement['id']);
          if (completedSurvey.length > 0) {
            supportStatus['level2'] = true;
          }
        }
      });
    }



    
    UpdateLoading(false);
  }

  Future<void> GetAccountData() async {
    // Obtain shared preferences.
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      userid = (prefs.getString("userid").toString());
      StudyId = (prefs.getString("studyid").toString());
    });
    GetOngoingData();
  }

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

    return Container(
      height: size.height,
      width: size.width,
      decoration: BoxDecoration(
        image: DecorationImage(
          fit: BoxFit.cover,
          image: Image.asset("assets/images/map.png").image,
        ),
      ),
      child: Stack(children: [
        Positioned(
          bottom: 85,
          left: 170,
          child: Container(
            height: 100,
            width: 100,
            //padding: EdgeInsets.all(16),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(128),
            ),
            child: supportStatus["level1"] == true
                ? Image.asset(
                    "assets/images/support/level1completed.png",
                  )
                : Image.asset(
                    "assets/images/support/level1Incomplete.png",
                  ),
          ),
        ),
        Positioned(
            bottom: 260,
            left: 52,
            child: Container(
                height: 100,
                width: 100,
                //padding: EdgeInsets.all(20),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(128),
                  color: supportStatus["level2"] != true
                      ? Color(0xFFe7dcdc)
                      : Colors.white,
                ),
                child: CircularPercentIndicator(
                  radius: 50.0,
                  lineWidth: 7.0,
                  percent: supportStatus["level2"] == true ? 1 : 0,
                  center: Container(
                    width: 60,
                    padding: EdgeInsets.all(5),
                    child: Image.asset(
                      "assets/images/gift_big.png",
                      opacity: AlwaysStoppedAnimation(
                          supportStatus["level2"] == true ? 1 : 0.5),
                    ),
                  ),
                  circularStrokeCap: CircularStrokeCap.round,
                  progressColor: Color(0xFFf06129),
                  backgroundColor: Color(0xFFa6c5ce),
                ))),
        Positioned(
          bottom: 382,
          right: 30,
          child: Container(
            height: 100,
            width: 100,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(128),
              color: Color(0xFFe7dcdc),
            ),
            child: CircularPercentIndicator(
              radius: 50.0,
              lineWidth: 8.0,
              percent: 0,
              center: Container(
                width: 60,
                padding: EdgeInsets.only(top: 6),
                child: SvgPicture.asset(
                  "assets/images/chocolates.svg",
                  color: Colors.grey.withOpacity(0.5),
                  colorBlendMode: BlendMode.dstOut,
                ),
              ),
              circularStrokeCap: CircularStrokeCap.round,
              progressColor: Color(0xFFf06129),
              backgroundColor: Color(0xFFa6c5ce),
            ),
          ),
        ),
        Positioned(
          top: 145,
          right: 85,
          child: Container(
            height: 100,
            width: 100,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(128),
              color: Color(0xFFe7dcdc),
            ),
            child: CircularPercentIndicator(
              radius: 50.0,
              lineWidth: 8.0,
              percent: 0,
              center: Container(
                width: 60,
                child: SvgPicture.asset(
                  "assets/images/crown.svg",
                  color: Colors.grey.withOpacity(0.5),
                  colorBlendMode: BlendMode.dstOut,
                ),
              ),
              circularStrokeCap: CircularStrokeCap.round,
              progressColor: Color(0xFFf06129),
              backgroundColor: Color(0xFFa6c5ce),
            ),
          ),
        ),
        Positioned(
          top: 10,
          left: 100,
          child: Stack(
            children: [
              Positioned(
                bottom: 0,
                left: 5,
                child: Container(
                  height: 28,
                  width: 90,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(6),
                    border: Border.all(color: Colors.white),
                    color: Color(0xFFF06129),
                  ),
                  child: Container(
                    child: Center(
                      child: Text("Finish",
                          style: GoogleFonts.getFont('Lexend Deca',
                              fontSize: 18,
                              color: Colors.white,
                              fontWeight: FontWeight.bold)),
                    ),
                  ),
                ),
              ),
              Container(
                height: 100,
                width: 100,
                margin: EdgeInsets.only(bottom: 25),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(128),
                  color: Color(0xFFe7dcdc),
                ),
                child: CircularPercentIndicator(
                  radius: 50.0,
                  lineWidth: 8.0,
                  percent: 0,
                  center: Container(
                    width: 56,
                    child: SvgPicture.asset(
                      "assets/images/winner.svg",
                      color: Colors.grey.withOpacity(0.5),
                      colorBlendMode: BlendMode.dstOut,
                    ),
                  ),
                  circularStrokeCap: CircularStrokeCap.round,
                  progressColor: Color(0xFFf06129),
                  backgroundColor: Color(0xFFa6c5ce),
                ),
              ),
            ],
          ),
        )
      ]),
    );
  }
}
