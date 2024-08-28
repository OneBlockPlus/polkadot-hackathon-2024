import 'package:flutter/cupertino.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final feelingProvider =
    ChangeNotifierProvider<FeelingProvider>((ref) => FeelingProvider());

class FeelingProvider extends ChangeNotifier {
  int selectedIndex = 0;

  void updateIndex(int newIndex) {
    selectedIndex = newIndex;
    notifyListeners();
  }
}
