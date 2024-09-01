import 'dart:convert';

class Question {
  String id;
  String questionid;
  String QuestionType;
  String QuestionType2;
  String content;
  String Answer;
  List<String>? AnswerOptions;

  Question({
    required this.id,
    required this.questionid,
    required this.QuestionType,
    required this.QuestionType2,
    required this.content,
    required this.Answer,
    this.AnswerOptions,
  });

  Question copyWith({
    String? id,
    String? questionid,
    String? QuestionType,
    String? QuestionType2,
    String? content,
    String? Answer,
    List<String>? AnswerOptions,
  }) {
    return Question(
        id: id ?? this.id,
        questionid: questionid ?? this.questionid,
        QuestionType: QuestionType ?? this.QuestionType,
        QuestionType2: QuestionType2 ?? this.QuestionType2,
        content: content ?? this.content,
        Answer: Answer ?? this.Answer,
        AnswerOptions: AnswerOptions ?? this.AnswerOptions);
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'questionid': questionid,
      "QuestionType": QuestionType,
      "QuestionType2": QuestionType2,
      'content': content,
      "Answer": Answer
    };
  }

  factory Question.fromMap(Map<String, dynamic> map) {
    return Question(
        id: map['id'] ?? '',
        questionid: map['questionid'] ?? "",
        QuestionType: map['QuestionType'] ?? '',
        QuestionType2: map['QuestionType2'] ?? '',
        content: map['content'] ?? '',
        Answer: map['Answer'] ?? "",
        AnswerOptions: map['AnswerOptions'] ?? []);
  }

  String toJson() => json.encode(toMap());

  factory Question.fromJson(String source) =>
      Question.fromMap(json.decode(source));

  @override
  String toString() =>
      'Question(id: $id, questionid: $questionid, QuestionType: $QuestionType, QuestionType2: $QuestionType2, content: $content, Answer: $Answer)';

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;

    return other is Question &&
        other.id == id &&
        other.questionid == questionid &&
        other.QuestionType == QuestionType &&
        other.QuestionType2 == QuestionType2 &&
        other.content == content &&
        other.Answer == Answer;
  }

  @override
  int get hashCode =>
      id.hashCode ^
      questionid.hashCode ^
      QuestionType.hashCode ^
      QuestionType2.hashCode ^
      content.hashCode ^
      Answer.hashCode;
}
