import 'dart:convert';

class Ages {
  String id;
  int from;
  int to;
  bool older;

  Ages({
    required this.id,
    required this.from,
    required this.to,
    required this.older
  });

  Ages copyWith({
    String? id,
    int ? from,
    int ? to,
    bool? older,
  }) {
    return Ages(
        id: id ?? this.id,
        from: from ?? this.from,
        to: to ?? this.to,
        older: older ?? this.older);
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'from': from,
      "to": to,
      "older": older
    };
  }

  factory Ages.fromMap(Map<String, dynamic> map) {
    return Ages(
        id: map['id'] ?? '',
        from: map['from'] ?? "",
        to: map['to'] ?? '',
        older: map['older'] ?? '');
  }

  String toJson() => json.encode(toMap());

  factory Ages.fromJson(String source) =>
      Ages.fromMap(json.decode(source));

 
  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;

    return other is Ages &&
        other.id == id &&
        other.from == from &&
        other.to == to &&
        other.older == older ;
  }

}
