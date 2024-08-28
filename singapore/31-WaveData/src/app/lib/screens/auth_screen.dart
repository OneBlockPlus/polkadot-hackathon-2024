import 'dart:convert';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:http/http.dart' as http;
import 'package:modal_bottom_sheet/modal_bottom_sheet.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:wavedata/components/data_edit_item.dart';
import 'package:wavedata/components/register_modal.dart';
import 'package:wavedata/screens/get_ready.dart';
import 'package:wavedata/screens/main_screen.dart';

import 'package:url_launcher/url_launcher.dart';

class AuthScreen extends StatefulWidget {
  @override
  AuthScreenApp createState() => AuthScreenApp();
}

class AuthScreenApp extends State<AuthScreen> {
  TextEditingController emailTXT = new TextEditingController();
  TextEditingController passwordTXT = new TextEditingController();
  bool isLoading = false;
  var POSTheader = {
    "Accept": "application/json",
    "Content-Type": "application/x-www-form-urlencoded"
  };
  @override
  initState() {
    GetAccount();
    super.initState();
  }

  Future<void> GetAccount() async {
    // Obtain shared preferences.
    final prefs = await SharedPreferences.getInstance();
    print(prefs.getString("userid"));
    if (prefs.getString("userid") != "" && prefs.getString("userid") != null) {
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(
          builder: (context) => MainScreen(),
        ),
      );
    }
  }

  Future<void> LoginAccount() async {
      const url = 'https://wavedata-singapore-polkadot-app.vercel.app/#/';
      if(await canLaunch(url)){
        await launch(url);
      }else {
        throw 'Could not launch $url';
      }


    // var url = Uri.parse(
    //     'https://wavedata-polkadot-singapore-api.onrender.com/api/POST/Login');
    // final response = await http.post(url,
    //     headers: POSTheader,
    //     body: {'email': emailTXT.text, 'password': passwordTXT.text});
    // var responseData = json.decode(response.body);
    // var data = (responseData['value']);
    // if (data != "False") {
    //   var userid = data;
    //   // Obtain shared preferences.
    //   final prefs = await SharedPreferences.getInstance();

    //   prefs.setString("userid", userid);
    //   Navigator.pushReplacement(
    //     context,
    //     MaterialPageRoute(
    //       builder: (context) => GetReadyScreen(),
    //     ),
    //   );
    //   print(prefs.getString("userid"));
    // } else {
    //   ScaffoldMessenger.of(context).showSnackBar(
    //       const SnackBar(content: Text("Email/password is incorrect!")));
    // }

    // setState(() => isLoading = false);
    // return;
  }

  @override
  Widget build(BuildContext context) {
    var size = MediaQuery.of(context).size;

    return Scaffold(
      body: Container(
        height: size.height,
        width: size.width,
        decoration: BoxDecoration(
          image: DecorationImage(
            fit: BoxFit.cover,
            image: Image.asset("assets/images/bg.png").image,
          ),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.end,
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            Container(
              margin: EdgeInsets.only(left: 16, right: 16, bottom: 64),
              child: Material(
                elevation: 5,
                borderRadius: BorderRadius.circular(8),
                child: Container(
                  height: size.height / 1.4,
                  constraints: const BoxConstraints(
                    minHeight: 500,
                  ),
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Column(
                    children: [
                      Container(
                        margin: EdgeInsets.only(top: 60, bottom: 30),
                        child: SvgPicture.asset(
                          "assets/images/Logo.svg",
                        ),
                      ),
                      Container(
                        margin: EdgeInsets.only(left: 24, right: 24),
                        child:
                            DataEditItem(label: "Email", controller: emailTXT),
                      ),
                      Container(
                        margin: EdgeInsets.only(left: 24, right: 24),
                        child: DataEditItem(
                            label: "Password",
                            isPassword: true,
                            controller: passwordTXT),
                      ),
                      Container(
                        margin: EdgeInsets.only(left: 24, right: 24),
                        child: GestureDetector(
                          onTap: () async {
                            if (isLoading) return;
                            if (emailTXT.text == "" || passwordTXT.text == "")
                              ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(
                                      content:
                                          Text("Please fill all fields!")));
                            setState(() => isLoading = true);
                            await LoginAccount();
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
                                    : Text("Login",
                                        style: GoogleFonts.getFont(
                                            'Lexend Deca',
                                            fontSize: 16,
                                            color: Colors.white)),
                              ),
                            ),
                          ),
                        ),
                      ),
                      SizedBox(
                        height: 20,
                      ),
                      Container(
                        margin: EdgeInsets.only(left: 24, right: 24),
                        child: GestureDetector(
                          onTap: () {
                            FocusScope.of(context).unfocus();
                            //showCupertinoModalBottomSheet(context: context, builder: builder)
                            showCupertinoModalBottomSheet(
                              context: context,
                              builder: (context) => RegisterModal(),
                            );
                          },
                          child: Material(
                            borderRadius: BorderRadius.circular(8),
                            child: Container(
                              height: 40,
                              decoration: BoxDecoration(
                                borderRadius: BorderRadius.circular(8),
                                border: Border.all(
                                    width: 1.2, color: Color(0xFF6B7280)),
                                color: const Color(0xFFF3F4F6),
                              ),
                              child: Center(
                                child: Text("Register",
                                    style: GoogleFonts.getFont('Lexend Deca',
                                        fontSize: 16,
                                        color: Color(0xFF6B7280))),
                              ),
                            ),
                          ),
                        ),
                      )
                    ],
                  ),
                ),
              ),
            )
          ],
        ),
      ),
    );
  }
}
