import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:wavedata/providers/navbar_provider.dart';

class WavedataNavbar extends ConsumerStatefulWidget {
  final void Function(int)? OnTap;
  @override
  ConsumerState<ConsumerStatefulWidget> createState() =>
      _WavedataNavbarState();
      WavedataNavbar(this.OnTap);
}

class _WavedataNavbarState extends ConsumerState<WavedataNavbar> {
  @override
  Widget build(BuildContext context) {
    var viewmodel = ref.watch(navbarProvider);
    int newIndex = viewmodel.selectedIndex == 4?0:viewmodel.selectedIndex;
    void Function(int)? OnTap = widget.OnTap;

    return BottomNavigationBar(
      currentIndex:  newIndex,
      onTap: OnTap,
      showSelectedLabels: true,
      showUnselectedLabels: true,
      backgroundColor: Colors.white,
      selectedItemColor: Color(0xFFF06129),
      type: BottomNavigationBarType.fixed,
      iconSize: 30,
      items: <BottomNavigationBarItem>[
        BottomNavigationBarItem(
          icon: SvgPicture.asset(
            "assets/images/home.svg",
          ),
           activeIcon:SvgPicture.asset(
              "assets/images/home-active.svg"
            ),
          label: "Home",
        ),
        BottomNavigationBarItem(
            icon: SvgPicture.asset(
              "assets/images/support.svg"
            ),
            activeIcon:SvgPicture.asset(
              "assets/images/support-active.svg"
            ),
            label: "Journey" ),
        BottomNavigationBarItem(
          icon: SvgPicture.asset(
            "assets/images/mydata.svg",
          ),
            activeIcon:SvgPicture.asset(
              "assets/images/mydata-active.svg"
            ),
          label: "My data",
        ),
        BottomNavigationBarItem(
            icon: SvgPicture.asset(
              "assets/images/rewards.svg"
            ),
             activeIcon:SvgPicture.asset(
              "assets/images/rewards-active.svg"
            ),
            label: "Credits"),
      ],
    );
  }
}
