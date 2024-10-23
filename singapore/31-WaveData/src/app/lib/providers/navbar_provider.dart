import 'package:flutter/cupertino.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final navbarProvider =
    ChangeNotifierProvider<NavbarProvider>((ref) => NavbarProvider());

class NavbarProvider extends ChangeNotifier {
  int selectedIndex = 0;

  void updateIndex(int newIndex) {
    selectedIndex = newIndex;
    notifyListeners();
  }
}
