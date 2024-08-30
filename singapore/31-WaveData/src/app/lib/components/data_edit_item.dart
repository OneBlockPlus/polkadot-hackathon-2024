import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class DataEditItem extends StatefulWidget {
  final String? label;
  final TextEditingController controller;
  final bool isNumeric;
  final bool isFilled;
  final EdgeInsets? overrideMargin;
  final bool isPassword;

  DataEditItem(
      {Key? key,
      this.label,
      required this.controller,
      this.isNumeric = false,
      this.isFilled = false,
      this.isPassword = false,
      this.overrideMargin})
      : super(key: key);

  @override
  _DataEditItemState createState() => _DataEditItemState();
}

class _DataEditItemState extends State<DataEditItem> {
  @override
  Widget build(BuildContext context) {
    var size = MediaQuery.of(context).size;
    var label = widget.label;
    var controller = widget.controller;
    var isNumeric = widget.isNumeric;
    var isFilled = widget.isFilled;
    var isPassword = widget.isPassword;
    var overrideMargin = widget.overrideMargin;

    return Container(
      height: label != null
          ? isFilled
              ? (65 + 60)
              : 65
          : 45,
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
                borderRadius: BorderRadius.circular(4),
                border:
                    Border.all(color: Colors.grey, width: 1), // Border added
              ),
              child: Container(
                height: isFilled ? (40 + 60) : 40,
                child: TextFormField(
                  onChanged: ((value) {
                    setState(() {
                      
                    });
                  }),
                  controller: controller,
                  textCapitalization: TextCapitalization.sentences,
                  obscureText: isPassword,
                  keyboardType:
                      isNumeric ? TextInputType.number : TextInputType.text,
                  style: GoogleFonts.getFont(
                    'Lexend Deca',
                    color: Color(0xFF232323),
                  ),
                  expands: isFilled ? true : false,
                  maxLines: isFilled ? null : 1,
                  textAlignVertical: isFilled
                      ? TextAlignVertical.top
                      : TextAlignVertical.center,
                  decoration: InputDecoration(
                    contentPadding: EdgeInsets.only(
                        left: 16,
                        right: 16,
                        top: isFilled ? 16 : 0,
                        bottom: isFilled ? 16 : 0),
                    border: InputBorder.none, // Remove underline
                    enabledBorder: OutlineInputBorder(
                      borderSide: BorderSide(
                          color: Colors
                              .transparent), // Set border color to transparent
                    ),
                    hintStyle: GoogleFonts.getFont('Lexend Deca',
                        color: Colors.grey.withOpacity(0.5)),
                    suffixIcon: controller.text.length > 0 && !isFilled
                        ? GestureDetector(
                            child: const Icon(
                              Icons.clear,
                              color: Colors.grey,
                            ),
                            onTap: () {
                              controller.clear();
                            },
                          )
                        : isFilled?null:SizedBox(height: 24,),
                  ),
                ),
              )),
        ],
      ),
    );
  }
}
