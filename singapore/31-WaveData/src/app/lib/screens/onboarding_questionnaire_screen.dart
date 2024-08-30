import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';

import 'package:http/http.dart' as http;
import 'package:wavedata/model/airtable_api.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:wavedata/model/question.dart';
import 'package:wavedata/providers/feeling_provider.dart';
import 'package:wavedata/providers/questionnaire_provider.dart';
import 'package:wavedata/screens/connect_data.dart';
import 'package:wavedata/screens/main_screen.dart';
import 'package:wavedata/screens/journal_screen.dart';

class OnboardingQuestionnaireScreen extends ConsumerStatefulWidget {
  const OnboardingQuestionnaireScreen({Key? key}) : super(key: key);

  @override
  ConsumerState<OnboardingQuestionnaireScreen> createState() =>
      _OnboardingQuestionnaireScreenState();
}

class _OnboardingQuestionnaireScreenState
    extends ConsumerState<OnboardingQuestionnaireScreen> {
  var POSTheader = {
    "Accept": "application/json",
    "Content-Type": "application/x-www-form-urlencoded"
  };
  String domain = 'http://127.0.0.1:3000';
  String userid = "";
  var allQuestions = [
      Question(
          id: "1",
          content: "Which form of sickle cell disease do you have?",
          questionid: "1",
          QuestionType: "tick",
          QuestionType2: "tick",
          Answer: "",
          AnswerOptions: [
            "HbSS",
            "HbSC, HbSβ0",
            "thalassemia, HbSβ+ thalassemia",
            "I don’t know"
          ]),
      Question(
          id: "2",
          content: "How many crises did you have in the last 12 months?",
          questionid: "2",
          QuestionType: "tick",
          QuestionType2: "tick",
          Answer: "",
          AnswerOptions: ["0", "1", "2", "3", "4", "5", ">5"]),
      Question(
          id: "3",
          content: "How often have you been hospitalized for a crisis?",
          questionid: "3",
          QuestionType: "tick",
          QuestionType2: "tick",
          Answer: "",
          AnswerOptions: ["0", "1", "2", "3", "4", "5", ">5"]),
      Question(
          id: "4",
          content:
              "How many times did you receive a blood-transfusion in the last 6 months?",
          questionid: "4",
          QuestionType: "tick",
          QuestionType2: "tick",
          Answer: "",
          AnswerOptions: ["0", "1", "2", "3", "4", "5", ">5"])
    ];

  bool isloading = true;
  Future<void> GetData() async {
    final prefs = await SharedPreferences.getInstance();
    userid = prefs.getString("userid").toString();
    setState(() {
      isloading = false;
    });
  }

  Future<void> SaveData() async {
    setState(() {
      isloading = true;
    });
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      userid = (prefs.getString("userid").toString());
    });

    // final UsersDataTable = base('users_data');
    // var filterByFormula = ' {user_id} = \'${userid}\'';
    // final user_data_record =
    //     await UsersDataTable.select(filterBy: (filterByFormula));

    // await UsersDataTable.update(user_data_record[0]['id'].toString(),
    //     {"disease_question": jsonEncode(allQuestions)});
    setState(() {
      isloading = false;
    });
  }

  Future<void> FinishOnboarding() async {
    setState(() {
      isloading = true;
    });
    Navigator.pushReplacement(
      context,
      MaterialPageRoute(
        builder: (context) => MainScreen(),
      ),
    );
    setState(() {
      isloading = false;
    });
  }

  @override
  initState() {
    super.initState();
    GetData();
  }

  @override
  Widget build(BuildContext context) {
    var size = MediaQuery.of(context).size;
    var questionnaireViewmodel = ref.watch(questionnaireProvider);
  
    Widget renderSections() {
      return Column(
        children: [
          Stack(
            alignment: Alignment.bottomCenter,
            children: [
              Container(
                width: size.width,
                height: size.height - size.height / 9,
                child: ListView.builder(
                  padding: const EdgeInsets.only(bottom: 40),
                  itemCount: allQuestions.length,
                  itemBuilder: ((context, index) => QuestionWidget(
                        question: allQuestions[index],
                      )),
                ),
              ),
              Container(
                margin: const EdgeInsets.only(
                    top: 0, left: 24, right: 24, bottom: 24),
                child: GestureDetector(
                  onTap: () async {
                    await SaveData();
                    questionnaireViewmodel.updateIndex(1);
                  },
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
                        child: Text(
                          "Next",
                          style: GoogleFonts.getFont('Lexend Deca',
                              fontSize: 16, color: Colors.white),
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            ],
          )
        ],
      );
    }

    return Scaffold(
      backgroundColor: Color.fromARGB(255, 255, 255, 255),
      body: SingleChildScrollView(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.start,
          children: isloading == true
              ? [
                  Container(
                    height: size.height,
                    width: size.width,
                    child: Center(
                        child: Container(
                            height: 150,
                            width: 150,
                            child: const SizedBox(
                              child: CircularProgressIndicator(
                                color: Color(0xFFF06129),
                              ),
                              height: 150.0,
                              width: 150.0,
                            ))),
                  )
                ]
              : [
                  isloading == false
                      ? const SizedBox(
                          height: 80,
                        )
                      : const Text(""),
                  IndexedStack(
                      index: questionnaireViewmodel.selectedIndex,
                      children: [
                        renderSections(),
                        Column(
                          children: [
                            SizedBox(
                              height: size.height / 8,
                            ),
                            Center(
                              child: Image.asset(
                                "assets/images/welldone.gif",
                                width: 200,
                              ),
                            ),
                            Container(
                              margin:
                                  EdgeInsets.only(left: 20, right: 20, top: 40),
                              child: Text(
                                  "You have filled your personal information. You can now explore your dashboard",
                                  textAlign: TextAlign.center,
                                  style: GoogleFonts.getFont('Lexend Deca',
                                      color: Color(0xFF423838),
                                      fontSize: 24,
                                      fontWeight: FontWeight.w700)),
                            ),
                            const SizedBox(
                              height: 12,
                            ),
                            Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  GestureDetector(
                                    onTap: () async {
                                      FinishOnboarding();
                                    },
                                    child: Material(
                                      borderRadius: BorderRadius.circular(8),
                                      elevation: 2,
                                      child: Container(
                                        padding: const EdgeInsets.only(
                                            top: 0,
                                            left: 10,
                                            right: 10,
                                            bottom: 0),
                                        height: 40,
                                        decoration: BoxDecoration(
                                          borderRadius:
                                              BorderRadius.circular(8),
                                          color: const Color(0xFFF06129),
                                        ),
                                        child: Center(
                                          child: Text(
                                            "Finish",
                                            style: GoogleFonts.getFont(
                                                'Lexend Deca',
                                                fontSize: 16,
                                                color: Colors.white),
                                          ),
                                        ),
                                      ),
                                    ),
                                  ),
                                ]),
                          ],
                        )
                      ])
                ],
        ),
      ),
    );
  }
}

