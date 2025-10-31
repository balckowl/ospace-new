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
  selectedColor,
  onColorSelect,
  colorOptions,
  panelOffsetRight = 0,
  usePinnedLayout = false,
}: Props) {
  const form = useForm<nameSchemaType>({
    resolver: valibotResolver(nameSchema),
    defaultValues: {
      name: nameInput,
    },
  });

  const availableColors =
    colorOptions && colorOptions.length > 0
      ? colorOptions
      : DEFAULT_DIALOG_COLORS;
  const shouldShowColorPicker = Boolean(onColorSelect);

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
                    {/* <FormLabel>{formLabel}</FormLabel> */}
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
            {shouldShowColorPicker && (
              <div className="mx-5">
                <p className="mb-2 px-1 font-medium text-gray-600 text-sm">
                  Color
                </p>
                <div className="flex items-center gap-3">
                  {availableColors.map((color) => {
                    const isSelected = selectedColor === color;
                    return (
                      <button
                        key={color}
                        type="button"
                        onClick={() => onColorSelect?.(color)}
                        className={`flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all duration-150 ${isSelected ? "scale-110 border-gray-900 shadow-lg" : "border-transparent hover:scale-105 hover:border-gray-400/70"}`}
                        style={{ background: color }}
                        aria-label={`Select color ${color}`}
                      >
                        {isSelected && (
                          <span className="block h-3.5 w-3.5 rounded-full border-2 border-white/80" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
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
