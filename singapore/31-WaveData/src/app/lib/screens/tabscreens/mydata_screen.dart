// ignore_for_file: prefer_const_literals_to_create_immutables

import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:wavedata/model/airtable_api.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:http/http.dart' as http;
import 'package:wavedata/screens/qr_code_generated.dart';
import 'package:wavedata/screens/wearables_screen.dart';
import 'package:wavedata/screens/auth_screen.dart';

class MyDataScreen extends ConsumerStatefulWidget {
  const MyDataScreen({Key? key}) : super(key: key);

  @override
  ConsumerState<ConsumerStatefulWidget> createState() => _MyDataScreenState();
}

class _MyDataScreenState extends ConsumerState<MyDataScreen> {
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

  String userid = "";
  String StudyId = "";

  String ImageLink = "https://i.postimg.cc/SsxGw5cZ/person.jpg";

  var refreshkey = GlobalKey<RefreshIndicatorState>();
  bool boolWearables = false;
  bool boolGender = false;
  bool boolBirthDate = false;
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
    if (boolBirthDate) {
      choosenData.add({"Birth Date": PatientDetails['birth-date']});
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

  Future<void> GetFHIRData(String userid) async {
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
      var imageData = dataUD['image'];
      ImageLink = imageData;
    });

    var urlFH = Uri.parse(
        '${domain}/api/GET/getFhir?userid=${int.parse(userid.toString())}');
    final responseFH = await http.get(urlFH);
    var responseDataFH = json.decode(responseFH.body);

    if (responseDataFH['value'] != null) {
      var data = (responseDataFH['value']);
      var allData = data;
      try {
        setState(() {
          PatientDetails['gender'] = allData['gender'];
          PatientDetails['birth-date'] = allData['birth_date'];
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
      userid = (prefs.getString("userid").toString());
      StudyId = (prefs.getString("studyid").toString());
    });

    GetFHIRData(userid);
  }

  var PatientDetails = {
    "gender": "Female",
    "birth-date": "",
    "name-family": "",
    "name-given": "",
    "phone": "",
    "disease": ""
  };

  TextEditingController _textFieldController = TextEditingController();
  void UpdateImage() async {
    setState(() {
      ImageLink = _textFieldController.text;
    });
    final prefs = await SharedPreferences.getInstance();
    String userid = (prefs.getString("userid").toString());
       final UsersTable = base('users');
        await UsersTable.update(userid, {"image": _textFieldController.text});

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
              decoration: const InputDecoration(
                  hintText: "https://image.com/example.png"),
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

    return //My Data
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
                    child: Text("Persoanl Information",
                        style:
                            GoogleFonts.getFont('Lexend Deca', fontSize: 24))),
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
                              padding:
                                  EdgeInsetsDirectional.fromSTEB(10, 7, 18, 5),
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
                                              alignment: Alignment.centerRight,
                                              child: Icon(
                                                  Icons.arrow_forward_outlined),
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
                                      PatientDetails['name-family'].toString(),
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
                                      'Birth Date',
                                      style: GoogleFonts.getFont(
                                        'Lexend',
                                        color: Colors.black,
                                        fontWeight: FontWeight.w500,
                                      ),
                                    ),
                                    subtitle: Text(
                                      PatientDetails['birth-date'].toString(),
                                      style: GoogleFonts.getFont(
                                        'Lexend Deca',
                                      ),
                                    ),
                                    value: this.boolBirthDate,
                                    onChanged: (value) {
                                      setState(() {
                                        boolBirthDate = value!;
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
                                    mainAxisAlignment: MainAxisAlignment.start,
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Expanded(
                                          child: MouseRegion(
                                              cursor: SystemMouseCursors.click,
                                              child: GestureDetector(
                                                child: Column(
                                                  children: [
                                                    Row(
                                                      children: [
                                                        Padding(
                                                          padding:
                                                              EdgeInsetsDirectional
                                                                  .fromSTEB(5,
                                                                      5, 5, 5),
                                                          child: Text(
                                                            'About',
                                                            style: GoogleFonts
                                                                .getFont(
                                                              'Lexend',
                                                              color:
                                                                  Colors.black,
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
                              margin: const EdgeInsets.only(top: 5, bottom: 5),
                              child: Material(
                                borderRadius: BorderRadius.circular(8),
                                elevation: 2,
                                child: Container(
                                  height: 60,
                                  decoration: BoxDecoration(
                                    borderRadius: BorderRadius.circular(8),
                                    color: const Color(0xFFF06129),
                                  ),
                                  child: Center(
                                    child: Padding(
                                        padding: EdgeInsetsDirectional.all(5),
                                        child: Text(
                                            "Generate QR Code if you want to share the data with your medical professional",
                                            style: GoogleFonts.getFont(
                                                'Lexend Deca',
                                                fontSize: 16,
                                                color: Colors.white))),
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
            });
  }
}
