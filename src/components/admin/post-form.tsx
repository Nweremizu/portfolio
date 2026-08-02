"use client";

import { useState } from "react";
import PostPreview from "@/components/admin/post-preview";

const inputClass =
  "w-full rounded-lg bg-card px-4 py-2.5 text-foreground outline-none focus-visible:outline-2 focus-visible:outline-primary";

interface PostValues {
  slug: string;
  title: string;
  date: string;
  body: string;
  coverImage: string;
  coverCreditName: string;
  coverCreditUrl: string;
}

const EMPTY_VALUES: PostValues = {
  slug: "",
  title: "",
  date: "",
  body: "",
  coverImage: "",
  coverCreditName: "",
  coverCreditUrl: "",
};

export default function PostForm({
  action,
  submitLabel,
  defaultValues,
}: {
  action: (formData: FormData) => void;
  submitLabel: string;
  defaultValues?: PostValues;
}) {
  // Inputs stay uncontrolled (defaultValue + the form's own action still own
  // submission) — this state only mirrors them for the live preview.
  const [values, setValues] = useState(defaultValues ?? EMPTY_VALUES);

  function update<K extends keyof PostValues>(key: K) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setValues((v) => ({ ...v, [key]: e.target.value }));
    };
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      <form action={action} className="flex flex-col gap-3 pt-8">
        <input
          name="title"
          placeholder="Title"
          defaultValue={defaultValues?.title}
          onChange={update("title")}
          required
          className={inputClass}
        />
        <input
          name="slug"
          placeholder="slug-for-the-url"
          defaultValue={defaultValues?.slug}
          pattern="[a-z0-9]+(-[a-z0-9]+)*"
          title="Lowercase letters, numbers, and hyphens only"
          required
          className={inputClass}
        />
        <input
          type="date"
          name="date"
          defaultValue={defaultValues?.date}
          onChange={update("date")}
          required
          className={inputClass}
        />
        <input
          type="url"
          name="coverImage"
          placeholder="Cover image URL (e.g. https://images.unsplash.com/photo-...)"
          defaultValue={defaultValues?.coverImage}
          onChange={update("coverImage")}
          required
          className={inputClass}
        />
        <div className="flex gap-3">
          <input
            name="coverCreditName"
            placeholder="Photographer name"
            defaultValue={defaultValues?.coverCreditName}
            onChange={update("coverCreditName")}
            required
            className={inputClass}
          />
          <input
            type="url"
            name="coverCreditUrl"
            placeholder="Photographer profile URL"
            defaultValue={defaultValues?.coverCreditUrl}
            required
            className={inputClass}
          />
        </div>
        <textarea
          name="body"
          placeholder="Write in markdown..."
          defaultValue={defaultValues?.body}
          onChange={update("body")}
          required
          rows={20}
          className={`${inputClass} font-mono text-sm resize-y`}
        />
        <button
          type="submit"
          className="self-start rounded-lg bg-primary text-white px-5 py-2.5 font-medium hover:opacity-90"
        >
          {submitLabel}
        </button>
      </form>

      <div className="lg:sticky lg:top-4 pt-8">
        <p className="text-sm text-secondary pb-2">Preview</p>
        <PostPreview values={values} />
      </div>
    </div>
  );
}
