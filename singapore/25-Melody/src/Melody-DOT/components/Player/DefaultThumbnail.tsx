/*
 * @Descripttion:
 * @version: 1.0
 * @Author: Hesin
 * @Date: 2024-08-25 15:37:52
 * @LastEditors: Hesin
 * @LastEditTime: 2024-08-25 16:29:30
 */
import { TbMusic } from "react-icons/tb";

export const DefaultThumbnail = () => {
  return (
    <div className="bg-accent -py-8 text-white justify-center items-center text-2xl rounded-lg flex w-full h-full">
      <TbMusic />
    </div>
  );
};
