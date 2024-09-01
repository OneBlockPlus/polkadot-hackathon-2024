// ignore_for_file: use_key_in_widget_constructors, non_constant_identifier_names, unnecessary_new, sized_box_for_whitespace, prefer_const_constructors

import 'dart:convert';
import 'package:google_fonts/google_fonts.dart';

import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:wavedata/components/data_edit_item.dart';
import 'package:qr_flutter/qr_flutter.dart';
import 'package:wavedata/screens/main_screen.dart';
import 'package:http/http.dart' as http;

class QRgeneratedScreen extends StatelessWidget {
  final String qr_data;
  QRgeneratedScreen(this.qr_data);

  @override
  Widget build(BuildContext context) {
    var size = MediaQuery.of(context).size;

    return Scaffold(
      appBar:  AppBar(
          automaticallyImplyLeading: false,
          toolbarHeight: 80,
          backgroundColor: Color(0xFFF06129),
          title: Container(
              height: 80,
              child: Row(
                mainAxisAlignment: MainAxisAlignment.start,
                crossAxisAlignment: CrossAxisAlignment.end,
                children: <Widget>[
                  IconButton(
                    iconSize: 20,
                    onPressed: (){ Navigator.pop(context);},
                    icon: Icon(Icons.arrow_back, color: Colors.white),
                  ),
                  Container(
                    height: 45,
                    width: 200,
                    child: Align(
                        alignment: AlignmentDirectional(0, 0),
                        child: Text('QR Code',
                            style: GoogleFonts.getFont(
                              'Lexend Deca',
                              fontSize: 24,
                              fontWeight: FontWeight.w300,
                              color: Colors.white,
                            ))),
                  )
                ],
              ))),
      
      backgroundColor:Colors.white,
      body: SingleChildScrollView(
        child: Container(
          width: size.width,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                margin: const EdgeInsets.only(top: 20, left: 20, right: 20),
                child: Container(
                    child: QrImage(data: qr_data),
                  ),
                decoration: BoxDecoration(boxShadow: const [
                  BoxShadow(
                      color: Color.fromARGB(25, 0, 0, 0),
                      blurRadius: 10,
                      spreadRadius: 1,
                      offset: Offset(0, 0))
                ]),
              ),
              Container(
                margin: const EdgeInsets.only(top: 20, left: 20, right: 20),
                child: GestureDetector(
                  onTap: () async {
                    Navigator.of(context).pop();
                  },
                  child: Material(
                    borderRadius: BorderRadius.circular(8),
                    elevation: 2,
                    child: Container(
                      height: 50,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(8),
                        color: Color(0xFFF06129),
                      ),
                      child: Center(
                        child: Text("Done",
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
      ),
    );
  }
}
