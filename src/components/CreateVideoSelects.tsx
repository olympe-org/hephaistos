import SelectTemplate from "./SelectTemplate";
import SelectMode from "./SelectMode";
import CheckboxSaveData from "./CheckboxSaveData";

export default function CreateVideoSelects() {
  return (
    <div className="flex flex-col gap-8">
      <SelectTemplate />
      <SelectMode />
      <CheckboxSaveData target="step1" />
    </div>
  );
}
