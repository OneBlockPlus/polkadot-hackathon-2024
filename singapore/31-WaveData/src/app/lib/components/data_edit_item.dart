import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class DataEditItem extends StatelessWidget {
  final String? label;
  final TextEditingController controller;
  final bool isNumeric;
  final EdgeInsets? overrideMargin;
  final bool isPassword;

  const DataEditItem(
      {Key? key,
      this.label,
      required this.controller,
      this.isNumeric = false,
      this.isPassword = false,
      this.overrideMargin})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    var size = MediaQuery.of(context).size;

    return Container(
      height: label != null ? 65 : 45,
      width: size.width * 0.89,
      margin: overrideMargin ?? EdgeInsets.only(bottom: 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (label != null)
            Container(
              margin: const EdgeInsets.only(bottom: 4),
              child: Text(label!,
                  overflow: TextOverflow.ellipsis,
                  style: GoogleFonts.getFont('Lexend Deca',
                      color: Color(0xFF232323),
                      fontSize: 14,
                      fontWeight: FontWeight.w600)),
            ),
          Container(
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(8),
            ),
            height: 40,
            child: TextFormField(
              controller: controller,
              textCapitalization: TextCapitalization.sentences,
              obscureText: isPassword,
              keyboardType:
                  isNumeric ? TextInputType.number : TextInputType.text,
              style: 
                  GoogleFonts.getFont('Lexend Deca',  color: Color(0xFF232323),),
              textAlignVertical: TextAlignVertical.center,
              decoration: InputDecoration(
                contentPadding: EdgeInsets.only(
                  left: 16,
                ),
                border: OutlineInputBorder(),
                enabledBorder: const OutlineInputBorder(
                  borderSide: const BorderSide(color: Colors.grey, width: 1),
                ),
                hintStyle: 
                GoogleFonts.getFont('Lexend Deca', color: Colors.grey.withOpacity(0.5)),
                suffixIcon: controller.text.length > 0
                    ? GestureDetector(
                        child: Icon(
                          Icons.clear,
                          color: Colors.grey,
                        ),
                        onTap: () {
                          controller.clear();
                        },
                      )
                    : SizedBox(
                        height: 24,
                      ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
