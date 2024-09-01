import 'dart:convert';

import 'package:flutter/cupertino.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:jiffy/jiffy.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:http/http.dart' as http;

import '../model/study_action.dart';

const domain = 'http://localhost:3000';

final mainProvider =
    ChangeNotifierProvider<MainProvider>((ref) => MainProvider());

class MainProvider extends ChangeNotifier {
  String _ProfileImage = "https://i.postimg.cc/SsxGw5cZ/person.jpg";
  String get ProfileImage => _ProfileImage;
  void updateImage(String img) {
    _ProfileImage = img;
    notifyListeners();
  }

  var supportStatus = {"level1": false, "level2": false};

  void updateSurveyStatus(var data) {
    supportStatus = data;
    notifyListeners();
  }

  var userDetails = {
    "userid": -1,
    "credits": 0,
    "ongoingcredit": null,
    "totalongoingcredit": null,
    "walletAddress": "",
  };

  void updateUserDetails(userdata) {
    userDetails = userdata;
    notifyListeners();
  }

  Future<void> GetUserData() async {
       final prefs = await SharedPreferences.getInstance();
    int userid = int.parse(prefs.getString("userid").toString());

    var url = Uri.parse('${domain}/api/GET/getUserDetails?userid=${userid}');
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

    userDetails["credits"] =
        int.parse(dataUD['credits'].toString()) / 1e18;
    userDetails["walletAddress"] = dataUD['walletAddress'];

    updateUserDetails(userDetails);

    var imageData = dataUD['image'];
    updateImage(imageData);
  }

  var ongoingStudies = {
    "studyid": -1,
    "title": "",
    "description": "",
    "image": "",
    "startSurvey": 0,
    "totalprice": 0
  };
  bool isOngoingStudy = false;

  void updateOngoignStudies(data) {
    ongoingStudies = data;
    notifyListeners();
  }

  var onGoingInformedConsent = StudyAction(
      id: "informed_consent",
      when: "Today",
      content: "Informed Consent",
      isDone: false);
  void updateOngoignInformed(data) {
    onGoingInformedConsent = data;
    notifyListeners();
  }

var surveyActions =[];
 void updateSurveysActions(data) {
    surveyActions = data;
    notifyListeners();
  }
  Future<void> GetOngoingData() async {
    ongoingStudies = {
      "studyid": -1,
      "title": "",
      "description": "",
      "image": "",
      "startSurvey": 0,
      "totalprice": 0
    };
    final prefs = await SharedPreferences.getInstance();
    int userid = int.parse(prefs.getString("userid").toString());

    var url =
        Uri.parse('${domain}/api/GET/Study/GetOngoingStudy?userid=${userid}');
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
      isOngoingStudy = true;

      var decoded_data = json.decode(data);

      try {
        //Studies
        var element = decoded_data['Study'];
        ongoingStudies['studyid'] = element['id'];
        ongoingStudies['title'] = element['title'];
        ongoingStudies['image'] = element['image'];
        ongoingStudies['description'] = element['description'];
        ongoingStudies['totalprice'] = element['budget'];
        userDetails['totalongoingcredit'] =
            element['budget'] != null ? element['budget'] : 0;
      } catch (e) {}
      updateOngoignStudies(ongoingStudies);

      //Surveys
      var SurveyAllElement = decoded_data['Survey'];
      var SurveyAllCompletedElement = decoded_data['Completed'];
      int totalcredit = 0;
      bool first_today = false;
      var dummyActions = [];
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
          bool status = completedSurvey.length > 0;
          if (!status) {
            timeToday = "Tomorrow";
            if (!first_today) {
              timeToday = "Today";
              first_today = true;
            }
          }
          dummyActions.add(
            StudyAction(
                id: SurveyElement['id'].toString(),
                when: timeToday,
                content: SurveyElement['name'],
                isDone: status),
          );
      }
      updateSurveysActions(dummyActions);
      
      userDetails['ongoingcredit'] = totalcredit;

      updateUserDetails(userDetails);

      //Informed Consent
      var InformedCompleted = decoded_data['CompletedInformed'];

      if (InformedCompleted != "False") {
        //Informed Consent
        String timeToday =
            Jiffy(DateTime.parse(InformedCompleted['date'])).fromNow();
        var data = StudyAction(
            id: "informed_consent",
            when: timeToday,
            content: "Informed Consent",
            isDone: true);
        updateOngoignInformed(data);
      }

      //Badges
      var supportStatus = {"level1": false, "level2": false};
      if (decoded_data['CompletedInformed'] != "False") {
        supportStatus['level1'] = true;
      }

      //Surveys
      for (var i = 0; i < SurveyAllElement.length; i++) {
        var SurveyElement = SurveyAllElement[i];
        var completedSurvey = SurveyAllCompletedElement.where(
            (e) => e['survey_id'] == SurveyElement['id']);
        if (completedSurvey.length > 0) {
          supportStatus['level2'] = true;
        }
      }

      updateSurveyStatus(supportStatus);
    }
  }
}
