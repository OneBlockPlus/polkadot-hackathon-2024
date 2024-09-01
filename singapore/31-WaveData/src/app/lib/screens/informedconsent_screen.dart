import 'dart:convert';
import 'dart:typed_data';
import 'dart:ui';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';

import 'package:http/http.dart' as http;
import 'package:wavedata/components/signature_modal.dart';
import 'package:wavedata/model/airtable_api.dart';
import 'package:wavedata/model/question.dart';
import 'package:wavedata/screens/connect_data.dart';
import 'package:wavedata/screens/main_screen.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:wavedata/model/informed_consent/ages.dart';
import 'package:flutter_html/flutter_html.dart';

import 'package:wavedata/model/informed_consent/subject.dart';
import 'package:wavedata/providers/navbar_provider.dart';
import 'package:wavedata/providers/questionnaire_provider.dart';
import 'package:wavedata/screens/journal_screen.dart';
import 'package:signature/signature.dart';
import 'package:youtube_player_flutter/youtube_player_flutter.dart';

class InformedConsentScreen extends ConsumerStatefulWidget {
  const InformedConsentScreen({Key? key}) : super(key: key);

  @override
  ConsumerState<InformedConsentScreen> createState() =>
      _InformedConsentScreenState();
}

class _InformedConsentScreenState extends ConsumerState<InformedConsentScreen> {
  var POSTheader = {
    "Accept": "application/json",
    "Content-Type": "application/x-www-form-urlencoded"
  };
  String baseURL = 'http://localhost:3000';

  var ages_groups = [];
  var study_title = "";
  List<Subject> subjects = [];
  String study_id = "-1";
  String UserName = "";
  String LoadingText = "";
  bool isloading = true;
  Map<String, dynamic> StudyDetails = {};

  void UpdateLoading(bool status) {
    isloading = status;
  }

  Future<void> GetData() async {
    final prefs = await SharedPreferences.getInstance();
    String studyid = prefs.getString("studyid").toString();
    String userid = prefs.getString("userid").toString();

    ages_groups = [];
    subjects = [];

    var url = Uri.parse(
        '${baseURL}/api/GET/Study/GetInformedConsent?study_id=${studyid}&user_id=${userid}');
    final response = await http.get(url);
    var responseData = jsonDecode(response.body);
    var value = jsonDecode(responseData['value']);

    List<Ages> dataAge = (value["eligible_age_group"] as List).map((e) {
      return Ages.fromMap((e as Map<String, dynamic>));
    }).toList();

    final studySubjectsTable = base('study_subjects');
    final filterByFormula = ' {study_id} = \'${studyid}\'';
    var sort = [
      {"field": "Order_ID", "direction": "asc"}
    ];

    final subjects_records = await studySubjectsTable.select(
        filterBy: (filterByFormula), sortBy: sort);

    List<Map<String, dynamic>> newSubjects = [];
    for (var element in subjects_records) {
      var subjectElement = element;
      var age = dataAge[0];
      var eligibleAgesAns = (dataAge.length > 0)
          ? json.decode(subjectElement['ages_ans'])[age.id]
          : {};

      newSubjects.add({
        'subject_id': subjectElement['subject_id'],
        'study_id': subjectElement['study_id'],
        'subject_index_id': subjectElement['subject_index_id'],
        'title': subjectElement['title'],
        'ages_ans': eligibleAgesAns,
      });
    }

    List<Subject> dataSubjects = (newSubjects as List).map((e) {
      return Subject.fromMap((e as Map<String, dynamic>));
    }).toList();

    var studytitle = (value['study_title'].toString());

    setState(() {
      ages_groups = dataAge;
      subjects = dataSubjects;
      study_title = studytitle;
      isloading = false;
      study_id = studyid;
      StudyDetails = value;
    });
  }

  Future<void> FinishIC() async {
    setState(() {
      LoadingText =  "Thank you for sending your informed consent. We are now checking the outcomes, which can take around one minute. Please wait";
      isloading = true;
    });

    final prefs = await SharedPreferences.getInstance();
    String userid = (prefs.getString("userid").toString());
    String studyid = (study_id);

    var url =
        Uri.parse('${baseURL}/api/POST/Study/CreateCompletedInformedConsent');
    await http.post(url, headers: POSTheader, body: {
      'userid': userid.toString(),
      'date': DateTime.now().toIso8601String(),
      'studyid': studyid.toString()
    });

    var given_permission = {
      "family": true,
      "given": false,
      "gender": false,
      "phone": false,
      "about": false,
      "blood": true,
      "sleep": true,
      "steps": true,
      "calories": true
    };

    String JsonMadePermission = given_permission.toString();

    var url2 = Uri.parse('${baseURL}/api/POST/Study/CreateOngoingStudy');
    await http.post(url2, headers: POSTheader, body: {
      'studyid': studyid.toString(),
      'userid': userid.toString(),
      'given_permission': JsonMadePermission
    });
    await Future.delayed(Duration(seconds: 2));

     
    setState(() {
         LoadingText =  "";
      isloading = false;
    });
  }

