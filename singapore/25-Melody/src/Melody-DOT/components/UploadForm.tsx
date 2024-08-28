"use client";

import { useState, useRef, ChangeEvent } from "react";
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
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Image from "next/image";

// Define a schema for file properties
const fileSchema = z.object({
  size: z.number().positive().int().optional(), // File size in bytes
  type: z.string().optional(), // MIME type
});
//form Schema
const formSchema = z.object({
  username: z.string().min(6, {
    message: "Username must be at least 6 characters.",
  }),
  desc: z
    .string()
    .min(10, {
      message: "desc must be at least 10 characters.",
    })
    .max(200)
    .optional(),
  musicCover: fileSchema.refine(
    (file) => file?.size != null && file?.type != null,
    {
      message: "Music cover is required and must have valid properties.",
    }
  ),
  musicFile: fileSchema.refine(
    (file) => file?.size != null && file?.type != null,
    {
      message: "Music file is required and must have valid properties.",
    }
  ),
});
export default function UploadForm() {
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [musicFile, setMusicFile] = useState<File | null>(null);

  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [musicPreview, setMusicPreview] = useState<string | null>(null);

  const inputFile = useRef<HTMLInputElement | null>(null);
  const inputMusicFile = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [cid, setCid] = useState<string>("");

  const uploadFile = async () => {
    if (!coverFile) return;
    try {
      setUploading(true);
      const data = new FormData();
      data.append("file", coverFile);
      const uploadRequest = await fetch("/api/upload", {
        method: "POST",
        body: data,
      });
      const uploadData = await uploadRequest.json();
      setCid(uploadData.IpfsHash);
      setUploading(false);
    } catch (e) {
      console.error(e);
      setUploading(false);
      alert("Trouble uploading file");
    }
  };

  const handleCoverChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const eFile = e.target.files[0];
      if (eFile) {
        setCoverFile(eFile);
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === "string") {
            setCoverPreview(reader.result);
          } else {
            setCoverPreview(null);
          }
          // console.log('63',reader.result)
        };
        reader.readAsDataURL(eFile);
      }
    }
  };

  const handleMusicChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setMusicFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setMusicPreview(reader.result);
        } else {
          setMusicPreview(null);
        }
      };
      reader.readAsDataURL(file);
    }
  };
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      desc: "",
    },
  });
  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values);
  }
  return (
    <main className="w-full min-h-screen m-auto flex flex-col justify-center items-center">
      <input
        type="file"
        id="file"
        ref={inputFile}
        onChange={handleCoverChange}
      />
      <button disabled={uploading} onClick={uploadFile}>
        {uploading ? "Uploading..." : "Upload"}
      </button>
      <div className="sm:max-w-lg w-full p-10 bg-white rounded-xl z-10">
        <h1 className="text-4xl font-bold text-gray-700 mb-10 text-center">
          Create NFT
        </h1>
        <div className="text-left">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="username"
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
              <FormField
                control={form.control}
                name="musicFile"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="pl-2 text-sm font-bold text-gray-500 tracking-wide">
                      Music File
                    </FormLabel>
                    <FormControl>
                      <div className="grid w-full max-w-sm items-center gap-1.5">
                        <Input
                          ref={inputMusicFile}
                          onChange={handleMusicChange}
                          id="musicFile"
                          type="file"
                          accept=".mp3, .wav"
                          className="text-sm font-bold text-gray-500 tracking-wide"
                        />
                        {musicPreview && (
                          <div className="mt-2">
                            <audio controls>
                              <source src={musicPreview} type="audio/mp3" />
                              Your browser does not support the audio element.
                            </audio>
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormDescription>
                      <span className="pl-2 text-sm text-gray-300 text-center">
                        File type: MP3 types of file
                      </span>
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="desc"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="pl-2 text-sm font-bold text-gray-500 tracking-wide">
                      Desc
                    </FormLabel>
                    <FormControl>
                      <Textarea className="text-sm font-bold text-gray-500 tracking-wide" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="text-center">
                <Button type="submit">Create</Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </main>
  );
}
