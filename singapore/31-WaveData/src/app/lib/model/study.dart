import 'dart:convert';

class Study {
  String? permission;
  String image;
  String title;
  String id;
  Study({
    required this.id,
    required this.image,
    required this.title,
    this.permission
  });

  Study copyWith({
    String? image,
    String? title,
    String? permission
  }) {
    return Study(
      id: id,
      image: image ?? this.image,
      title: title ?? this.title,
      permission: permission?? this.permission
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'permission': permission,
      'image': image,
      'title': title,
      'id': id,
    };
  }

  factory Study.fromMap(Map<String, dynamic> map) {
    return Study(
      id: map['id'] ?? '',
      image: map['image'] ?? '',
      title: map['title'] ?? '',
      permission: map['permission']??''

    );
  }

  String toJson() => json.encode(toMap());

  factory Study.fromJson(String source) => Study.fromMap(json.decode(source));

  @override
  String toString() => 'Study(image: $image, title: $title, permission: $permission)';

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;

    return other is Study && other.image == image && other.title == title;
  }

  @override
  int get hashCode => image.hashCode ^ title.hashCode;
}
