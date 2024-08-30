import 'dart:convert';

class AgesAns {
  String answer;
  String? GivenAnswer;
  String type;
  String? questiontype2;
  String? urlText;
  String? urlType;
  List<String> limited;

  AgesAns(
      {required this.answer,
      required this.type,
      required this.questiontype2,
      required this.urlText,
      required this.urlType,
      required this.limited});

  AgesAns copyWith({
    String? answer,
    String? type,
    String? questiontype2,
    String? urlText,
    String? urlType,
    List<String>? limited,
  }) {
    return AgesAns(
        answer: answer ?? this.answer,
        type: type ?? this.type,
        questiontype2: questiontype2 ?? this.questiontype2,
        urlText: urlText ?? this.urlText,
        urlType: urlType ?? this.urlType,
        limited: limited ?? this.limited);
  }

  Map<String, dynamic> toMap() {
    return {
      'answer': answer,
      'type': type,
      'questiontype2': questiontype2,
      'urlText': urlText,
      'urlType': urlType,
      "limited": limited
    };
  }

  factory AgesAns.fromMap(Map<String, dynamic> map) {
    var limitedAns = (map['limited'] as List).map((val) {
      return val["answer"].toString();
    }).toList();
    return AgesAns(
        answer: map['answer'] ?? '',
        type: map['type'] ?? "",
        questiontype2: map['questiontype2'] ?? "",
        urlText: map['urlText'] ?? "",
        urlType: map['urlType'] ?? "",
        limited: limitedAns);
  }

  String toJson() => json.encode(toMap());

  factory AgesAns.fromJson(String source) =>
      AgesAns.fromMap(json.decode(source));

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;

    return other is AgesAns &&
        other.answer == answer &&
        other.type == type &&
        other.questiontype2 == questiontype2 &&
        other.urlText == urlText &&
        other.urlType == urlType &&
        other.limited == limited;
  }
}
