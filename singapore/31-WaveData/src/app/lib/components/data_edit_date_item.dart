import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';

class DataEditDateItem extends StatelessWidget {
  final String? label;
  final TextEditingController controller;
  final EdgeInsets? overrideMargin;

  const DataEditDateItem(
      {Key? key, this.label, required this.controller, this.overrideMargin})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    var size = MediaQuery.of(context).size;

    Future _selectDate() async {
      DateTime? picked = await showDatePicker(
          context: context,
          initialDate: new DateTime.now(),
          firstDate: new DateTime(1950),
          lastDate: new DateTime(2030));
      if (picked != null) {
        String formattedDate = DateFormat('yyyy-MM-dd').format(picked);

        controller.text = formattedDate;
      }
    }

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
                // focusNode: _focusNode,
                keyboardType: TextInputType.phone,
                autocorrect: false,
                controller: controller,
                onSaved: (value) {
                  controller.text = value!;
                },
                onTap: () {
                  _selectDate();
                  FocusScope.of(context).requestFocus(new FocusNode());
                },
                maxLines: 1,
                decoration: InputDecoration(
                  contentPadding: EdgeInsets.only(
                    left: 16,
                  ),
                  border: OutlineInputBorder(),
                  enabledBorder: const OutlineInputBorder(
                    borderSide: const BorderSide(color: Colors.grey, width: 1),
                  ),
                  hintStyle: GoogleFonts.getFont('Lexend Deca',
                      color: Colors.grey.withOpacity(0.5)),
                  suffixIcon: const Icon(Icons.calendar_today),
                ),
              )),
        ],
      ),
    );
  }
}
