import 'dart:convert';

import 'package:wavedata/model/informed_consent/agesAns.dart';

class Subject {
  String subject_id;
  String subject_index_id;
  String title;
  String study_id;
  AgesAns? ages_ans;

  Subject({
    required this.subject_id,
    required this.subject_index_id,
    required this.title,
    required this.study_id,
    required this.ages_ans,
  });

  Subject copyWith(
      {String? subject_id,
      String? subject_index_id,
      String? title,
      String? study_id,
      AgesAns? ages_ans}) {
    return Subject(
        subject_id: subject_id ?? this.subject_id,
        subject_index_id: subject_index_id ?? this.subject_index_id,
        title: title ?? this.title,
        study_id: study_id ?? this.study_id,
        ages_ans: ages_ans ?? this.ages_ans);
  }

  factory Subject.fromMap(Map<String, dynamic> map) {
    var nor_ages = map['ages_ans'];
    var age_ns = null;
    if (nor_ages.length > 0) {
      age_ns = AgesAns.fromMap(nor_ages as Map<String, dynamic>);
    }

    return Subject(
      subject_id: map['subject_id'] ?? '',
      subject_index_id: map['subject_index_id'] ?? "",
      title: map['title'] ?? '',
      study_id: map['study_id'] ?? '',
      ages_ans: age_ns,
    );
  }

  factory Subject.fromJson(String source) =>
      Subject.fromMap(json.decode(source));

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;

    return other is Subject &&
        other.subject_id == subject_id &&
        other.subject_index_id == subject_index_id &&
        other.title == title &&
        other.study_id == study_id &&
        other.ages_ans == ages_ans;
  }
}
