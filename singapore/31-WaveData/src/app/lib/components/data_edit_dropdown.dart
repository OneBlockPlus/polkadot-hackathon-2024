import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:dropdown_button2/dropdown_button2.dart';

class DataEditDropdown extends StatefulWidget {
  final List<String> items;
  final TextEditingController controller;
  final String? label;

  DataEditDropdown({required this.items, required this.controller, this.label});

  @override
  _DataEditDropdownState createState() => _DataEditDropdownState();
}

class _DataEditDropdownState extends State<DataEditDropdown> {
  @override
  Widget build(BuildContext context) {
    var size = MediaQuery.of(context).size;

    return Container(
      height: widget.label != null ? 73 : 53,
      width: size.width * 0.89,
      margin: EdgeInsets.only(bottom: 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (widget.label != null)
            Container(
              margin: const EdgeInsets.only(bottom: 4),
              child: Text(widget.label!,
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
                  height: 40,
                  child: DropdownButtonHideUnderline(
                    child: DropdownButton2<String>(
                      value: widget.controller.text.isNotEmpty
                          ? widget.controller.text
                          : null,
                      isExpanded: true,
                      onChanged: (String? newValue) {
                        setState(() {
                          widget.controller.text = newValue ?? '';
                        });
                      },
                      items: widget.items.map((String item) {
                        return DropdownMenuItem<String>(
                          value: item,
                          child: Text(item),
                        );
                      }).toList(),
                      style: GoogleFonts.getFont(
                        'Lexend Deca',
                        color: Color(0xFF232323),
                      ),
                      buttonStyleData: ButtonStyleData(
                        height: 40,
                      ),
                    ),
                  ))),
        ],
      ),
    );
  }
}
