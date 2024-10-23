/*
 * @Descripttion: 
 * @version: 1.0
 * @Author: Hesin
 * @Date: 2024-08-21 16:05:19
 * @LastEditors: Hesin
 * @LastEditTime: 2024-08-27 12:16:47
 */
"use client";

export interface RouteProp {
  name: string;
  path: string;
}

export const routeList: RouteProp[] = [
  { name: "Home", path: "/" },
  { name: "Browsing", path: "/browsing" },
  { name: "Create", path: "/create" },
  { name: "Consolidate", path: "/consolidate" },
];