class QuestionWidget extends StatefulWidget {
  final Question question;
  const QuestionWidget({Key? key, required this.question});

  @override
  _QuestionWidget createState() => _QuestionWidget();
}

class _QuestionWidget extends State<QuestionWidget> {
  @override
  Widget build(BuildContext context) {
    var size = MediaQuery.of(context).size;
    final Question question = widget.question;
    List<Widget> renderAnswers() {
      List<Widget> allAns = question.AnswerOptions!.map((item) {
        return Row(
          children: [
            GestureDetector(
              onTap: () {
                setState(() {
                  question.Answer = item;
                });
              },
              child: Container(
                  margin: const EdgeInsets.only(left: 24, right: 24),
                  child: question.Answer != item
                      ? Image.asset("assets/images/moods/back-no.png")
                      : Image.asset("assets/images/moodspressed/back-yes.png")),
            ),
            Text(item.toString())
          ],
        );
      }).toList();
      return allAns;
    }

    ;
    return Container(
      width: size.width,
      margin: const EdgeInsets.only(left: 16, right: 16, bottom: 32),
      padding: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(12),
        color: const Color(
          0xFFFEE4CA,
        ),
      ),
      child: Column(
        children: [
          Container(
            margin: const EdgeInsets.only(top: 24, bottom: 24),
            padding: const EdgeInsets.only(left: 48, right: 48),
            child: Text(
              question.id + ". " + question.content,
              textAlign: TextAlign.center,
              style: GoogleFonts.getFont('Lexend Deca',
                  color: const Color(0xFF423838),
                  fontSize: 16,
                  fontWeight: FontWeight.w700),
            ),
          ),
          Column(
            mainAxisSize: MainAxisSize.min,
            children: renderAnswers(),
          )
        ],
      ),
    );
  }
}
