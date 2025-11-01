"use client";

import { valibotResolver } from "@hookform/resolvers/valibot";
import { FlagTriangleRight, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import {
  type InferOutput,
  maxLength,
  minLength,
  object,
  pipe,
  regex,
  string,
} from "valibot";
import { useTranslation } from "@/i18n/client";
import { authedHono } from "@/lib/hono-client";
import Header from "../lp/layout/Header";
import { Button } from "../ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import SectionTitle from "./shared/SectionTitle";

type Props = {
  handleNextStep: () => void;
  handleOsNameChange: (osName: string) => void;
  lang: string;
};

export default function InputOsNameForm({
  handleNextStep,
  handleOsNameChange,
  lang,
}: Props) {
  const { t } = useTranslation(lang);
  const title = t("inputName.title");
  const desc = t("inputName.desc");
  const placeholder = t("inputName.placeholder");
  const btn = t("inputName.btn");
  const min = t("inputName.min");
  const max = t("inputName.max");
  const pattarn = t("inputName.pattarn");
  const alreadyUse = t("inputName.already-use");

  const osNameFormInput = object({
    osName: pipe(
      string(),
      minLength(2, min),
      maxLength(10, max),
      regex(/^[a-z](?:[a-z-]*[a-z])?$/, pattarn),
    ),
  });

  const form = useForm<InferOutput<typeof osNameFormInput>>({
    resolver: valibotResolver(osNameFormInput),
    defaultValues: {
      osName: "",
    },
  });

  const onSubmit = async (data: InferOutput<typeof osNameFormInput>) => {
    const { osName } = data;

    const res = await authedHono.api.user[":osName"].$post({
      param: { osName },
    });

    if (res.status === 200) {
      handleOsNameChange(osName);
      handleNextStep();
    }

    if (res.status === 409) {
      form.setError("osName", { message: alreadyUse });
      return;
    }
  };

  return (
    <div>
      <Header />
      <div className="flex min-h-[calc(100dvh-70px)] items-center justify-center bg-black px-4">
        <div className="w-full max-w-md">
          <div className="relative">
            <div className="relative rounded-2xl">
              <SectionTitle title={title} desc={desc} />
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                  <FormField
                    control={form.control}
                    name="osName"
                    render={({ field }) => (
                      <FormItem className="mb-4 w-full">
                        <FormControl>
                          <Input
                            placeholder={placeholder}
                            {...field}
                            className="w-full bg-white"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    size="lg"
                    className="mx-auto flex items-center gap-2 rounded-xl font-medium text-lg text-white transition-all duration-200"
                    disabled={form.formState.isSubmitting}
                  >
                    {form.formState.isSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <FlagTriangleRight width={15} height={15} />
                    )}
                    {btn}
                  </Button>
                </form>
              </Form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
