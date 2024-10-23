/*
 * @Descripttion:
 * @version: 1.0
 * @Author: Hesin
 * @Date: 2024-09-30 16:12:34
 * @LastEditors: Hesin
 * @LastEditTime: 2024-10-17 23:12:19
 */
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Heros from "@/components/Heros";

export default function Home() {
  return (
    <main className="relative bg-black-100 flex justify-center items-center flex-col overflow-hidden sm:px-10 px-5">
      
      <Header />
      <div className="max-w-7xl w-full">
        <Heros />
      </div>
      <Footer />
    </main>
  );
}
