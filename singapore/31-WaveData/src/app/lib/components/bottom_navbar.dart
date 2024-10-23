import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:wavedata/providers/navbar_provider.dart';

class WavedataNavbar extends ConsumerStatefulWidget {
  @override
  ConsumerState<ConsumerStatefulWidget> createState() => _WavedataNavbarState();
}

class _WavedataNavbarState extends ConsumerState<WavedataNavbar> {
  @override
  Widget build(BuildContext context) {
    var viewmodel = ref.watch(navbarProvider);

    return BottomNavigationBar(
      currentIndex: viewmodel.selectedIndex,
      onTap: (newIndex) {
        viewmodel.updateIndex(newIndex);
      },
      showSelectedLabels: true,
      showUnselectedLabels: true,
      backgroundColor: Colors.white,
      selectedItemColor: Color(0xFFF06129),
      type: BottomNavigationBarType.fixed,
      iconSize: 30,
      items: <BottomNavigationBarItem>[
        BottomNavigationBarItem(
          /* icon: Icon(
            Icons.location_pin,
            color: viewmodel.selectedIndex == 0
                ? AppColors.navbarSelected
                : Colors.black,
          ), */
          icon: SvgPicture.asset(
            "assets/images/home.svg",
            color: viewmodel.selectedIndex == 0
                ? Color(0xFFF06129)
                : Color(0xFF6B7280),
          ),
          label: "Home",
        ),
        BottomNavigationBarItem(
            /* icon: Icon(
              Icons.local_offer_outlined,
              color: viewmodel.selectedIndex == 1
                  ? AppColors.navbarSelected
                  : Colors.black,
            ), */
            icon: SvgPicture.asset(
              "assets/images/support.svg",
              color: viewmodel.selectedIndex == 1
                  ? Color(0xFFF06129)
                  : Color(0xFF6B7280),
            ),
            label: "Journey"),
        BottomNavigationBarItem(
          /*  icon: Icon(
            Icons.credit_card_outlined,
            color: viewmodel.selectedIndex == 2
                ? AppColors.navbarSelected
                : Colors.black,
          ), */
          icon: SvgPicture.asset(
            "assets/images/mydata.svg",
          
            color: viewmodel.selectedIndex == 2
                ? Color(0xFFF06129)
                : Color(0xFF6B7280),
          ),
          label: "My data",
        ),
        BottomNavigationBarItem(
            /* icon: Icon(
              Icons.person_outline,
              color: viewmodel.selectedIndex == 3
                  ? AppColors.navbarSelected
                  : Colors.black,
            ), */
            icon: SvgPicture.asset(
              "assets/images/rewards.svg",
              color: viewmodel.selectedIndex == 3
                  ? Color(0xFFF06129)
                  : Color(0xFF6B7280),
            ),
            label: "Credits"),
      ],
    );
  }
}
