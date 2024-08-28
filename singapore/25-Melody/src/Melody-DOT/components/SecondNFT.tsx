"use client";

import { useState, useRef, ChangeEvent, useEffect } from "react";

import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { usePathname } from "next/navigation";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Image from "next/image";

//form Schema
const formSchema = z.object({
  desc: z.string().optional(),
  musicname: z.string().optional(),
  musicCover: z.string().optional(),
  musicFile: z.string().optional(),
  prompt: z.string().min(10, {
    message: "at least 10 characters.",
  }),
});

export default function SecondNFT({ music, setisColl,id }) {
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [musicFile, setMusicFile] = useState<File | null>(null);

  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [musicPreview, setMusicPreview] = useState<string | null>(null);
  const [musicPreviewAI, setMusicPreviewAI] = useState<string | null>(null);

  const inputFile = useRef<HTMLInputElement | null>(null);
  const inputMusicFile = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [cid, setCid] = useState<string>("");

  const [isOk, setisOk] = useState(false);

  useEffect(() => {
    if (music) {
      setMusicPreview(music.src);
    }
  }, []);

  // const handleCoverChange = (e: ChangeEvent<HTMLInputElement>) => {
  //   if (e.target.files && e.target.files.length > 0) {
  //     const eFile = e.target.files[0];
  //     if (eFile) {
  //       setCoverFile(eFile);
  //       const reader = new FileReader();
  //       reader.onloadend = () => {
  //         if (typeof reader.result === "string") {
  //           setCoverPreview(reader.result);
  //         } else {
  //           setCoverPreview(null);
  //         }
  //         // console.log('63',reader.result)
  //       };
  //       reader.readAsDataURL(eFile);
  //     }
  //   }
  // };

  // const handleMusicChange = (e: ChangeEvent<HTMLInputElement>) => {
  //   if (e.target.files && e.target.files.length > 0) {
  //     const file = e.target.files[0];
  //     setMusicFile(file);
  //     const reader = new FileReader();
  //     reader.onloadend = () => {
  //       if (typeof reader.result === "string") {
  //         setMusicPreview(reader.result);
  //       } else {
  //         setMusicPreview(null);
  //       }
  //     };
  //     reader.readAsDataURL(file);
  //   }
  // };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      musicname: "",
      desc: "",
    },
  });
  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    setMusicPreviewAI(music.src);

    console.log(values);
  }
  return (
    <SheetContent className="flex flex-col " style={{ maxWidth: "80vw" }}>
      <h1 className="text-4xl font-semibold">Second-Create</h1>

      <div className="w-full p-10 bg-white rounded-xl z-10 overflow-auto">
        <div className="text-left">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 grid grid-cols-2 gap-4"
            >
              {/* <div>
                <FormField
                  control={form.control}
                  name="musicname"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="pl-2 text-sm font-bold text-gray-500 tracking-wide">
                        Music Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="your music name"
                          {...field}
                          className="text-primary"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="musicCover"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="pl-2 text-sm font-bold text-gray-500 tracking-wide">
                        Music Cover
                      </FormLabel>
                      <FormControl>
                        <div className="grid w-full max-w-sm items-center gap-1.5">
                          <Input
                            ref={inputFile}
                            onChange={handleCoverChange}
                            id="picture"
                            type="file"
                            className="text-sm font-bold text-gray-500 tracking-wide"
                          />
                          {coverPreview && (
                            <div className="mt-2">
                              <Image
                                src={coverPreview}
                                alt="Preview"
                                className="rounded-md"
                                width={500}
                                height={500}
                              />
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormDescription>
                        <span className="pl-2 text-sm text-gray-300 text-center">
                          File type: jpg、png types of images
                        </span>
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div> */}
              <div>
                <FormField
                  control={form.control}
                  name="prompt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="pl-2 text-sm font-bold text-gray-500 tracking-wide">
                        AI Create
                      </FormLabel>
                      <FormControl>
                        <div className="grid w-full max-w-sm items-center gap-1.5">
                          {musicPreview && (
                            <div className="mt-2">
                              <audio controls>
                                <source src={musicPreview} type="audio/mp3" />
                                Your browser does not support the audio element.
                              </audio>
                            </div>
                          )}
                          <Input
                            placeholder="AI prompt"
                            {...field}
                            className="text-primary"
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        <span className="pl-2 text-sm text-gray-300 text-center">
                          input your prompt and sellect create Btn
                        </span>
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {musicPreviewAI && (
                  <div className="mt-2">
                    <audio controls>
                      <source src={musicPreviewAI} type="audio/mp3" />
                    </audio>
                  </div>
                )}
                <div className="text-center my-10">
                  <Button type="submit" variant="nooutline">
                    AI Create
                  </Button>
                  <Button
                    variant="outline"
                    className="ml-2 font-semibold"
                    onClick={() => {
                      setisOk(true);
                      console.log('-1')
                      setisColl(id);
                    }}
                  >
                    Upload
                  </Button>
                  {isOk && (
                    <div className="text-accent mt-8">
                      second create successfuly
                    </div>
                  )}
                </div>
              </div>

              {/* <Label className="pl-2 text-sm font-bold text-gray-500 tracking-wide">
              Desc
            </Label>
            <Textarea className="text-sm font-bold text-gray-500 tracking-wide" />

            <Label className="pl-2 text-sm font-bold text-gray-500 tracking-wide">
              Music Name
            </Label>
            <Input
              placeholder="your music name"
              className="text-primary my-0"
            />

            <Label className="pl-2 text-sm font-bold text-gray-500 tracking-wide">
              Music Cover
            </Label>
            <Input
              placeholder="your music name"
              className="text-primary my-0"
            /> */}
            </form>
          </Form>
        </div>
      </div>
    </SheetContent>
  );
}
