import 'package:flutter/material.dart';
import 'package:wavedata/screens/connect_data.dart';
import 'package:google_fonts/google_fonts.dart';

class GetReadyScreen extends StatelessWidget {
  const GetReadyScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
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
            Row(
              children: [
                Container(
                  //width: 400,

                  margin: EdgeInsets.only(top: 24, left: 24, bottom: 24),
                  child: Text(
                    'Get ready to contribute.',
                    style: 
                     GoogleFonts.getFont('Lexend Deca',fontSize: 24,color: Colors.black,fontWeight: FontWeight.w600)
                  ),
                ),
              ],
            ),
            Container(
              //width: 400,
              margin: EdgeInsets.only(top: 24, left: 24, bottom: 24),
              child: Text(
                'To contribute to medical studies please connect your medical data.',
                style:
                 GoogleFonts.getFont('Lexend Deca',  fontSize: 16,color: Color(0xFF423838),letterSpacing: 0.5,fontWeight: FontWeight.w400)
              ),
            ),
            Container(
              margin: EdgeInsets.only(left: 24, right: 24),
              child: GestureDetector(
                onTap: () {
                  Navigator.push(
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
                    height: 40,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(8),
                      color: Color(0xFFF06129),
                    ),
                    child: Center(
                      child: Text(
                        "Connect my data",
                        style: 
                         GoogleFonts.getFont('Lexend Deca',  fontSize: 16, color: Colors.white)
                      ),
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
