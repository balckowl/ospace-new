import { valibotResolver } from "@hookform/resolvers/valibot";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { type InferOutput, pick } from "valibot";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { DesktopSchema } from "@/server/schemas/desktop.schema";

type Props = {
  visible: boolean;
  onClose: () => void;
  save: (name: string) => void | Promise<void>;
  initialName?: string;
  title?: string;
  submitLabel?: string;
};

const nameSchema = pick(DesktopSchema, ["name"]);
type nameSchemaType = InferOutput<typeof nameSchema>;

export default function VirtualDesktopDialog({
  visible,
  onClose,
  save,
  initialName = "",
  title = "Virtual Desktop",
  submitLabel = "Save",
}: Props) {
  const form = useForm<nameSchemaType>({
    resolver: valibotResolver(nameSchema),
    defaultValues: {
      name: initialName,
    },
  });

  useEffect(() => {
    if (visible) {
      form.reset({ name: initialName });
    }
  }, [form, initialName, visible]);

  const currentName = form.watch("name");

  const onSubmit = async (formData: nameSchemaType) => {
    await save(formData.name);
    onClose();
  };

  if (!visible) return null;

  return (
    <div
      className={`dialog fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm`}
      style={{ zIndex: 7000 }}
    >
      <div className={`min-w-[400px] rounded-2xl bg-white p-0 shadow-2xl`}>
        <h3 className="mb-4 flex items-center gap-2 px-5 pt-5 font-semibold text-gray-800 text-lg">
          {title}
        </h3>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="mx-5">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="border-b-[1.5px]">
                        <input
                          placeholder="デスクトップ名を入力"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                          }}
                          className="w-full rounded-2xl border-0 px-1 py-1.5 outline-none focus-visible:ring-0"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="mt-6 flex justify-end space-x-3 px-5 pb-5">
              <Button
                onClick={onClose}
                className="w-[120px] rounded-xl bg-gray-100 px-4 py-2 font-medium text-gray-700 text-sm transition-colors hover:bg-gray-200"
                type="button"
              >
                cancel
              </Button>
              <Button
                type="submit"
                disabled={!currentName.trim()}
                className="w-[120px] rounded-xl px-4 py-2 font-medium text-sm text-white transition-colors disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                {submitLabel}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
