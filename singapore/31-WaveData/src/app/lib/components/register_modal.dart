// ignore_for_file: prefer_const_constructors, unnecessary_new

import 'dart:convert';
import 'dart:html';

import 'package:google_fonts/google_fonts.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:wavedata/components/data_edit_item.dart';

class RegisterModal extends StatefulWidget {
  @override
  RegisterApp createState() => RegisterApp();
}

class RegisterApp extends State<RegisterModal> {
  TextEditingController fullnameTXT = new TextEditingController();
  TextEditingController emailTXT = new TextEditingController();
  TextEditingController passwordTXT = new TextEditingController();
  TextEditingController ConPassTXT = new TextEditingController();
  bool isLoading = false;
  var POSTheader = {
    "Accept": "application/json",
    "Content-Type": "application/x-www-form-urlencoded"
  };

  Future<void> RegisterAccount() async {
    var url = Uri.parse(
        'https://wavedata-polkadot-singapore-api.onrender.com/api/GET/checkEmail?email=${Uri.encodeComponent(emailTXT.text)}');
    final response = await http.get(url);
    var responseData = json.decode(response.body);
    if (responseData['value'] == "False") {
      var urlReg = Uri.parse(
          'https://wavedata-polkadot-singapore-api.onrender.com/api/POST/Register');
      await http.post(urlReg, headers: POSTheader, body: {
        'fullname': fullnameTXT.text,
        'email': emailTXT.text,
        'password': passwordTXT.text
      });

      Navigator.pop(context);
    }
    setState(() => isLoading = false);
    return;
  }

  @override
  Widget build(BuildContext context) {
    return Material(
      child: CupertinoPageScaffold(
        child: Container(
          height: 450,
          width: 400,
          child: Column(
            children: [
              Container(
                width: 400,
                margin: EdgeInsets.only(top: 24, left: 24, bottom: 24),
                child: Text('Register your account',
                    style: GoogleFonts.getFont('Lexend Deca',
                        fontSize: 24,
                        color: Colors.black,
                        fontWeight: FontWeight.w600)),
              ),
              Container(
                margin: EdgeInsets.only(left: 24, right: 24),
                child:
                    DataEditItem(label: "Full Name", controller: fullnameTXT),
              ),
              Container(
                margin: EdgeInsets.only(left: 24, right: 24),
                child: DataEditItem(label: "Email", controller: emailTXT),
              ),
              Container(
                margin: EdgeInsets.only(left: 24, right: 24),
                child: DataEditItem(
                  label: "Password",
                  isPassword: true,
                  controller: passwordTXT,
                ),
              ),
              Container(
                margin: EdgeInsets.only(left: 24, right: 24),
                child: DataEditItem(
                  label: "Repeat Password",
                  isPassword: true,
                  controller: ConPassTXT,
                ),
              ),
              Container(
                margin: EdgeInsets.only(left: 24, right: 24),
                child: GestureDetector(
                  onTap: () async {
                    if (isLoading) return;
                    if (emailTXT.text == "" ||
                        fullnameTXT.text == "" ||
                        passwordTXT.text == "" ||
                        ConPassTXT.text == "") return;
                    if (passwordTXT.text != ConPassTXT.text) return;
                    setState(() => isLoading = true);
                    await RegisterAccount();
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
                        child: isLoading
                            ? SizedBox(
                                child: CircularProgressIndicator(
                                  color: Colors.white,
                                ),
                                height: 20.0,
                                width: 20.0,
                              )
                            : Text("Register",
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
