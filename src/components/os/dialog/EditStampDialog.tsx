import { valibotResolver } from "@hookform/resolvers/valibot";
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
import { StampOnly } from "@/server/schemas/desktop.schema";

type Props = {
  dialogZIndex: number;
  contentInput: string;
  changeContentInput: (value: string) => void;
  onSave: () => void;
  visible: boolean;
  onCancel: () => void;
  formLabel: string;
};

const stampSchema = pick(StampOnly, ["stampText"]);
type stampSchemaType = InferOutput<typeof stampSchema>;

export default function EditStampDialog({
  dialogZIndex,
  contentInput,
  changeContentInput,
  onSave,
  visible,
  onCancel,
  formLabel,
}: Props) {
  const form = useForm<stampSchemaType>({
    resolver: valibotResolver(stampSchema),
    defaultValues: {
      stampText: contentInput,
    },
  });

  const currentContent = form.watch("stampText");

  const onSubmit = () => {
    onSave();
  };

  if (!visible) return null;

  return (
    <div
      className="dialog fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      style={{ zIndex: dialogZIndex }}
    >
      <div className="edit-stamp-dialog min-w-[400px] rounded-2xl bg-white p-0 shadow-2xl">
        <h3 className="mb-4 flex items-center gap-2 px-5 pt-5 font-semibold text-gray-800 text-lg">
          Edit Stamp Text
        </h3>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="mx-5">
              <FormField
                control={form.control}
                name="stampText"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="border-b-[1.5px]">
                        <input
                          placeholder={formLabel || "Hello!..."}
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            changeContentInput(e.target.value);
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
                onClick={onCancel}
                className="w-[120px] rounded-xl bg-gray-100 px-4 py-2 font-medium text-gray-700 text-sm transition-colors hover:bg-gray-200"
                type="button"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!currentContent?.trim()}
                className="w-[120px] rounded-xl px-4 py-2 font-medium text-sm text-white transition-colors disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                Save
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
