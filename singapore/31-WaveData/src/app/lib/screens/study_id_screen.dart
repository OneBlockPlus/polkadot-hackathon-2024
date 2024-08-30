import 'package:flutter/material.dart';
import 'package:wavedata/components/data_edit_item.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'informedconsent_screen.dart';
import 'connect_data.dart';

class GetStudyIDScreen extends StatelessWidget {
  const GetStudyIDScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    TextEditingController StudyIdText = new TextEditingController();
    var size = MediaQuery.of(context).size;

    return Scaffold(
      backgroundColor: Colors.white,
      body: SingleChildScrollView(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.start,
          children: [
            SizedBox(
              height: size.height / 8,
            ),
            Container(
              margin: EdgeInsets.only(top: 64, bottom: 48),
              child: Image.asset(
                "assets/images/heart.gif",
                width: 250,
              ),
            ),
            Column(
              children: [
                Container(
                  margin: EdgeInsets.only(top: 0, left: 24, bottom: 24),
                  child: Text('Welcome at wavedata.',
                      style: GoogleFonts.getFont('Lexend Deca',
                          fontSize: 24,
                          color: Colors.black,
                          fontWeight: FontWeight.w600)),
                ),
              ],
            ),
            Container(
                margin: const EdgeInsets.only(left: 24, right: 24),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      margin: const EdgeInsets.only(bottom: 4),
                      child: Text(
                          "Please provide the keycode that you got to join the study",
                          style: GoogleFonts.getFont('Lexend Deca',
                              color: Color(0xFF232323),
                              fontSize: 14,
                              fontWeight: FontWeight.w600)),
                    ),
                    DataEditItem(label: "", controller: StudyIdText),
                  ],
                )),
            Container(
              margin: EdgeInsets.only(left: 24, right: 24),
              child: GestureDetector(
                onTap: () async {
                  final prefs = await SharedPreferences.getInstance();
                  prefs.setString("studyid", StudyIdText.text);
                  await Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => InformedConsentScreen(),
                    ),
                  );
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
                      child: Text("Continue",
                          style: GoogleFonts.getFont('Lexend Deca',
                              fontSize: 16, color: Colors.white)),
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
