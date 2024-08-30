import 'dart:convert';

class StudyAction {
  String id;
  String when;
  String content;
  bool isDone;
  StudyAction({
    required this.id,
    required this.when,
    required this.content,
    required this.isDone,
  });

  StudyAction copyWith({
    String? id,
    String? when,
    String? content,
    bool? isDone,
  }) {
    return StudyAction(
      id: id ?? this.id,
      when: when ?? this.when,
      content: content ?? this.content,
      isDone: isDone ?? this.isDone,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'when': when,
      'content': content,
      'isDone': isDone,
    };
  }

  factory StudyAction.fromMap(Map<String, dynamic> map) {
    return StudyAction(
      id: map['id'] ?? '',
      when: map['when'] ?? '',
      content: map['content'] ?? '',
      isDone: map['isDone'] ?? false,
    );
  }

  String toJson() => json.encode(toMap());

  factory StudyAction.fromJson(String source) =>
      StudyAction.fromMap(json.decode(source));

  @override
  String toString() =>
      'StudyAction(id: $id, when: $when, content: $content, isDone: $isDone)';

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;

    return other is StudyAction &&
        other.id == id &&
        other.when == when &&
        other.content == content &&
        other.isDone == isDone;
  }

  @override
  int get hashCode => when.hashCode ^ content.hashCode ^ isDone.hashCode;
}
