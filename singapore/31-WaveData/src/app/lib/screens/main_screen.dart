// ignore_for_file: prefer_const_literals_to_create_immutables

import 'dart:convert';
import 'dart:io';
import 'dart:js';
import 'dart:ui';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:get/get.dart';
import 'package:image_picker/image_picker.dart';
import 'package:jiffy/jiffy.dart';
import 'package:percent_indicator/circular_percent_indicator.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:http/http.dart' as http;
import 'package:wavedata/components/bottom_navbar.dart';
import 'package:wavedata/model/offer.dart';
import 'package:wavedata/model/trial.dart';
import 'package:wavedata/model/trial_action.dart';
import 'package:wavedata/providers/navbar_provider.dart';
import 'package:wavedata/screens/qr_code_generated.dart';
import 'package:wavedata/screens/wearables_screen.dart';
import 'package:wavedata/screens/auth_screen.dart';
import 'package:wavedata/screens/feeling_screen.dart';
import 'package:flutter_staggered_grid_view/flutter_staggered_grid_view.dart';

class MainScreen extends ConsumerStatefulWidget {
  const MainScreen({Key? key}) : super(key: key);

  @override
  ConsumerState<ConsumerStatefulWidget> createState() => _MainScreenState();
}

class _MainScreenState extends ConsumerState<MainScreen> {
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
  var supportStatus = {"level1": false, "level2": false};

  int userid = 0;
  int startTrial = 0;
  String ImageLink = "https://i.postimg.cc/SsxGw5cZ/person.jpg";
  var userDetails = {
    "userid": -1,
    "credits": 0,
    "ongoingcredit": null,
    "totalongoingcredit": null
  };
  var refreshkey = GlobalKey<RefreshIndicatorState>();
  bool boolWearables = false;
  bool boolGender = false;
  bool boolNameGiven = false;
  bool boolNameFamily = false;
  bool boolPhone = false;
  bool boolAbout = false;
  String wrappedData = "";
  Future<void> GenerateQRCode() async {
    var choosenData = [];
    if (boolGender) {
      choosenData.add({"Gender": PatientDetails['gender']});
    }
    if (boolNameGiven) {
      choosenData.add({"Name Given": PatientDetails['name-given']});
    }
    if (boolNameFamily) {
      choosenData.add({"Family Name": PatientDetails['name-family']});
    }
    if (boolPhone) {
      choosenData.add({"Phone": PatientDetails['phone']});
    }

    if (boolAbout) {
      choosenData.add({"disease": PatientDetails['disease']});
    }

    wrappedData = jsonEncode(choosenData);
  }

  Future<void> GetAvialbleData() async {
    avilableTrials = [];
    var url = Uri.parse(
        'https://wavedata-polkadot-singapore-api.onrender.com/api/GET/Trial/GetAvailableTrial?userid=${userid}');
    final response = await http.get(url);
    var responseData = json.decode(response.body);

    var data = (responseData['value']);
    var allTrials = json.decode(data);
    allTrials.forEach((element) => {
          setState(() {
            avilableTrials.add(Trial(
                id: element['id'],
                title: element['title'],
                image: element['image'],
                permission: element['permissions']));
          })
        });
  }