  @override
  initState() {
    GetData();
    super.initState();
  }

  var initialized = false;

  @override
  Widget build(BuildContext context) {
    var questionnaireViewmodel = ref.watch(questionnaireProvider);
    var navbarViewmodel = ref.watch(navbarProvider);

    if (initialized == false) {
      questionnaireViewmodel.selectedIndex = 0;
      navbarViewmodel.selectedIndex = (4);
      navbarViewmodel.notifyListeners();
      initialized = true;
    }
    return Scaffold(
      appBar: AppBar(
          automaticallyImplyLeading: false,
          toolbarHeight: 80,
          backgroundColor: Color(0xFFF06129),
          title: Container(
              height: 80,
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                crossAxisAlignment: CrossAxisAlignment.end,
                children: <Widget>[
                  IconButton(
                    iconSize: 20,
                    onPressed: () {
                      if (questionnaireViewmodel.selectedIndex > 0) {
                        questionnaireViewmodel.updateIndex(
                            questionnaireViewmodel.selectedIndex - 1);
                      } else {
                        Navigator.pop(context);
                      }
                    },
                    icon: Icon(Icons.arrow_back, color: Colors.white),
                  ),
                  Container(width: 300 - 30),
                  questionnaireViewmodel.selectedIndex - 1 != subjects.length
                      ? IconButton(
                          iconSize: 20,
                          onPressed: () {
                            if (questionnaireViewmodel.selectedIndex > 0) {
                              questionnaireViewmodel.updateIndex(
                                  questionnaireViewmodel.selectedIndex + 1);
                            }
                          },
                          icon: Icon(Icons.arrow_forward, color: Colors.white),
                        )
                      : Text(""),
                ],
              ))),
      backgroundColor:Colors.white,
      body: InformConsent(
          isloading,
          LoadingText,
          UpdateLoading,
          ages_groups,
          study_title,
          subjects,
          questionnaireViewmodel,
          study_id,
          FinishIC,
          UserName),
    );
  }
}

class InformConsent extends StatefulWidget {
  final isloading;
  final loadingText;
  final ages_groups;
  final study_title;
  final UserName;
  final List<Subject> subjects;
  final questionnaireViewmodel;
  final Function UpdateLoading;
  final Function FinishIC;

  final String study_id;

  InformConsent(
      this.isloading,
      this.loadingText,
      this.UpdateLoading,
      this.ages_groups,
      this.study_title,
      this.subjects,
      this.questionnaireViewmodel,
      this.study_id,
      this.FinishIC,
      this.UserName);

  @override
  _InformConsentState createState() => _InformConsentState();
}

