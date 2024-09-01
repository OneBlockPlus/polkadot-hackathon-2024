import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:signature/signature.dart';

class SignatureModal extends StatelessWidget {
  final signature_controller;

  SignatureModal(this.signature_controller);

  @override
  Widget build(BuildContext context) {
        return Scaffold(
        appBar: AppBar(
          title: Text('Signature'),
        ),
        body: Container(
            margin: EdgeInsets.all(16.0), // Add margin here
           
            child: Column(children: [
             Expanded(
                child: Container(
                  decoration: BoxDecoration(
                    border: Border.all(color: Color(0xFFF06129)),
                  ),
                  child: Signature(
                    controller: signature_controller,
                    backgroundColor: Colors.white,
                  ),
                ),
),
              SizedBox(height: 20),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  GestureDetector(
                      onTap: () async {
                        signature_controller.clear();
                      },
                      child: Material(
                        borderRadius: BorderRadius.circular(8),
                        elevation: 2,
                        child: Container(
                          padding: EdgeInsets.symmetric(
                              horizontal: 16), // Add padding here
                          height: 40,
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(8),
                            color: Color(0xFFF06129),
                          ),
                          child: Center(
                            child: Text("Clear",
                                style: GoogleFonts.getFont('Lexend Deca',
                                    fontSize: 16, color: Colors.white)),
                          ),
                        ),
                      )),
                  SizedBox(width: 20),
                  GestureDetector(
                      onTap: () async {
                        Navigator.of(context).pop();
                      },
                      child: Material(
                        borderRadius: BorderRadius.circular(8),
                        elevation: 2,
                        child: Container(
                          padding: EdgeInsets.symmetric(
                              horizontal: 16), // Add padding here
                          height: 40,
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(8),
                            color: Color(0xFFF06129),
                          ),
                          child: Center(
                            child: Text("Save Signature",
                                style: GoogleFonts.getFont('Lexend Deca',
                                    fontSize: 16, color: Colors.white)),
                          ),
                        ),
                      )),
                ],
              ),
            ])));
  }
}
