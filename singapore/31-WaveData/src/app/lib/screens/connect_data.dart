// ignore_for_file: use_key_in_widget_constructors, non_constant_identifier_names, unnecessary_new, sized_box_for_whitespace, prefer_const_constructors

import 'dart:convert';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_hooks/flutter_hooks.dart';

import 'package:flutter/material.dart';
import 'package:wavedata/providers/feeling_provider.dart';
import 'package:wavedata/screens/onboarding_questionnaire_screen.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:wavedata/components/data_edit_item.dart';
import 'package:wavedata/components/data_edit_dropdown.dart';
import 'package:wavedata/screens/main_screen.dart';
import 'package:wavedata/model/airtable_api.dart';
import 'package:http/http.dart' as http;

class ConnectDataScreen extends ConsumerStatefulWidget {
  const ConnectDataScreen({Key? key}) : super(key: key);

  @override
  ConsumerState<ConnectDataScreen> createState() => _ConnectDataScreenState();
}

class _ConnectDataScreenState extends ConsumerState<ConnectDataScreen> {
  TextEditingController GivenNameTXT = new TextEditingController();
  TextEditingController IdentifierTXT = new TextEditingController();
  TextEditingController FHIRIDTXT = new TextEditingController();
  TextEditingController WalletAddressTXT = new TextEditingController(text: "");

  bool isLoading = false;
 var POSTheader = {
    "Accept": "application/json",
    "Content-Type": "application/x-www-form-urlencoded"
  };
  bool termsBool = false;
   String baseURL=  'http://127.0.0.1:3000';
 
  @override
  initState() {
    GetData();
    super.initState();
  }
  Future<void> GetData() async {
    final prefs = await SharedPreferences.getInstance();
    var userid = prefs.getString("userid");
    var url = Uri.parse(
        '${baseURL}/api/GET/getFhir?userid=${int.parse(userid.toString())}');

    final response = await http.get(url);
    var responseData = json.decode(response.body);
    if (responseData['value'] != null) {
      var data = (responseData['value']);
      setState(() {
        GivenNameTXT.text = data['given_name'];
        IdentifierTXT.text = data['identifier'];
        FHIRIDTXT.text = data['patient_id'].toString();
        WalletAddressTXT.text = data['walletaddress'].toString();
      });
    }
  }

  
  Future<void> ConnectData() async {
    final prefs = await SharedPreferences.getInstance();
    var userid = prefs.getString("userid");
    try {
      var url = Uri.parse('${baseURL}/api/POST/UpadateFhir');
      final response = await http.post(url, headers: POSTheader, body: {
        'userid': userid,
        'givenname': GivenNameTXT.text,
        'identifier': IdentifierTXT.text,
        'patientid': FHIRIDTXT.text,
        'walletaddress': WalletAddressTXT.text,
      });
      var responseData = json.decode(response.body);
      if (responseData['status'] == 200) {
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(
            builder: (context) => MainScreen(),
          ),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(context)
          .showSnackBar(const SnackBar(content: Text("Please try again!")));
    }

    setState(() => isLoading = false);
    return;
  }

  @override
  Widget build(BuildContext context) {
    var size = MediaQuery.of(context).size;

    var feelingViewmodel = ref.watch(feelingProvider);


    return Scaffold(
      backgroundColor: Colors.white,
      body: SingleChildScrollView(
        child: Container(
          width: size.width,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              SizedBox(
                height: size.height / 8,
              ),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Image.asset(
                    "assets/images/heart.png",
                    width: 100,
                  ),
                ],
              ),
              Container(
                //width: 400,

                margin: const EdgeInsets.only(top: 24, left: 24, bottom: 24),
                child: Text('Connect your data.',
                    style: GoogleFonts.getFont('Lexend Deca',
                        fontSize: 24,
                        color: Colors.black,
                        fontWeight: FontWeight.w600)),
              ),
              Container(
                margin: const EdgeInsets.only(left: 24, right: 24),
                child:
                    DataEditItem(label: "Given name", controller: GivenNameTXT),
              ),
              Container(
                margin: const EdgeInsets.only(left: 24, right: 24),
                child: DataEditItem(
                    label: "Identifier", controller: IdentifierTXT),
              ),
              Container(
                margin: const EdgeInsets.only(left: 24, right: 24),
                child: DataEditItem(
                    label: "FIHR Patient ID", controller: FHIRIDTXT),
              ),
              Container(
                margin: const EdgeInsets.only(left: 24, right: 24),
                child: DataEditItem(
                    label: "Wallet Address", controller: WalletAddressTXT),
              ),
              Container(
                margin: const EdgeInsets.only(left: 12, right: 24),
                child: Row(
                  children: [
                    Checkbox(
                        value: termsBool,
                        onChanged: (val) {
                          setState(() {
                            termsBool = val!;
                          });
                        }),
                    Text("By sharing your data you agree to our ",
                        style: GoogleFonts.getFont('Lexend Deca',
                            color: Colors.grey, fontWeight: FontWeight.w700)),
                    Text("terms",
                        style: GoogleFonts.getFont('Lexend Deca',
                            color: Colors.black, fontWeight: FontWeight.w500))
                  ],
                ),
              ),
              Container(
                margin: const EdgeInsets.only(top: 32, left: 24, right: 24),
                child: GestureDetector(
                  onTap: () async {
                    if (isLoading) return;
                    if (GivenNameTXT.text == "" ||
                        IdentifierTXT.text == "" ||
                        FHIRIDTXT.text == "") return;
                    setState(() => isLoading = true);
                    await ConnectData();
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
                        child: isLoading
                            ? SizedBox(
                                child: CircularProgressIndicator(
                                  color: Colors.white,
                                ),
                                height: 20.0,
                                width: 20.0,
                              )
                            : Text("Connect",
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