class _InformConsentState extends State<InformConsent> {
  @override
  Widget build(BuildContext context) {
    var size = MediaQuery.of(context).size;
    // scroll controller
    late ScrollController _scrollController = ScrollController();

    void _scrollToTop() {
      _scrollController.animateTo(0,
          duration: const Duration(seconds: 0), curve: Curves.linear);
    }

    var isloading = widget.isloading;
    var loadingText = widget.loadingText;
    var ages_groups = widget.ages_groups;
    var study_title = widget.study_title;
    String UserName = widget.UserName;
    var questionnaireViewmodel = widget.questionnaireViewmodel;
    List<Subject> subjects = widget.subjects;
    Function UpdateLoading = widget.UpdateLoading;
    Function FinishIC = widget.FinishIC;

    String study_id = widget.study_id;

    void GoToNextUrl() {
      UpdateLoading(true);

      questionnaireViewmodel
          .updateIndex(questionnaireViewmodel.selectedIndex + 1);
      _scrollToTop();
      UpdateLoading(false);
    }

    List<Widget> renderSections() {
      List<Widget> allsection = [];

      allsection.add(Column(children: [
        Container(
          margin: EdgeInsets.only(top: 64, bottom: 20),
          child: Image.asset(
            "assets/images/heart.gif",
            width: 250,
          ),
        ),
        const SizedBox(
          height: 12,
        ),
        Container(
          margin: EdgeInsets.only(left: 20, right: 20, top: 40),
          child: Text(
              "You will now go through the information about the study in " +
                  subjects.length.toString() +
                  " questions. And after you have read the information you can decide if you want to go ahead with the consent.",
              textAlign: TextAlign.center,
              style: GoogleFonts.getFont('Lexend Deca',
                  color: Color(0xFF423838),
                  fontSize: 16,
                  fontWeight: FontWeight.w700)),
        ),
        const SizedBox(
          height: 12,
        ),
        Container(
          width: (size.width - (24 * 3)),
          margin:
              const EdgeInsets.only(left: (24), top: 20, right: 24, bottom: 24),
          child: GestureDetector(
            onTap: () async {
              GoToNextUrl();
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
      ]));

      allsection.addAll(subjects.map((e) {
        TextEditingController AnswerBox = new TextEditingController();

        return SingleChildScrollView(
          controller: _scrollController,
          child:
              Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Container(
              margin: EdgeInsets.only(left: 48, right: 48, top: 40),
              child: Text(study_title,
                  textAlign: TextAlign.center,
                  style: GoogleFonts.getFont('Lexend Deca',
                      color: Color(0xFF423838),
                      fontSize: 24,
                      fontWeight: FontWeight.w700)),
            ),
            const SizedBox(
              height: 12,
            ),
            Container(
              width: size.width,
              margin: const EdgeInsets.only(left: 16, right: 16),
              padding: const EdgeInsets.only(bottom: 12),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(12),
                color: const Color(
                  0xFFFEE4CA,
                ),
              ),
              child: QuestionWidget(
                subject: e,
                size: size,
                UserName: UserName,
              ),
            ),
            Visibility(
                visible: questionnaireViewmodel.selectedIndex > 0 &&
                    questionnaireViewmodel.selectedIndex < subjects.length + 1,
                child: Container(
                  height: 100,
                  child: Text(""),
                ))
          ]),
        );
      }).toList());
      var allDeclerationOfConsent = [
        Question(
            id: "0",
            questionid: "0",
            QuestionType2: "",
            QuestionType: "",
            content: "I understood the information.",
            Answer: ""),
        Question(
            id: "0",
            questionid: "0",
            QuestionType2: "",
            QuestionType: "",
            content: "I could also ask questions.",
            Answer: ""),
        Question(
            id: "0",
            questionid: "0",
            QuestionType2: "",
            QuestionType: "",
            content: "My questions have been answered.",
            Answer: ""),
        Question(
            id: "0",
            questionid: "0",
            QuestionType2: "",
            QuestionType: "",
            content: "I had plenty of time to decide if I would participate.",
            Answer: ""),
        Question(
            id: "0",
            questionid: "0",
            QuestionType2: "",
            QuestionType: "",
            content: "I know I'm not obligated to participate.",
            Answer: ""),
        Question(
            id: "0",
            questionid: "0",
            QuestionType2: "",
            QuestionType: "",
            content:
                "I understand that I can always stop if I don't want to participate.",
            Answer: ""),
        Question(
            id: "0",
            questionid: "0",
            QuestionType2: "",
            QuestionType: "",
            content:
                "I give permission that my data will processed and used as mentioned in the information letter..",
            Answer: ""),
        Question(
            id: "0",
            questionid: "0",
            QuestionType2: "",
            QuestionType: "",
            content:
                "** I give permission that during the study my doctor will provide some medical information on my behalf.",
            Answer: ""),
        Question(
            id: "0",
            questionid: "0",
            QuestionType2: "",
            QuestionType: "",
            content:
                "** I give permission to ask me for a follow-up study later.",
            Answer: ""),
        Question(
            id: "0",
            questionid: "0",
            QuestionType2: "",
            QuestionType: "",
            content: "I want to participate in this research.",
            Answer: ""),
        Question(
            id: "0",
            questionid: "0",
            QuestionType2: "",
            QuestionType: "",
            content: "Signature",
            Answer: ""),
      ];

      allsection.add(
          // Delecration Of Consent                     //Hard Coded
          Column(
        children: [
          Container(
            child: Column(
              children: [
                Container(
                  child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Container(
                          child: Text(
                            "Declaration of consent",
                            textAlign: TextAlign.center,
                            style: GoogleFonts.getFont('Lexend Deca',
                                color: const Color(0xFF423838),
                                fontSize: 24,
                                fontWeight: FontWeight.w700),
                          ),
                        )
                      ]),
                ),
                const SizedBox(
                  height: 12,
                ),
                Stack(
                  alignment: Alignment.bottomCenter,
                  children: [
                    Container(
                      width: size.width,
                      height: size.height - 122,
                      child: ListView.builder(
                        padding: const EdgeInsets.only(bottom: 80),
                        itemCount: allDeclerationOfConsent.length,
                        itemBuilder: ((context, index) => QuestionYesNoWidget(
                              question: allDeclerationOfConsent[index],
                            )),
                      ),
                    ),
                    Container(
                      margin: const EdgeInsets.only(
                          top: 0, left: 24, right: 24, bottom: 24),
                      child: GestureDetector(
                        onTap: () async {
                          await FinishIC();
                          questionnaireViewmodel.updateIndex(questionnaireViewmodel.selectedIndex + 1);
                          _scrollToTop();
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
                                "I want to join the study",
                                style: GoogleFonts.getFont('Lexend Deca',
                                    fontSize: 16, color: Colors.white),
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          )
        ],
      ));

      allsection.add(
          // Last page
          Column(
        children: [
          Center(
            child: Image.asset(
              "assets/images/welldone.gif",
              width: 200,
            ),
          ),
          Container(
            margin: EdgeInsets.only(left: 20, right: 20, top: 40),
            child: Text("Your informed consent is approved",
                textAlign: TextAlign.center,
                style: GoogleFonts.getFont('Lexend Deca',
                    color: Color(0xFF423838),
                    fontSize: 24,
                    fontWeight: FontWeight.w700)),
          ),
          const SizedBox(
            height: 12,
          ),
          Row(mainAxisAlignment: MainAxisAlignment.center, children: [
            GestureDetector(
              onTap: () async {
               Navigator.pushReplacement(
      context,
      MaterialPageRoute(
        builder: (context) => ConnectDataScreen(),
      ),
    );
              },
              child: Material(
                borderRadius: BorderRadius.circular(8),
                elevation: 2,
                child: Container(
                  padding: const EdgeInsets.only(
                      top: 0, left: 10, right: 10, bottom: 0),
                  height: 40,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(8),
                    color: const Color(0xFFF06129),
                  ),
                  child: Center(
                    child: Text(
                      "Let's connect your medical data",
                      style: GoogleFonts.getFont('Lexend Deca',
                          fontSize: 16, color: Colors.white),
                    ),
                  ),
                ),
              ),
            ),
          ]),

          // Row(mainAxisAlignment: MainAxisAlignment.center, children: [
          //   GestureDetector(
          //     onTap: () async {
          //       await FinishIC();
          //     },
          //     child: Container(
          //       margin: const EdgeInsets.only(top: 24),
          //       child: Image.asset("assets/images/check.png"),
          //     ),
          //   )
          // ]),
        ],
      ));

      return allsection;
    }

    return Column(
        children: isloading == true
            ? [
                Expanded(
                    child: Center(
                        child: Container(
                              margin: EdgeInsets.only(left: 20, right: 20, top: 80),
                          child:  Column(
                          
                  children: [
                    Text(
                        loadingText,
                        textAlign: TextAlign.center,
                        style: GoogleFonts.getFont('Lexend Deca',
                            color: Color(0xFF423838),
                            fontSize: 16,
                            fontWeight: FontWeight.w700)),
                    Container(
                       margin: EdgeInsets.only(top: 40),
                        height: 150,
                        width: 150,
                        child: const SizedBox(
                          child: CircularProgressIndicator(
                            color: Color(0xFFF06129),
                          ),
                          height: 150.0,
                          width: 150.0,
                        ))
                  ],
                ))))
              ]
            : [
                Expanded(
                  child: Stack(
                    alignment: Alignment.topCenter,
                    children: [
                      IndexedStack(
                        index: questionnaireViewmodel.selectedIndex,
                        children: renderSections(),
                      ),

                      // Bottom navigation buttons
                      Visibility(
                        visible: questionnaireViewmodel.selectedIndex > 0 &&
                            questionnaireViewmodel.selectedIndex <
                                subjects.length + 1,
                        child: Positioned(
                            bottom: 0,
                            left: 0,
                            right: 0,
                            child: Container(
                              decoration: BoxDecoration(color: Colors.white),
                              child: Column(
                                children: [
                                  Row(
                                    //Hard Coded
                                    mainAxisAlignment:
                                        MainAxisAlignment.spaceEvenly,
                                    children: [
                                      Visibility(
                                        visible: questionnaireViewmodel
                                                .selectedIndex >
                                            1,
                                        child: Container(
                                          width: (size.width - (24 * 3)) / 2,
                                          margin: const EdgeInsets.only(
                                              top: 20, left: 24, bottom: 24),
                                          child: GestureDetector(
                                            onTap: () async {
                                              questionnaireViewmodel
                                                  .updateIndex(
                                                      questionnaireViewmodel
                                                              .selectedIndex -
                                                          1);
                                              _scrollToTop();
                                            },
                                            child: Material(
                                              borderRadius:
                                                  BorderRadius.circular(8),
                                              elevation: 2,
                                              child: Container(
                                                height: 40,
                                                decoration: BoxDecoration(
                                                  borderRadius:
                                                      BorderRadius.circular(8),
                                                  color:
                                                      const Color(0xFFF06129),
                                                ),
                                                child: Center(
                                                  child: Text(
                                                    "Previous",
                                                    style: GoogleFonts.getFont(
                                                        'Lexend Deca',
                                                        fontSize: 16,
                                                        color: Colors.white),
                                                  ),
                                                ),
                                              ),
                                            ),
                                          ),
                                        ),
                                      ),
                                      Container(
                                        width: questionnaireViewmodel
                                                    .selectedIndex >
                                                0
                                            ? (size.width - (24 * 3)) / 2
                                            : (size.width - (24 * 3)),
                                        margin: const EdgeInsets.only(
                                            left: (24),
                                            top: 20,
                                            right: 24,
                                            bottom: 24),
                                        child: GestureDetector(
                                          onTap: () async {
                                            GoToNextUrl();
                                          },
                                          child: Material(
                                            borderRadius:
                                                BorderRadius.circular(8),
                                            elevation: 2,
                                            child: Container(
                                              height: 40,
                                              decoration: BoxDecoration(
                                                borderRadius:
                                                    BorderRadius.circular(8),
                                                color: const Color(0xFFF06129),
                                              ),
                                              child: Center(
                                                child: Text(
                                                  "Next",
                                                  style: GoogleFonts.getFont(
                                                      'Lexend Deca',
                                                      fontSize: 16,
                                                      color: Colors.white),
                                                ),
                                              ),
                                            ),
                                          ),
                                        ),
                                      ),
                                    ],
                                  )
                                ],
                              ),
                            )),
                      )
                    ],
                  ),
                )
              ]);
  }
}

class QuestionYesNoWidget extends StatefulWidget {
  final Question question;
  const QuestionYesNoWidget({Key? key, required this.question});

  @override
  _QuestionYesNoWidget createState() => _QuestionYesNoWidget();
}

class _QuestionYesNoWidget extends State<QuestionYesNoWidget> {
  @override
  Widget build(BuildContext context) {
    var size = MediaQuery.of(context).size;

    final Question question = widget.question;
    TextEditingController AnswerBox = new TextEditingController();
    Uint8List? signatureImage;
    final SignatureController signature_controller = SignatureController(
      penStrokeWidth: 4.0,
      penColor: Colors.black,
    );

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
              question.content.toString(),
              textAlign: TextAlign.left,
              style: GoogleFonts.getFont('Lexend Deca',
                  color: const Color(0xFF423838),
                  fontSize: 16,
                  fontWeight: FontWeight.w700),
            ),
          ),
          question.content == "Signature"
              ? Column(
                  children: [
                    Container(
                        margin: const EdgeInsets.only(
                            right: 10, bottom: 10, left: 10),
                        child: Text(
                          "When everything is clear, please give your signature below",
                          textAlign: TextAlign.left,
                          style: GoogleFonts.getFont('Lexend Deca',
                              color: const Color(0xFF423838),
                              fontSize: 12,
                              fontWeight: FontWeight.w700),
                        )),
                    Column(children: [
                      GestureDetector(
                        onTap: () async {
                          await Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (context) =>
                                  SignatureModal(signature_controller),
                            ),
                          );
                          setState(() async {
                            signatureImage =
                                await signature_controller.toPngBytes();
                          });
                        },
                        child: Container(
                          width: 100,
                          height: 100,
                          decoration: BoxDecoration(
                            border: Border.all(color: Color(0xFFF06129)),
                          ),
                          child: signatureImage != null
                              ? Image.memory(signatureImage!)
                              : Icon(
                                  Icons.edit,
                                  size: 50,
                                  color: Color(0xFFF06129),
                                ),
                        ),
                      ),
                    ]),
                  ],
                )
              : Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Row(
                      children: [
                        GestureDetector(
                          onTap: () {
                            setState(() {
                              question.Answer = "Yes";
                            });
                          },
                          child: Container(
                              margin:
                                  const EdgeInsets.only(left: 24, right: 24),
                              child: question.Answer != "Yes"
                                  ? Image.asset(
                                      "assets/images/moods/back-yes.png")
                                  : Image.asset(
                                      "assets/images/moodspressed/back-yes.png")),
                        ),
                        const Text("Yes")
                      ],
                    ),
                    Row(
                      children: [
                        GestureDetector(
                          onTap: () {
                            setState(() {
                              question.Answer = "No";
                            });
                          },
                          child: Container(
                              margin:
                                  const EdgeInsets.only(left: 24, right: 24),
                              child: question.Answer != "No"
                                  ? Image.asset(
                                      "assets/images/moods/back-no.png")
                                  : Image.asset(
                                      "assets/images/moodspressed/back-no.png")),
                        ),
                        const Text("No")
                      ],
                    )
                  ],
                )
        ],
      ),
    );
  }
}

