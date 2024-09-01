import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:wavedata/providers/feeling_provider.dart';
import 'package:wavedata/screens/connect_data.dart';
import 'package:wavedata/screens/questionnaire_screen.dart';

class FeelingScreen extends ConsumerWidget {
  const FeelingScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    var size = MediaQuery.of(context).size;

    var feelingViewmodel = ref.watch(feelingProvider);
//rgba(253, 249, 242, 1)
    return Scaffold(
      backgroundColor:Colors.white,
      body: SingleChildScrollView(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.start,
          children: [
            SizedBox(
              height: size.height / 8,
            ),
            Container(
              margin: EdgeInsets.only(top: 12, bottom: 32),
              child: Center(
                child: Image.asset(
                  "assets/images/heart.gif",
                  width: 220,
                ),
              ),
            ),
            IndexedStack(
              index: feelingViewmodel.selectedIndex,
              children: [
                Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      margin: EdgeInsets.only(left: 48, right: 48),
                      child: Text(
                        "How are you feeling right now?",
                        textAlign: TextAlign.center,
                        style: 
                          GoogleFonts.getFont('Lexend Deca',  color: Color(0xFF423838),fontSize: 24,fontWeight: FontWeight.w700)
                   
                      ),
                    ),
                    SizedBox(
                      height: 48,
                    ),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        GestureDetector(
                          onTap: () {
                            feelingViewmodel.updateIndex(1);
                          },
                          child: Container(
                              margin: EdgeInsets.only(left: 4, right: 4),
                              child: Image.asset("assets/images/moods/1.png")),
                        ),
                        GestureDetector(
                          onTap: () {
                            feelingViewmodel.updateIndex(1);
                          },
                          child: Container(
                              margin: EdgeInsets.only(left: 4, right: 4),
                              child: Image.asset("assets/images/moods/2.png")),
                        ),
                        GestureDetector(
                          onTap: () {
                            feelingViewmodel.updateIndex(1);
                          },
                          child: Container(
                              margin: EdgeInsets.only(left: 4, right: 4),
                              child: Image.asset("assets/images/moods/3.png")),
                        ),
                        GestureDetector(
                          onTap: () {
                            feelingViewmodel.updateIndex(1);
                          },
                          child: Container(
                              margin: EdgeInsets.only(left: 4, right: 4),
                              child: Image.asset("assets/images/moods/4.png")),
                        ),
                        GestureDetector(
                          onTap: () {
                            feelingViewmodel.updateIndex(1);
                          },
                          child: Container(
                              margin: EdgeInsets.only(left: 4, right: 4),
                              child: Image.asset("assets/images/moods/5.png")),
                        ),
                      ],
                    ),
                  ],
                ),
                //2nd page
                Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      margin: EdgeInsets.only(left: 48, right: 48),
                      child: Text(
                        "Let's add your blood pressures?",
                        textAlign: TextAlign.center,
                        style:   GoogleFonts.getFont('Lexend Deca',color: Color(0xFF423838),fontSize: 24,fontWeight: FontWeight.w700)
                      ),
                    ),
                    SizedBox(
                      height: 48,
                    ),
                    Container(
                      margin: EdgeInsets.only(
                          left: size.width / 4,
                          right: size.width / 4,
                          bottom: 24),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Container(
                            width: 60,
                            child: Column(
                              mainAxisSize: MainAxisSize.min,
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  "Top",
                                  style: 
                                   GoogleFonts.getFont('Lexend Deca', color: Color(0xFF9B9B9B),fontSize: 14,fontWeight: FontWeight.w600)
                                ),
                                TextField(
                                  keyboardType: TextInputType.number,
                                )
                              ],
                            ),
                          ),
                          Container(
                            width: 60,
                            child: Column(
                              mainAxisSize: MainAxisSize.min,
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  "Bottom",
                                  style: 
                                     GoogleFonts.getFont('Lexend Deca',color: Color(0xFF9B9B9B),fontSize: 14,fontWeight: FontWeight.w600)
                                ),
                                TextField(
                                  keyboardType: TextInputType.number,
                                )
                              ],
                            ),
                          )
                        ],
                      ),
                    ),
                    GestureDetector(
                      onTap: () {
                        feelingViewmodel.updateIndex(2);
                      },
                      child: Container(
                        margin: EdgeInsets.only(bottom: 32),
                        child: Image.asset("assets/images/check.png"),
                      ),
                    ),
                    TextButton(
                        onPressed: () {
                          feelingViewmodel.updateIndex(2);
                        },
                        child: Text(
                          "Skip",
                          style: 
                           GoogleFonts.getFont('Lexend Deca',color: Color(0xFFF06129),fontSize: 14,fontWeight: FontWeight.w400)
                        ))
                  ],
                ),

                //3rd page
                Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      margin: EdgeInsets.only(left: 48, right: 48),
                      child: Text(
                        "And your blood sugar level?",
                        textAlign: TextAlign.center,
                        style: 
                          GoogleFonts.getFont('Lexend Deca',  color: Color(0xFF423838),fontSize: 24,fontWeight: FontWeight.w700)
                      ),
                    ),
                    SizedBox(
                      height: 48,
                    ),
                    Container(
                      margin: EdgeInsets.only(bottom: 24),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Container(
                            width: 60,
                            child: Column(
                              mainAxisSize: MainAxisSize.min,
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                TextField(
                                  keyboardType: TextInputType.number,
                                  decoration:
                                      InputDecoration(hintText: "0 mg/dl"),
                                )
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                    GestureDetector(
                      onTap: () {
                        feelingViewmodel.updateIndex(3);
                      },
                      child: Container(
                        margin: EdgeInsets.only(bottom: 32),
                        child: Image.asset("assets/images/check.png"),
                      ),
                    ),
                    TextButton(
                        onPressed: () {
                          feelingViewmodel.updateIndex(3);
                        },
                        child: Text(
                          "Skip",
                          style:
                            GoogleFonts.getFont('Lexend Deca',color: Color(0xFFF06129),fontSize: 14,fontWeight: FontWeight.w400)
                        ))
                  ],
                ),

                //4th page
                Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      margin: EdgeInsets.only(left: 48, right: 48),
                      child: Text(
                        "Let's fill in some questions",
                        textAlign: TextAlign.center,
                        style: 
                        GoogleFonts.getFont('Lexend Deca', color: Color(0xFF423838),fontSize: 24,fontWeight: FontWeight.w700)
                      ),
                    ),
                    SizedBox(
                      height: 48,
                    ),
                    Container(
                      margin: EdgeInsets.only(top: 64, left: 24, right: 24),
                      child: GestureDetector(
                        onTap: () async {
                          feelingViewmodel.updateIndex(0);
                          await Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (context) => QuestionnaireScreen(),
                            ),
                          );
                          Navigator.pop(context);
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
                              child: Text(
                                "Next",
                                style: 
                                    GoogleFonts.getFont('Lexend Deca',   fontSize: 16, color: Colors.white)
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            )
          ],
        ),
      ),
    );
  }
}
