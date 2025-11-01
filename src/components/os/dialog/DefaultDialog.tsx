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
import { cn } from "@/lib/utils";
import { DesktopSchema } from "@/server/schemas/desktop.schema";

export const DEFAULT_DIALOG_COLORS = [
  "#FEE2E2",
  "#FEF3C7",
  "#DCFCE7",
  "#DBEAFE",
  "#F3E8FF",
];

type Props = {
  dialogZIndex: number;
  dialogClassName: string;
  nameInput: string;
  changeNameInput: (value: string) => void;
  onSave: () => void;
  visible: boolean;
  title: string;
  saveLabel?: string;
  onCancel: () => void;
  cancelLabel?: string;
  placeholder: string;
  selectedColor?: string;
  onColorSelect?: (value: string) => void;
  colorOptions?: string[];
  panelOffsetRight?: number;
  usePinnedLayout?: boolean;
};

const nameSchema = pick(DesktopSchema, ["name"]);
type nameSchemaType = InferOutput<typeof nameSchema>;

export default function DefaultDialog({
  dialogZIndex,
  dialogClassName,
  nameInput,
  changeNameInput,
  onSave,
  visible,
  title,
  onCancel,
  cancelLabel = "Cancel",
  saveLabel = "Save",
  placeholder,
  panelOffsetRight = 0,
  usePinnedLayout = false,
}: Props) {
  const form = useForm<nameSchemaType>({
    resolver: valibotResolver(nameSchema),
    defaultValues: {
      name: nameInput,
    },
  });

  const currentName = form.watch("name");

  const onSubmit = () => {
    onSave();
  };

  if (!visible) return null;

  return (
    <div
      className={cn(
        "dialog fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm",
        usePinnedLayout && "m-3 rounded-2xl",
      )}
      style={{
        zIndex: dialogZIndex,
        right: panelOffsetRight,
      }}
    >
      <div
        className={cn(
          "min-w-[400px] bg-white p-0 shadow-2xl",
          usePinnedLayout ? "rounded-3xl" : "rounded-2xl",
          dialogClassName,
        )}
      >
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
                          placeholder={placeholder}
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            changeNameInput(e.target.value);
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
                {cancelLabel}
              </Button>
              <Button
                type="submit"
                disabled={!currentName.trim()}
                className="w-[120px] rounded-xl px-4 py-2 font-medium text-sm text-white transition-colors disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                {saveLabel}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