  Future<void> GetOngoingData() async {
    ongoingTrials = {
      "trialid": -1,
      "title": "",
      "description": "",
      "image": "",
      "startSurvey": 0,
      "totalprice": 0
    };
    dummyActions = [];
    var url = Uri.parse(
        'https://wavedata-polkadot-singapore-api.onrender.com/api/GET/Trial/GetOngoingTrial?userid=${userid}');
    final response = await http.get(url);
    var responseData = json.decode(response.body);

    var data = (responseData['value']);

    if (data != "None") {
      setState(() {
        isOngoingTrial = true;
      });
      var decoded_data = json.decode(data);
      try {
        //Trials
        var element = decoded_data['Trial'];
        setState(() {
          ongoingTrials['trialid'] = element['id'];
          ongoingTrials['title'] = element['title'];
          ongoingTrials['image'] = element['image'];
          ongoingTrials['description'] = element['description'];
          ongoingTrials['totalprice'] = element['budget'];
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
            supportStatus['level1'] = true;
            totalcredit += int.parse(SurveyElement['reward'].toString());
          }
          bool status = completedSurvey.length > 0;

          dummyActions.add(
            TrialAction(
                id: SurveyElement['id'].toString(),
                when: timeToday,
                content: SurveyElement['name'],
                isDone: status),
          );
        }
        userDetails['ongoingcredit'] = totalcredit;
      });
    }
  }

  Future<void> GetFHIRData(int userid) async {
    var url = Uri.parse(
        'https://wavedata-polkadot-singapore-api.onrender.com/api/GET/getUserDetails?userid=${userid}');
    final response = await http.get(url);
    var responseData = json.decode(response.body);

    var dataUD = (responseData['value']);

    setState(() {
      var imageData = dataUD['image'];
      ImageLink = imageData;
      userDetails["credits"] = dataUD['credits'];
    });

    var urlFH = Uri.parse(
        'https://wavedata-polkadot-singapore-api.onrender.com/api/GET/getFhir?userid=${int.parse(userid.toString())}');
    final responseFH = await http.get(urlFH);
    var responseDataFH = json.decode(responseFH.body);

    if (responseDataFH['value'] != null) {
      var data = (responseDataFH['value']);
      var allData = data;
      try {
        setState(() {
          PatientDetails['gender'] = allData['gender'];
          PatientDetails['name-family'] = allData['family_name'];
          PatientDetails['name-given'] = allData['given_name'];
          PatientDetails['phone'] = allData['phone'];
          PatientDetails['disease'] = allData['about'];
        });
      } catch (e) {}
    }
  }

  Future<void> GetAccountData() async {
    // Obtain shared preferences.
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      userid = int.parse(prefs.getString("userid").toString());
    });

    GetAvialbleData();
    GetOngoingData();
    GetFHIRData(userid);
  }

  var dummyActions = [];
  var ongoingTrials = {
    "trialid": -1,
    "title": "",
    "description": "",
    "image": "",
    "startSurvey": 0
  };
  bool isOngoingTrial = false;

  var PatientDetails = {
    "gender": "Female",
    "name-family": "",
    "name-given": "",
    "phone": "",
    "disease": ""
  };

  var avilableTrials = [];

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
    var navbarViewmodel = ref.watch(navbarProvider);
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
      print(t);
      return t.toDouble();
    }

    //FHIR switches
    bool? FamilyNameSwitch;
    bool? GivenNameSwitch;
    bool? GenderSwitch;
    bool? PhoneSwitch;
    bool? AboutSwitch;
    //Wearable switches
    bool? BloodSwitch;
    bool? SleepSwitch;
    bool? StepsSwitch;
    bool? CaloriesSwitch;

    bool SetSwitches(int type, bool value, {int fhirtype = 0}) {
      if (fhirtype == 0) {
        setState(() {
          if (type == 0) {
            FamilyNameSwitch = value;
          }
          ;
          if (type == 1) {
            GivenNameSwitch = value;
          }
          ;
          if (type == 2) {
            GenderSwitch = value;
          }
          if (type == 3) {
            PhoneSwitch = value;
          }
          if (type == 4) {
            AboutSwitch = value;
          }
        });
      } else {
        if (type == 0) {
          BloodSwitch = value;
        }
        if (type == 1) {
          SleepSwitch = value;
        }
        if (type == 2) {
          StepsSwitch = value;
        }
        if (type == 3) {
          CaloriesSwitch = value;
        }
      }

      return value;
    }

    Future<void> StartTrial(int trialid) async {
      final prefs = await SharedPreferences.getInstance();
      int userid = int.parse(prefs.getString("userid").toString());

      var given_permission = {
        "family": FamilyNameSwitch,
        "given": GivenNameSwitch,
        "gender": GenderSwitch,
        "phone": PhoneSwitch,
        "about": AboutSwitch,
        "blood": BloodSwitch,
        "sleep": SleepSwitch,
        "steps": StepsSwitch,
        "calories": CaloriesSwitch
      };

      String JsonMadePermission = given_permission.toString();

      var url = Uri.parse(
          'https://wavedata-polkadot-singapore-api.onrender.com/api/POST/Trial/CreateOngoingTrail');
      await http.post(url, headers: POSTheader, body: {
        'trialid': trialid.toString(),
        'userid': userid.toString(),
        'given_permission': JsonMadePermission
      });
      await Future.delayed(Duration(seconds: 2));
      Navigator.pop(context);
    }

    Future startFunction(int trialid, String permissions) => showDialog(
        context: context,
        builder: (context) =>
            OngoingDialog(trialid, permissions, SetSwitches, StartTrial));

    TextEditingController _textFieldController = TextEditingController();
    void UpdateImage() async {
      setState(() {
        ImageLink = _textFieldController.text;
      });
      final prefs = await SharedPreferences.getInstance();
      int userid = int.parse(prefs.getString("userid").toString());
      var url = Uri.parse(
          'https://wavedata-polkadot-singapore-api.onrender.com/api/POST/UpadateImage');
      await http.post(url, headers: POSTheader, body: {
        'userid': userid.toString(),
        'image': _textFieldController.text
      });
      Navigator.pop(context);
    }

    imagePickerOption(BuildContext context) async {
      return showDialog(
          context: context,
          builder: (context) {
            return AlertDialog(
              title: Text('Image url'),
              content: TextField(
                controller: _textFieldController,
                decoration:
                    const InputDecoration(hintText: "https://image.com/we.png"),
              ),
              actions: <Widget>[
                TextButton(
                  child: const Text('SUBMIT'),
                  onPressed: UpdateImage,
                )
              ],
            );
          });
    }

    return Scaffold(
      bottomNavigationBar: WavedataNavbar(),
      body: IndexedStack(
        index: navbarViewmodel.selectedIndex,
        children: [
          //home
          Container(
            height: size.height,
            width: size.width,
            decoration: BoxDecoration(
              image: DecorationImage(
                fit: BoxFit.cover,
                image: Image.asset("assets/images/bg.png").image,
              ),
            ),
            child: SingleChildScrollView(
              child: Column(
                children: [
                  Container(
                    margin: EdgeInsets.only(top: 24, left: 16, right: 16),
                    child: Material(
                      elevation: 5,
                      borderRadius: const BorderRadius.only(
                          topLeft: Radius.circular(128),
                          bottomLeft: Radius.circular(128),
                          topRight: Radius.circular(12),
                          bottomRight: Radius.circular(12)),
                      child: Container(
                        height: 150,
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Material(
                                elevation: 8,
                                color: Colors.amber,
                                borderRadius: BorderRadius.circular(128),
                                clipBehavior: Clip.none,
                                child: Container(
                                    height: 148,
                                    width: 148,
                                    padding: EdgeInsets.all(12),
                                    clipBehavior: Clip.antiAlias,
                                    decoration: BoxDecoration(
                                        borderRadius:
                                            BorderRadius.circular(200.0),
                                        color: Colors.white),
                                    child: Stack(
                                      children: [
                                        Container(
                                          child: Image.network(
                                            ImageLink,
                                            fit: BoxFit.fitWidth,
                                          ),
                                        ),
                                        Positioned(
                                          bottom: 5,
                                          right: 5,
                                          child: GestureDetector(
                                              onTap: () {
                                                var viewmodel =
                                                    ref.watch(navbarProvider);
                                                viewmodel.updateIndex(2);
                                              },
                                              child: Container(
                                                height: 40,
                                                width: 40,
                                                decoration: BoxDecoration(
                                                  shape: BoxShape.circle,
                                                  border: Border.all(
                                                    width: 4,
                                                    color: Color(0xFFF06129),
                                                  ),
                                                  color: Colors.white,
                                                ),
                                                child: const Icon(
                                                  Icons.edit,
                                                  color: Color(0xFFF06129),
                                                ),
                                              )),
                                        )
                                      ],
                                    ))),
                            Container(
                              margin: EdgeInsets.only(right: 20),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  AspectRatio(
                                    aspectRatio: 2 / 4,
                                    child: Container(
                                        margin: const EdgeInsets.only(
                                            top: 20, bottom: 20),
                                        padding: EdgeInsets.only(bottom: 24),
                                        decoration: BoxDecoration(
                                            borderRadius:
                                                BorderRadius.circular(12),
                                            border: Border.all(
                                                color: Colors.grey
                                                    .withOpacity(0.3),
                                                width: 1.5),
                                            color: Color(0xFFD1D5DB)),
                                        child: Image.asset(
                                            "assets/images/ribbon.png")),
                                  ),
                                  const SizedBox(
                                    width: 16,
                                  ),
                                  AspectRatio(
                                    aspectRatio: 2 / 4,
                                    child: Container(
                                        margin: const EdgeInsets.only(
                                            top: 20, bottom: 20),
                                        padding: EdgeInsets.only(bottom: 24),
                                        decoration: BoxDecoration(
                                            borderRadius:
                                                BorderRadius.circular(12),
                                            border: Border.all(
                                                color: Colors.grey
                                                    .withOpacity(0.3),
                                                width: 1.5),
                                            color: Color(0xFFD1D5DB)),
                                        child: Image.asset(
                                            "assets/images/gift.png")),
                                  ),
                                ],
                              ),
                            )
                          ],
                        ),
                      ),
                    ),
                  ),
                  Container(
                      margin:
                          const EdgeInsets.only(top: 12, left: 16, bottom: 4),
                      child: Row(
                        children: [
                          Text("Ongoing trials",
                              style: GoogleFonts.getFont('Lexend Deca',
                                  color: Color(0xFF08323A),
                                  fontSize: 15,
                                  fontWeight: FontWeight.w600)),
                        ],
                      )),
                  Container(
                    margin: EdgeInsets.only(left: 16, right: 16),
                    child: Material(
                      borderRadius: BorderRadius.circular(12),
                      child: Stack(children: [
                        RefreshIndicator(
                            onRefresh: () {
                              return Future<void>(() async {
                                GetOngoingData();
                                await GetAvialbleData();
                              });
                            },
                            child: Stack(children: [
                              Container(
                                height: 240,
                                width: size.width,
                                child: isOngoingTrial == true
                                    ? ClipRRect(
                                        child: RefreshIndicator(
                                          onRefresh: GetOngoingData,
                                          child: Wrap(
                                            children: [
                                              Container(
                                                margin: const EdgeInsets.only(
                                                    left: 16,
                                                    top: 8,
                                                    bottom: 8),
                                                child: Text(
                                                    ongoingTrials['title']
                                                        .toString(),
                                                    style: GoogleFonts.getFont(
                                                        'Lexend Deca',
                                                        color:
                                                            Color(0xFFF06129),
                                                        fontWeight:
                                                            FontWeight.bold)),
                                              ),
                                              Image.network(
                                                  ongoingTrials['image']
                                                      .toString(),
                                                  width: size.width,
                                                  fit: BoxFit.cover)
                                            ],
                                          ),
                                        ),
                                      )
                                    : const Center(
                                        child: Text("No ongoing trials")),
                              ),
                              Positioned(
                                  bottom: 5,
                                  child: isOngoingTrial == true
                                      ? Container(
                                          width: size.width,
                                          height: 150,
                                          child: ListView.builder(
                                            itemCount: dummyActions.length,
                                            padding: EdgeInsets.only(left: 8),
                                            scrollDirection: Axis.horizontal,
                                            itemBuilder: ((context, index) =>
                                                ActionTile(
                                                  action: dummyActions[index],
                                                  startFunction: () async {
                                                    await Navigator.push(
                                                      context,
                                                      MaterialPageRoute(
                                                        builder: (context) =>
                                                            FeelingScreen(),
                                                      ),
                                                    );
                                                    GetAccountData();
                                                  },
                                                )),
                                          ),
                                        )
                                      : Text(""))
                            ])),
                      ]),
                    ),
                  ),
                  Container(
                      margin: EdgeInsets.only(top: 25, left: 16, bottom: 4),
                      child: Row(
                        children: [
                          Text("Available trials",
                              style: GoogleFonts.getFont('Lexend Deca',
                                  color: Color(0xFF08323A),
                                  fontSize: 15,
                                  fontWeight: FontWeight.w600)),
                        ],
                      )),
                  Container(
                    width: size.width,
                    height: 200,
                    child: RefreshIndicator(
                        key: refreshkey,
                        child: ListView.builder(
                          itemCount: avilableTrials.length,
                          padding: EdgeInsets.only(left: 16),
                          scrollDirection: Axis.horizontal,
                          itemBuilder: ((context, index) {
                            var trial = avilableTrials[index];
                            return Container(
                              //padding: EdgeInsets.all(14),
                              margin: EdgeInsets.only(right: 12),
                              decoration: BoxDecoration(
                                  borderRadius: BorderRadius.circular(12),
                                  border:
                                      Border.all(color: Colors.white, width: 1),
                                  color: Colors.white),
                              width: 200,
                              clipBehavior: Clip.hardEdge,
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  GestureDetector(
                                    onTap: (() async {
                                      await startFunction(
                                          trial.id, trial.permission);
                                      GetAccountData();
                                    }),
                                    behavior: HitTestBehavior.opaque,
                                    child: Container(
                                      child: Column(
                                        children: [
                                          ClipRRect(
                                            borderRadius:
                                                const BorderRadius.only(
                                                    topLeft:
                                                        Radius.circular(12),
                                                    topRight:
                                                        Radius.circular(12)),
                                            child: Container(
                                              height: 140,
                                              child: Image.network(
                                                trial.image,
                                                width: 250,
                                                fit: BoxFit.fitWidth,
                                              ),
                                            ),
                                          ),
                                          Container(
                                            alignment: Alignment.bottomLeft,
                                            padding: EdgeInsets.only(
                                                left: 10, top: 10),
                                            child: Text(trial.title,
                                                style: GoogleFonts.getFont(
                                                    'Lexend Deca',
                                                    color: Color(0xFFF06129),
                                                    fontSize: 16,
                                                    fontWeight:
                                                        FontWeight.w400)),
                                          ),
                                        ],
                                      ),
                                    ),
                                  )
                                ],
                              ),
                            );
                          }),
                        ),
                        onRefresh: () {
                          return Future<void>(() async {
                            GetOngoingData();
                            await GetAvialbleData();
                          });
                        }),
                  )
                ],
              ),
            ),
          ),

          //Journey
          Container(
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
                    ),
                    /* child: Image.asset(
                      "assets/images/gift_big.png",
                    ), */
                    child: Image.asset(
                      "assets/images/support/level2Incomplete.png",
                      colorBlendMode: BlendMode.dstOut,
                    )),
              ),
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
                      child: Image.asset(
                        "assets/images/chocolates.png",
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
                      child: Image.asset(
                        "assets/images/crown.png",
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
                          child: Image.asset(
                            "assets/images/winner.png",
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
          ),

//******************************** */
          //My Data

          RefreshIndicator(
              child: Container(
                height: size.height,
                width: size.width,
                decoration: BoxDecoration(
                  image: DecorationImage(
                    fit: BoxFit.cover,
                    image: Image.asset("assets/images/bg.png").image,
                  ),
                ),
                child: Stack(children: [
                  Container(
                      margin: EdgeInsets.only(left: 10, top: 26, bottom: 50),
                      height: 100,
                      child: Text("FHIR data",
                          style: GoogleFonts.getFont('Lexend Deca',
                              fontSize: 24))),
                  Positioned(
                    top: 25,
                    right: 30,
                    child: GestureDetector(
                        onTap: () async {
                          await Logout();
                        },
                        child: Container(
                          height: 40,
                          width: 40,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            border: Border.all(
                              width: 4,
                              color: Color.fromARGB(255, 255, 0, 0),
                            ),
                            color: Colors.white,
                          ),
                          child: const Icon(
                            Icons.logout,
                            color: Color.fromARGB(255, 255, 0, 0),
                          ),
                        )),
                  ),
                  Container(
                    width: 150,
                    height: 150,
                    margin: EdgeInsets.only(top: 70, left: 120),
                    padding: EdgeInsets.all(12),
                    clipBehavior: Clip.antiAlias,
                    decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(200.0),
                        color: Colors.white),
                    child: Stack(
                      children: [
                        Container(
                          child: Wrap(
                            children: [
                              Image.network(ImageLink,
                                  width: size.width, fit: BoxFit.fill)
                            ],
                          ),
                        ),
                        Positioned(
                          bottom: 5,
                          right: 5,
                          child: GestureDetector(
                              onTap: () {
                                imagePickerOption(context);
                              },
                              child: Container(
                                height: 40,
                                width: 40,
                                decoration: BoxDecoration(
                                  shape: BoxShape.circle,
                                  border: Border.all(
                                    width: 4,
                                    color: Color(0xFFF06129),
                                  ),
                                  color: Colors.white,
                                ),
                                child: const Icon(
                                  Icons.edit,
                                  color: Color(0xFFF06129),
                                ),
                              )),
                        )
                      ],
                    ),
                  ),
                  Padding(
                    padding: EdgeInsetsDirectional.fromSTEB(24, 220, 24, 0),
                    child: SingleChildScrollView(
                      child: Column(
                        mainAxisSize: MainAxisSize.max,
                        children: [
                          Padding(
                            padding: EdgeInsetsDirectional.fromSTEB(0, 5, 0, 0),
                            child: Container(
                              width: MediaQuery.of(context).size.width * 0.90,
                              height: 50,
                              decoration: BoxDecoration(
                                color: Color.fromARGB(255, 238, 238, 238),
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: Padding(
                                padding: EdgeInsetsDirectional.fromSTEB(
                                    10, 7, 18, 5),
                                child: Row(
                                  children: [
                                    Expanded(
                                      child: MouseRegion(
                                        cursor: SystemMouseCursors.click,
                                        child: GestureDetector(
                                          child: Row(
                                            children: [
                                              Padding(
                                                padding:
                                                    const EdgeInsetsDirectional
                                                        .fromSTEB(5, 5, 5, 5),
                                                child: Text(
                                                  'Wearables',
                                                  style: GoogleFonts.getFont(
                                                    'Lexend',
                                                    color: Colors.black,
                                                    fontWeight: FontWeight.w500,
                                                    fontSize: 18,
                                                  ),
                                                ),
                                              ),
                                              const Align(
                                                alignment:
                                                    Alignment.centerRight,
                                                child: Icon(Icons
                                                    .arrow_forward_outlined),
                                              ),
                                            ],
                                          ),
                                          onTap: () async {
                                            await Navigator.push(
                                              context,
                                              MaterialPageRoute(
                                                  builder: (context) =>
                                                      const WearablesScreen()),
                                            );
                                          },
                                        ),
                                      ),
                                    ),
                                    Checkbox(
                                      value: boolWearables,
                                      onChanged: (bool? value) {
                                        setState(() {
                                          boolWearables = value!;
                                        });
                                      },
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ),
                          Padding(
                            padding: EdgeInsetsDirectional.fromSTEB(0, 5, 0, 0),
                            child: Container(
                              width: MediaQuery.of(context).size.width * 0.90,
                              decoration: BoxDecoration(
                                color: Color.fromARGB(255, 238, 238, 238),
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: Padding(
                                padding:
                                    EdgeInsetsDirectional.fromSTEB(2, 2, 2, 2),
                                child: Column(
                                  children: [
                                    CheckboxListTile(
                                      title: Text(
                                        'Family name',
                                        style: GoogleFonts.getFont(
                                          'Lexend',
                                          color: Colors.black,
                                          fontWeight: FontWeight.w500,
                                        ),
                                      ),
                                      subtitle: Text(
                                        PatientDetails['name-family']
                                            .toString(),
                                        style: GoogleFonts.getFont(
                                          'Lexend Deca',
                                        ),
                                      ),
                                      value: this.boolNameFamily,
                                      onChanged: (value) {
                                        setState(() {
                                          boolNameFamily = value!;
                                        });
                                      },
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ),
                          Padding(
                            padding: EdgeInsetsDirectional.fromSTEB(0, 5, 0, 0),
                            child: Container(
                              width: MediaQuery.of(context).size.width * 0.90,
                              decoration: BoxDecoration(
                                color: Color.fromARGB(255, 238, 238, 238),
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: Padding(
                                padding:
                                    EdgeInsetsDirectional.fromSTEB(2, 2, 2, 2),
                                child: Column(
                                  children: [
                                    CheckboxListTile(
                                      title: Text(
                                        'Given name',
                                        style: GoogleFonts.getFont(
                                          'Lexend',
                                          color: Colors.black,
                                          fontWeight: FontWeight.w500,
                                        ),
                                      ),
                                      subtitle: Text(
                                        PatientDetails['name-given'].toString(),
                                        style: GoogleFonts.getFont(
                                          'Lexend Deca',
                                        ),
                                      ),
                                      value: this.boolNameGiven,
                                      onChanged: (value) {
                                        setState(() {
                                          boolNameGiven = value!;
                                        });
                                      },
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ),
                          Padding(
                            padding: EdgeInsetsDirectional.fromSTEB(0, 5, 0, 0),
                            child: Container(
                              width: MediaQuery.of(context).size.width * 0.90,
                              decoration: BoxDecoration(
                                color: Color.fromARGB(255, 238, 238, 238),
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: Padding(
                                padding:
                                    EdgeInsetsDirectional.fromSTEB(2, 2, 2, 2),
                                child: Column(
                                  children: [
                                    CheckboxListTile(
                                      title: Text(
                                        'Gender',
                                        style: GoogleFonts.getFont(
                                          'Lexend',
                                          color: Colors.black,
                                          fontWeight: FontWeight.w500,
                                        ),
                                      ),
                                      subtitle: Text(
                                        PatientDetails['gender'].toString(),
                                        style: GoogleFonts.getFont(
                                          'Lexend Deca',
                                        ),
                                      ),
                                      value: this.boolGender,
                                      onChanged: (value) {
                                        setState(() {
                                          boolGender = value!;
                                        });
                                      },
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ),
                          Padding(
                            padding: EdgeInsetsDirectional.fromSTEB(0, 5, 0, 0),
                            child: Container(
                              width: MediaQuery.of(context).size.width * 0.90,
                              decoration: BoxDecoration(
                                color: Color.fromARGB(255, 238, 238, 238),
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: Padding(
                                padding:
                                    EdgeInsetsDirectional.fromSTEB(2, 2, 2, 2),
                                child: Column(
                                  children: [
                                    CheckboxListTile(
                                      title: Text(
                                        'Phone',
                                        style: GoogleFonts.getFont(
                                          'Lexend',
                                          color: Colors.black,
                                          fontWeight: FontWeight.w500,
                                        ),
                                      ),
                                      subtitle: Text(
                                        PatientDetails['phone'].toString(),
                                        style: GoogleFonts.getFont(
                                          'Lexend Deca',
                                        ),
                                      ),
                                      value: this.boolPhone,
                                      onChanged: (value) {
                                        setState(() {
                                          boolPhone = value!;
                                        });
                                      },
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ),
                          Padding(
                            padding: EdgeInsetsDirectional.fromSTEB(0, 5, 0, 0),
                            child: Container(
                              width: MediaQuery.of(context).size.width * 0.90,
                              decoration: BoxDecoration(
                                color: Color.fromARGB(255, 238, 238, 238),
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: Padding(
                                  padding: EdgeInsetsDirectional.fromSTEB(
                                      10, 7, 18, 5),
                                  child: Row(
                                      mainAxisAlignment:
                                          MainAxisAlignment.start,
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        Expanded(
                                            child: MouseRegion(
                                                cursor:
                                                    SystemMouseCursors.click,
                                                child: GestureDetector(
                                                  child: Column(
                                                    children: [
                                                      Row(
                                                        children: [
                                                          Padding(
                                                            padding:
                                                                EdgeInsetsDirectional
                                                                    .fromSTEB(
                                                                        5,
                                                                        5,
                                                                        5,
                                                                        5),
                                                            child: Text(
                                                              'About',
                                                              style: GoogleFonts
                                                                  .getFont(
                                                                'Lexend',
                                                                color: Colors
                                                                    .black,
                                                                fontWeight:
                                                                    FontWeight
                                                                        .w500,
                                                                fontSize: 18,
                                                              ),
                                                            ),
                                                          ),
                                                        ],
                                                      ),
                                                      Row(
                                                        children: [
                                                          Expanded(
                                                            child: Text(
                                                              PatientDetails[
                                                                      'disease']
                                                                  .toString(),
                                                              style: GoogleFonts
                                                                  .getFont(
                                                                'Lexend Deca',
                                                                fontSize: 14,
                                                              ),
                                                            ),
                                                          )
                                                        ],
                                                      ),
                                                    ],
                                                  ),
                                                  onTap: () async {
                                                    setState(() {
                                                      boolAbout = !boolAbout;
                                                    });
                                                  },
                                                ))),
                                        Checkbox(
                                          value: boolAbout,
                                          onChanged: (bool? value) {
                                            setState(() {
                                              boolAbout = value!;
                                            });
                                          },
                                        ),
                                      ])),
                            ),
                          ),
                          // Padding(
                          //   padding:
                          //       EdgeInsetsDirectional.fromSTEB(0, 5, 0, 10),
                          //   child: Container(
                          //     width: MediaQuery.of(context).size.width * 0.90,
                          //     decoration: BoxDecoration(
                          //       color: Color.fromARGB(255, 238, 238, 238),
                          //       borderRadius: BorderRadius.circular(10),
                          //     ),
                          //     child: Padding(
                          //       padding:
                          //           EdgeInsetsDirectional.fromSTEB(2, 2, 2, 2),
                          //       child: Column(
                          //         children: [
                          //           CheckboxListTile(
                          //             title: Text(
                          //               'About',
                          //               style: GoogleFonts.getFont(
                          //                 'Lexend',
                          //                 color: Colors.black,
                          //                 fontWeight: FontWeight.w500,
                          //               ),
                          //             ),
                          //             subtitle: Expanded(
                          //                 child: Text(
                          //               PatientDetails['disease'].toString(),
                          //               style: GoogleFonts.getFont(
                          //                 'Lexend Deca',
                          //               ),
                          //             )),
                          //             value: this.boolAbout,
                          //             onChanged: (value) {
                          //               setState(() {
                          //                 boolAbout = value!;
                          //               });
                          //             },
                          //           ),
                          //         ],
                          //       ),
                          //     ),
                          //   ),
                          // ),
                          GestureDetector(
                              onTap: () async {
                                await GenerateQRCode();

                                await Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                      builder: (context) =>
                                          QRgeneratedScreen(wrappedData)),
                                );
                              },
                              child: Container(
                                margin:
                                    const EdgeInsets.only(top: 5, bottom: 5),
                                child: Material(
                                  borderRadius: BorderRadius.circular(8),
                                  elevation: 2,
                                  child: Container(
                                    height: 40,
                                    decoration: BoxDecoration(
                                      borderRadius: BorderRadius.circular(8),
                                      color: const Color(0xFFF06129),
                                    ),
                                    child: Center(
                                      child: Text("Generate QR Code",
                                          style: GoogleFonts.getFont(
                                              'Lexend Deca',
                                              fontSize: 16,
                                              color: Colors.white)),
                                    ),
                                  ),
                                ),
                              )),
                        ],
                      ),
                    ),
                  )
                ]),
              ),
              onRefresh: () {
                return Future<void>(() async {
                  await GetAccountData();
                });
              }),

//********************************* */
          //credits

          RefreshIndicator(
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
                                      padding: const EdgeInsets.only(
                                          left: 20, right: 20),
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
                                                      fontWeight:
                                                          FontWeight.w700)),
                                              Text(
                                                  userDetails['credits']
                                                      .toString(),
                                                  style: GoogleFonts.getFont(
                                                      'Lexend Deca',
                                                      color: Color(0xFFF06129),
                                                      fontSize: 25,
                                                      fontWeight:
                                                          FontWeight.w700))
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
                                              child: Text("Cash out",
                                                  style: GoogleFonts.getFont(
                                                      'Lexend Deca',
                                                      color: Colors.white,
                                                      fontSize: 16,
                                                      fontWeight:
                                                          FontWeight.bold)))
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
                                  child: Text(ongoingTrials['title'].toString(),
                                      textAlign: TextAlign.center,
                                      style: GoogleFonts.getFont('Lexend Deca',
                                          fontSize: 14,
                                          fontWeight: FontWeight.w700)),
                                ),
                                Container(
                                  width: size.width,
                                  child: Row(
                                    mainAxisAlignment:
                                        MainAxisAlignment.spaceEvenly,
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
                                              color: Color.fromRGBO(
                                                  124, 209, 227, 1),
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
                                                    userDetails[
                                                            'ongoingcredit'] ==
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
                                                      BorderRadius.circular(
                                                          128),
                                                ),
                                                child: Container(
                                                  margin:
                                                      EdgeInsets.only(top: 8),
                                                  child: Column(
                                                    mainAxisSize:
                                                        MainAxisSize.min,
                                                    mainAxisAlignment:
                                                        MainAxisAlignment
                                                            .center,
                                                    children: [
                                                      Text(
                                                        "Total credits",
                                                        style:
                                                            GoogleFonts.getFont(
                                                                'Lexend Deca',
                                                                fontSize: 14,
                                                                fontWeight:
                                                                    FontWeight
                                                                        .w700),
                                                      ),
                                                      Text(
                                                          ((userDetails['ongoingcredit'] !=
                                                                      null)
                                                                  ? userDetails[
                                                                      'ongoingcredit']
                                                                  : 0)
                                                              .toString(),
                                                          style: GoogleFonts
                                                              .getFont(
                                                                  'Lexend Deca',
                                                                  color: Color(
                                                                      0xFFF06129),
                                                                  fontSize: 20,
                                                                  fontWeight:
                                                                      FontWeight
                                                                          .w700))
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
                                                color: Color.fromRGBO(
                                                    124, 209, 227, 1),
                                              ),
                                              child:
                                                  ongoingTrials['image'] != ""
                                                      ? Image.network(
                                                          ongoingTrials['image']
                                                              .toString(),
                                                          fit: BoxFit.cover,
                                                        )
                                                      : Text("")),
                                        ),
                                      ),
                                      Container(
                                        child: Container(
                                            margin: EdgeInsets.only(
                                                top: 120, right: 0),
                                            height: size.width / 8,
                                            width: size.width / 8,
                                            decoration: BoxDecoration(
                                              borderRadius:
                                                  BorderRadius.circular(128),
                                              color: Color.fromRGBO(
                                                  124, 209, 227, 1),
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
                                              borderRadius:
                                                  BorderRadius.vertical(
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
                                              padding: const EdgeInsets.only(
                                                  bottom: 40),
                                              itemBuilder: (context, index) {
                                                return Container(
                                                  decoration: BoxDecoration(
                                                      color: Colors.white,
                                                      borderRadius:
                                                          BorderRadius.circular(
                                                              15)),
                                                  child: Column(
                                                    mainAxisAlignment:
                                                        MainAxisAlignment.start,
                                                    crossAxisAlignment:
                                                        CrossAxisAlignment
                                                            .start,
                                                    children: [
                                                      Row(
                                                        mainAxisAlignment:
                                                            MainAxisAlignment
                                                                .center,
                                                        children: [
                                                          Container(
                                                              margin:
                                                                  const EdgeInsets
                                                                          .only(
                                                                      top: 24,
                                                                      bottom:
                                                                          24),
                                                              child: Image.asset(
                                                                  dummyOffers[
                                                                          index]
                                                                      .image)),
                                                        ],
                                                      ),
                                                      Container(
                                                          padding:
                                                              EdgeInsets.only(
                                                                  left: 12),
                                                          margin:
                                                              EdgeInsets.only(
                                                                  bottom: 12),
                                                          child: Text(
                                                              dummyOffers[index]
                                                                  .title,
                                                              style: GoogleFonts.getFont(
                                                                  'Lexend Deca',
                                                                  fontSize: 14,
                                                                  fontWeight:
                                                                      FontWeight
                                                                          .bold))),
                                                      Container(
                                                        padding:
                                                            const EdgeInsets
                                                                    .only(
                                                                left: 12,
                                                                right: 12,
                                                                bottom: 16),
                                                        child: Row(
                                                          mainAxisAlignment:
                                                              MainAxisAlignment
                                                                  .spaceBetween,
                                                          children: [
                                                            Text(
                                                                dummyOffers[
                                                                        index]
                                                                    .store,
                                                                style: GoogleFonts.getFont(
                                                                    'Lexend Deca',
                                                                    color: Color(
                                                                        0xFF7CD1E3),
                                                                    fontSize:
                                                                        14,
                                                                    fontWeight:
                                                                        FontWeight
                                                                            .bold)),
                                                            Text(
                                                                dummyOffers[
                                                                        index]
                                                                    .period,
                                                                style: GoogleFonts.getFont(
                                                                    'Lexend Deca',
                                                                    color: Color(
                                                                        0xFFA0A1A8),
                                                                    fontSize:
                                                                        10,
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
                                                        color:
                                                            Color(0xFF08323A),
                                                        fontSize: 15,
                                                        fontWeight:
                                                            FontWeight.bold)),
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
                  await GetFHIRData(userid);
                });
              }),
        ],
      ),
    );
  }
}

class ActionTile extends StatelessWidget {
  final VoidCallback startFunction;

  final TrialAction action;

  const ActionTile({
    Key? key,
    required this.startFunction,
    required this.action,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      margin: const EdgeInsets.only(right: 12, bottom: 2),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.white, width: 1),
        color: action.isDone ? Color(0xFF6B7280) : Color(0xFFFEE4CA),
      ),
      width: 120,
      child: action.isDone
          ? Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(action.when.toUpperCase(),
                    style: GoogleFonts.getFont('Lexend Deca',
                        color: Colors.white,
                        fontSize: 16,
                        fontWeight: FontWeight.w700)),
                const SizedBox(
                  height: 12,
                ),
                Text(action.content,
                    style: GoogleFonts.getFont('Lexend Deca',
                        color: Colors.white,
                        fontSize: 13,
                        fontWeight: FontWeight.w400)),
                const SizedBox(
                  height: 12,
                ),
                Container(
                  height: 40,
                  child: Center(
                      child: Row(
                    children: [
                      Image.asset("assets/images/done.png"),
                      const SizedBox(
                        width: 4,
                      ),
                      Text("Completed",
                          style: GoogleFonts.getFont('Lexend Deca',
                              color: Colors.white,
                              fontSize: 12,
                              fontWeight: FontWeight.bold))
                    ],
                  )),
                ),
              ],
            )
          : Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text("TODAY",
                    style: GoogleFonts.getFont('Lexend Deca',
                        color: Color(0xFFF06129),
                        fontSize: 16,
                        fontWeight: FontWeight.w700)),
                const SizedBox(
                  height: 12,
                ),
                Text(action.content,
                    style: GoogleFonts.getFont('Lexend Deca',
                        color: Color(0xFF08323A),
                        fontSize: 13,
                        fontWeight: FontWeight.w400)),
                const SizedBox(
                  height: 12,
                ),
                GestureDetector(
                  onTap: () async {
                    final prefs = await SharedPreferences.getInstance();
                    prefs.setString("surveyid", action.id);
                    startFunction();
                  },
                  behavior: HitTestBehavior.opaque,
                  child: Container(
                    height: 40,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(6),
                      color: Color(0xFFF06129),
                    ),
                    child: Center(
                      child: Text("Start",
                          style: GoogleFonts.getFont('Lexend Deca',
                              color: Colors.white,
                              fontSize: 16,
                              fontWeight: FontWeight.w500)),
                    ),
                  ),
                ),
              ],
            ),
    );
  }
}

class OngoingDialog extends StatefulWidget {
  int trialid;
  final String permissions;
  final Function StartTrial;
  final Function SetSwitches;

  OngoingDialog(
      this.trialid, this.permissions, this.SetSwitches, this.StartTrial);

  @override
  _OngoingDialogState createState() => _OngoingDialogState();
}

class _OngoingDialogState extends State<OngoingDialog> {
  //FHIR switches
  bool FamilyNameSwitch = false;
  bool GivenNameSwitch = false;
  bool GenderSwitch = false;
  bool PhoneSwitch = false;
  bool AboutSwitch = false;
  //Wearable switches
  bool BloodSwitch = false;
  bool SleepSwitch = false;
  bool StepsSwitch = false;
  bool CaloriesSwitch = false;

  bool GetPermission(String type) {
    return jsonDecode(widget.permissions)[type];
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: Text("Do you want to start the trial?"),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        mainAxisAlignment: MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Align(
            alignment: AlignmentDirectional(-0.95, 0),
            child: Text(
              'FHIR',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.w900,
              ),
            ),
          ),
          Padding(
            padding: EdgeInsetsDirectional.fromSTEB(8, 8, 8, 8),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                GetPermission('family')
                    ? Padding(
                        padding: EdgeInsetsDirectional.fromSTEB(0, 0, 0, 5),
                        child: SwitchListTile(
                          value: FamilyNameSwitch,
                          onChanged: (newValue) {
                            setState(() => {
                                  FamilyNameSwitch =
                                      widget.SetSwitches(0, newValue)
                                });
                          },
                          title: Text(
                            'Family Name',
                          ),
                          tileColor: Colors.white,
                          dense: false,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.zero,
                            side:
                                BorderSide(color: Color(0x4d9e9e9e), width: 1),
                          ),
                          controlAffinity: ListTileControlAffinity.trailing,
                        ),
                      )
                    : Visibility(
                        // hiding the child widget
                        visible: false,
                        child: Text(""),
                      ),
                GetPermission('given')
                    ? Padding(
                        padding: EdgeInsetsDirectional.fromSTEB(0, 0, 0, 5),
                        child: SwitchListTile(
                          value: GivenNameSwitch,
                          onChanged: (newValue) {
                            setState(() => {
                                  GivenNameSwitch =
                                      widget.SetSwitches(1, newValue)
                                });
                          },
                          title: Text(
                            'Given Name',
                          ),
                          tileColor: Colors.white,
                          dense: false,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.zero,
                            side:
                                BorderSide(color: Color(0x4d9e9e9e), width: 1),
                          ),
                          controlAffinity: ListTileControlAffinity.trailing,
                        ),
                      )
                    : Visibility(
                        // hiding the child widget
                        visible: false,
                        child: Text(""),
                      ),
                GetPermission('phone')
                    ? Padding(
                        padding: EdgeInsetsDirectional.fromSTEB(0, 0, 0, 5),
                        child: SwitchListTile(
                          value: PhoneSwitch,
                          onChanged: (newValue) {
                            setState(() => {
                                  PhoneSwitch = widget.SetSwitches(2, newValue)
                                });
                          },
                          title: Text(
                            'Phone',
                          ),
                          tileColor: Colors.white,
                          dense: false,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.zero,
                            side:
                                BorderSide(color: Color(0x4d9e9e9e), width: 1),
                          ),
                          controlAffinity: ListTileControlAffinity.trailing,
                        ),
                      )
                    : Visibility(
                        // hiding the child widget
                        visible: false,
                        child: Text(""),
                      ),
                GetPermission('gender')
                    ? Padding(
                        padding: EdgeInsetsDirectional.fromSTEB(0, 0, 0, 5),
                        child: SwitchListTile(
                          value: GenderSwitch,
                          onChanged: (newValue) {
                            setState(() => {
                                  GenderSwitch = widget.SetSwitches(3, newValue)
                                });
                          },
                          title: Text(
                            'Gender',
                          ),
                          tileColor: Colors.white,
                          dense: false,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.zero,
                            side:
                                BorderSide(color: Color(0x4d9e9e9e), width: 1),
                          ),
                          controlAffinity: ListTileControlAffinity.trailing,
                        ),
                      )
                    : Visibility(
                        // hiding the child widget
                        visible: false,
                        child: Text(""),
                      ),
                GetPermission('about')
                    ? Padding(
                        padding: EdgeInsetsDirectional.fromSTEB(0, 0, 0, 5),
                        child: SwitchListTile(
                          value: AboutSwitch,
                          onChanged: (newValue) {
                            setState(() => {
                                  AboutSwitch = widget.SetSwitches(4, newValue)
                                });
                          },
                          title: Text(
                            'About',
                          ),
                          tileColor: Colors.white,
                          dense: false,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.zero,
                            side:
                                BorderSide(color: Color(0x4d9e9e9e), width: 1),
                          ),
                          controlAffinity: ListTileControlAffinity.trailing,
                        ),
                      )
                    : Visibility(
                        // hiding the child widget
                        visible: false,
                        child: Text(""),
                      ),
              ],
            ),
          ),
          Align(
            alignment: AlignmentDirectional(-0.95, 0),
            child: Text(
              'WEARABLES',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.w900,
              ),
            ),
          ),
          Padding(
            padding: EdgeInsetsDirectional.fromSTEB(8, 8, 8, 8),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                GetPermission('blood')
                    ? Padding(
                        padding: EdgeInsetsDirectional.fromSTEB(0, 0, 0, 5),
                        child: SwitchListTile(
                          value: BloodSwitch,
                          onChanged: (newValue) {
                            setState(() => {
                                  BloodSwitch = widget.SetSwitches(0, newValue,
                                      fhirtype: 1)
                                });
                          },
                          title: Text(
                            'Blood Rate Data',
                          ),
                          tileColor: Colors.white,
                          dense: false,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.zero,
                            side:
                                BorderSide(color: Color(0x4d9e9e9e), width: 1),
                          ),
                          controlAffinity: ListTileControlAffinity.trailing,
                        ),
                      )
                    : Visibility(
                        // hiding the child widget
                        visible: false,
                        child: Text(""),
                      ),
                GetPermission('sleep')
                    ? Padding(
                        padding: EdgeInsetsDirectional.fromSTEB(0, 0, 0, 5),
                        child: SwitchListTile(
                          value: SleepSwitch,
                          onChanged: (newValue) {
                            setState(() => {
                                  SleepSwitch = widget.SetSwitches(1, newValue,
                                      fhirtype: 1)
                                });
                          },
                          title: Text(
                            'Sleep Data',
                          ),
                          tileColor: Colors.white,
                          dense: false,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.zero,
                            side:
                                BorderSide(color: Color(0x4d9e9e9e), width: 1),
                          ),
                          controlAffinity: ListTileControlAffinity.trailing,
                        ),
                      )
                    : Visibility(
                        // hiding the child widget
                        visible: false,
                        child: Text(""),
                      ),
                GetPermission('steps')
                    ? Padding(
                        padding: EdgeInsetsDirectional.fromSTEB(0, 0, 0, 5),
                        child: SwitchListTile(
                          value: StepsSwitch,
                          onChanged: (newValue) {
                            setState(() => {
                                  StepsSwitch = widget.SetSwitches(2, newValue,
                                      fhirtype: 1)
                                });
                          },
                          title: Text(
                            'Steps Data',
                          ),
                          tileColor: Colors.white,
                          dense: false,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.zero,
                            side:
                                BorderSide(color: Color(0x4d9e9e9e), width: 1),
                          ),
                          controlAffinity: ListTileControlAffinity.trailing,
                        ),
                      )
                    : Visibility(
                        // hiding the child widget
                        visible: false,
                        child: Text(""),
                      ),
                GetPermission('calories')
                    ? Padding(
                        padding: EdgeInsetsDirectional.fromSTEB(0, 0, 0, 5),
                        child: SwitchListTile(
                          value: CaloriesSwitch,
                          onChanged: (newValue) {
                            setState(() => {
                                  CaloriesSwitch = widget.SetSwitches(
                                      3, newValue,
                                      fhirtype: 1)
                                });
                          },
                          title: Text(
                            'Calories Burned Data',
                          ),
                          tileColor: Colors.white,
                          dense: false,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.zero,
                            side:
                                BorderSide(color: Color(0x4d9e9e9e), width: 1),
                          ),
                          controlAffinity: ListTileControlAffinity.trailing,
                        ),
                      )
                    : Visibility(
                        // hiding the child widget
                        visible: false,
                        child: Text(""),
                      ),
              ],
            ),
          ),
        ],
      ),
      actions: [
        TextButton(
            onPressed: (() async {
              await widget.StartTrial(widget.trialid);
            }),
            child: Text("Accept"))
      ],
    );
  }
}
