import 'dart:convert';

class Offer {
  String title;
  String store;
  String period;
  String image;

  Offer({
    required this.title,
    required this.store,
    required this.period,
    required this.image,
  });

  Offer copyWith({
    String? title,
    String? store,
    String? period,
    String? image,
  }) {
    return Offer(
      title: title ?? this.title,
      store: store ?? this.store,
      period: period ?? this.period,
      image: image ?? this.image,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'title': title,
      'store': store,
      'period': period,
      'image': image,
    };
  }

  factory Offer.fromMap(Map<String, dynamic> map) {
    return Offer(
      title: map['title'] ?? '',
      store: map['store'] ?? '',
      period: map['period'] ?? '',
      image: map['image'] ?? '',
    );
  }

  String toJson() => json.encode(toMap());

  factory Offer.fromJson(String source) => Offer.fromMap(json.decode(source));

  @override
  String toString() {
    return 'Offer(title: $title, store: $store, period: $period, image: $image)';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;

    return other is Offer &&
        other.title == title &&
        other.store == store &&
        other.period == period &&
        other.image == image;
  }

  @override
  int get hashCode {
    return title.hashCode ^ store.hashCode ^ period.hashCode ^ image.hashCode;
  }
}
