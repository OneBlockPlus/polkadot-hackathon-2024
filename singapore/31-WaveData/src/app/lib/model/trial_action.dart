import 'dart:convert';

class TrialAction {
  String id;
  String when;
  String content;
  bool isDone;
  TrialAction({
    required this.id,
    required this.when,
    required this.content,
    required this.isDone,
  });

  TrialAction copyWith({
    String? id,
    String? when,
    String? content,
    bool? isDone,
  }) {
    return TrialAction(
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

  factory TrialAction.fromMap(Map<String, dynamic> map) {
    return TrialAction(
      id: map['id'] ?? '',
      when: map['when'] ?? '',
      content: map['content'] ?? '',
      isDone: map['isDone'] ?? false,
    );
  }

  String toJson() => json.encode(toMap());

  factory TrialAction.fromJson(String source) =>
      TrialAction.fromMap(json.decode(source));

  @override
  String toString() =>
      'TrialAction(id: $id, when: $when, content: $content, isDone: $isDone)';

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;

    return other is TrialAction &&
        other.id == id &&
        other.when == when &&
        other.content == content &&
        other.isDone == isDone;
  }

  @override
  int get hashCode => when.hashCode ^ content.hashCode ^ isDone.hashCode;
}
