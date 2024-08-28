import 'dart:convert';

class Trial {
  String? permission;
  String image;
  String title;
  int id;
  Trial({
    required this.id,
    required this.image,
    required this.title,
    this.permission
  });

  Trial copyWith({
    String? image,
    String? title,
    String? permission
  }) {
    return Trial(
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

  factory Trial.fromMap(Map<String, dynamic> map) {
    return Trial(
      id: map['id'] ?? '',
      image: map['image'] ?? '',
      title: map['title'] ?? '',
      permission: map['permission']??''

    );
  }

  String toJson() => json.encode(toMap());

  factory Trial.fromJson(String source) => Trial.fromMap(json.decode(source));

  @override
  String toString() => 'Trial(image: $image, title: $title, permission: $permission)';

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;

    return other is Trial && other.image == image && other.title == title;
  }

  @override
  int get hashCode => image.hashCode ^ title.hashCode;
}