class QuestionWidget extends StatefulWidget {
  final Subject subject;
  final Size size;
  final String UserName;
  const QuestionWidget({
    Key? key,
    required this.subject,
    required this.size,
    required this.UserName,
  });

  @override
  _QuestionWidget createState() => _QuestionWidget();
}

class _QuestionWidget extends State<QuestionWidget> {
  @override
  Widget build(BuildContext context) {
    final Subject subject = widget.subject;
    final String UserName = widget.UserName;
    final Size size = widget.size;
    TextEditingController AnswerBox = new TextEditingController();
    TextEditingController ImageBox = new TextEditingController();

    var question = subject.ages_ans;

    Container GetUrlView() {
      if (subject.ages_ans!.urlType == "image") {
        return Container(
          margin: const EdgeInsets.only(right: 10, bottom: 20, left: 10),
          child: Container(
            child: Image.network(subject.ages_ans!.urlText.toString()),
            height: 200,
          ),
        );
      }
      if (subject.ages_ans!.urlType == "upload") {
        return Container(
          margin: const EdgeInsets.only(right: 10, bottom: 20, left: 10),
          child: TextField(
            controller: AnswerBox,
            keyboardType: TextInputType.url,
            decoration: const InputDecoration(
                fillColor: Colors.white,
                filled: true,
                hintText: "https://image.com/example.png"),
          ),
        );
      }
      if (subject.ages_ans!.urlType == "video") {
        return Container(
          margin: const EdgeInsets.only(right: 10, bottom: 20, left: 10),
          child: Container(
              child: Html(
                  data: '<iframe height="180" width="340" src="https://www.youtube.com/embed/' +
                      YoutubePlayer.convertUrlToId(
                              subject.ages_ans!.urlText.toString())
                          .toString() +
                      '" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; web-share" allowfullscreen></iframe>')),
        );
      }

      return Container();
    }

    if (question!.type == "rating" && question!.questiontype2 == "1-5") {
      return Column(
        children: [
          Container(
            margin: const EdgeInsets.only(top: 24, bottom: 24),
            padding: const EdgeInsets.only(left: 48, right: 48),
            child: Text(
              subject.title,
              textAlign: TextAlign.left,
              style: GoogleFonts.getFont('Lexend Deca',
                  color: const Color(0xFF423838),
                  fontSize: 16,
                  fontWeight: FontWeight.w700),
            ),
          ),
          GetUrlView(),
          Container(
            margin: const EdgeInsets.only(left: 24, right: 24),
            child: Expanded(
              child: Text(
                subject.ages_ans!.answer.replaceAll("{patient_name}", UserName),
                textAlign: TextAlign.justify,
                style: GoogleFonts.getFont('Lexend Deca',
                    color: const Color(0xFF423838),
                    fontSize: 14,
                    letterSpacing: 0.82,
                    fontWeight: FontWeight.w400),
              ),
            ),
          ),
          Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Row(
                children: [
                  GestureDetector(
                    onTap: () {
                      setState(() {
                        question.GivenAnswer = "5";
                      });
                    },
                    child: Container(
                        margin: const EdgeInsets.only(left: 24, right: 24),
                        child: question.GivenAnswer != "5"
                            ? Image.asset(
                                "assets/images/moods/5.png",
                              )
                            : Image.asset(
                                "assets/images/moodspressed/5.png",
                              )),
                  ),
                  const Text("Excellent")
                ],
              ),
              Row(
                children: [
                  GestureDetector(
                    onTap: () {
                      setState(() {
                        question.GivenAnswer = "4";
                      });
                    },
                    child: Container(
                        margin: const EdgeInsets.only(left: 24, right: 24),
                        child: question.GivenAnswer != "4"
                            ? Image.asset(
                                "assets/images/moods/4.png",
                              )
                            : Image.asset(
                                "assets/images/moodspressed/4.png",
                              )),
                  ),
                  const Text("Very good")
                ],
              ),
              Row(
                children: [
                  GestureDetector(
                    onTap: () {
                      setState(() {
                        question.GivenAnswer = "3";
                      });
                    },
                    child: Container(
                        margin: const EdgeInsets.only(left: 24, right: 24),
                        child: question.GivenAnswer != "3"
                            ? Image.asset(
                                "assets/images/moods/3.png",
                              )
                            : Image.asset(
                                "assets/images/moodspressed/3.png",
                              )),
                  ),
                  const Text("Good")
                ],
              ),
              Row(
                children: [
                  GestureDetector(
                    onTap: () {
                      setState(() {
                        question.GivenAnswer = "2";
                      });
                    },
                    child: Container(
                        margin: const EdgeInsets.only(left: 24, right: 24),
                        child: question.GivenAnswer != "2"
                            ? Image.asset(
                                "assets/images/moods/2.png",
                              )
                            : Image.asset(
                                "assets/images/moodspressed/2.png",
                              )),
                  ),
                  const Text("Fair")
                ],
              ),
              Row(
                children: [
                  GestureDetector(
                    onTap: () {
                      setState(() {
                        question.GivenAnswer = "1";
                      });
                    },
                    child: Container(
                        margin: const EdgeInsets.only(left: 24, right: 24),
                        child: question.GivenAnswer != "1"
                            ? Image.asset(
                                "assets/images/moods/1.png",
                              )
                            : Image.asset(
                                "assets/images/moodspressed/1.png",
                              )),
                  ),
                  const Text("Poor")
                ],
              )
            ],
          )
        ],
      );
    } else if (question.type == "rating" && question.questiontype2 == "1-3") {
      return Column(
        children: [
          Container(
            margin: const EdgeInsets.only(top: 24, bottom: 24),
            padding: const EdgeInsets.only(left: 48, right: 48),
            child: Text(
              subject.title,
              textAlign: TextAlign.left,
              style: GoogleFonts.getFont('Lexend Deca',
                  color: const Color(0xFF423838),
                  fontSize: 16,
                  fontWeight: FontWeight.w700),
            ),
          ),
          GetUrlView(),
          Row(mainAxisAlignment: MainAxisAlignment.center, children: [
            Expanded(
              child: Text(
                subject.ages_ans!.answer,
                textAlign: TextAlign.left,
                style: GoogleFonts.getFont('Lexend Deca',
                    color: const Color(0xFF423838),
                    fontSize: 14,
                    letterSpacing: 0.82,
                    fontWeight: FontWeight.w400),
              ),
            ),
          ]),
          Container(
              margin: const EdgeInsets.only(top: 10, bottom: 24),
              padding: const EdgeInsets.only(left: 24, right: 24),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.start,
                children: [
                  Text("Questions for researcher (Optional):",
                      textAlign: TextAlign.left),
                  Container(
                    margin: const EdgeInsets.only(top: 15),
                    child: TextField(
                      controller: AnswerBox,
                      keyboardType: TextInputType.multiline,
                      maxLines: 4,
                      decoration: const InputDecoration(
                          fillColor: Colors.white, filled: true),
                    ),
                  )
                ],
              )),
          Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Row(
                children: [
                  GestureDetector(
                    onTap: () {
                      setState(() {
                        question.GivenAnswer = "3";
                      });
                    },
                    child: Container(
                        margin: const EdgeInsets.only(left: 24, right: 24),
                        child: question.GivenAnswer != "3"
                            ? Image.asset(
                                "assets/images/moods/5.png",
                              )
                            : Image.asset(
                                "assets/images/moodspressed/5.png",
                              )),
                  ),
                  const Text("Excellent")
                ],
              ),
              Row(
                children: [
                  GestureDetector(
                    onTap: () {
                      setState(() {
                        question.GivenAnswer = "2";
                      });
                    },
                    child: Container(
                        margin: const EdgeInsets.only(left: 24, right: 24),
                        child: question.GivenAnswer != "2"
                            ? Image.asset("assets/images/moods/3.png")
                            : Image.asset("assets/images/moodspressed/3.png")),
                  ),
                  const Text("Good")
                ],
              ),
              Row(
                children: [
                  GestureDetector(
                    onTap: () {
                      setState(() {
                        question.GivenAnswer = "1";
                      });
                    },
                    child: Container(
                        margin: const EdgeInsets.only(left: 24, right: 24),
                        child: question.GivenAnswer != "1"
                            ? Image.asset("assets/images/moods/1.png")
                            : Image.asset("assets/images/moodspressed/1.png")),
                  ),
                  const Text("Poor")
                ],
              )
            ],
          )
        ],
      );
    } else if (question.type == "open") {
      return Column(children: [
        Container(
          margin: const EdgeInsets.only(top: 24, bottom: 24),
          padding: const EdgeInsets.only(left: 48, right: 48),
          child: Text(
            subject.title,
            textAlign: TextAlign.left,
            style: GoogleFonts.getFont('Lexend Deca',
                color: const Color(0xFF423838),
                fontSize: 16,
                fontWeight: FontWeight.w700),
          ),
        ),
        GetUrlView(),
        Container(
          margin: const EdgeInsets.only(left: 24, right: 24),
          child: Row(mainAxisAlignment: MainAxisAlignment.center, children: [
            Expanded(
              child: Text(
                subject.ages_ans!.answer,
                textAlign: TextAlign.left,
                style: GoogleFonts.getFont('Lexend Deca',
                    color: const Color(0xFF423838),
                    fontSize: 14,
                    letterSpacing: 0.82,
                    fontWeight: FontWeight.w400),
              ),
            ),
          ]),
        ),
        Container(
            margin: const EdgeInsets.only(top: 24, bottom: 24),
            padding: const EdgeInsets.only(left: 24, right: 24),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.start,
              children: [
                Text("Questions for researcher (Optional):",
                    textAlign: TextAlign.left),
                Container(
                  margin: const EdgeInsets.only(top: 15),
                  child: TextField(
                    controller: AnswerBox,
                    keyboardType: TextInputType.multiline,
                    maxLines: 4,
                    onTap: () async {
                      await Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) =>
                              JournalScreen(AnswerBox, title: "Note"),
                        ),
                      );
                    },
                    decoration: const InputDecoration(
                        fillColor: Colors.white, filled: true),
                  ),
                )
              ],
            )),
        Container(
            margin: const EdgeInsets.only(top: 24, bottom: 24),
            padding: const EdgeInsets.only(left: 24, right: 24),
            child: TextField(
              controller: AnswerBox,
              keyboardType: TextInputType.multiline,
              maxLines: 4,
              onTap: () async {
                await Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => JournalScreen(AnswerBox),
                  ),
                );
              },
              decoration:
                  const InputDecoration(fillColor: Colors.white, filled: true),
            )),
      ]);
    }

    return Column(children: [
      Container(
        margin: const EdgeInsets.only(top: 24, bottom: 24),
        padding: const EdgeInsets.only(left: 48, right: 48),
        child: Text(
          subject.title,
          textAlign: TextAlign.left,
          style: GoogleFonts.getFont('Lexend Deca',
              color: const Color(0xFF423838),
              fontSize: 16,
              fontWeight: FontWeight.w700),
        ),
      ),
      GetUrlView(),
      Container(
        margin: const EdgeInsets.only(left: 24, right: 24),
        child: Row(mainAxisAlignment: MainAxisAlignment.center, children: [
          Expanded(
            child: Container(
                // Hard Coded
                margin: const EdgeInsets.only(top: 24, bottom: 24),
                padding: const EdgeInsets.only(left: 24, right: 24),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.start,
                  children: [
                    Text(
                      subject.ages_ans!.answer,
                      textAlign: TextAlign.left,
                      style: GoogleFonts.getFont('Lexend Deca',
                          color: const Color(0xFF423838),
                          fontSize: 14,
                          letterSpacing: 0.82,
                          fontWeight: FontWeight.w400),
                    ),
                    SizedBox(
                      height: 25,
                    ),
                    Text(
                      "Questions for researcher (Optional):",
                      textAlign: TextAlign.left,
                    ),
                    Container(
                      margin: const EdgeInsets.only(top: 15),
                      child: TextField(
                        controller: AnswerBox,
                        keyboardType: TextInputType.multiline,
                        maxLines: 4,
                        decoration: const InputDecoration(
                            fillColor: Colors.white, filled: true),
                      ),
                    )
                  ],
                )),
          ),
        ]),
      ),
    ]);
  }
}
