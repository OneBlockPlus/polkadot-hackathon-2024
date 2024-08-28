import 'package:flutter/cupertino.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final questionnaireProvider = ChangeNotifierProvider<QuestionnaireProvider>(
    (ref) => QuestionnaireProvider());

class QuestionnaireProvider extends ChangeNotifier {
  int selectedIndex = 0;

  void updateIndex(int newIndex) {
    selectedIndex = newIndex;
    notifyListeners();
  }
}
